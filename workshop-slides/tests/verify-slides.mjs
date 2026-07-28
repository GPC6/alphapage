import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve(import.meta.dirname, '..', 'index.html');
assert.ok(fs.existsSync(htmlPath), 'index.html must exist');
const html = fs.readFileSync(htmlPath, 'utf8');
const slides = html.match(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"/g) ?? [];
assert.equal(slides.length, 56, `expected 56 slides, found ${slides.length}`);
const slideBlocks = html.match(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[\s\S]*?<\/section>/g) ?? [];
slideBlocks.forEach((block, index) => {
  const number = index + 1;
  assert.match(block, new RegExp(`id=["']slide-${number}["']`), `slide ${number} has the wrong id`);
  assert.match(
    block,
    new RegExp(`<span class=["']slide-number["']>${String(number).padStart(2, '0')} / 56</span>`),
    `slide ${number} has the wrong visible number`,
  );
});

for (const id of [
  'prev-button',
  'next-button',
  'fullscreen-button',
  'slide-counter',
  'progress-bar',
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
}

for (const marker of [
  'AI 보완',
  '회칙 제2조',
  '회칙 제9조',
  '회칙 제12조',
  '회칙 제15조',
  '회칙 제18조',
  '운영진 내규 제1장',
  '운영진 내규 제3장',
  '운영진 내규 제4장',
  '운영진 내규 제5장',
  '정회원이나 가족회원 5명 이상의 연서',
  '개정된 회칙은 회장이 3일 내에 공고',
  '자아실현과 친목을 도모한다',
  '8장르 무대를 우선으로 받고',
  '행사와 사업의 구체적인 지침은 다루지 않음',
  '혜택 소급 취소',
  '모든 H.I.S. 부원에게 열린 연습의 장',
  '회칙 [2026.01.19. 개정]',
  '운영진 내규 [2026.02.18. 운영회의 의결]',
  '배정 공지',
  '매년 초 선발',
  '카페에 많은 관심을 가져주세요.',
  '오비에게 온 연락, 어떻게 답할까?',
  '많은 OB 가족기수가 있다는 점은 H.I.S.의 장점',
  '아이스 브레이킹 용지 배부 · 팀의 각오 한마디 적기',
  '본회의 운영에 필수적인 업무를 집행',
  '모든 업무 총괄 · 대외 대표',
  '인수인계서를 꼼꼼히 읽습니다',
  '기존 방식의 이유',
  '예상 문제점을 반드시 확인',
  '30기 손지유',
  '30기 권민준',
  '30기 이재영',
  '운영진의 공지는 가볍지 않습니다',
  '참여 자격·제한에는 명확한 이유 붙이기',
  '질문에 공지를 그대로 인용할 만큼, 정보는 빠짐없이',
  '세부 내용은 폼에서 확인하도록 안내',
  '2026 히스 회계장부',
  '회계 이재영에게 카톡으로',
  '영수증 사진',
  '환급 요청',
  '안건지는 H.I.S. 구글 드라이브에 업로드됩니다',
  '지금 H.I.S. 구글 계정에 로그인합니다',
  '운영팀은 이런 일 합니다',
  '카훗 QR 교체 영역',
]) {
  assert.ok(html.includes(marker), `missing content marker: ${marker}`);
}

assert.equal((html.match(/AI 보완/g) ?? []).length, 6, 'AI 보완 labels must remain on all six generated rule scenarios');
assert.match(
  html,
  /\.slide\[data-section="rules-game"\] \.display-line--acid\s*\{[^}]*color:\s*var\(--ink\)[^}]*background:\s*var\(--acid\)/s,
  'the rules activity title must use dark text on the acid highlight',
);
assert.match(html, /class="portrait-photo portrait-photo--president"[^>]*src="assets\/president-son-jiyu\.jpeg"/);
assert.match(html, /class="portrait-photo portrait-photo--vice-president"[^>]*src="assets\/vice-president-kwon-minjun\.jpeg"/);
assert.match(html, /class="portrait-photo portrait-photo--accountant"[^>]*src="assets\/accountant-lee-jaeyoung\.jpeg"/);
assert.equal(
  (slideBlocks[2].match(/class="portrait-sticker /g) ?? []).length,
  2,
  'the accountant portrait must have exactly two Toto stickers',
);
assert.match(slideBlocks[2], /src="assets\/accountant-sticker-toto-upside\.png"/);
assert.match(slideBlocks[2], /src="assets\/accountant-sticker-toto-sleepy\.png"/);
assert.match(html, /\.portrait-photo\s*\{[^}]*object-fit:\s*cover/s, 'leadership portraits must use a face-focused crop');
assert.doesNotMatch(html, /portrait-slot--pending|사진 준비 중/, 'accountant placeholder must be replaced');
assert.match(html, /class="notice-example"[^>]*src="assets\/notice-good\.jpeg"/);
assert.match(html, /class="notice-example"[^>]*src="assets\/notice-bad\.jpeg"/);
assert.match(html, /\.notice-example\s*\{[^}]*object-fit:\s*contain/s, 'notice images must remain uncropped');
assert.doesNotMatch(html, /사진 교체 영역|공지 이미지 교체 영역/, 'filled image placeholders must be removed');
assert.match(html, /data-team-intro-player/);
assert.match(html, /function playTeamIntro/);
assert.match(html, /@keyframes team-intro-cover-out/);
assert.match(
  slideBlocks[3],
  /id="slide-4" data-section="people-teams"[\s\S]*class="team-intro-wrap"[\s\S]*class="team-intro-name"[\s\S]*운영팀[\s\S]*data-team-intro-player/,
  'the operating-team label must be a separate element before the intro player',
);
assert.match(
  slideBlocks[4],
  /id="slide-5" data-section="people-team-dance"[\s\S]*댄스팀[\s\S]*src="assets\/dance-team-intro\.png"/,
);
assert.match(
  slideBlocks[5],
  /id="slide-6" data-section="people-team-activity"[\s\S]*활동팀[\s\S]*src="assets\/activity-team-intro\.jpeg"/,
);
assert.match(
  slideBlocks[6],
  /id="slide-7" data-section="people-team-media"[\s\S]*미디어팀[\s\S]*src="assets\/media-team-intro\.png"/,
  'the media-team slide must use the uploaded introduction image',
);
assert.match(
  slideBlocks[7],
  /id="slide-8" data-section="people-team-secretary"[\s\S]*class="slide-stage slide-stage--center team-title-only-stage"[\s\S]*SECRETARY TEAM[\s\S]*서기팀/,
  'the secretary-team slide must be title-only',
);
assert.doesNotMatch(slideBlocks[7], /team-feature-media|팀 소개 자료 삽입 영역/, 'the secretary-team slide must not contain a photo area');
assert.doesNotMatch(html, /팀 소개 자료 삽입 영역/, 'no team introduction placeholders may remain');
assert.match(
  slideBlocks[8],
  /id="slide-9" data-section="people-newcomers"[\s\S]*신입 운영진[\s\S]*팀장이 이름을 부르면 앞으로 나와주세요[\s\S]*팀장 옆에서 짧게 자기소개를 해주세요/,
  'slide 9 must explain the team-leader call and newcomer introduction flow',
);
assert.doesNotMatch(html, /data-section="people-activity-team"/, 'the obsolete team-guessing activity must be removed');
assert.match(
  slideBlocks[9],
  /id="slide-10" data-section="people-activity-lead"[\s\S]*ACTIVITY 0[\s\S]*이 상황, 누구에게\?[\s\S]*어느 팀장에게 말해야 할지/,
  'the remaining activity must become slide 10 with its name and explanation',
);
assert.doesNotMatch(slideBlocks[9], /class="activity-index"/, 'the remaining activity must not display a game number');
assert.match(html, /data-flip-card/);
assert.match(html, /data-timeline-item/);
assert.doesNotMatch(html, /history-quiz|WRAP-UP QUIZ/, 'part 1 wrap-up quiz must be removed');
assert.doesNotMatch(html, /퀴즈는 진행자가 별도로 준비합니다\./, 'facilitator preparation note must be removed');
assert.match(
  slideBlocks[48],
  /id="slide-49" data-section="practice-drive-login"[\s\S]*안건지는 H\.I\.S\. 구글 드라이브에 업로드됩니다[\s\S]*지금 H\.I\.S\. 구글 계정에 로그인합니다/,
  'Google Drive login slide must follow the original slide 45',
);
assert.match(
  slideBlocks[49],
  /id="slide-50" data-section="practice-accounting"[\s\S]*2026 히스 회계장부[\s\S]*회계 이재영에게 카톡으로[\s\S]*영수증 사진[\s\S]*환급 요청/,
  'accounting reimbursement process must immediately follow the Google Drive login slide',
);
assert.doesNotMatch(html, /회계 처리 자료 삽입 영역/, 'accounting placeholder must be replaced');
assert.match(html, /data-document-reveal/);
assert.match(html, /document-sheet document-sheet--first/);
assert.match(html, /id="document-sheet-cafe" class="document-sheet document-sheet--second" aria-hidden="true"/);
assert.match(html, /aria-expanded="false"/);
assert.match(html, /function syncDocumentReveal/);
assert.match(html, /stack\.addEventListener\("click",[\s\S]*?syncDocumentReveal\(stack, true\)/);
assert.match(html, /if \(!isActive\) \{[\s\S]*?syncDocumentReveal\(stack, false\)/);
assert.match(html, /@keyframes document-reveal/);
assert.doesNotMatch(html, /transform:\s*rotate\(180deg\)/, 'agenda type labels must not be upside down');
assert.match(html, /\.slide-number\s*\{[^}]*top:\s*24px/s, 'slide number must sit above the content label');
assert.match(
  html,
  /slide\.toggleAttribute\(["']inert["'],\s*!isActive\)/,
  'inactive slides must leave the keyboard tab order',
);
assert.match(
  html,
  /\.slide\[data-section=["']opening["']\]::after,\s*\.slide\[data-section=["']history-title["']\]::after/,
  'dark cover must use the white logo artwork',
);
assert.match(
  html,
  /window\.setTimeout\(updateFullscreenLabel,\s*500\)/,
  'fullscreen control must resync after browsers leave fullscreen without a change event',
);
assert.doesNotMatch(html, /<(?:script|link)\b[^>]*(?:src|href)=["']https?:/i);
assert.doesNotMatch(html, /\b(?:TODO|TBD|Lorem ipsum)\b/i);

for (const asset of [
  'logo-black.png',
  'logo-white.png',
  'president-son-jiyu.jpeg',
  'vice-president-kwon-minjun.jpeg',
  'accountant-lee-jaeyoung.jpeg',
  'accountant-sticker-toto-upside.png',
  'accountant-sticker-toto-sleepy.png',
  'dance-team-intro.png',
  'activity-team-intro.jpeg',
  'media-team-intro.png',
  'notice-good.jpeg',
  'notice-bad.jpeg',
  'team-intro/intro-cover.png',
  'team-intro/interlude.gif',
  'team-intro/final-left-top.png',
  'team-intro/final-left-bottom.png',
  'team-intro/final-mascot.gif',
  'team-intro/final-strip-1.jpg',
  'team-intro/final-strip-2.jpg',
  'team-intro/final-strip-3.jpg',
  'team-intro/final-meeting.png',
  'team-intro/final-room.png',
]) {
  const assetPath = path.resolve(import.meta.dirname, '..', 'assets', asset);
  assert.ok(fs.existsSync(assetPath), `missing local asset: ${asset}`);
}

console.log('Verified: 56 slides, local assets, source labels, placeholders, and interactions.');
