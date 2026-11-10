'use strict';
(() => {
  const batches = window.BATCH_DATA.batches;
  const cohorts = [window.BATCH_DATA.baseline,batches[0],batches[2],batches[1]];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (v, digits=8) => '$'+Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:digits});
  const num = (v, digits=3) => Number(v).toLocaleString('en-US',{maximumFractionDigits:digits});
  const time = v => {const s=Math.round(v);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  const wall = v => {const s=Math.round(v);return `${Math.floor(s/3600)}시간 ${Math.floor(s/60)%60}분 ${s%60}초`;};
  const date = v => new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(v));
  const paths={compare:'M4 5v14h16M8 15v-5m5 5V4m5 11V8',film:'M4 4h16v16H4zM8 4v16M16 4v16M4 9h4m-4 6h4m8-6h4m-4 6h4',scene:'m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9',archive:'M4 5h16v4H4zM6 9v11h12V9M10 13h4',download:'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',check:'m5 12 4 4L19 6',clock:'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',alert:'m12 3 10 18H2L12 3Zm0 6v5m0 3v.1',info:'M12 11v6m0-10v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'};
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
  const labels={agent_complete:'모델 완료',bounded_fallback:'50턴 제한',model_error:'공급사 오류'};
  const status = (value, compact=false) => `<span class="outcome ${value}"${compact?` title="${labels[value]}"`:''}>${icon(value==='agent_complete'?'check':value==='bounded_fallback'?'clock':'alert')}${compact?`<span class="sr-only">${labels[value]}</span>`:labels[value]}</span>`;
  const td = value => `<td class="numeric">${value}</td>`;
  const table = (label, markup, cls='') => `<div class="table-scroll" tabindex="0" role="region" aria-label="${label}"><table class="${cls}">${markup}</table></div>`;
  const download = (file,label) => `<a href="data/${file}" download>${label}</a>`;
  const panel = id => document.getElementById(id==='legacy'?'legacy-report':'panel-'+id);
  const tabs = [...document.querySelectorAll('.report-tabs [role=tab]')];
  const key = b => `<span class="batch-key ${b.id}" aria-hidden="true"></span>`;
  const finalRows = b => b.runs.filter(r=>r.final_result);
  const tabsForHash = hash => ['compare','claude-ai','gpt-ai','gpt-normal','legacy'].includes(hash)?hash:['overview','projects','statistics','timing','relationships','raw','method'].includes(hash)?'legacy':null;

  function activate(id, changeHash=true) {
    tabs.forEach(tab=>{const on=tab.dataset.tab===id;tab.setAttribute('aria-selected',on);tab.tabIndex=on?0:-1;});
    [...cohorts.map(b=>b.id),'compare'].forEach(key=>panel(key).hidden=key!==id);
    if(id==='compare') tabs[0].tabIndex=0;
    if(changeHash) history.pushState(null,'','#'+id);
    document.getElementById('report-footer-scope').textContent=id==='legacy'?'Claude 일반 모드 · 18 projects · 79 observations':id==='compare'?'네 모델·모드 묶음 · 각 18개 프로젝트 · USD':'신규 측정 · 54 results · 55 attempts · USD';
    window.dispatchEvent(new CustomEvent('report:mode',{detail:{id}}));
    if(id==='legacy') window.dispatchEvent(new Event('resize'));
  }
  tabs.forEach((tab,i)=>{
    const type=tab.dataset.tab;
    tab.insertAdjacentHTML('afterbegin',icon(type==='compare'?'compare':type==='legacy'||type==='gpt-normal'?'scene':'film'));
    tab.addEventListener('click',()=>activate(type));
    tab.addEventListener('keydown',e=>{
      let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
      if(next!==undefined){e.preventDefault();tabs[next].focus();activate(tabs[next].dataset.tab);tabs[next].scrollIntoView({block:'nearest',inline:'nearest'});}
    });
  });
  window.addEventListener('hashchange',()=>{const id=tabsForHash(location.hash.slice(1));if(id)activate(id,false);});

  const totalCost=batches.reduce((sum,b)=>sum+b.summary.all_cost.total,0);
  panel('compare').innerHTML=`<div class="batch-title"><div><h1>네 가지 모델·모드 비교</h1><p class="batch-lead">기존 Claude 일반 모드와 새로 측정한 세 묶음의 첫 씬 생성 기록입니다.</p><p class="batch-meta"><span>각 18개 프로젝트 · 최종 결과 72개</span><span>기존 148컷 · 새 측정 152컷</span><span>시간 비교: 앱 / 클라이언트 타이머</span></p></div><a class="button" href="data/mode-comparison.csv" download>${icon('download')}비교 CSV</a></div>
    ${table('네 묶음의 최종 18개 결과와 전체 실행 비용 비교',`<thead><tr><th>모델 / 생성 모드</th><th class="numeric">최종 18개 비용</th><th class="numeric">평균 앱 시간<small>최종 18개 기준</small></th><th>종료 사유<small>모델 완료 / 50턴 제한</small></th><th class="numeric">전체 실행 비용<small>실패·재시도 포함</small></th></tr></thead><tbody>${cohorts.map(b=>`<tr><td><button class="batch-link" data-open-batch="${b.id}">${key(b)}${b.model_label}</button><small>${b.mode==='normal'?'일반 모드':'AI 프리비즈'} · ${b.summary.attempts}회 실행</small></td>${td(money(b.summary.final_cost.total))}${td(time(b.summary.final_app.mean))}<td><span class="outcome agent_complete">${icon('check')}${b.summary.completed}</span> / <span class="outcome bounded_fallback">${icon('clock')}${b.summary.limited}</span></td>${td(money(b.summary.all_cost.total))}</tr>`).join('')}</tbody>`,'batch-table')}
    <p class="caption">새 세 묶음 합계 <strong>${money(totalCost)}</strong> · 저장 결과 54개 · 실행 55회. 기존 Claude 일반 모드는 첫 씬 18건만 비교합니다. 시간은 분:초, 비용은 USD입니다.</p>
    <div class="batch-note"><p>${icon('info')}<strong>종료 사유까지 함께 비교하세요.</strong> ‘모델 완료’는 AI가 완료를 선언한 실행이고, ‘50턴 제한’은 한도에 도달해 서버가 종료한 실행입니다. 저장된 결과의 연출 품질을 뜻하지 않습니다.</p><p>Claude의 15번 첫 실행은 공급사 오류로 종료됐습니다. 최종 18개 비교에는 재시도 결과를 사용하고, 전체 실행 비용에는 첫 실패 비용과 사후 확인 비용 ${money(batches[0].summary.recovered_cost_usd)}도 포함했습니다.</p></div>
    <div class="batch-section pair-section"><h2>프로젝트별로 나란히 보기</h2><div class="pair-controls"><label class="control">비교 지표<select id="pair-metric"><option value="cost_usd">API 비용 · USD</option><option value="server_seconds">서버 생성 시간 · 분:초</option><option value="app_seconds">앱 관찰 시간 · 분:초</option></select></label><p>각 묶음의 최종 결과 18개를 비교합니다. 값을 선택하면 해당 실행의 상세 기록이 열립니다.</p></div><div id="paired-projects"></div></div>
    <div class="batch-section batch-method"><h2>측정 조건과 읽는 방법</h2><div class="batch-definitions"><p><strong>새 세 묶음의 동일한 입력</strong> — 원본 스토리보드로 새 복제본을 만든 뒤 전체 씬 생성을 실행했습니다. 세 묶음 모두 152컷·이미지 182개를 보존했고, 요청마다 실제 모드와 모델을 확인했습니다.</p><p><strong>시간과 비용</strong> — 추론 강도 high, 최대 50턴, 프로젝트별 순차 실행입니다. 서버 시간은 생성 타이머, 앱 시간은 명령부터 종료 관찰까지이며 복제·저장·내보내기는 제외합니다. API 비용에는 씬 모델과 검색 임베딩을 포함하고, 기존 스토리보드 제작·영상 렌더링 비용은 제외합니다.</p><p><strong>비교 범위</strong> — 각 조건을 한 번씩 측정한 기록이며 실행 시각과 캐시 상태는 다릅니다. 일반 모드와 AI 프리비즈는 사용할 수 있는 도구도 다릅니다. 비용·시간 차이를 모델만의 성능 차이나 품질 우열로 해석하지 않습니다.</p><p><strong>Claude 일반 모드</strong> — 기존 79개 기록과 모든 분석은 첫 번째 탭에 있습니다. 이 비교표에는 첫 씬 18건만 사용합니다. 기존 첫 씬 148컷과 새 측정 152컷은 입력과 실행 시점이 달라 통제된 모델 성능 시험이 아닙니다. 요약 시간은 모두 앱 / 클라이언트 타이머로 맞췄습니다.</p></div></div>
    <div class="download-row">${download('batch-runs.csv','신규 55회 실행 CSV')}${download('batches.json','세 묶음 전체 JSON')}${download('batches-provenance.json','원자료 출처·해시')}</div>`;

  function renderPairs() {
    const metric=document.getElementById('pair-metric').value;
    const max=Math.max(...cohorts.flatMap(b=>finalRows(b).map(r=>r[metric])));
    document.getElementById('paired-projects').innerHTML=table('같은 프로젝트의 네 묶음 비용 또는 시간',`<thead><tr><th>프로젝트</th>${cohorts.map(b=>`<th class="numeric">${key(b)}${b.model_label}<br>${b.mode==='normal'?'일반 모드':'AI 프리비즈'}</th>`).join('')}</tr></thead><tbody>${finalRows(batches[0]).map(base=>`<tr><td><span class="project-id">${String(base.number).padStart(2,'0')}</span> ${esc(base.project)}</td>${cohorts.map(b=>{const r=finalRows(b).find(x=>x.number===base.number);return `<td data-cohort="${esc(b.label)}"><button class="batch-link pair-value" data-pair="${b.id}:${r.run_id}" aria-label="${esc(base.project)} ${esc(b.label)} 상세">${metric==='cost_usd'?money(r[metric],4):time(r[metric])}${status(r.outcome,true)}<span class="pair-bar ${b.id}" style="--value:${r[metric]/max*100}%" aria-hidden="true"></span></button></td>`;}).join('')}</tr>`).join('')}</tbody>`,'pair-table');
    document.querySelectorAll('[data-pair]').forEach(button=>button.addEventListener('click',()=>{const [bid,rid]=button.dataset.pair.split(':');activate(bid);if(bid==='legacy')window.LegacyReport.selectProject(cohorts[0].runs.find(r=>r.run_id===rid).number,true);else showDetail(batches.find(b=>b.id===bid),rid,true);}));
  }

  function renderBatch(b) {
    const s=b.summary, root=panel(b.id);
    root.innerHTML=`<div class="batch-title"><div><h1>${esc(b.label)}</h1><p class="batch-lead">같은 원본에서 새로 복제한 18개 프로젝트의 전체 씬 생성 기록입니다.</p><p class="batch-meta"><span>${date(s.period_kst[0])}–${date(s.period_kst[1])} KST</span><span>${s.attempts}회 실행 · 결과 18개 저장</span><span>high · 최대 50턴</span></p></div><a class="button" href="data/${b.id}-runs.csv" download>${icon('download')}실행별 CSV</a></div>
      <dl class="batch-totals"><div><dt>전체 API 비용</dt><dd>${money(s.all_cost.total)}<small>${s.attempts}회 · 실패·재시도 포함</small></dd></div><div><dt>평균 서버 생성 시간</dt><dd>${time(s.all_server.mean)}<small>실행 ${s.attempts}회 기준</small></dd></div><div><dt>평균 API 비용</dt><dd>${money(s.all_cost.mean,4)}<small>실행 ${s.attempts}회 기준</small></dd></div><div><dt>순차 실행 경과 시간</dt><dd>${wall(s.batch_wall_seconds)}</dd></div></dl>
      <div class="status-stack" role="img" aria-label="최종 결과 18개 중 모델 완료 ${s.completed}개, 50턴 제한 ${s.limited}개"><span class="complete" style="width:${s.completed/18*100}%"></span><span class="limited" style="width:${s.limited/18*100}%"></span></div>
      <div class="batch-status-legend">${status('agent_complete')} ${s.completed}개 ${status('bounded_fallback')} ${s.limited}개 ${s.errors?`${status('model_error')} 첫 시도 ${s.errors}회`:''}</div>
      ${b.id==='claude-ai'?`<div class="batch-note"><strong>15번 첫 시도와 재시도를 모두 포함했습니다.</strong> 공급사 오류로 종료된 첫 시도도 비용이 발생했습니다. 사후 조회로 확인한 ${money(s.recovered_cost_usd)}를 더한 전체 비용이며, 해당 실패 기록의 exact 표시는 false로 유지했습니다. 서버 장부는 사후 조회액을 제외한 원래 사용량과 일치합니다.</div>`:s.limited?`<p class="caption">50턴 제한 종료: ${finalRows(b).filter(r=>r.outcome==='bounded_fallback').map(r=>`${String(r.number).padStart(2,'0')} ${esc(r.project)}`).join(', ')}. 생성된 장면을 저장했으며 모델 완료 선언과 구분합니다.</p>`:''}
      <div class="batch-section run-section"><h2>프로젝트별 실행 기록</h2><div class="batch-toolbar"><label class="control">프로젝트 검색<input type="search" data-search placeholder="프로젝트 이름으로 검색" autocomplete="off"></label><label class="control">종료 사유<select data-outcome><option value="all">전체 ${s.attempts}회</option value="agent_complete">모델 완료</option><option value="bounded_fallback">50턴 제한</option><option value="model_error">공급사 오류</option></select></label><label class="control">정렬<select data-sort><option value="number">프로젝트 번호순</option><option value="cost_usd">비용 높은 순</option><option value="server_seconds">시간 긴 순</option></select></label><span class="result-count" data-count aria-live="polite"></span></div><p class="mobile-only table-hint">프로젝트를 선택하면 컷 수·앱 시간·턴 수도 확인할 수 있습니다.</p><div data-runs></div><div data-detail hidden></div></div>
      <div class="batch-section"><h2>분모를 구분한 통계</h2>${table('전체 실행, 최종 18개, 모델 완료 실행의 통계',`<thead><tr><th>집계 대상</th><th class="numeric">건수</th><th class="numeric">비용 합계</th><th class="numeric">평균 비용</th><th class="numeric">평균 서버 시간</th><th class="numeric">중앙값 시간</th><th class="numeric">P90 시간</th></tr></thead><tbody>${[['전체 실행',s.all_cost,s.all_server],['최종 결과 18개',s.final_cost,s.final_server],['모델 완료 선언만',s.complete_cost,s.complete_server]].map(([label,c,t])=>`<tr><td>${label}</td>${td(c.n)}${td(money(c.total))}${td(money(c.mean,4))}${td(time(t.mean))}${td(time(t.median))}${td(time(t.p90_nearest_rank))}</tr>`).join('')}</tbody>`,'batch-stat-table')}<p class="caption">P90은 nearest-rank 방식입니다. 모델 완료 선언만의 통계는 서로 다른 프로젝트 집합이므로 직접적인 모델 순위로 사용하지 않습니다. 최종 결과 18개에는 턴 제한 종료도 포함합니다.</p></div>
      <div class="batch-section batch-method"><h2>검증과 측정 기준</h2><div class="batch-definitions"><p><strong>보존 확인</strong> — 원본 18개 변경 없음. 스토리보드 152컷·참조 이미지 182개 일치. 결과 18개를 앱에서 저장·재열기하고 PVZ로 내보냈습니다.</p><p><strong>실제 요청</strong> — ${esc(b.model)} · ${b.mode==='normal'?'일반 모드':'AI 프리비즈'} · high. 앱 설정과 서버 시작 이벤트를 확인했습니다.${b.mode==='normal'?' 일반 모드는 서버 계약상 mode 필드를 생략하며, 일반 전용 도구 집합도 함께 확인했습니다.':''}</p><p><strong>비용</strong> — 공급사 사용량 보고값이며 카드 청구서 대조는 아닙니다. ${s.all_cost_exact?'모든 실행의 비용 exact는 true입니다.':'실패 실행 1개의 비용 exact는 false입니다. 사후 확인액을 별도 보존했습니다.'} 씬 모델과 임베딩 비용을 포함합니다.</p>${b.id==='gpt-normal'?'<p><strong>첫 실행의 앱 시간</strong> — 측정기 관찰을 같은 요청에 다시 연결해 저장된 UTC 시작 시각으로 계산했습니다. 생성 재시도는 없고 서버 시간·비용은 연속입니다. 나머지는 monotonic 타이머입니다.</p>':''}<details class="analysis-fold"><summary>실행 버전과 원자료 위치</summary><p>서버 <code class="run-id">${esc(b.server_commit)}</code><br>클라이언트 <code class="run-id">${esc(b.client_commit)}</code></p><p>워크스페이스 원자료: <code>${esc(b.source)}</code>. 배포 데이터에는 계정·인증정보·개인 절대경로·요청 원문을 포함하지 않았습니다.</p></details></div></div>
      <div class="download-row">${download(b.id+'-runs.csv',s.attempts+'회 실행 CSV')}${download(b.id+'.json','묶음 전체 JSON')}${download('batches-provenance.json','원자료 출처·해시')}</div>`;
    root.querySelectorAll('input,select').forEach(input=>input.addEventListener(input.type==='search'?'input':'change',()=>renderRuns(b)));
    renderRuns(b);
  }

  function renderRuns(b) {
    const root=panel(b.id), search=root.querySelector('[data-search]').value.trim().toLowerCase(), outcome=root.querySelector('[data-outcome]').value, sort=root.querySelector('[data-sort]').value;
    const rows=b.runs.filter(r=>r.project.toLowerCase().includes(search)&&(outcome==='all'||r.outcome===outcome));
    rows.sort(sort==='number'?(a,b)=>a.number-b.number||a.attempt-b.attempt:(a,b)=>b[sort]-a[sort]);
    root.querySelector('[data-count]').textContent=`${rows.length} / ${b.runs.length}회 실행`;
    root.querySelector('[data-runs]').innerHTML=table('프로젝트별 실행 비용과 시간',`<thead><tr><th>프로젝트 / 시도</th><th class="numeric">컷</th><th class="numeric">API 비용</th><th class="numeric">서버 시간</th><th class="numeric">앱 시간</th><th class="numeric">턴</th><th>종료 사유</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr data-record="${r.run_id}"><td><button class="project-button" data-run-detail="${r.run_id}"><span class="project-id">${String(r.number).padStart(2,'0')}</span><span>${esc(r.project)}</span></button>${r.attempt>1||r.outcome==='model_error'?`<span class="attempt-label">${r.attempt}번째 시도${r.final_result?' · 최종 저장 결과':' · 실패 기록'}</span>`:''}</td>${td(r.cut_count)}${td(money(r.cost_usd))}${td(time(r.server_seconds))}${td(time(r.app_seconds))}${td(r.turns)}<td>${status(r.outcome)}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">검색 결과가 없습니다. 검색어나 종료 사유를 변경해 주세요.</td></tr>'}</tbody>`,'batch-run-table');
    root.querySelectorAll('[data-run-detail]').forEach(button=>button.addEventListener('click',()=>showDetail(b,button.dataset.runDetail,true)));
    root.querySelector('[data-detail]').hidden=true;
  }

  function showDetail(b, rid, focus=false) {
    const root=panel(b.id), r=b.runs.find(r=>r.run_id===rid), detail=root.querySelector('[data-detail]');
    root.querySelectorAll('[data-record]').forEach(row=>row.classList.toggle('selected',row.dataset.record===rid));
    const fields=[['API 비용',money(r.cost_usd)],['서버 생성 시간',num(r.server_seconds)+'초'],['앱 관찰 시간',num(r.app_seconds)+'초'],['턴 / 유료 호출',`${r.turns} / ${r.paid_calls}`],['컷 / 참조 이미지',`${r.cut_count} / ${r.image_count}`],['오브젝트 / 샷',`${r.objects} / ${r.shots}`],['요청 / 결과 길이',`${r.target_seconds==null?'미기록':num(r.target_seconds)+'초'} / ${num(r.scene_seconds)}초`],['도구 검증 거절',r.op_rejections+'회'],['원본 스토리보드',r.storyboard_preserved?'보존 확인':'미확인']];
    detail.hidden=false;detail.className='batch-detail';
    detail.innerHTML=`<h3 tabindex="-1">${String(r.number).padStart(2,'0')} ${esc(r.project)} · ${r.attempt}번째 시도</h3><p class="caption">${date(r.started_at)} KST · ${esc(b.label)} · high</p>${status(r.outcome)}<dl>${fields.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><code class="run-id">${esc(r.run_id)}</code><p class="caption">비용 exact: ${r.cost_exact?'true':'false'}${r.recovered_cost_usd?` · 장부 ${money(r.meter_cost_usd)} + 사후 확인 ${money(r.recovered_cost_usd)}`:''}. ${r.app_timing_method==='restored_utc_observation'?'앱 시간은 동일 요청에 관찰을 다시 연결한 UTC 경과값입니다.':'앱 시간은 생성 명령부터 완료 관찰까지의 경과 타이머입니다.'}</p>`;
    const attempts=b.runs.filter(x=>x.number===r.number);
    if(attempts.length>1){
      detail.insertAdjacentHTML('afterbegin',`<div class="attempt-switch" aria-label="시도 선택">${attempts.map(x=>`<button class="button ${x.run_id===rid?'active':''}" data-attempt="${x.run_id}">${x.attempt}번째 시도 · ${x.final_result?'최종 결과':'공급사 오류'}</button>`).join('')}</div>`);
      detail.querySelectorAll('[data-attempt]').forEach(button=>button.addEventListener('click',()=>showDetail(b,button.dataset.attempt,true)));
    }
    window.dispatchEvent(new CustomEvent('report:project',{detail:{id:b.id,number:r.number}}));
    if(focus){detail.querySelector('h3').focus({preventScroll:true});}
  }
  batches.forEach(renderBatch);
  document.querySelectorAll('[data-open-batch]').forEach(button=>button.addEventListener('click',()=>activate(button.dataset.openBatch)));
  document.getElementById('pair-metric').addEventListener('change',renderPairs);
  renderPairs();
  window.ReportBatches={activate,showDetail};
  activate(tabsForHash(location.hash.slice(1))||'legacy',false);
})();
