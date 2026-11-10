# 데이터 사전

통화는 USD, `*_seconds`는 초, 시각 `*_utc`는 UTC다. 브라우저 표시는 KST다.

## 새 세 묶음

`batches.json` 버전 2의 batches는 2026.11.09–10의 새 세 묶음이고 baseline은 기존 Claude 일반 모드의 첫 씬 18건이다. `claude-ai`, `gpt-ai`, `gpt-normal`의 JSON과 `*-runs.csv`는 각 묶음이고 `batch-runs.csv`는 전체 55회 실행이다. `batch-comparison.csv`는 최종 결과 18개 기준과 전체 실행 기준을 구분한다. 기존 `report.json`과 `runs.json`의 79개 관측값은 별도로 유지했다.

- `batch`, `number`, `attempt`, `run_id`: 묶음·프로젝트·시도·서버 실행 식별자.
- `mode`, `model`, `effort`: 서버 시작 이벤트와 대조한 실제 생성 설정.
- `started_at`, `finished_at`: UTC 시각. 화면은 KST로 변환한다.
- `outcome`: `agent_complete` 모델 완료 선언, `bounded_fallback` 50턴 제한 종료, `model_error` 공급사 오류.
- `final_result`: 최종 18개 비교에 들어가는 결과. 실패한 첫 시도는 false, 새 복제본에서 실행한 재시도는 true다.
- `cost_usd`: 사후 조회액까지 포함한 보고서 비용. `meter_cost_usd`는 원래 사용량 장부, `recovered_cost_usd`는 사후 확인 추가액이다.
- `cost_exact`: 원래 공급사 비용 exact 표기. 실패 1건의 false를 사후 보충으로 true로 바꾸지 않았다.
- `server_seconds`, `app_seconds`: 서버 생성 타이머와 앱 관찰 타이머. `app_timing_method`가 `restored_utc_observation`이면 같은 생성 요청에 관찰을 다시 연결한 UTC 경과값이다.
- `target_seconds`, `scene_seconds`: 요청/저장 장면의 길이. MP4 렌더 실측이 아니다.
- `cut_count`, `image_count`, `objects`, `shots`, `turns`, `paid_calls`, `op_rejections`: 입력·장면·실행의 개수. 비용은 과금된 재시도를 포함한다.
- `summary.all_*`, `summary.final_*`, `summary.complete_*`: 전체 시도, 최종 결과 18개, 모델 완료 선언만의 통계. `p90_nearest_rank`는 정렬 후 ceil(n×0.9)번째 값이다.
- `batches-provenance.json`: 사용한 집계 파일의 상대 이름과 SHA-256. 원본 요청 본문·로그인 정보·절대경로는 배포하지 않는다.

## 네 묶음 비교

`mode-comparison.csv/json`은 Claude 일반 모드, Claude AI 프리비즈, GPT-6 Sol 일반 모드, GPT-6 Sol AI 프리비즈 순서로 각각 최종 18개를 비교한다. 기존 첫 씬 148컷과 새 묶음 각각 152컷을 명시한다. 요약 시간 `mean_app_seconds`는 모두 앱 / 클라이언트 타이머이며 `mean_server_seconds`도 별도 보존한다. 첫 씬 원값은 `report.json`에서 읽고 그 파일의 해시도 `batches-provenance.json`에 남긴다. 기존 79건의 원자료에는 추가·삭제·수정을 하지 않는다.

## 기존 관측값

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

## 작업별 시간

`timing.json`은 첫 씬 18건·재시도 사례 제외 17건·추가요청 6건의 통계와 프로젝트별 구간을 담는다. `timing-turns.csv`는 639턴, `timing-tools.csv`는 1,216회 도구 호출이다. 기존 79개 실행 관측에 새 실행을 추가한 것이 아니라 그 안의 씬 기록을 세분화한 값이다.

- `model_response_interval_seconds`: 앞선 도구 완료부터 다음 모델 응답 완료까지. 호출·통신·재시도·턴 처리 포함.
- `execution_interval_seconds`: 도구 순차 실행의 완료 응답 사이 구간. 클라이언트 왕복 포함.
- `category`: 응답이 요청한 도구 이름으로 분류. 실제 추론 주제나 원인을 직접 측정한 값은 아님.
- `truncated_no_tool`: 출력 한도에 도달하고 도구 호출 없이 끝난 응답. 이후 턴에서 작업은 계속됨.
- 원본 로그의 단조 증가 타이머를 사용하며 중복 집계하지 않음. MP4 렌더링 시간은 포함하지 않음.

## 컷 수·영상 길이 관계

`relationship-points.csv`는 첫 씬 18건과 스토리보드 18건의 분석 입력이다. `relationship-statistics.csv`는 단계 2종 × 표본 2종 × 관계 4종 = 16개 결과다.

- `duration_seconds`: 첫 씬은 생성 요청 당시 길이, 스토리보드는 해당 생성 결과 길이. `duration_basis`로 구분하며 최종 MP4 실측 길이가 아님.
- `sample=all`: 전체 18건. `sample=sensitivity`: 첫 씬은 공룡에게 츄르를, 스토리보드는 야간 인수인계 보충 측정을 제외한 17건.
- `pearson_r`, `spearman_rho`: 직선 상관과 평균 동순위에 기반한 순위 상관.
- `pearson_ci95`: Fisher z 근사 95% 신뢰구간. 개별 비교 기준이며 다중 비교 보정 구간이 아님.
- `permutation_p`: 양측 순열 검정 200,000회, `(극단값 수+1)/(200000+1)`. 재현 시드는 각 결과에 포함.
- `holm_p`: 전체 표본의 8개 비교를 함께 보정. 예외 제외 표본은 단계별 4개 비교를 별도 보정.
- `slope`, `intercept`, `r_squared`: y = intercept + slope × x의 최소제곱 결과. 원자료 단위는 초·USD·컷이며 화면의 시간축(분)과 구분.

생성 결과 길이와 컷 수가 서로 연관되어 있으므로 독립 효과나 인과 효과로 해석하지 않는다. 추가요청은 3개 프로젝트의 반복 관측이므로 관계 분석에서 제외했다.
