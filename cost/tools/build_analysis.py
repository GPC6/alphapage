"""Timing summaries and exploratory relationships; only packaged measurements are read."""
import math
import random
import statistics

PERMUTATIONS = 200_000
SEED = 20261110


def ranks(values):
    result = [0.0] * len(values)
    ordered = sorted(range(len(values)), key=values.__getitem__)
    start = 0
    while start < len(values):
        end = start + 1
        while end < len(values) and values[ordered[end]] == values[ordered[start]]:
            end += 1
        rank = (start + 1 + end) / 2
        for i in ordered[start:end]:
            result[i] = rank
        start = end
    return result


def relationship(points, x_key, y_key, seed):
    x, y = [[float(p[key]) for p in points] for key in (x_key, y_key)]
    n = len(x)
    xc = [v - statistics.mean(x) for v in x]
    yc = [v - statistics.mean(y) for v in y]
    xx, yy = sum(v * v for v in xc), sum(v * v for v in yc)
    xy = sum(a * b for a, b in zip(xc, yc))
    r = xy / math.sqrt(xx * yy)
    slope = xy / xx
    intercept = statistics.mean(y) - slope * statistics.mean(x)
    z = math.atanh(max(-.999999999, min(.999999999, r)))
    z_margin = 1.959963984540054 / math.sqrt(n - 3)
    rng = random.Random(seed)
    shuffled = yc[:]
    threshold = abs(xy) - 1e-12
    extreme = 0
    for _ in range(PERMUTATIONS):
        rng.shuffle(shuffled)
        extreme += abs(sum(a * b for a, b in zip(xc, shuffled))) >= threshold
    p = (extreme + 1) / (PERMUTATIONS + 1)
    return dict(x=x_key, y=y_key, n=n, pearson_r=r,
                spearman_rho=statistics.correlation(ranks(x), ranks(y)),
                pearson_ci95=[math.tanh(z - z_margin), math.tanh(z + z_margin)],
                permutation_p=p, permutation_seed=seed, permutations=PERMUTATIONS,
                slope=slope, intercept=intercept, r_squared=r * r)


def holm(results):
    previous = 0
    for rank, row in enumerate(sorted(results, key=lambda x: x['permutation_p'])):
        previous = min(1, max(previous, (len(results) - rank) * row['permutation_p']))
        row['holm_p'] = previous
        row['holm_family_size'] = len(results)


def build_relationships(story, scene):
    points = []
    for pipeline, rows in [('scene', scene), ('storyboard', story)]:
        for r in rows:
            points.append(dict(pipeline=pipeline, project_id=r['number'], project=r['name'],
                run_id=r['run_id'], cuts=r['cuts'],
                duration_seconds=r['target_duration_seconds'] if pipeline == 'scene' else r['generated_duration_seconds'],
                duration_basis='scene_request' if pipeline == 'scene' else 'generated_storyboard',
                elapsed_seconds=r['client_elapsed_seconds'] if pipeline == 'scene' else r['total_seconds'],
                cost_usd=r['cost_usd'] if pipeline == 'scene' else r['total_usd'],
                exception=(pipeline == 'scene' and r['number'] == 11) or (pipeline == 'storyboard' and r['number'] == 1)))
    datasets = []
    for pipeline in ['scene', 'storyboard']:
        for sample in ['all', 'sensitivity']:
            selected = [p for p in points if p['pipeline'] == pipeline and (sample == 'all' or not p['exception'])]
            results = [relationship(selected, x, y, SEED + len(datasets) * 10 + i)
                       for i, (x, y) in enumerate((('cuts', 'elapsed_seconds'), ('cuts', 'cost_usd'),
                                                  ('duration_seconds', 'elapsed_seconds'), ('duration_seconds', 'cost_usd')))]
            datasets.append(dict(id=f'{pipeline}-{sample}', pipeline=pipeline, sample=sample,
                n=len(selected), points=selected, results=results,
                cuts_duration_r=statistics.correlation([p['cuts'] for p in selected], [p['duration_seconds'] for p in selected])))
    # The eight primary comparisons form one family; sensitivity families are separate.
    holm([r for d in datasets if d['sample'] == 'all' for r in d['results']])
    for d in datasets:
        if d['sample'] == 'sensitivity':
            holm(d['results'])
    return dict(datasets=datasets, points=points, method={
        'seed': SEED, 'permutations': PERMUTATIONS,
        'p_value': 'Pearson r의 양측 순열 검정. (극단값 수+1)/(200000+1).',
        'confidence_interval': 'Pearson r의 Fisher z 근사 95% 신뢰구간. 동시 신뢰구간이 아님.',
        'multiplicity': '전체 18건의 8개 비교는 함께 Holm 보정. 예외 제외는 각 단계의 4개 비교를 별도 보정.',
        'regression': '단일 설명변수 최소제곱 직선. 인과 효과나 검증된 예측 모델이 아님.',
        'scene_duration': '첫 씬 생성 요청 당시 target_duration_seconds. 최종 MP4 실측 길이가 아님.',
        'storyboard_duration': '해당 스토리보드의 생성 결과 길이. 사전에 고정한 설명변수가 아님.',
        'scope': '각 단계 18개 프로젝트. 추가요청은 3개 프로젝트의 반복 기록이므로 관계 분석에서 제외.'})


def build_timing(read):
    stats = read('timing-statistics.json')
    return dict(first=stats['first'], additional=stats['additional'],
                sensitivity=stats['first_excluding_clock_anomaly'], storyboard=stats['storyboard'],
                projects=read('timing-projects.json'), additional_runs=read('timing-additional.json'))
