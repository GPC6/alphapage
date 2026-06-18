let apiKey = "";
let myInput;
let submitButton;
let gameState = "ready";
let loading = false;
let statusMessage = "상황 받기 버튼을 눌러 사회생활 대사 게임을 시작하세요.";
let playerLine = "";
let scenario = null;
let evaluation = null;

const MODEL_NAME = "gemini-3.5-flash";
const SYSTEM_PROMPT = [
  "너는 '사회생활 대사 선택 게임'의 게임 마스터이자 평가자다.",
  "게임이 상황을 제시하면 사용자는 그 상황에 맞는 말을 직접 입력한다.",
  "평가는 한국어로 짧고 구체적으로 한다.",
  "무례하거나 조작적인 표현을 좋은 답으로 권하지 않는다.",
  "반드시 요청한 JSON 형식만 출력하고, 마크다운 코드블록은 쓰지 않는다."
].join(" ");

const SCENE_SEEDS = [
  "조별과제",
  "교수님 메일",
  "친구 부탁 거절",
  "단톡방 수습",
  "알바 지각",
  "동기와 오해",
  "회의에서 반대 의견",
  "약속 취소"
];

function setup() {
  createCanvas(920, 760);
  textFont("Arial");
  loadApiKey();

  myInput = createInput();
  myInput.position(24, 778);
  myInput.style("width", "740px");
  myInput.style("height", "38px");
  myInput.style("font-size", "18px");
  myInput.style("padding", "8px 12px");
  myInput.style("border", "1px solid #bbb");
  myInput.style("border-radius", "6px");
  myInput.style("outline", "none");
  myInput.attribute("placeholder", "상황을 받은 뒤, 내가 할 말을 여기에 입력하세요.");
  myInput.elt.addEventListener("keydown", handleInputKeyDown);

  submitButton = createButton("상황 받기");
  submitButton.position(790, 778);
  submitButton.size(104, 56);
  submitButton.style("font-size", "17px");
  submitButton.style("border", "0");
  submitButton.style("border-radius", "6px");
  submitButton.style("background", "#2f6f73");
  submitButton.style("color", "#fff");
  submitButton.style("cursor", "pointer");
  submitButton.mousePressed(handleSubmit);

  setInputMode();
}

function draw() {
  background("#f7f7f2");
  drawHeader();

  if (gameState === "ready") {
    drawReadyIntro();
  } else if (gameState === "answer") {
    drawScenario();
  } else {
    drawResult();
  }

  drawStatus();
}

function keyPressed() {
  if (isInputFocused()) {
    return;
  }

  if (key === "Enter") {
    handleSubmit();
    return false;
  }

  if ((key === "r" || key === "R") && !loading) {
    resetGame();
    return false;
  }
}

function isInputFocused() {
  return myInput && document.activeElement === myInput.elt;
}

function handleInputKeyDown(event) {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    handleSubmit();
  }
}

function loadApiKey() {
  if (typeof setAPIKey === "function") {
    setAPIKey();
  }

  if (apiKey === "" || apiKey === "API_KEY_HERE") {
    apiKey = prompt("Gemini API Key를 입력하세요:") || "";
  }
}

function handleSubmit() {
  if (loading) {
    return;
  }

  if (!ensureApiKey()) {
    return;
  }

  if (gameState === "ready" || gameState === "result") {
    startScenario();
    return;
  }

  const value = myInput.value().trim();
  if (value === "") {
    statusMessage = "상황에 맞게 할 말을 직접 써보세요.";
    return;
  }

  myInput.value("");
  submitLine(value);
}

function ensureApiKey() {
  if (apiKey !== "" && apiKey !== "API_KEY_HERE") {
    return true;
  }

  apiKey = prompt("Gemini API Key를 입력하세요:") || "";
  if (apiKey === "" || apiKey === "API_KEY_HERE") {
    statusMessage = "API 키가 있어야 LLM이 상황을 만들고 평가할 수 있습니다.";
    return false;
  }

  return true;
}

async function startScenario() {
  scenario = null;
  evaluation = null;
  playerLine = "";
  setLoading(true, "LLM이 새 사회생활 상황을 만드는 중...");

  try {
    const result = await requestJson(buildScenarioPrompt());
    scenario = normalizeScenario(result);
    gameState = "answer";
    statusMessage = "주어진 상황에 맞게 실제로 할 말을 입력하세요.";
    setInputMode();
  } catch (error) {
    console.error(error);
    statusMessage = formatRequestError("상황 생성 실패", error);
  } finally {
    setLoading(false);
  }
}

