'use strict';
(() => {
  const D = window.REPORT_DATA, $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = (v, digits=2) => Number(v).toLocaleString('en-US', {maximumFractionDigits:digits});
  const time = v => {const s=Math.round(v); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  const seconds = v => v<1 ? num(v,3)+'초' : time(v);
  const money = v => '$'+Number(v).toFixed(3);
  const pValue = v => v<.0001 ? '<0.0001' : v.toFixed(4);
  const cell = (v, cls='numeric') => `<td class="${cls}">${v}</td>`;
  const table = (heads, rows) => `<table><thead><tr>${heads.map((h,i)=>`<th class="${i?'numeric':''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>cell(v,i?'numeric':'')).join('')}</tr>`).join('')}</tbody></table>`;
  const labels = {search_guide:'검색·가이드 요청',objects_environment:'오브젝트·배경 구성',motion_effects:'동작·효과 구성',cameras:'카메라 구성',observation:'화면·상태 확인 요청',mixed:'여러 작업 함께 요청',completion:'종료 응답',truncated_no_tool:'출력 한도·도구 호출 없음'};
  const opLabels = {screenshot_scene:'스크린샷',search_assets:'에셋 검색',search_animations:'애니메이션 검색',search_effects:'효과 검색',preview_scene:'미리보기',get_guide:'가이드 읽기'};

  function renderTiming() {
    const key=$('timing-sample').value, s=D.timing[key], total=s.totals.server_seconds.total;
    const projects=key==='additional'?D.timing.additional_runs:D.timing.projects.filter(r=>key!=='sensitivity'||r.number!==11);
    const other=projects.map(r=>r.preload_seconds+r.tail_seconds).sort((a,b)=>a-b);
    const quantile=p=>{const x=(other.length-1)*p,lo=Math.floor(x),hi=Math.ceil(x);return other[lo]+(other[hi]-other[lo])*(x-lo);};
    const otherStats={mean:other.reduce((a,b)=>a+b,0)/other.length,median:quantile(.5),p90:quantile(.9),total:other.reduce((a,b)=>a+b,0)};
    const segments=[['모델 응답',s.totals.model_response_seconds,'model'],['도구 실행',s.totals.tool_execution_seconds,'tools'],['준비·종료',otherStats,'other']];
    $('timing-count').textContent=`${s.runs}건 · ${s.totals.turns.total}턴 · 도구 ${num(s.totals.tool_calls.total,0)}회`;
    $('timing-summary').innerHTML=`평균 <strong>${time(s.totals.client_seconds.mean)}</strong> 중 모델 응답 구간이 <strong>${num(s.totals.model_share_pct,1)}%</strong>. 도구 실행은 평균 <strong>${num(s.totals.tool_execution_seconds.mean,1)}초</strong>.`;
    $('time-split').innerHTML=segments.map(([label,v,cls])=>`<span class="${cls}" style="width:${v.total/total*100}%" title="${label} ${num(v.total/total*100,2)}%"></span>`).join('');
    $('time-split').setAttribute('aria-label',segments.map(([label,v])=>`${label} ${num(v.total/total*100,2)}%`).join(', '));
    $('timing-components').innerHTML=table(['구간','평균','중앙값','P90','합계','비중'],segments.map(([label,v])=>[label,seconds(v.mean),seconds(v.median),seconds(v.p90),seconds(v.total),num(v.total/total*100,2)+'%']));
    $('timing-categories').innerHTML=table(['응답의 작업 종류','턴 수','건당 누적 평균','응답 시간 비중'],Object.entries(s.model_categories).sort((a,b)=>b[1].total-a[1].total).map(([key,v])=>[labels[key],v.n,time(v.mean_per_project_seconds),num(v.share_of_model_pct,1)+'%']));
    const toolRows=Object.entries(s.tools).sort((a,b)=>b[1].total-a[1].total);
    $('timing-tool-table').innerHTML=table(['도구','호출','호출당 평균','건당 누적 평균'],toolRows.slice(0,6).map(([key,v])=>[`${esc(opLabels[key]||key)}<span class="record-note">${esc(key)}</span>`,v.n,num(v.mean,2)+'초',num(v.mean_per_project_seconds,2)+'초']));
    const l=s.long_response_turns_over_60s;
    $('long-turn-summary').innerHTML=`1분 넘는 응답 <strong>${l.n}개(${num(l.turn_share_pct,1)}%)</strong>가 모델 응답 시간의 <strong>${num(l.model_time_share_pct,1)}%</strong>를 차지. 응답 1회의 중앙값은 ${num(s.turn_model_response_seconds.median,1)}초.`;
    $('truncated-table').innerHTML=table(['출력 한도에 도달한 프로젝트','턴','응답 대기','도구 호출'],s.truncated_no_tool_turns.map(t=>[esc(t.project),t.turn,time(t.model_response_interval_seconds),'0회']));
    $('timing-project-table').innerHTML=table(['프로젝트','전체 시간','모델 응답','도구 실행','가장 긴 응답'],projects.map(r=>[esc(r.project),time(r.client_seconds),time(r.model_response_seconds),num(r.tool_execution_seconds,1)+'초',`${time(r.longest_turn.model_response_interval_seconds)}<span class="record-note">${r.longest_turn.turn}턴 · ${esc(labels[r.longest_turn.category])}${r.longest_turn.retries?' · 재시도 '+r.longest_turn.retries+'회':''}</span>`]));
    $('timing-exception').textContent=key==='additional'?'추가요청 6회는 3개 프로젝트에서 관측. 전체 확장 후 생성 1회 포함.':key==='sensitivity'?'공룡에게 츄르를 1건을 제외한 결과.':'공룡에게 츄르를의 약 53분 49초 시계 공백은 타이머에서 제외. 타이머 안의 재시도 시간은 포함. 가장 긴 응답은 개별 1회이며, 작업 종류별 누적 최대와 다름.';
  }
  $('timing-storyboard').innerHTML=table(['단계','평균','중앙값','P90','최대','비중'],[['draft_seconds','초안 작성'],['structure_seconds','컷 구조화'],['images_seconds','컷 이미지 생성']].map(([key,label])=>{const v=D.timing.storyboard[key];return [label,time(v.mean),time(v.median),time(v.p90),time(v.max),num(v.total/D.timing.storyboard.total_seconds.total*100,1)+'%'];}));

  let selectedPoint=null;
  const xLabel = key => key==='cuts'?'컷 수':'영상 길이';
  const yLabel = key => key==='cost_usd'?'생성 비용':'생성 시간';
  function currentRelation() {
    const dataset=D.relationships.datasets.find(d=>d.id===`${$('relation-stage').value}-${$('relation-sample').value}`);
    const result=dataset.results.find(r=>r.x===$('relation-x').value&&r.y===$('relation-y').value);
    return {dataset,result};
  }
  function slopeLabel(r) {
    const delta=r.slope*(r.x==='duration_seconds'?10:1);
    return `${r.x==='cuts'?'1컷':'영상 10초'}당 ${delta>=0?'+':'−'}${r.y==='cost_usd'?money(Math.abs(delta)):num(Math.abs(delta),1)+'초'}`;
  }
  function showPoint(point) {
    selectedPoint=point.project_id;
    $('relation-point').innerHTML=`<strong>${esc(point.project)}</strong> · ${point.cuts}컷 · 영상 ${num(point.duration_seconds,3)}초 · 생성 ${time(point.elapsed_seconds)} · ${money(point.cost_usd)}${point.exception?' · 예외 표본':''}`;
    $('relation-scatter').querySelectorAll('[data-project]').forEach(el=>el.setAttribute('aria-pressed',String(+el.dataset.project===selectedPoint)));
  }
  function renderRelationship() {
    const stage=$('relation-stage').value;
    $('relation-sample').options[1].textContent=stage==='scene'?'재시도 사례 제외 17건':'보충 측정 제외 17건';
    const {dataset:d,result:r}=currentRelation();
    const supported=r.holm_p<.05;
    $('relation-basis').textContent=stage==='scene'?'영상 길이 = 첫 씬 생성 요청 당시 길이(초). 최종 MP4 실측 길이와 다를 수 있음. 생성 시간은 클라이언트 타이머.':'영상 길이 = 해당 스토리보드 생성 결과의 총 길이(초). 사전에 고정한 길이가 아니며, 생성 시간은 서버 타이머.';
    $('relation-conclusion').innerHTML=`${d.n}건에서 ${xLabel(r.x)}와 ${yLabel(r.y)}의 ${supported?`<strong>${r.pearson_r>0?'양':'음'}의 상관관계가 관측됨</strong>`:'<strong>관계를 확정하기 어려움</strong>'}. r = ${num(r.pearson_r,3)}, 보정 p ${r.holm_p<.0001?'&lt; 0.0001':'= '+num(r.holm_p,4)}.`;
    $('relation-metrics').innerHTML=`<h3>선택한 관계 · ${d.n}건</h3><dl><div><dt>Pearson r</dt><dd>${num(r.pearson_r,3)}</dd></div><div><dt>95% 신뢰구간</dt><dd>${num(r.pearson_ci95[0],3)} ~ ${num(r.pearson_ci95[1],3)}</dd></div><div><dt>Spearman ρ</dt><dd>${num(r.spearman_rho,3)}</dd></div><div><dt>순열 p</dt><dd>${esc(pValue(r.permutation_p))}</dd></div><div><dt>Holm 보정 p</dt><dd>${esc(pValue(r.holm_p))}</dd></div><div><dt>R²</dt><dd>${num(r.r_squared,3)}</dd></div></dl><p class="caption">회귀 기울기<br><strong>${slopeLabel(r)}</strong><br>표본 안의 직선 경향이며 인과 효과가 아님.</p>`;
    $('relation-table').innerHTML=table(['관계','Pearson r','95% 신뢰구간','Spearman ρ','순열 p','보정 p'],d.results.map(v=>[`${xLabel(v.x)} ↔ ${yLabel(v.y)}`,num(v.pearson_r,3),`${num(v.pearson_ci95[0],3)} ~ ${num(v.pearson_ci95[1],3)}`,num(v.spearman_rho,3),esc(pValue(v.permutation_p)),esc(pValue(v.holm_p))]));
    $('relation-caveat').textContent=`컷 수와 영상 길이도 서로 연관됨(r = ${num(d.cuts_duration_r,3)}). 두 변수의 독립 효과를 분리한 분석은 아님. ${stage==='storyboard'?'스토리보드 길이는 생성 결과 값이므로 길이를 늘리면 비용이 오른다는 인과 해석에 주의. ':''}신뢰구간은 개별 비교 기준이고, 보정 p는 ${r.holm_family_size}개 비교 기준.`;
    $('relation-raw-table').innerHTML=table(['프로젝트','컷 수','영상 길이(초)','생성 시간(초)','비용 USD'],d.points.map(p=>[`${esc(p.project)}${p.exception?'<span class="record-note">예외 표본</span>':''}`,p.cuts,num(p.duration_seconds,6),num(p.elapsed_seconds,6),Number(p.cost_usd).toFixed(8)]));
    const selected=d.points.find(p=>p.project_id===selectedPoint);
    if(selected) showPoint(selected); else {selectedPoint=null;$('relation-point').textContent='점을 선택하면 프로젝트의 원값을 확인할 수 있음.';}
    drawRelationship();
  }
  function drawRelationship() {
    const {dataset:d,result:r}=currentRelation(), svg=$('relation-scatter');
    const mobile=svg.parentElement.clientWidth<560,W=mobile?420:900,H=mobile?345:370,L=mobile?53:64,R=22,T=32,B=48;
    const paddedX=Math.max(...d.points.map(p=>p[r.x]))*1.08;
    const maxX=r.x==='cuts'?Math.ceil(paddedX/4)*4:paddedX,maxY=Math.max(...d.points.map(p=>p[r.y]))*1.12;
    const x=v=>L+v/maxX*(W-L-R),y=v=>H-B-v/maxY*(H-T-B);
    const color=getComputedStyle(document.documentElement).getPropertyValue(d.pipeline==='scene'?'--scene':'--board').trim();
    let markup=`<defs><clipPath id="relation-bounds"><rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}"/></clipPath></defs>`;
    for(let i=0;i<=4;i++) {
      const vy=maxY*i/4,vx=maxX*i/4;
      markup+=`<line class="grid-line" x1="${L}" y1="${y(vy)}" x2="${W-R}" y2="${y(vy)}"/><text x="${L-10}" y="${y(vy)+4}" text-anchor="end">${r.y==='cost_usd'?'$'+num(vy,2):num(vy/60,1)}</text><text x="${x(vx)}" y="${H-B+24}" text-anchor="middle">${num(vx,r.x==='cuts'?1:0)}</text>`;
    }
    markup+=`<text x="${L}" y="16">${yLabel(r.y)} (${r.y==='cost_usd'?'USD':'분'})</text><text x="${W-R}" y="${H-3}" text-anchor="end">${xLabel(r.x)} (${r.x==='cuts'?'개':'초'})</text><g clip-path="url(#relation-bounds)"><line class="fit-line" x1="${x(0)}" y1="${y(r.intercept)}" x2="${x(maxX)}" y2="${y(r.intercept+r.slope*maxX)}" stroke="${color}"/></g>`;
    for(const p of d.points) {
      const label=`${p.project}, ${p.cuts}컷, 영상 ${num(p.duration_seconds,3)}초, 생성 ${time(p.elapsed_seconds)}, ${money(p.cost_usd)}`;
      const shape=d.pipeline==='scene'?'<rect x="-5" y="-5" width="10" height="10" rx="1"/>':'<circle r="5"/>';
      markup+=`<g class="relation-point" tabindex="0" role="button" data-project="${p.project_id}" aria-pressed="${p.project_id===selectedPoint}" aria-label="${esc(label)}" transform="translate(${x(p[r.x])},${y(p[r.y])})" fill="${color}"><title>${esc(label)}</title><circle class="point-target" r="13"/>${shape}${p.exception?'<circle class="exception-ring" r="9"/>':''}</g>`;
    }
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=markup;
    svg.querySelectorAll('[data-project]').forEach(el=>{
      const p=d.points.find(p=>p.project_id===+el.dataset.project);
      ['mouseenter','focus','click'].forEach(event=>el.addEventListener(event,()=>showPoint(p)));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showPoint(p);}});
    });
  }
  $('timing-sample').addEventListener('change',renderTiming);
  ['relation-stage','relation-sample','relation-x','relation-y'].forEach(id=>$(id).addEventListener('change',renderRelationship));
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(drawRelationship,150);});
  renderTiming();renderRelationship();
})();
