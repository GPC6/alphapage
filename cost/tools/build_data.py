"""Rebuild the static report from packaged measurements. No network/model calls."""
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


def read(name):
    return json.loads((DATA / 'source' / name).read_text())


def write(name, value):
    (DATA / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def csv_file(name, rows):
    fields = list(dict.fromkeys(k for row in rows for k in row))
    with (DATA / name).open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v for k, v in row.items()})


def summary(values):
    values = sorted(float(x) for x in values if x is not None)
    if not values:
        return {'n': 0, **{k: None for k in ['total', 'mean', 'median', 'min', 'max', 'sample_stddev', 'sample_variance', 'standard_error', 'p10', 'p25', 'p75', 'p90', 'p95', 'iqr', 'cv_percent']}}
    n = len(values)
    total = float(sum(Decimal(str(x)) for x in values))
    mean = total / n
    sd = statistics.stdev(values) if n > 1 else None
    def q(p):
        x = (n - 1) * p
        lo, hi = math.floor(x), math.ceil(x)
        return values[lo] + (values[hi] - values[lo]) * (x - lo)
    return dict(n=n, total=total, mean=mean, median=statistics.median(values), min=values[0], max=values[-1],
                sample_stddev=sd, sample_variance=sd * sd if sd is not None else None,
                standard_error=sd / math.sqrt(n) if sd is not None else None,
                p10=q(.1), p25=q(.25), p75=q(.75), p90=q(.9), p95=q(.95), iqr=q(.75)-q(.25),
                cv_percent=sd / mean * 100 if sd is not None and mean else None)


story = read('storyboard.json')
scene = read('first-scene.json')
follow = read('followups.json')
follow_context = {r['run_id']: r for r in read('followup-context.json')}
panels = read('panel-regenerations.json')
expansion = read('storyboard-expansion.json')
name_id = {r['name']: r['number'] for r in scene}
name_id['전독시 — 8컷 확장'] = 14
types = {'storyboard': '스토리보드 생성', 'scene': '첫 씬 생성', 'followup': '추가 씬 요청',
         'panel': '스토리보드 컷 재생성', 'expansion': '스토리보드 전체 확장'}
runs = []
for kind, records in [('storyboard', story), ('scene', scene), ('followup', follow), ('panel', panels), ('expansion', expansion)]:
    for i, raw in enumerate(records):
        r = dict(raw)
        project_id = r.get('number') or name_id[r.get('name', r.get('project'))]
        r.update(record_id=f'{kind}-{i+1:02}', pipeline=kind, pipeline_label=types[kind], project_id=project_id,
                 project_name=scene[project_id-1]['name'])
        r['elapsed_seconds'] = r.get('client_elapsed_seconds', r.get('elapsed_seconds', r.get('total_seconds')))
        r['cost_usd'] = float(r.get('cost_usd', r.get('total_usd')))
        r['time_source'] = 'client' if kind in ('scene', 'followup') else 'server'
        if kind == 'followup':
            context = follow_context[r['run_id']]
            r['cuts'] = context['cuts']
            r['target_duration_seconds'] = context['target_duration']
            r['ledger_verified'] = True
        runs.append(r)

projects = []
for s in scene:
    n = s['number']
    own = [r for r in runs if r['project_id'] == n]
    extras = [r for r in own if r['pipeline'] == 'followup']
    projects.append({'id': n, 'name': s['name'], 'cohort': s['cohort'], 'cuts': s['cuts'], 'notes': s['notes'],
                     'storyboard': next(r for r in own if r['pipeline'] == 'storyboard'),
                     'scene': next(r for r in own if r['pipeline'] == 'scene'),
                     'followups': extras, 'panels': [r for r in own if r['pipeline'] == 'panel'],
                     'expansions': [r for r in own if r['pipeline'] == 'expansion'],
                     'followup_cost_stats': summary([r['cost_usd'] for r in extras]),
                     'followup_time_stats': summary([r['elapsed_seconds'] for r in extras])})

groups = []
def group(id_, label, records, fields=None, note=''):
    fields = fields or {'cost_usd': ('비용', 'USD'), 'elapsed_seconds': ('소요 시간', 'seconds')}
    groups.append({'id': id_, 'label': label, 'note': note, 'record_ids': [r['record_id'] for r in records],
                   'metrics': {key: {'label': label_, 'unit': unit, **summary([r.get(key) for r in records])}
                               for key, (label_, unit) in fields.items()}})

for kind in types:
    records = [r for r in runs if r['pipeline'] == kind]
    group(kind, types[kind], records)
group('story-historical', '스토리보드 · 당시 기록 17건', [r for r in runs if r['pipeline']=='storyboard' and r['project_id']!=1])
group('story-supplemental', '스토리보드 · 보충 생성 1건', [r for r in runs if r['pipeline']=='storyboard' and r['project_id']==1], note='2026-11-08에 새로 측정. 과거 로그 복구가 아님.')
for code, label in [('draft', '연출안 작성'), ('structure', '구조화·검사'), ('images', '컷 이미지 생성')]:
    group('story-'+code, '스토리보드 단계 · '+label, [r for r in runs if r['pipeline']=='storyboard'],
          {code+'_usd': ('비용', 'USD'), code+'_seconds': ('소요 시간', 'seconds')})