async function submitLine(value) {
  playerLine = value;
  evaluation = null;
  setLoading(true, "LLM이 대사의 적절함을 평가하는 중...");

  try {
    const result = await requestJson(buildEvaluationPrompt(scenario, value));
    evaluation = normalizeEvaluation(result);
    gameState = "result";
    statusMessage = "R을 누르거나 새 상황 버튼을 누르면 다음 판으로 넘어갑니다.";
    setInputMode();
  } catch (error) {
    console.error(error);
    statusMessage = formatRequestError("평가 실패", error);
  } finally {
    setLoading(false);
  }
}

async function requestJson(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ]
    })
  });

  const responseText = await response.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error?.message || responseText || response.statusText;
    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (text === "") {
    throw new Error("응답에서 텍스트를 찾지 못했습니다.");
  }

  return parseJsonText(text);
}

function buildScenarioPrompt() {
  const seed = SCENE_SEEDS[Math.floor(Math.random() * SCENE_SEEDS.length)];

  return [
    "사회생활 대사 게임의 한 라운드를 만들어라.",
    `이번 라운드 소재: ${seed}`,
    "사용자가 직접 상황을 입력하지 않는다. 네가 상황을 제시해야 한다.",
    "상황은 대학생이 겪을 법하고, 말 한마디가 중요한 장면이어야 한다.",
    "아래 JSON 형식만 출력하라.",
    "{",
    '  "title": "짧은 장면 제목, 14자 이내",',
    '  "situation": "사용자가 처한 상황 설명, 70자 이내",',
    '  "npc": "상대 역할",',
    '  "relationship": "상대와의 관계",',
    '  "npcLine": "상대가 먼저 한 말, 45자 이내",',
    '  "playerGoal": "사용자가 말로 달성해야 할 목표, 45자 이내",',
    '  "avoid": "피해야 할 말투나 실수, 45자 이내",',
    '  "criteria": ["평가 기준 1, 12자 이내", "평가 기준 2, 12자 이내", "평가 기준 3, 12자 이내"]',
    "}"
  ].join("\n");
}

function buildEvaluationPrompt(scene, line) {
  return [
    "아래 게임 상황에서 사용자의 대사가 얼마나 적절한지 평가하라.",
    `상황: ${scene.situation}`,
    `상대: ${scene.npc}`,
    `관계: ${scene.relationship}`,
    `상대 말: ${scene.npcLine}`,
    `목표: ${scene.playerGoal}`,
    `피해야 할 점: ${scene.avoid}`,
    `사용자 대사: ${line}`,
    "점수는 0부터 100까지의 정수로 매겨라.",
    "아래 JSON 형식만 출력하라.",
    "{",
    '  "totalScore": 0,',
    '  "tactScore": 0,',
    '  "empathyScore": 0,',
    '  "clarityScore": 0,',
    '  "timingScore": 0,',
    '  "badge": "짧은 칭호, 12자 이내",',
    '  "npcReaction": "상대가 보일 법한 반응, 45자 이내",',
    '  "feedback": "왜 그렇게 평가했는지, 70자 이내",',
    '  "betterLine": "더 적절한 대사 예시, 55자 이내",',
    '  "nextTip": "다음 라운드에 기억할 팁, 55자 이내"',
    "}"
  ].join("\n");
}

