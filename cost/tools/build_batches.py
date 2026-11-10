"""Package the three measured batches; publish metrics only, never private app records."""
import csv
import hashlib
import json
import math
import statistics
import zipfile
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
SOURCES = [
    ('claude-ai', 'ai_previz_18_2026-11-09', 'Claude · AI 프리비즈', 'Claude Opus 5.5', 'ai_previz'),
    ('gpt-ai', 'ai_previz_gpt6sol_18_2026-11-10', 'GPT-6 Sol · AI 프리비즈', 'GPT-6 Sol', 'ai_previz'),
    ('gpt-normal', 'normal_gpt6sol_18_2026-11-10', 'GPT-6 Sol · 일반 모드', 'GPT-6 Sol', 'normal'),
]


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def metrics(rows, field):
    values = [r[field] for r in rows]
    return dict(n=len(values), total=float(sum(Decimal(str(v)) for v in values)),
                mean=statistics.mean(values), median=statistics.median(values),
                min=min(values), max=max(values),
                p90_nearest_rank=sorted(values)[math.ceil(len(values) * .9) - 1])


def csv_file(path, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main():
    batches, provenance, all_rows = [], [], []
    for bid, directory, label, model_label, mode in SOURCES:
        source = ROOT.parent / directory
        def read(name):
            path = source / name
            provenance.append(dict(batch=bid, file=f'{directory}/{name}',
                                   sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
            return json.loads(path.read_text())
        stats, validation, versions = read('statistics.json'), read('final_validation.json'), read('versions.json')
        records = read('runs.json')
        for retry in sorted(source.glob('runs_retry_*.json')):
            records.extend(read(retry.name))
        csv_path = source / 'runs.csv'
        provenance.append(dict(batch=bid, file=f'{directory}/runs.csv', sha256=hashlib.sha256(csv_path.read_bytes()).hexdigest()))
        with csv_path.open(encoding='utf-8-sig', newline='') as f:
            csv_rows = {r['run_id']: r for r in csv.DictReader(f)}
        rows = []
        for r in records:
            c = csv_rows[r['run_id']]
            event_path = source / 'evidence/server_runs' / r['run_id'] / 'events.jsonl'
            with event_path.open() as stream:
                start = next(e for line in stream if (e := json.loads(line)).get('event') == 'started')
            assert (start.get('mode') or 'normal') == mode and start['effort'] == 'high'
            expected_model = 'anthropic/claude-opus-5.5' if bid == 'claude-ai' else 'openai/gpt-6-sol'
            assert start['model'] == expected_model
            if mode == 'normal':
                assert {'set_environment', 'set_effect_spans', 'set_object_anims'} <= set(start['op_tools'])
            outcome = 'model_error' if r['status'] != 'completed' else r['finished_by']
            rows.append(dict(batch=bid, number=r['number'], project=r['project'], attempt=r.get('attempt', 1),
                run_id=r['run_id'], mode=mode, model=start['model'], effort=start['effort'],
                started_at=r['generation_started_at'], finished_at=r['generation_finished_at'],
                outcome=outcome, cut_count=r['board_before']['cut_count'], image_count=r['board_before']['image_count'],
                target_seconds=start.get('target_duration'), scene_seconds=r['app_after']['scene']['duration'],
                server_seconds=r['server_elapsed_seconds'], app_seconds=r['client_elapsed_seconds'],
                cost_usd=float(c['cost_usd']), meter_cost_usd=r['usage']['cost_usd'],
                recovered_cost_usd=float(c.get('recovered_cost_usd') or 0), cost_exact=r['usage']['exact'],
                turns=int(c['turns']), paid_calls=r['usage']['calls'], op_rejections=int(c['op_rejection_count']),
                objects=r['app_reopened']['scene']['object_count'], shots=r['app_reopened']['scene']['shot_count'],
                storyboard_preserved=r['board_reopened']['storyboard_equal'] and not r['board_reopened']['different_images'],
                app_timing_method='restored_utc_observation' if r.get('observer_recovery') else 'monotonic',
                final_result=False))
        rows.sort(key=lambda r: (r['number'], r['attempt']))
        for number in range(1, 19):
            candidates = [r for r in rows if r['number'] == number and r['outcome'] != 'model_error']
            assert candidates
            max(candidates, key=lambda r: r['attempt'])['final_result'] = True
        final = [r for r in rows if r['final_result']]
        assert len(final) == 18 and sum(r['cut_count'] for r in final) == 152
        assert sum(r['image_count'] for r in final) == 182 and all(r['storyboard_preserved'] for r in rows)
        assert abs(sum(Decimal(str(r['cost_usd'])) for r in rows) - Decimal(str(stats['cost_usd']['total']))) < Decimal('.00000001')
        assert abs(sum(r['server_seconds'] for r in rows) - stats['server_seconds']['total']) < .000001
        assert validation['original_hashes_unchanged'] == 18 and validation['raw_meter_matches_ledger']
        summary = dict(attempts=len(rows), results=18, completed=sum(r['outcome'] == 'agent_complete' for r in final),
            limited=sum(r['outcome'] == 'bounded_fallback' for r in final), errors=sum(r['outcome'] == 'model_error' for r in rows),
            all_cost=metrics(rows, 'cost_usd'), all_server=metrics(rows, 'server_seconds'), all_app=metrics(rows, 'app_seconds'),
            final_cost=metrics(final, 'cost_usd'), final_server=metrics(final, 'server_seconds'), final_app=metrics(final, 'app_seconds'),
            complete_cost=metrics([r for r in final if r['outcome'] == 'agent_complete'], 'cost_usd'),
            complete_server=metrics([r for r in final if r['outcome'] == 'agent_complete'], 'server_seconds'),
            recovered_cost_usd=sum(r['recovered_cost_usd'] for r in rows), all_cost_exact=all(r['cost_exact'] for r in rows),
            period_kst=stats['period_kst'], batch_wall_seconds=stats['batch_wall_seconds'],
            cuts=152, images=182, originals_unchanged=18, ledger_matches=True)
        batch = dict(id=bid, label=label, model_label=model_label, model=expected_model, mode=mode,
                     source=directory, summary=summary, runs=rows,
                     client_commit=versions['Previzion-Client']['commit'],
                     server_commit=versions['measurement_server']['commit'])
        batches.append(batch)
        all_rows.extend(rows)
        csv_file(DATA / f'{bid}-runs.csv', rows)
        write(DATA / f'{bid}.json', batch)
    assert len(all_rows) == 55
    historical = json.loads((DATA / 'report.json').read_text())
    provenance.append(dict(batch='legacy', file='previzion-performance-report/data/report.json',
                           sha256=hashlib.sha256((DATA / 'report.json').read_bytes()).hexdigest()))
    scene_rows = sorted([r for r in historical['runs'] if r['pipeline'] == 'scene'], key=lambda r: r['project_id'])
    assert len(scene_rows) == 18 and all(r['requested_model'] == 'anthropic/claude-opus-5.5' for r in scene_rows)
    baseline_rows = [dict(number=r['project_id'], project=r['project_name'], run_id=r['run_id'],
                         cost_usd=r['cost_usd'], app_seconds=r['client_elapsed_seconds'],
                         server_seconds=r['server_elapsed_seconds'], cut_count=r['cuts'],
                         outcome=r['finished_by'], final_result=True) for r in scene_rows]
    baseline = dict(id='legacy', label='Claude · 일반 모드', model_label='Claude Opus 5.5',
                    model='anthropic/claude-opus-5.5', mode='normal', runs=baseline_rows,
                    summary=dict(attempts=18, results=18, completed=sum(r['outcome'] == 'agent_complete' for r in baseline_rows), limited=0, errors=0,
                                 cuts=sum(r['cut_count'] for r in baseline_rows),
                                 all_cost=metrics(baseline_rows, 'cost_usd'), final_cost=metrics(baseline_rows, 'cost_usd'),
                                 final_server=metrics(baseline_rows, 'server_seconds'), final_app=metrics(baseline_rows, 'app_seconds')))
    comparison = [baseline, batches[0], batches[2], batches[1]]
    write(DATA / 'mode-comparison.json', dict(cohorts=comparison,
          note='기존 Claude 일반 모드는 148컷, 신규 세 묶음은 각 152컷. 비교 요약 시간은 앱 관찰 시간으로 통일.'))
    csv_file(DATA / 'mode-comparison.csv', [dict(label=b['label'], model=b['model'], mode=b['mode'],
        final_projects=18, cuts=b['summary']['cuts'], final_cost_usd=b['summary']['final_cost']['total'],
        all_attempts_cost_usd=b['summary']['all_cost']['total'], mean_app_seconds=b['summary']['final_app']['mean'],
        mean_server_seconds=b['summary']['final_server']['mean'], agent_complete=b['summary']['completed'],
        bounded_fallback=b['summary']['limited']) for b in comparison])
    payload = dict(version=2, measured_through='2026-11-10', currency='USD', batches=batches, baseline=baseline)
    write(DATA / 'batches.json', payload)
    write(DATA / 'batches-provenance.json', provenance)
    csv_file(DATA / 'batch-runs.csv', all_rows)
    csv_file(DATA / 'batch-comparison.csv', [dict(batch=b['id'], label=b['label'], mode=b['mode'], model=b['model'],
        attempts=b['summary']['attempts'], results=18, agent_complete=b['summary']['completed'], bounded_fallback=b['summary']['limited'],
        model_errors=b['summary']['errors'], all_attempts_cost_usd=b['summary']['all_cost']['total'],
        final_18_cost_usd=b['summary']['final_cost']['total'], final_18_mean_server_seconds=b['summary']['final_server']['mean'],
        all_attempts_mean_server_seconds=b['summary']['all_server']['mean'],
        batch_wall_seconds=b['summary']['batch_wall_seconds']) for b in batches])
    (ROOT / 'assets/batches-data.js').write_text('window.BATCH_DATA = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    manifest = [dict(path=str(f.relative_to(DATA)), bytes=f.stat().st_size, sha256=hashlib.sha256(f.read_bytes()).hexdigest())
                for f in sorted(DATA.rglob('*')) if f.is_file() and f.name not in ('manifest.json', 'all-data.zip')]
    write(DATA / 'manifest.json', manifest)
    with zipfile.ZipFile(DATA / 'all-data.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for f in sorted(DATA.rglob('*')):
            if f.is_file() and f.suffix != '.zip':
                archive.write(f, str(f.relative_to(DATA)))
    print('Packaged 3 batches, 54 saved results and 55 attempts; all source totals reconciled.')


if __name__ == '__main__':
    main()
