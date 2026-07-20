# Storyboard 이미지 생성 방식 비교 실험 · 업로드용

이 폴더는 비교 화면을 공유하기 위한 정리본이다. 원본 화질의 비교 이미지와
화면에 필요한 메타데이터만 남겼으며, 용량이 큰 API 원문·진단 로그는 제외했다.
웹 스토리지에는 **이 폴더의 내부 구조를 유지한 채 폴더 전체를 업로드**하고
`index.html`을 시작 문서로 지정하면 된다.

2026-07-20 `refactor/autonomous-scene-generation`의 `acf34e2`에서 실제
`POST /api/cont/generate` API를 호출한 결과다. 생성이 끝난 뒤 원격 최신 `fe0f830`까지
다시 pull해 확인했으며, 사이의 두 커밋은 Scene logger와 interactive client 출력 경로만
바꾸고 Storyboard 이미지 생성 코드는 바꾸지 않았다.

## 바로 보기

`index.html`을 PC 브라우저로 열면 다음 기준으로 비교할 수 있다.

- 시나리오: 도심 추격 / 건물 사이 이동 / 야간 인수인계
- 보기: Storyboard 전체 / 같은 Panel 번호끼리 비교
- 반복: 전체 / 반복 1 / 반복 2
- Reference 결과 아래의 펼침 영역: 실제 생성에 사용한 장소·주체 시트
- Panel 클릭: 큰 이미지, shot/action, 해상도, 파일 크기, 밝기, 잉크 면적

외부 서버나 패키지는 필요 없다. 이 폴더 전체를 복사한 뒤 `index.html`을
더블클릭하면 된다.

## 실험 매트릭스

- 시나리오 3개
- 생성 방식 3개: `draft`, `standard`, `reference`
- 방식별 2회 반복
- 1회당 8컷
- 신규 18 Storyboard / 144 Panel
- 과거 Grid 기준선 3 Storyboard / 24 Panel
- HTML 전체 21 Storyboard / 168 Panel

최종 실행 설정은 다음과 같다.

- Text model: `gpt-5.6-sol`, reasoning effort `high`
- Image model: `gpt-image-2`
- Panel image size: `1536x1024`
- Draft source grid size: `1024x1536`
- Image quality: `low`
- Image workers: 4
- 최종 재개 실행의 동시 Storyboard 요청: 1

## 실측 요약

| 방식 | Storyboard | Panel | 평균 시간 | 평균 Panel 크기 | Reference sheet | 추산 이미지 API 호출 |
|---|---:|---:|---:|---:|---:|---:|
| Draft | 6 | 48 | 240.61초 | 327.9 KB | 0 | 6 |
| Standard | 6 | 48 | 276.28초 | 2,694.6 KB | 0 | 48 |
| Reference | 6 | 48 | 371.84초 | 2,977.0 KB | 28 | 76 |

Draft Panel은 2×4 Grid를 나눈 `512x384`, Standard와 Reference Panel은
각각 독립된 `1536x1024` 이미지다. 이미지 API 호출 수는 서버 구현을 기준으로
계산했으며 Text LLM 호출은 포함하지 않는다.

## 눈으로 확인한 경향

1. **Reference의 반복 요소 연속성이 가장 강했다.** 야간 인수인계의 한 실행에서
   지원의 단발머리·긴 코트·문서 파우치와 두 오피스 건물, 배송 트럭, 재활용함의
   배치가 여러 컷에 걸쳐 안정적으로 반복됐다.
2. **Standard는 컷별 디테일과 구도 자유도가 높지만 컷 사이 외형 변화가 더 쉽다.**
   각 Panel이 다른 Panel이나 공통 시트를 보지 못하기 때문이다.
3. **Draft는 한 장 안에서 스타일이 자연스럽게 묶이고 호출 수가 가장 적다.** 다만
   최종 Panel이 512×384로 작고, 복잡한 컷은 묘사가 뭉개지며 Grid 생성의 영향을 받는다.
4. **세 방식 모두 현재 프롬프트가 요구하는 '거친 프리비즈 선화'보다 지나치게 완성된
   일러스트에 가깝다.** 배경 디테일과 검은 면·반사가 많고, 일부 컷은 만화풍 인물이나
   미세한 청색 기운도 보인다. 다음 개선 실험에서는 이 과도한 렌더링을 먼저 줄이는 것이 좋다.
5. Reference는 Draft보다 평균 약 55%, Standard보다 약 35% 오래 걸렸다. 주체가 많은
   도심 추격은 시트 6장, 건물 사이 이동은 3장, 야간 인수인계는 5장을 사용했다.

## 비교할 때 주의할 점

현재 공개 API는 mode만 바꿔 이미지를 다시 그리는 것이 아니라, 요청마다 director
treatment와 structured 8컷 설계를 새로 만든다. 따라서 mode 간 결과 차이에는 이미지
생성 방식뿐 아니라 shot/action/pacing의 확률적 변화도 섞여 있다. 상세 API 원문과
진단 로그는 업로드 용량을 줄이기 위해 이 정리본에서 제외했으며 원본 실험 폴더에 있다.

## 저장 구조

- `index.html`: 업로드 후 시작 문서이자 로컬 비교 화면
- `analysis.json`: 방식별 집계
- `verification.json`: 원본 실험 결과의 무결성 검사 요약
- `legacy/`: 2026-07-19 과거 Grid 기준선 PNG
- `runs/.../panels/`: 신규 방식별 개별 Panel PNG
- `runs/.../diagnostics/reference_sheets/`: Reference 생성에 사용한 PNG

HTML 안에는 화면 구성과 메타데이터가 들어 있고, PNG는 위 상대경로로 연결된다.
따라서 `index.html`만 따로 업로드하거나 폴더명을 임의로 바꾸면 이미지가 깨질 수 있다.

## 실행 중 확인된 호환성

과거 기준선과 같은 `gpt-4.1-mini`로 다시 실행하려 했지만 최신
`get_storyboard_llm()`이 모든 Text model에 `reasoning_effort="high"`를 보내므로 OpenAI가
`Unrecognized request argument supplied: reasoning_effort`로 거부했다. 실패는 이미지 호출
전에 끝났고 별도 `output/storyboard_image_experiment_20260720_failed_gpt41_reasoning/`에
보존했다. 본 비교 결과는 최신 코드 기본값인 `gpt-5.6-sol`로 생성했다.
