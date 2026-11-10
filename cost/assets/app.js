'use strict';
(() => {
  const D = window.REPORT_DATA;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (v, digits=3) => v == null ? '—' : '$' + Number(v).toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const number = (v, digits=3) => v == null ? '—' : Number(v).toLocaleString('en-US',{maximumFractionDigits:digits});
  const duration = v => {if(v == null) return '—'; const s = Math.round(v); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
  const date = v => v ? new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v)) : '—';
  const group = id => D.groups.find(g => g.id === id);
  const colors = {storyboard:'#79dbb5',scene:'#a9caff',followup:'#f0c879'};
  let selected = 1, rawPage = 0, filteredRaw = [];
  const pageSize = 15;
  const marker = kind => `<i class="marker ${kind==='storyboard'?'board':kind==='followup'?'follow':'scene'}" aria-hidden="true"></i>`;
  const td = (v, cls='numeric') => `<td class="${cls}">${v}</td>`;

  $('summary-body').innerHTML = ['storyboard','scene','followup'].map(kind => {
    const m=group(kind).metrics;
    return `<tr><td>${marker(kind)}${esc(D.types[kind])}</td>${td(m.cost_usd.n)}${td(money(m.cost_usd.mean),'numeric big-value')}${td(duration(m.elapsed_seconds.mean),'numeric big-value')}</tr>`;
  }).join('');

  function renderProjects() {
    const query=$('project-search').value.trim().toLocaleLowerCase();
    const cohort=$('cohort').value;
    const sort=$('project-sort').value;
    const key={sceneCost:p=>p.scene.cost_usd,sceneTime:p=>p.scene.elapsed_seconds,storyCost:p=>p.storyboard.cost_usd,storyTime:p=>p.storyboard.elapsed_seconds,followCost:p=>p.followup_cost_stats.total??-1};
    const projects=D.projects.filter(p=>p.name.toLocaleLowerCase().includes(query) && (cohort==='all'||cohort==='followup'&&p.followups.length||p.cohort===cohort));
    projects.sort(sort==='id'?(a,b)=>a.id-b.id:(a,b)=>key[sort](b)-key[sort](a)||a.id-b.id);
    $('project-count').textContent=`${projects.length} / 18개 프로젝트`;
    $('project-body').innerHTML=projects.length?projects.map(p=>`<tr class="${p.id===selected?'selected':''}"><td class="sticky-col"><button class="project-button" data-project="${p.id}" aria-pressed="${p.id===selected}"><span class="project-id">${String(p.id).padStart(2,'0')}</span><span>${esc(p.name)}${p.id===1?' ★':p.id===11?' †':''}</span></button></td>${td(p.cuts)}${td(money(p.storyboard.cost_usd))}${td(duration(p.storyboard.elapsed_seconds))}${td(money(p.scene.cost_usd))}${td(duration(p.scene.elapsed_seconds))}${p.followups.length?td(p.followups.length)+td(money(p.followup_cost_stats.total))+td(duration(p.followup_time_stats.total)):'<td colspan="3" class="missing">집계 기록 없음</td>'}</tr>`).join(''):'<tr><td colspan="9" class="empty">검색 결과 없음. 검색어나 집단을 변경해 주세요.</td></tr>';
    document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>selectProject(+b.dataset.project,true)));
  }
  function selectProject(id, scroll=false) {
    selected=id;
    renderProjects();
    const p=D.projects.find(p=>p.id===id), s=p.storyboard, c=p.scene;
    const stageRows=[['연출안 작성',s.draft_usd,s.draft_seconds],['구조화·검사',s.structure_usd,s.structure_seconds],['컷 이미지 생성',s.images_usd,s.images_seconds],['전체',s.cost_usd,s.elapsed_seconds]];
    const costRow=(label,cost,time)=>`<tr><td>${label}</td>${td(money(cost,6))}${td(duration(time))}</tr>`;
    const note=({1:'스토리보드: 2026.11.08 보충 측정 · 8컷·43초. 기존 첫 씬은 8컷·23.5초 기준.',11:'시간 간극이 있어 경과 타이머 기준으로 집계. 유료 재시도 비용 포함.',14:'첫 씬은 4컷·13초 기준. 이후 확장은 추가요청에 집계.'})[id] || '';
    $('project-detail').innerHTML=`<div class="detail-heading"><h3 id="detail-title" tabindex="-1">${esc(p.name)}</h3><span>${p.cohort==='beta_030'?'기존 베타':'신규 웹'} · 첫 씬 ${p.cuts}컷</span></div>${note?`<p class="detail-note">${esc(note)}</p>`:''}<div class="detail-grid"><div><h4 class="board-ink">스토리보드 생성</h4><table><thead><tr><th>단계</th><th class="numeric">비용 USD</th><th class="numeric">시간</th></tr></thead><tbody>${stageRows.map(r=>costRow(...r)).join('')}</tbody></table><p>${date(s.started_utc)} KST · ${s.cuts}컷 · 결과 길이 ${number(s.generated_duration_seconds)}초</p><code class="run-id">${esc(s.run_id)}</code></div><div><h4 class="scene-ink">첫 씬 생성</h4><table><thead><tr><th>측정 항목</th><th class="numeric">값</th></tr></thead><tbody><tr><td>전체 API 비용</td>${td(money(c.cost_usd,8))}</tr><tr><td>씬 모델 / 임베딩</td>${td(money(c.scene_model_cost_usd,6)+' / '+money(c.embedding_cost_usd,8))}</tr><tr><td>클라이언트 타이머</td>${td(duration(c.elapsed_seconds)+' <span class="stat-unit">'+number(c.elapsed_seconds)+'초</span>')}</tr><tr><td>UTC 시작–종료 차이</td>${td(duration(c.wall_elapsed_seconds))}</tr><tr><td>턴 / 유료 호출</td>${td(c.turns+' / '+c.billable_calls)}</tr></tbody></table><p>${date(c.started_utc)} KST · 요청 영상 ${number(c.target_duration_seconds)}초</p><code class="run-id">${esc(c.run_id)}</code></div></div><div class="detail-follow"><h4 class="follow-ink">추가 씬 요청 ${p.followups.length?`· ${p.followups.length}건`:''}</h4>${p.followups.length?`<div class="table-scroll" tabindex="0" role="region" aria-label="선택한 프로젝트의 추가요청 내역"><table><thead><tr><th>요청</th><th>시작 시각 KST</th><th class="numeric">비용 USD</th><th class="numeric">시간</th><th class="numeric">턴</th></tr></thead><tbody>${p.followups.map((r,i)=>`<tr><td>${i+1}. ${r.kind==='expanded_regeneration'?'전체 확장 재생성':'씬 수정'}<code class="run-id">${esc(r.run_id)}</code></td><td>${date(r.started_utc)}</td>${td(money(r.cost_usd,6))}${td(duration(r.elapsed_seconds))}${td(r.turns)}</tr>`).join('')}</tbody></table></div><div class="totals"><span>합계 <strong>${money(p.followup_cost_stats.total)} · ${duration(p.followup_time_stats.total)}</strong></span><span>회당 평균 <strong>${money(p.followup_cost_stats.mean)} · ${duration(p.followup_time_stats.mean)}</strong></span></div>`:'<p>집계 기록 없음.</p>'}<p>별도 스토리보드 기록: 컷 재생성 ${p.panels.length}회${p.expansions.length?' · 전체 확장 '+p.expansions.length+'건':''}.</p><div class="detail-actions"><a href="#raw" id="project-raw-link">이 프로젝트 원자료 보기 →</a>${p.followups.length?'<a href="#statistics" id="project-stats-link">추가요청 전체 통계 보기 →</a>':''}</div></div>`;
    $('project-raw-link').addEventListener('click',()=>{$('raw-project').value=String(id);$('raw-kind').value='all';rawPage=0;renderRaw();});
    $('project-stats-link')?.addEventListener('click',()=>{$('population').value='followup-project-'+id;renderStats();});
    if(scroll) window.dispatchEvent(new CustomEvent('report:project',{detail:{id:'legacy',number:id}}));
    if(scroll){$('detail-title').focus({preventScroll:true});}
  }

  function renderChart() {
    const kind=$('chart-kind').value;
    const runs=D.runs.filter(r=>['storyboard','scene','followup'].includes(r.pipeline)&&(kind==='all'||r.pipeline===kind));
    const compact=$('scatter').clientWidth<560;
    const W=compact?370:900,H=compact?280:320,L=43,R=20,T=23,B=38;
    const maxX=Math.max(1,Math.ceil(Math.max(...runs.map(r=>r.cost_usd))*1.08));
    const maxY=Math.ceil(Math.max(...runs.map(r=>r.elapsed_seconds/60))*1.1/2)*2;
    const x=v=>L+(W-L-R)*v/maxX,y=v=>H-B-(H-B-T)*v/maxY;
    let svg=`<title>실행별 비용과 소요 시간</title><desc>가로축은 USD, 세로축은 분. 점을 선택하면 프로젝트 상세가 열립니다. 같은 값은 원자료 표에서도 확인할 수 있습니다.</desc>`;
    for(let i=0;i<=4;i++){const yy=maxY*i/4;svg+=`<line class="gridline" x1="${L}" y1="${y(yy)}" x2="${W-R}" y2="${y(yy)}"/><text x="${L-9}" y="${y(yy)+4}" text-anchor="end">${number(yy,1)}</text>`;}
    for(let i=0;i<=4;i++){const xx=maxX*i/4;svg+=`<text x="${x(xx)}" y="${H-13}" text-anchor="middle">$${number(xx,2)}</text>`;}
    svg+=`<text x="${L}" y="13">시간 (분)</text><text x="${W-R}" y="13" text-anchor="end">${runs.length}건 · 비용 (USD)</text>`;
    runs.forEach(r=>{const xx=x(r.cost_usd),yy=y(r.elapsed_seconds/60),shape=r.pipeline==='storyboard'?'<circle r="5"/>':r.pipeline==='scene'?'<rect x="-4.8" y="-4.8" width="9.6" height="9.6" rx="1"/>':'<path d="M0-6 6 0 0 6-6 0Z"/>';
      const label=`${r.project_name}, ${r.pipeline_label}, ${money(r.cost_usd)}, ${duration(r.elapsed_seconds)}`;
      svg+=`<g class="point" role="link" tabindex="0" data-run="${r.record_id}" transform="translate(${xx},${yy})" fill="${colors[r.pipeline]}" aria-label="${esc(label)}"><title>${esc(label)}</title>${shape}</g>`;
    });
    $('scatter').setAttribute('viewBox',`0 0 ${W} ${H}`);$('scatter').innerHTML=svg;
    $('plot-range').innerHTML=`비용 ${money(Math.min(...runs.map(r=>r.cost_usd)),2)}–${money(Math.max(...runs.map(r=>r.cost_usd)),2)}<br>시간 ${duration(Math.min(...runs.map(r=>r.elapsed_seconds)))}–${duration(Math.max(...runs.map(r=>r.elapsed_seconds)))}`;
    $('scatter').querySelectorAll('[data-run]').forEach(el=>{
      const r=D.runs.find(r=>r.record_id===el.dataset.run);
      const show=()=>{$('chart-tooltip').innerHTML=`<strong>${esc(r.project_name)}</strong>${esc(r.pipeline_label)} · ${money(r.cost_usd)} · ${duration(r.elapsed_seconds)}`;$('chart-tooltip').hidden=false;};
      const hide=()=>{$('chart-tooltip').hidden=true;};
      const go=()=>{hide();$('project-search').value='';$('cohort').value='all';selectProject(r.project_id,true);};
      el.addEventListener('mouseenter',show);el.addEventListener('mouseleave',hide);el.addEventListener('focus',show);el.addEventListener('blur',hide);el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}if(e.key==='Escape')hide();});
    });
  }

  const statDefs=[['n','관측 수'],['mean','평균'],['median','중앙값'],['total','합계'],['min','최솟값'],['max','최댓값'],['sample_stddev','표본 표준편차'],['sample_variance','표본 분산'],['standard_error','평균의 표준오차'],['p10','P10'],['p25','P25 · 제1사분위수'],['p75','P75 · 제3사분위수'],['p90','P90'],['p95','P95'],['iqr','사분위 범위 · IQR'],['cv_percent','변동계수']];
  $('population').innerHTML=D.groups.map(g=>`<option value="${g.id}">${esc(g.label)} (${Object.values(g.metrics)[0].n}건)</option>`).join('');
  function statValue(m,key) {
    const v=m[key];if(v==null)return '<span class="muted">정의 안 됨</span>';
    if(key==='n')return number(v,0);
    if(key==='cv_percent')return number(v,2)+'%';
    if(key==='sample_variance')return number(v,6)+` <span class="stat-unit">${m.unit==='USD'?'USD²':m.unit==='seconds'?'초²':'개²'}</span>`;
    if(m.unit==='USD')return money(v,6);
    if(m.unit==='seconds')return $('stats-precision').checked?number(v,6)+' <span class="stat-unit">초</span>':duration(v);
    return number(v,3);
  }
  function renderStats() {
    const g=group($('population').value),metrics=Object.values(g.metrics);
    $('population-note').textContent=(g.note||'')+(g.id==='storyboard'?' 기존 기록 17건 + 보충 측정 1건.':g.id==='followup'?' 수정 5건 + 전체 확장 1건.':'');
    $('stats-table').innerHTML=`<table class="stats-table"><thead><tr><th>통계량</th>${metrics.map(m=>`<th>${esc(m.label)} <span class="stat-unit">${m.unit==='USD'?'USD':m.unit==='seconds'?($('stats-precision').checked?'초':'분:초'):'개'}</span></th>`).join('')}</tr></thead><tbody>${statDefs.map(([key,label])=>`<tr class="${['mean','median'].includes(key)?'emphasis':''}"><td>${label}</td>${metrics.map(m=>td(statValue(m,key))).join('')}</tr>`).join('')}</tbody></table>`;
  }
  const base=group('storyboard').metrics;
  $('stage-table').innerHTML='<table><thead><tr><th>단계</th><th class="numeric">평균 시간</th><th class="numeric">시간 비중</th><th class="numeric">평균 비용 USD</th><th class="numeric">비용 비중</th></tr></thead><tbody>'+['draft','structure','images'].map((key,i)=>{const m=group('story-'+key).metrics;return `<tr><td>${['연출안 작성','구조화·검사','컷 이미지 생성'][i]}</td>${td(number(m[key+'_seconds'].mean,1)+'초')}${td(number(m[key+'_seconds'].total/base.elapsed_seconds.total*100,1)+'%')}${td(money(m[key+'_usd'].mean,6))}${td(number(m[key+'_usd'].total/base.cost_usd.total*100,1)+'%')}</tr>`;}).join('')+'</tbody></table>';

  $('raw-project').innerHTML+=D.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  function renderRaw() {
    filteredRaw=D.runs.filter(r=>($('raw-kind').value==='all'||r.pipeline===$('raw-kind').value)&&($('raw-project').value==='all'||r.project_id===+$('raw-project').value));
    const pages=Math.max(1,Math.ceil(filteredRaw.length/pageSize));rawPage=Math.min(rawPage,pages-1);
    $('raw-count').textContent=`${filteredRaw.length}건`;
    $('raw-body').innerHTML=filteredRaw.length?filteredRaw.slice(rawPage*pageSize,(rawPage+1)*pageSize).map(r=>`<tr><td><details><summary>${esc(r.project_name)}<span class="record-note">${esc(r.record_id)}${r.request_group?' · '+esc(r.request_group):''}</span></summary><pre>${esc(JSON.stringify(r,null,2))}</pre></details></td><td class="record-kind">${esc(r.pipeline_label)}${r.pipeline==='followup'?'<span class="record-note">'+(r.kind==='expanded_regeneration'?'전체 확장':'씬 수정')+'</span>':''}${r.edit_mode?'<span class="record-note">'+esc(r.edit_mode)+'</span>':''}${r.measurement_origin==='supplemental_rerun_2026-11-08'?'<span class="record-note">★ 보충 생성</span>':''}</td><td>${date(r.started_utc)}</td>${td(money(r.cost_usd,8))}${td(number(r.elapsed_seconds,6))}</tr>`).join(''):'<tr><td colspan="5" class="empty">집계 기록 없음. 작업 종류나 프로젝트를 변경해 주세요.</td></tr>';
    $('raw-page-label').textContent=`${rawPage+1} / ${pages} 페이지 · 한 페이지 ${pageSize}건`;
    $('raw-prev').disabled=rawPage===0;$('raw-next').disabled=rawPage>=pages-1;$('download-filtered').disabled=!filteredRaw.length;
  }
  $('download-filtered').addEventListener('click',()=>{
    const keys=[...new Set(filteredRaw.flatMap(r=>Object.keys(r)))];
    const quote=v=>{let t=v==null?'':String(typeof v==='object'?JSON.stringify(v):v);if(/^[=+@-]/.test(t)&&typeof v!=='number')t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};
    const csv='\ufeff'+[keys.map(quote).join(','),...filteredRaw.map(r=>keys.map(k=>quote(r[k])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='previzion-filtered-runs.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  ['project-search','cohort','project-sort'].forEach(id=>$(id).addEventListener(id==='project-search'?'input':'change',renderProjects));
  ['population','stats-precision'].forEach(id=>$(id).addEventListener('change',renderStats));
  ['raw-kind','raw-project'].forEach(id=>$(id).addEventListener('change',()=>{rawPage=0;renderRaw();}));
  $('raw-prev').addEventListener('click',()=>{rawPage--;renderRaw();});$('raw-next').addEventListener('click',()=>{rawPage++;renderRaw();});
  $('chart-kind').addEventListener('change',renderChart);
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderChart,150);});
  window.LegacyReport={selectProject};
  selectProject(1);renderStats();renderRaw();renderChart();
})();
