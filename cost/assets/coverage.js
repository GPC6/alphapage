'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const cohorts = [BATCH_DATA.baseline,BATCH_DATA.batches[0],BATCH_DATA.batches[2],BATCH_DATA.batches[1]];
  const sections = ['overview','projects','statistics','timing','relationships','raw','method'];
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const root = id => $(id==='legacy'?'legacy-report':'panel-'+id);
  let current = 'legacy', lastMode = 'legacy', selected = null;

  function sidebar() {
    const b=cohorts.find(b=>b.id===(current==='compare'?lastMode:current));
    $('project-nav').innerHTML=b.runs.filter(r=>r.final_result).map(r=>`<button data-side-project="${r.number}" aria-current="${selected===r.number?'true':'false'}"><span class="nav-number">${String(r.number).padStart(2,'0')}</span><span>${esc(r.project)}</span><span class="nav-cost" title="API 비용 $${r.cost_usd}">$${r.cost_usd.toFixed(2)}</span></button>`).join('');
    $('project-nav').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>openProject(+button.dataset.sideProject)));
    $('mobile-project').value=selected??'';
    $('side-note').textContent=current==='compare'?'프로젝트를 선택하면 네 묶음을 나란히 봅니다. 목록 금액은 직전에 본 모드의 최종 씬 비용입니다.':`${b.label}\n목록 금액은 최종 씬 비용(USD)입니다. 프로젝트를 선택해 상세 기록을 확인하세요.`;
  }

  function legacySection(id) {
    sections.forEach(key=>$(key).hidden=key!==id);
    document.querySelectorAll('.site-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+id));
    window.dispatchEvent(new Event('resize'));
  }

  function resetView() {
    selected=null;
    [...cohorts.map(b=>b.id),'compare'].forEach(id=>root(id).classList.remove('project-focused','method-focused'));
    $('project-context').hidden=true;
    $('paired-projects').querySelectorAll('tbody tr').forEach(row=>row.hidden=false);
  }

  function modeChanged(id) {
    current=id;
    if(id!=='compare') lastMode=id;
    resetView();
    if(id==='legacy') legacySection(sections.includes(location.hash.slice(1))?location.hash.slice(1):'overview');
    document.querySelectorAll('.report-actions [data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===(id==='compare'?'compare':'overview')));
    sidebar();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function focusProject(id,number) {
    current=id; selected=number;
    root(id).classList.remove('method-focused');
    root(id).classList.add('project-focused');
    if(id==='legacy') legacySection('projects');
    const label=id==='compare'?'네 묶음 비교':cohorts.find(b=>b.id===id).label;
    $('project-context').hidden=false;
    $('project-context').querySelector('span').textContent=label+' · 프로젝트 상세';
    document.querySelectorAll('.report-actions [data-view]').forEach(button=>button.classList.remove('active'));
    sidebar();
    window.scrollTo({top:0,behavior:'instant'});
  }

  function openProject(number) {
    if(current==='compare') {
      focusProject('compare',number);
      $('paired-projects').querySelectorAll('tbody tr').forEach((row,i)=>row.hidden=i+1!==number);
    } else if(current==='legacy') {
      LegacyReport.selectProject(number,true);
    } else {
      const b=cohorts.find(b=>b.id===current), r=b.runs.find(r=>r.number===number&&r.final_result);
      ReportBatches.showDetail(b,r.run_id,true);
    }
  }

  $('mobile-project').insertAdjacentHTML('beforeend',cohorts[0].runs.map(r=>`<option value="${r.number}">${String(r.number).padStart(2,'0')} ${esc(r.project)}</option>`).join(''));
  $('mobile-project').addEventListener('change',event=>event.target.value?openProject(+event.target.value):ReportBatches.activate(current));
  window.addEventListener('report:mode',event=>modeChanged(event.detail.id));
  window.addEventListener('report:project',event=>focusProject(event.detail.id,event.detail.number));
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
    const view=button.dataset.view;
    if(view==='compare') {ReportBatches.activate('compare');return;}
    if(view==='overview') {ReportBatches.activate(current==='compare'?lastMode:current);return;}
    resetView();
    if(current==='legacy') {history.pushState(null,'','#method');legacySection('method');}
    else root(current).classList.add('method-focused');
    document.querySelectorAll('.report-actions [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='method'));
    sidebar();window.scrollTo({top:0,behavior:'instant'});
  }));
  document.querySelectorAll('.site-nav a').forEach(a=>a.addEventListener('click',()=>{
    resetView(); legacySection(a.hash.slice(1));sidebar();
  }));
  $('pair-metric').addEventListener('change',()=>{
    if(current==='compare'&&selected) $('paired-projects').querySelectorAll('tbody tr').forEach((row,i)=>row.hidden=i+1!==selected);
  });
  const hash=location.hash.slice(1);
  modeChanged(cohorts.some(b=>b.id===hash)||hash==='compare'?hash:'legacy');
})();