function parseJsonText(text) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```$/i, "");
  return JSON.parse(cleaned);
}

function normalizeScenario(result) {
  return {
    title: compactText(result.title || "말 한마디 미션", 18),
    situation: compactText(result.situation || "상대에게 조심스럽게 말해야 하는 상황입니다.", 86),
    npc: compactText(result.npc || "상대방", 14),
    relationship: compactText(result.relationship || "사회적 관계", 18),
    npcLine: compactText(result.npcLine || "그래서 어떻게 할 건데?", 58),
    playerGoal: compactText(result.playerGoal || "내 뜻을 분명히 전하면서 관계를 해치지 않기", 58),
    avoid: compactText(result.avoid || "비난처럼 들리는 말투", 58),
    criteria: compactList(result.criteria, 3, 16)
  };
}

function normalizeEvaluation(result) {
  return {
    totalScore: clampScore(result.totalScore),
    tactScore: clampScore(result.tactScore),
    empathyScore: clampScore(result.empathyScore),
    clarityScore: clampScore(result.clarityScore),
    timingScore: clampScore(result.timingScore),
    badge: compactText(result.badge || "사회생활 연습생", 16),
    npcReaction: compactText(result.npcReaction || "상대가 잠시 생각한 뒤 대화를 이어갑니다.", 58),
    feedback: compactText(result.feedback || "의도는 보이지만 맥락을 조금 더 부드럽게 열면 좋습니다.", 86),
    betterLine: compactText(result.betterLine || "혹시 지금 이야기해도 괜찮을까요? 제가 걱정되는 부분이 있어요.", 68),
    nextTip: compactText(result.nextTip || "상대의 상황을 한 번 인정한 뒤 내 요청을 말하세요.", 68)
  };
}

function compactText(value, maxLength) {
  const textValue = String(value || "").replace(/\s+/g, " ").trim();
  if (textValue.length <= maxLength) {
    return textValue;
  }

  return `${textValue.slice(0, Math.max(0, maxLength - 1))}…`;
}

function compactList(value, count, maxLength) {
  const fallback = ["상대 감정 고려", "내 요청 명확히", "부담 적은 말투"];
  const source = Array.isArray(value) && value.length > 0 ? value : fallback;
  return source.slice(0, count).map((item) => compactText(item, maxLength));
}

function clampScore(value) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function formatRequestError(label, error) {
  const message = error?.message || String(error);

  if (message.includes("Failed to fetch")) {
    return `${label}: 브라우저 요청이 막혔습니다. file://로 열었다면 GitHub Pages나 로컬 서버(http://localhost)에서 여세요.`;
  }

  return `${label}: ${message.slice(0, 110)}`;
}

function setLoading(value, message) {
  loading = value;

  if (message) {
    statusMessage = message;
  }

  if (loading) {
    myInput.attribute("disabled", "true");
    submitButton.attribute("disabled", "true");
    submitButton.style("background", "#888");
  } else {
    setInputMode();
  }
}

function setInputMode() {
  submitButton.removeAttribute("disabled");
  submitButton.style("background", "#2f6f73");

  if (gameState === "answer") {
    myInput.removeAttribute("disabled");
    myInput.attribute("placeholder", "내가 할 말 입력: 예) 지금 이야기해도 괜찮을까요?");
    submitButton.html("평가");
  } else {
    myInput.attribute("disabled", "true");
    myInput.attribute("placeholder", "상황을 받은 뒤, 내가 할 말을 여기에 입력하세요.");
    submitButton.html(gameState === "ready" ? "상황 받기" : "새 상황");
  }
}

function resetGame() {
  gameState = "ready";
  playerLine = "";
  scenario = null;
  evaluation = null;
  statusMessage = "상황 받기 버튼을 눌러 사회생활 대사 게임을 시작하세요.";
  myInput.value("");
  setInputMode();
}

function drawHeader() {
  fill("#1f2328");
  noStroke();
  textSize(32);
  textStyle(BOLD);
  text("사회생활 대사 선택 게임", 36, 54);

  textStyle(NORMAL);
  textSize(15);
  fill("#4e5a61");
  text("게임이 상황을 제시하면, 그 맥락에 맞는 말을 직접 입력해 점수를 받습니다.", 38, 82);

  const label = gameState === "ready" ? "상황 대기" : gameState === "answer" ? "대사 입력" : "평가 결과";
  drawPill(label, 760, 34);
}

function drawReadyIntro() {
  drawPanel(36, 120, 848, 500, "#ffffff");

  fill("#243447");
  textSize(24);
  textStyle(BOLD);
  text("말 한마디로 통과하는 사회생활 미션", 64, 164);

  textStyle(NORMAL);
  textSize(16);
  fill("#38434a");
  text("상황은 LLM이 매 라운드 새로 냅니다. 당신은 주어진 상대, 관계, 목표를 보고 가장 적절한 대사를 입력하면 됩니다.", 64, 202, 760, 48);

  const steps = [
    "1. 상황 받기: LLM이 난처한 사회적 장면을 제시",
    "2. 대사 입력: 내가 실제로 할 말을 한 문장으로 작성",
    "3. 평가 받기: 눈치, 공감, 명확함, 타이밍 점수 확인"
  ];

  for (let i = 0; i < steps.length; i++) {
    drawSmallCard(64, 274 + i * 52, steps[i]);
  }

  fill("#2f6f73");
  textSize(16);
  text("아래 버튼을 누르면 첫 상황이 시작됩니다.", 64, 450);
}

