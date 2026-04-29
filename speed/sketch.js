let canvas;
let mapSectionEl;
let daySelectEl;
let directionSelectEl;
let hourSliderEl;
let hourValueEl;
let segmentListEl;
let isPlaying = false;
let speedTable;
let minSpeed = Infinity;
let maxSpeed = -Infinity;

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const DIRECTIONS = ['상행', '하행'];
const ROUTE_DATA = {
  상행: [
    {
      id: '1200000800',
      name: '서울대 정문 → 관악구청',
      distanceKm: 1.537,
      points: [
        { x: 0.18, y: 0.57 },
        { x: 0.28, y: 0.64 },
        { x: 0.39, y: 0.635 },
        { x: 0.45, y: 0.615 },
        { x: 0.56, y: 0.54 },
        { x: 0.60, y: 0.51 },
      ],
    },
    {
      id: '1200003400',
      name: '관악구청 → 서울대입구역',
      distanceKm: 0.289,
      points: [
        { x: 0.60, y: 0.51 },
        { x: 0.64, y: 0.50 },
        { x: 0.67, y: 0.49 },
        { x: 0.69, y: 0.485 },
        { x: 0.716, y: 0.48 },
      ],
    },
  ],
  하행: [
    {
      id: '1200003300',
      name: '서울대입구역 → 관악구청',
      distanceKm: 0.29,
      points: [
        { x: 0.716, y: 0.48 },
        { x: 0.69, y: 0.485 },
        { x: 0.67, y: 0.49 },
        { x: 0.64, y: 0.50 },
        { x: 0.60, y: 0.51 },
      ],
    },
    {
      id: '1200000700',
      name: '관악구청 → 서울대 정문',
      distanceKm: 1.481,
      points: [
        { x: 0.60, y: 0.51 },
        { x: 0.56, y: 0.54 },
        { x: 0.45, y: 0.615 },
        { x: 0.39, y: 0.635 },
        { x: 0.28, y: 0.64 },
        { x: 0.18, y: 0.57 },
      ],
    },
  ],
};

const SPEED_DATA = createEmptySpeedData();

function preload() {
  speedTable = loadTable('speed_data.csv', 'csv', 'header');
}

function setup() {
  populateSpeedDataFromTable(speedTable);
  noCanvas();
  buildAppLayout();
  createMapCanvas();
  refreshTimeLabel();
  refreshInfoPanels();
}

function draw() {
  if (!canvas) return;

  drawMapBackground();
  drawRoute();
  drawMarkers();
  drawCanvasOverlayLabels();

  if (isPlaying && frameCount % 30 === 0) {
    hourSliderEl.value = String((getSelectedHour() + 1) % 24);
    refreshTimeLabel();
    refreshInfoPanels();
  }
}

function createMapCanvas() {
  const rect = mapSectionEl.getBoundingClientRect();
  canvas = createCanvas(rect.width, rect.height);
  canvas.parent(mapSectionEl);
  canvas.elt.style.display = 'block';
  canvas.elt.style.position = 'absolute';
  canvas.elt.style.inset = '0';
  canvas.elt.style.borderRadius = '20px';
  canvas.elt.style.zIndex = '1';
}