for code, label in [('plan', '수정 계획'), ('image', '이미지 수정')]:
    group('panel-'+code, '컷 재생성 단계 · '+label, [r for r in runs if r['pipeline']=='panel'],
          {code+'_usd': ('비용','USD'), code+'_seconds': ('소요 시간','seconds')})
group('followup-edits', '추가 씬 요청 · 수정만 5건', [r for r in runs if r['pipeline']=='followup' and r['kind']!='expanded_regeneration'])
group('followup-expanded', '추가 씬 요청 · 전체 확장 1건', [r for r in runs if r['pipeline']=='followup' and r['kind']=='expanded_regeneration'])
for cohort, label in [('beta_030','기존 베타'), ('new_web','신규 웹')]:
    ids = {p['id'] for p in projects if p['cohort']==cohort}
    for kind in ['storyboard', 'scene']:
        subset=[r for r in runs if r['pipeline']==kind and r['project_id'] in ids and not(kind=='storyboard' and r['project_id']==1)]
        group(kind+'-'+cohort, types[kind]+' · '+label+(' 당시 기록' if kind=='storyboard' else ''), subset)
group('scene-sensitive', '첫 씬 · 시간 간극/재시도 사례 제외 17건', [r for r in runs if r['pipeline']=='scene' and r['project_id']!=11])
group('scene-extra', '첫 씬 · 시각 차이·턴·호출·컷 수', [r for r in runs if r['pipeline']=='scene'],
      {'wall_elapsed_seconds': ('UTC 시작–종료 차이','seconds'), 'turns': ('턴 수','count'),
       'billable_calls': ('유료 호출 수','count'), 'cuts': ('컷 수','count'), 'target_duration_seconds': ('영상 요청 길이','seconds'),
       'scene_model_cost_usd': ('씬 모델 비용','USD'), 'embedding_cost_usd': ('임베딩 비용','USD')})
for cuts in sorted({p['cuts'] for p in projects}):
    for kind in ['storyboard','scene']:
        group(f'{kind}-cuts-{cuts}', f'{types[kind]} · {cuts}컷', [r for r in runs if r['pipeline']==kind and r.get('cuts')==cuts])
for p in projects:
    if p['followups']:
        group('followup-project-'+str(p['id']), '추가 씬 · '+p['name'], p['followups'])

flat_stats=[]
for g in groups:
    for key, metric in g['metrics'].items():
        flat_stats.append({'population':g['id'], 'population_label':g['label'], 'metric':key, **metric})
project_rows=[]
for p in projects:
    f=p['followup_cost_stats']; t=p['followup_time_stats']
    project_rows.append(dict(project_id=p['id'], project=p['name'], cohort=p['cohort'], cuts=p['cuts'],
         storyboard_cost_usd=p['storyboard']['cost_usd'], storyboard_seconds=p['storyboard']['elapsed_seconds'],
         storyboard_origin=p['storyboard']['measurement_origin'], scene_cost_usd=p['scene']['cost_usd'], scene_seconds=p['scene']['elapsed_seconds'],
         followup_record_count=f['n'], followup_total_usd=f['total'], followup_mean_usd=f['mean'],
         followup_total_seconds=t['total'], followup_mean_seconds=t['mean']))

payload={'version':1, 'published':'2026-11-09', 'currency':'USD', 'projects':projects, 'runs':runs, 'groups':groups,
         'correlations':read('cut-count-analysis.json'), 'types':types,
         'method':{'percentiles':'선형 보간: 정렬 후 위치 (n−1)×p. PERCENTILE.INC와 동일.',
                   'standard_deviation':'표본 표준편차 (n−1). 표본 1건일 때 정의하지 않음.',
                   'time':'스토리보드: 서버 경과 타이머. 씬: 클라이언트 경과 타이머. 각 요청의 합은 배치 대기 시간이 아님.',
                   'no_records':'추가요청 미관측은 비용 0 또는 요청이 없었다는 증거가 아님.'}}

assert len(projects)==18 and len(runs)==79
expected={'storyboard':'4.0020903','scene':'58.39127732','followup':'10.21859262','panel':'1.0995195','expansion':'0.2436595'}
for kind,total in expected.items():
    assert sum(Decimal(str(r['cost_usd'])) for r in runs if r['pipeline']==kind)==Decimal(total)
for g in groups[:3]:
    assert g['metrics']['cost_usd']['n']=={'storyboard':18,'scene':18,'followup':6}[g['id']]
write('report.json',payload)
(ROOT/'assets'/'data.js').write_text('window.REPORT_DATA = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
write('runs.json', runs); write('statistics.json', groups); write('projects.json', project_rows)
csv_file('runs.csv',runs); csv_file('statistics.csv',flat_stats); csv_file('projects.csv',project_rows)
for kind in types:
    csv_file(kind+'.csv', [r for r in runs if r['pipeline']==kind])
manifest=[]
for f in sorted(DATA.rglob('*')):
    if f.is_file() and f.name not in ['manifest.json','all-data.zip']:
        manifest.append({'path':str(f.relative_to(DATA)), 'bytes':f.stat().st_size, 'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
write('manifest.json',manifest)
with zipfile.ZipFile(DATA/'all-data.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(DATA.rglob('*')):
        if f.is_file() and f.suffix!='.zip': z.write(f, str(f.relative_to(DATA)))
print(f'Packaged {len(projects)} projects, {len(runs)} observations, {len(groups)} populations; all five cost totals reconciled.')
