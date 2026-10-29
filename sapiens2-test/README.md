# 춤 분석 보고서 — GitHub Pages 배포 폴더

이 폴더의 파일만 복사하면 되는 정적 사이트입니다. Python 설치, 모델 다운로드, npm 빌드, 외부 API가 필요하지 않습니다.

## 새 GitHub Pages 사이트로 올리기

1. 이 폴더 **안의 내용물 전체**를 GitHub 저장소의 최상위에 복사하거나 업로드합니다. `index.html`이 저장소 최상위에 있어야 합니다.
2. 저장소의 **Settings → Pages → Build and deployment → Source → Deploy from a branch**를 선택합니다.
3. 파일을 올린 브랜치(예: `main`)와 **`/(root)`**를 선택하고 **Save**를 누릅니다.
4. 배포가 끝나면 Pages 화면의 **Visit site**로 엽니다.

기존 Pages 사이트에 추가한다면 이 폴더째 게시 폴더 안에 복사해도 됩니다. 그 경우 사이트 주소 뒤에 `/dance-analysis-github-pages/`를 붙여 접속하세요. 링크는 모두 상대 경로여서 저장소 이름이나 하위 폴더에 의존하지 않습니다.

`.nojekyll`은 숨김 파일입니다. 함께 복사하면 Jekyll 빌드 없이 정적 파일을 게시합니다. `assets`와 `data` 폴더의 이름과 위치는 그대로 유지하세요.

## 구성

```text
index.html                  보고서 시작 페이지
.nojekyll                   정적 파일 게시 설정
assets/
  annotated.mp4             관절·각도·비트 표시 영상, 원본 오디오 포함
  angles_motion_A.png        첫 번째 댄서 그래프
  angles_motion_B.png        두 번째 댄서 그래프
data/
  measurements.csv          관절 각도와 손·발 상대 속도
  keypoints.csv             63개 키포인트 좌표·점수·채택 여부
  motion_events.csv         동작 후보와 음악 기준 시간 차이
  summary.json              분석 요약
  metadata.json             분석 설정, 제외 구간, 모델 정보
  pose_data.npz             원시 좌표와 추적 결과
  measurements.npz          각도와 필터 전후 속도
  audio_features.json       추정 템포·비트·소리 시작점
  audio_features.npz        오디오 특징 배열
```

배포용 영상만 웹 업로드를 위해 25MiB 미만으로 재인코딩했습니다. 해상도·프레임률·시간축은 유지했으며 분석 수치는 원본 결과와 같습니다. 원본 고화질 결과와 분석 코드는 이 배포 폴더 밖에 그대로 있습니다. 공개용 메타데이터에는 원본 영상의 파일명만 남기고 로컬 절대 경로를 제거했습니다.

보고서의 시간 버튼을 누르면 해당 동작 1초 전부터 재생합니다. 각도는 2D 추정값이며, 67.3–68.3초는 관객과 관절이 섞인 오류로 수치 계산에서 제외했습니다.

공식 안내: [Pages 게시 폴더 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [정적 파일과 index.html](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [웹 업로드 파일 크기 제한](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).