function buildAppLayout() {
  const root = document.createElement('div');
  root.className = 'app-root';
  document.body.appendChild(root);

  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div>
      <h1>서울대 정문 - 관악구청 - 서울대입구역 평균 주행 속력 시각화</h1>
      <p>요일·방향·시간대별 평균 주행 속력을 지도 위에서 확인합니다.</p>
    </div>
    <div class="header-meta">데이터 출처: 서울시 교통정보 시스템<br>2025년 3월-6월 데이터</div>
  `;
  root.appendChild(header);

  const controlBar = document.createElement('section');
  controlBar.className = 'control-bar';

  const dayBox = createControlBox('요일 선택');
  const daySelect = document.createElement('select');
  DAYS.forEach((day) => {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = `${day}요일`;
    daySelect.appendChild(option);
  });
  daySelect.value = DAYS[0];
  daySelect.addEventListener('change', () => {
    refreshInfoPanels();
  });
  dayBox.body.appendChild(daySelect);
  controlBar.appendChild(dayBox.wrap);

  const directionBox = createControlBox('방향 선택');
  const directionSelect = document.createElement('select');
  DIRECTIONS.forEach((dir) => {
    const option = document.createElement('option');
    option.value = dir;
    option.textContent = dir;
    directionSelect.appendChild(option);
  });
  directionSelect.value = DIRECTIONS[0];
  directionSelect.addEventListener('change', () => {
    refreshInfoPanels();
  });
  directionBox.body.appendChild(directionSelect);
  controlBar.appendChild(directionBox.wrap);

  const content = document.createElement('section');
  content.className = 'content-grid';
  root.appendChild(content);

  const mapSection = document.createElement('div');
  mapSection.className = 'map-section';
  content.appendChild(mapSection);
  mapSection.appendChild(controlBar);

  const rightPanel = document.createElement('aside');
  rightPanel.className = 'right-panel';
  mapSection.appendChild(rightPanel);

  const detailBox = createPanelCard('구간별 평균 주행 속력');
  detailBox.body.innerHTML = `<div id="segment-list" class="segment-list"></div>`;
  rightPanel.appendChild(detailBox.wrap);

  const bottomBar = document.createElement('section');
  bottomBar.className = 'bottom-time-bar';
  root.appendChild(bottomBar);

  const playBtn = document.createElement('button');
  playBtn.className = 'play-btn';
  playBtn.textContent = '▶';
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '❚❚' : '▶';
  });
  bottomBar.appendChild(playBtn);

  const timeInfo = document.createElement('div');
  timeInfo.className = 'time-info';
  timeInfo.innerHTML = `
    <div class="time-label">현재 시간</div>
    <div id="hour-value" class="hour-value"></div>
  `;
  bottomBar.appendChild(timeInfo);

  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'slider-wrap';

  const hourSlider = document.createElement('input');
  hourSlider.type = 'range';
  hourSlider.min = '0';
  hourSlider.max = '23';
  hourSlider.step = '1';
  hourSlider.value = '8';
  hourSlider.addEventListener('input', () => {
    refreshTimeLabel();
    refreshInfoPanels();
  });

  const tickRow = document.createElement('div');
  tickRow.className = 'tick-row';
  for (let i = 0; i <= 24; i += 2) {
    const tick = document.createElement('span');
    tick.textContent = String(i).padStart(2, '0') + ':00';
    if (i == 24) tick.textContent = ''
    tickRow.appendChild(tick);
  }

  sliderWrap.appendChild(hourSlider);
  sliderWrap.appendChild(tickRow);
  bottomBar.appendChild(sliderWrap);

  mapSectionEl = mapSection;
  daySelectEl = daySelect;
  directionSelectEl = directionSelect;
  hourSliderEl = hourSlider;
  hourValueEl = timeInfo.querySelector('#hour-value');
  segmentListEl = detailBox.body.querySelector('#segment-list');
}

function refreshInfoPanels() {
  const segments = getCurrentSegments();
  const day = getSelectedDay();
  const hour = getSelectedHour();

  renderSegmentList(segments, day, hour);
}

function renderSegmentList(segments, day, hour) {
  segmentListEl.innerHTML = '';

  segments.forEach((seg) => {
    const speed = getSpeed(day, hour, getSelectedDirection(), seg.id);
    const item = document.createElement('div');
    item.className = 'segment-item';
    item.style.borderLeft = `6px solid ${speedToCssColor(speed)}`;

    item.innerHTML = `
      <div class="segment-item-top">
        <div class="segment-item-name">${seg.name}</div>
        <div class="segment-item-speed">${speed.toFixed(1)} km/h</div>
      </div>
      <div class="segment-item-meta">${seg.distanceKm.toFixed(1)} km</div>
    `;

    segmentListEl.appendChild(item);
  });
}

function drawMapBackground() {
  background('#eef2f1');

  const routeSpine = getRouteSpinePoints();

  noStroke();
  fill('#d9e7d3');
  ellipse(width * 0.47, height * 0.40, width * 0.22, height * 0.20);
  ellipse(width * 0.56, height * 0.72, width * 0.20, height * 0.16);
  ellipse(width * 0.32, height * 0.18, width * 0.15, height * 0.12);

  fill('#d7e3f1');
  beginShape();
  vertex(0, height * 0.72);
  vertex(width * 0.08, height * 0.69);
  vertex(width * 0.18, height * 0.66);
  vertex(width * 0.28, height * 0.64);
  vertex(width * 0.34, height * 0.67);
  vertex(width * 0.33, height);
  vertex(0, height);
  endShape(CLOSE);

  stroke(255);
  strokeWeight(26);
  noFill();
  drawPolyline(routeSpine);

  stroke('#dadada');
  strokeWeight(8);
  drawPolyline([
    { x: 0.58, y: 0.12 },
    { x: 0.60, y: 0.22 },
    { x: 0.62, y: 0.34 },
    { x: 0.61, y: 0.45 },
  ]);

  drawPolyline([
    { x: 0.34, y: 0.80 },
    { x: 0.45, y: 0.74 },
    { x: 0.56, y: 0.69 },
    { x: 0.66, y: 0.64 },
  ]);

  drawPolyline([
    { x: 0.22, y: 0.32 },
    { x: 0.33, y: 0.37 },
    { x: 0.46, y: 0.43 },
    { x: 0.58, y: 0.46 },
  ]);

  stroke('#ffcf7d');
  strokeWeight(34);
  drawPolyline([
    { x: 0.08, y: 0.50 },
    { x: 0.16, y: 0.54 },
    { x: 0.28, y: 0.60 },
    { x: 0.40, y: 0.62 },
    { x: 0.52, y: 0.60 },
    { x: 0.58, y: 0.72 },
    { x: 0.60, y: 0.88 },
    { x: 0.59, y: 1.02 },
  ]);

  stroke('#6c8ab8');
  strokeWeight(10);
  drawPolyline([
    { x: 0.22, y: -0.02 },
    { x: 0.24, y: 0.10 },
    { x: 0.27, y: 0.22 },
    { x: 0.26, y: 0.32 },
    { x: 0.23, y: 0.40 },
  ]);

  stroke('#2fb34a');
  strokeWeight(14);
  drawPolyline([
    { x: 0.735, y: 0.00 },
    { x: 0.733, y: 0.16 },
    { x: 0.729, y: 0.31 },
    { x: 0.722, y: 0.48 },
    { x: 0.718, y: 0.66 },
    { x: 0.714, y: 1.02 },
  ]);


  noStroke();
  fill('#2fb34a');
  circle(width * 0.722, height * 0.48, 10);
  circle(width * 0.718, height * 0.66, 9);

  noStroke();
  fill(17, 24, 39, 70);
  circle(width * 0.60, height * 0.51, 18);
  circle(width * 0.716, height * 0.48, 18);
  circle(width * 0.18, height * 0.55, 18);

  fill(56, 92, 53, 220);
  textAlign(CENTER, CENTER);
  textSize(18);
  text('청룡산', width * 0.47, height * 0.39);

  fill(76, 85, 99, 220);
  textSize(16);
  text('관악구청', width * 0.59, height * 0.45);
  text('서울대입구역', width * 0.77, height * 0.46);
  text('서울대 정문', width * 0.18, height * 0.61);
}

function drawRoute() {
  const segments = getCurrentSegments();
  const day = getSelectedDay();
  const hour = getSelectedHour();

  segments.forEach((seg) => {
    const speed = getSpeed(day, hour, getSelectedDirection(), seg.id);

    stroke(255, 255, 255, 180);
    strokeWeight(16);
    noFill();
    drawPolyline(seg.points);

    stroke(speedToP5Color(speed));
    strokeWeight(10);
    drawPolyline(seg.points);
  });
}

function drawMarkers() {
  const segments = getCurrentSegments();
  const points = [];
  points.push(segments[0].points[0]);
  segments.forEach((seg) => points.push(seg.points[seg.points.length - 1]));

  const labels = getSelectedDirection() === '상행'
    ? ['출발 서울대 정문', '관악구청', '도착 서울대입구역']
    : ['출발 서울대입구역', '관악구청', '도착 서울대 정문'];

  points.forEach((p, idx) => {
    const px = p.x * width;
    const py = p.y * height;

    fill(255, 255, 255, 220);
    noStroke();
    circle(px, py, 28);

    fill(idx === 0 ? '#1677ff' : idx === points.length - 1 ? '#0f9d58' : '#5b6472');
    stroke(255);
    strokeWeight(3);
    circle(px, py, 18);

    noStroke();
    fill(17, 24, 39, 210);
    rect(px + 12, py + 10, textWidth(labels[idx]) + 20, 30, 999);
    fill(255);
    textSize(14);
    textAlign(LEFT, CENTER);
    text(labels[idx], px + 22, py + 25);
  });
}

function drawCanvasOverlayLabels() {
  fill(17, 24, 39, 220);
  noStroke();
  rect(18, 18, 280, 84, 18);

  fill(255);
  textAlign(LEFT, TOP);
  textSize(16);
  text(`${getSelectedDay()}요일 · ${getSelectedDirection()}`, 34, 34);
  textSize(28);
  text(formatHourLabel(getSelectedHour()), 34, 56);
}

function getCurrentSegments() {
  return ROUTE_DATA[getSelectedDirection()];
}

function getSpeed(day, hour, direction, segmentId) {
  return SPEED_DATA[day]?.[hour]?.[direction]?.[segmentId] ?? 0;
}

function getSelectedDay() {
  return daySelectEl.value;
}

function getSelectedDirection() {
  return directionSelectEl.value;
}

function getSelectedHour() {
  return Number(hourSliderEl.value);
}

function refreshTimeLabel() {
  hourValueEl.textContent = formatHourRange(getSelectedHour());
}

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function formatHourRange(hour) {
  const next = (hour + 1) % 24;
  return `${String(hour).padStart(2, '0')}:00 - ${String(next).padStart(2, '0')}:00`;
}

function speedToCssColor(speed) {
  const { r, g, b } = speedToRgb(speed);
  return `rgb(${r}, ${g}, ${b})`;
}

function speedToP5Color(speed) {
  const { r, g, b } = speedToRgb(speed);
  return color(r, g, b);
}

function drawPolyline(points) {
  noFill();
  beginShape();
  points.forEach((p) => vertex(p.x * width, p.y * height));
  endShape();
}

function getRouteSpinePoints() {
  const segments = ROUTE_DATA.상행;
  const spine = [];

  segments.forEach((seg, segIndex) => {
    seg.points.forEach((point, pointIndex) => {
      if (segIndex > 0 && pointIndex === 0) return;
      spine.push(point);
    });
  });

  return spine;
}

function createControlBox(title) {
  const wrap = document.createElement('div');
  wrap.className = 'control-box';

  const label = document.createElement('div');
  label.className = 'control-box-title';
  label.textContent = title;
  wrap.appendChild(label);

  const body = document.createElement('div');
  body.className = 'control-box-body';
  wrap.appendChild(body);

  return { wrap, body };
}

function createPanelCard(title) {
  const wrap = document.createElement('div');
  wrap.className = 'panel-card';

  const heading = document.createElement('div');
  heading.className = 'panel-card-title';
  heading.textContent = title;
  wrap.appendChild(heading);

  const body = document.createElement('div');
  body.className = 'panel-card-body';
  wrap.appendChild(body);

  return { wrap, body };
}

function createEmptySpeedData() {
  const data = {};

  DAYS.forEach((day) => {
    data[day] = {};

    for (let hour = 0; hour < 24; hour++) {
      data[day][hour] = {
        상행: {},
        하행: {},
      };
    }
  });

  return data;
}

function populateSpeedDataFromTable(table) {
  if (!table) return;

  for (let rowIndex = 0; rowIndex < table.getRowCount(); rowIndex++) {
    const row = table.getRow(rowIndex);
    const day = row.getString('week').trim();
    const direction = row.getString('dir').trim();
    const segmentId = row.getString('seg_id').trim();

    if (!SPEED_DATA[day] || !SPEED_DATA[day][0] || !SPEED_DATA[day][0][direction]) {
      continue;
    }

    for (let hour = 0; hour < 24; hour++) {
      const rawValue = row.getString(String(hour + 1)).trim();
      const speed = Number.parseFloat(rawValue);

      if (!Number.isFinite(speed)) {
        continue;
      }

      SPEED_DATA[day][hour][direction][segmentId] = speed;
      minSpeed = Math.min(minSpeed, speed);
      maxSpeed = Math.max(maxSpeed, speed);
    }
  }
}

function normalizeSpeed(speed) {
  if (!Number.isFinite(speed)) return 0;
  if (!Number.isFinite(minSpeed) || !Number.isFinite(maxSpeed) || maxSpeed <= minSpeed) {
    return 0;
  }

  return constrain((speed - minSpeed) / (maxSpeed - minSpeed), 0, 1);
}

function speedToRgb(speed) {
  const hue = lerp(0, 120, normalizeSpeed(speed));
  return hslToRgb(hue, 78, 46);
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const saturation = constrain(s / 100, 0, 1);
  const lightness = constrain(l / 100, 0, 1);

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = chroma;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = chroma;
  } else if (hue < 180) {
    gPrime = chroma;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = chroma;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = chroma;
  } else {
    rPrime = chroma;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + match) * 255),
    g: Math.round((gPrime + match) * 255),
    b: Math.round((bPrime + match) * 255),
  };
}
