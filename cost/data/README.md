# 데이터 사전

통화는 USD, `*_seconds`는 초, 시각 `*_utc`는 UTC다. 브라우저 표시는 KST다.

- `project_id`: 1–18의 프로젝트 연결 키.
- `record_id`: 배포 데이터 안에서 관측값을 유일하게 구분하는 키.
- `run_id`: 원래 생성 실행 식별자. 컷 재생성에서는 같은 ID를 공유할 수 있다.
- `request_group`: 컷 재생성의 개별 요청 구분. 과거 로그는 겹치지 않는 요청 순서로 구분했다.
- `pipeline`: storyboard / scene / followup / panel / expansion.
- `cost_usd`: 해당 요청의 전체 기록 비용.
- `elapsed_seconds`: 보고서에서 사용하는 시간. `time_source`로 서버/클라이언트 구분.
- `measurement_origin`: historical_original 또는 supplemental_rerun_2026-11-08.
- `*_usd`, `*_seconds`: 단계·비용 구성별 원값.
- `ledger_crosschecked` / `ledger_verified`: 장부 대조 여부. false는 실패가 아니라 해당 자료에서 장부 대조를 하지 않았다는 뜻. 기존 베타 씬은 서버 사용량 로그를 사용했다.
- `cost_exact` / `all_costs_exact`: 원래 사용량 기록의 정확값 표시.
- `known_interrupted_call_*`: 확인된 유료 중단·재시도 값. 0이 모든 종류의 재시도 부재를 증명하지는 않는다.
- `followup_record_count`: 확인된 추가요청 수. 0이면 합계·평균은 null/CSV 빈칸으로 남긴다.
- `source/followup-context.json`의 `included: false`: 원래 ‘첫 씬’ 집계에서 제외됐다는 선정 메타데이터다. 이 보고서의 추가요청 6건에는 포함돼 있다.

백분위 선형 보간: 정렬 후 (n−1)×p. 표본 분산/표준편차: n−1. 표준오차: 표준편차/√n. 변동계수: 표준편차/평균×100. n=1인 표준편차·분산·표준오차·변동계수는 null이다.

source/는 원본 파일 전체 로그가 아닌 실행 단위 집계 원자료다. 계정명, 개인 로컬 경로, 요청 본문을 제거했다. 개인정보 제외와 파일 해시는 provenance.json에서 확인할 수 있다.