function drawScenario() {
  drawPanel(36, 116, 848, 560, "#ffffff");

  fill("#243447");
  textStyle(BOLD);
  textSize(25);
  text(scenario.title, 64, 158);

  textStyle(NORMAL);
  textSize(15);
  fill("#6a4c93");
  text(`상대: ${scenario.npc} / 관계: ${scenario.relationship}`, 64, 188);

  drawLabelBox("상황", scenario.situation, 64, 216, 376, 150, "#fff4df");
  drawLabelBox("상대의 말", scenario.npcLine, 464, 216, 376, 150, "#eef2ff");
  drawLabelBox("목표", scenario.playerGoal, 64, 392, 376, 122, "#e8f3f1");
  drawLabelBox("피해야 할 점", scenario.avoid, 464, 392, 376, 122, "#fbe8e7");

  fill("#243447");
  textStyle(BOLD);
  textSize(15);
  text("평가 기준", 64, 558);

  textStyle(NORMAL);
  textSize(14);
  fill("#38434a");
  const criteria = scenario.criteria.length > 0 ? scenario.criteria : ["상대 감정 고려", "내 요청의 명확함", "말투의 부담감"];
  text(criteria.map((item) => `- ${item}`).join("   "), 150, 558, 690, 48);
}

function drawResult() {
  drawPanel(36, 108, 848, 590, "#ffffff");

  fill("#243447");
  textStyle(BOLD);
  textSize(24);
  text(`평가: ${evaluation.badge}`, 64, 150);

  drawScoreCircle(evaluation.totalScore, 740, 168);
  drawScoreBar("눈치", evaluation.tactScore, 64, 200);
  drawScoreBar("공감", evaluation.empathyScore, 64, 242);
  drawScoreBar("명확함", evaluation.clarityScore, 64, 284);
  drawScoreBar("타이밍", evaluation.timingScore, 64, 326);

  drawLabelBox("내가 한 말", compactText(playerLine, 58), 464, 230, 376, 96, "#eef2ff");
  drawLabelBox("상대 반응", evaluation.npcReaction, 464, 352, 376, 96, "#e8f3f1");
  drawLabelBox("피드백", evaluation.feedback, 64, 482, 376, 112, "#fff4df");
  drawLabelBox("더 적절한 말", evaluation.betterLine, 464, 482, 376, 112, "#fbe8e7");

  fill("#2f6f73");
  textSize(15);
  text(`다음 팁: ${evaluation.nextTip}`, 64, 640, 760, 36);
}

function drawStatus() {
  fill(loading ? "#8f5b2f" : "#4e5a61");
  textStyle(NORMAL);
  textSize(14);
  text(compactText(statusMessage, 95), 38, 728, 840, 24);
}

function drawPanel(x, y, w, h, colorValue) {
  fill(colorValue);
  stroke("#d8d8d0");
  strokeWeight(1);
  rect(x, y, w, h, 8);
}

function drawSmallCard(x, y, label) {
  fill("#f0f3f5");
  stroke("#d6dee2");
  rect(x, y, 620, 36, 6);
  noStroke();
  fill("#38434a");
  textSize(15);
  text(label, x + 14, y + 23);
}

function drawLabelBox(label, body, x, y, w, h, colorValue) {
  fill(colorValue);
  stroke("#d7d0c7");
  rect(x, y, w, h, 8);
  noStroke();
  fill("#243447");
  textStyle(BOLD);
  textSize(14);
  text(label, x + 16, y + 24);
  textStyle(NORMAL);
  textSize(14);
  fill("#38434a");
  text(compactText(body, Math.floor((w - 32) * (h - 54) / 420)), x + 16, y + 48, w - 32, h - 54);
}

function drawScoreBar(label, value, x, y) {
  fill("#243447");
  textStyle(BOLD);
  textSize(14);
  text(label, x, y);

  fill("#e2e5e7");
  noStroke();
  rect(x + 84, y - 12, 220, 14, 7);

  fill("#2f6f73");
  rect(x + 84, y - 12, map(value, 0, 100, 0, 220), 14, 7);

  fill("#38434a");
  textStyle(NORMAL);
  text(`${value}`, x + 318, y);
}

function drawScoreCircle(value, x, y) {
  noStroke();
  fill("#2f6f73");
  circle(x, y, 104);

  fill("#ffffff");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text(value, x, y - 6);
  textSize(13);
  text("점", x, y + 28);
  textAlign(LEFT, BASELINE);
}

function drawPill(label, x, y) {
  fill("#243447");
  noStroke();
  rect(x, y, 124, 34, 17);
  fill("#ffffff");
  textSize(14);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + 62, y + 17);
  textAlign(LEFT, BASELINE);
}
