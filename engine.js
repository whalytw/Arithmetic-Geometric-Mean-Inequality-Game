/* 極限造園王 — standalone, deterministic mathematics and scoring. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GardenMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TYPES = [
    { id: 'garden', name: '花園建造師', short: '花園', goal: '最大面積', kind: '最大值', icon: '✿', art: 'garden', advanced: false, values: [3,4,5,6,8] },
    { id: 'flag', name: '三角旗幟設計師', short: '旗幟', goal: '最大面積', kind: '最大值', icon: '⚑', art: 'flag', advanced: false, values: [2,4,6] },
    { id: 'pool', name: '泳池圍欄工程師', short: '泳池', goal: '最少圍欄', kind: '最小值', icon: '≈', art: 'pool', advanced: false, values: [3,4,5,6,7] },
    { id: 'warehouse', name: '倉庫省錢建造師', short: '倉庫', goal: '最低費用', kind: '最小值', icon: '▤', art: 'warehouse', advanced: false, values: [2,3,4] },
    { id: 'robot', name: '機器人調速師', short: '機器人', goal: '最少耗能', kind: '最小值', icon: '⚙', art: 'robot', advanced: false, values: [3,4,5,6] },
    { id: 'box', name: '紙盒製造工坊', short: '紙盒', goal: '最大容積', kind: '最大值', icon: '◇', art: 'box', advanced: true, values: [1,2,3] },
    { id: 'crate', name: '貨箱容量挑戰', short: '貨箱', goal: '最大體積', kind: '最大值', icon: '▱', art: 'box', advanced: true, values: [2,3,4] }
  ];
  const STAGE_NAMES = ['讀懂任務', '找到界線', '最佳條件', '完成任務'];
  const plain = s => String(s).replace(/<[^>]*>/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const frac = (a,b) => `<span class="frac" aria-label="${plain(a)}除以${plain(b)}"><span>${a}</span><span>${b}</span></span>`;
  const sqrt = a => `<span class="sqrt">√<span>${a}</span></span>`;
  const cubeRoot = a => `<span class="sqrt"><span class="root-index">3</span>√<span>${a}</span></span>`;
  function originalAMGM(terms, hint, solution, notation='') {
    const n=terms.length, sum=terms.join(' + '), product=terms.map(t=>/^[A-Za-z](?:<sup>2<\/sup>)?$/.test(t)?t:`(${t})`).join('');
    const root=n===3?cubeRoot(product):sqrt(product);
    const formula=(denominator,sign)=>`<span class="amgm-formula">${frac(sum,denominator)} <span class="relation">${sign}</span> ${root}</span>`;
    const stage=choices(`選出這題的原始${n===3?'三':'兩'}數算幾不等式。`,formula(n,'≥'),[formula(n,'≤'),formula(n,'>'),formula(n+1,'≥')],hint,solution);
    stage.notation=notation;
    stage.originalForm=true;
    return stage;
  }
  const choices = (prompt, correct, wrong, hint, solution) => ({kind:'choice', prompt, options:[{id:'correct',html:correct}, ...wrong.map((html,i)=>({id:'wrong'+i,html}))], correctId:'correct', hint, solution});
  const number = (prompt, labels, values, hint, solution, units=[]) => ({kind:'number',prompt,labels,values,hint,solution,units});
  function createQuestion(type, k) {
    const meta = TYPES.find(t=>t.id===type);
    if (!meta || !meta.values.includes(k)) throw new Error('題型或數值不在心算題庫內');
    const q = {type,k,meta,stages:[],summary:[],optimal:{}};
    if(type==='garden') {
      const p=4*k, a=k*k;
      q.story=`用 <b>${p} 公尺</b>圍欄，圍出一座矩形花園。長為 L、寬為 W，兩者都大於 0。怎樣讓花園面積最大？`;
      q.given=`圍欄 ${p} m`; q.unit='m²'; q.optimal={L:k,W:k,result:a};
      q.stages=[
        choices('哪一個式子表示四邊的圍欄總長？',`2L + 2W = ${p}`,[`L + W = ${p}`,`LW = ${p}`,`2LW = ${p}`],'矩形有兩條長邊與兩條寬邊。',`2L + 2W = ${p}，所以 L + W = ${2*k}。`),
        null,
        number('等號成立時，長與寬各是多少？',['長 L','寬 W'],[k,k],'算幾不等式的兩項相等時，才能達到上限。',`L = W，且 L + W = ${2*k}，所以 L = W = ${k}。`,['m','m']),
        number('算出花園的最大面積。',['最大面積'],[a],`最佳尺寸是 ${k} × ${k}，面積是長乘寬。`,`最大面積 = ${k} × ${k} = ${a} 平方公尺。`,['m²'])
      ];
      q.summary=[`L + W = ${2*k}`,`L = W = ${k}`,`最大面積 ${a} m²`];
    } else if(type==='flag') {
      const s=2*k*k, area=k*k/2;
      q.story=`做一面直角三角形旗幟，斜邊固定為 <b>${k}${sqrt(2)} 公尺</b>。兩條直角邊 a、b 都大於 0，怎樣讓旗面面積最大？`;
      q.given=`斜邊 ${k}√2 m`;q.unit='m²';q.optimal={a:k,b:k,result:area};
      q.stages=[
        choices('用勾股定理表示兩條直角邊的限制。',`a<sup>2</sup> + b<sup>2</sup> = ${s}`,[`a + b = ${s}`,`ab = ${s}`,`a<sup>2</sup> + b<sup>2</sup> = ${k*k}`],'斜邊的平方，等於兩條直角邊的平方和。',`a<sup>2</sup> + b<sup>2</sup> = (${k}√2)<sup>2</sup> = ${s}。`),
        null,
        number('要達到上限，兩條直角邊各是多少？',['直角邊 a','直角邊 b'],[k,k],'等號需要 a² = b²。因為 a、b 都是正數，所以 a = b。',`a = b，且 2a<sup>2</sup> = ${s}，所以 a = b = ${k}。`,['m','m']),
        number('算出旗幟的最大面積。',['最大面積'],[area],`三角形面積 = ${frac(1,2)} × 底 × 高。`,`${frac(1,2)} × ${k} × ${k} = ${area} 平方公尺。`,['m²'])
      ];q.summary=[`a² + b² = ${s}`,`a = b = ${k}`,`最大面積 ${area} m²`];
    } else if(type==='pool') {
      const area=k*k, p=4*k;
      q.story=`矩形泳池的面積必須維持 <b>${area} 平方公尺</b>。長 L、寬 W 都大於 0，四邊都要圍欄，怎樣使用最少材料？`;
      q.given=`面積 ${area} m²`;q.unit='m';q.optimal={L:k,W:k,result:p};
      q.stages=[
        choices('哪一個式子表示固定面積？',`LW = ${area}`,[`L + W = ${area}`,`2L + 2W = ${area}`,`L<sup>2</sup> + W<sup>2</sup> = ${area}`],'矩形面積是長乘寬。',`LW = ${area}，而要最小化的周長是 2(L + W)。`),
        null,
        number('圍欄最少時，長與寬各是多少？',['長 L','寬 W'],[k,k],'等號成立於 L = W，兩者乘積仍須符合面積。',`L = W = √${area} = ${k}。`,['m','m']),
        number('算出四邊圍欄的最小總長。',['最少圍欄'],[p],`四邊總長 = 2 × (長 + 寬)。`,`最小周長 = 2 × ${2*k} = ${p} 公尺。`,['m'])
      ];q.summary=[`LW = ${area}`,`L = W = ${k}`,`最少圍欄 ${p} m`];
    } else if(type==='warehouse') {
      const area=2*k*k,cost=8*k;
      q.story=`倉庫底面積固定 <b>${area} 平方公尺</b>。橫向長度 L、直向長度 W 都大於 0。橫牆每公尺 <b>2 枚金幣</b>，直牆每公尺 <b>1 枚</b>，四面牆怎樣蓋最省？`;
      q.given=`面積 ${area} m²；橫牆 2、直牆 1 枚/m`;q.unit='枚';q.optimal={L:k,W:2*k,result:cost};
      q.stages=[
        choices('兩面橫牆、兩面直牆，總費用是哪個式子？','4L + 2W',['2L + W','2L + 2W','4L + 4W'],'橫牆有兩面，每面每公尺 2 枚；直牆有兩面，每面每公尺 1 枚。','總費用 = 2 × 2L + 2 × 1W = 4L + 2W。'),
        null,
        number('最低費用的橫向、直向長度各是多少？',['橫向 L','直向 W'],[k,2*k],`等號要讓 4L = 2W，所以 W = 2L。再配合 LW = ${area}。`,`W = 2L，2L<sup>2</sup> = ${area}，因此 L = ${k}、W = ${2*k}。`,['m','m']),
        number('算出四面牆的最低費用。',['最低費用'],[cost],`把 L = ${k}、W = ${2*k} 代入 4L + 2W。`,`4 × ${k} + 2 × ${2*k} = ${cost} 枚金幣。`,['枚'])
      ];q.summary=[`LW = ${area}`,`4L = 2W`, `L = ${k}，W = ${2*k}`,`最低費用 ${cost} 枚`];
    } else if(type==='robot') {
      const c=k*k;
      q.story=`機器人的速度設定 x 大於 0。遊戲中，動力耗能指數為 <b>x</b>，時間耗能指數為 <b>${frac(c,'x')}</b>。怎樣調整速度，讓兩項耗能總和最小？`;
      q.given=`動力 x ／時間 ${c}÷x`;q.unit='';q.optimal={x:k,result:2*k};
      q.stages=[
        choices('把兩項相加，總耗能指數 E 是？',`E = x + ${frac(c,'x')}`,[`E = x × ${frac(c,'x')}`,`E = x − ${frac(c,'x')}`,`E = x + ${c}`],'總耗能指數是動力項與時間項的和。',`E = x + ${frac(c,'x')}，且 x > 0。`),
        null,
        number('讓兩項耗能相等，速度 x 應設定為多少？',['速度 x'],[k],`等號需要 x = ${frac(c,'x')}，所以 x² = ${c}。`,`x > 0，因此 x = √${c} = ${k}。`),
        number('算出最小總耗能指數。',['最小耗能'],[2*k],`兩項都是 ${k}，將它們相加。`,`${k} + ${frac(c,k)} = ${2*k}。`)
      ];q.summary=[`兩項乘積 ${c}`,`x = ${k}`,`最小耗能指數 ${2*k}`];
    } else if(type==='box') {
      const side=6*k, base=4*k,v=16*k*k*k;
      q.story=`一張 <b>${side} × ${side} 公分</b>正方形紙，四角各裁掉邊長 x 的正方形，向上摺成無蓋紙盒。0 < x < ${side/2}，怎樣讓容積最大？`;
      q.given=`正方形紙 ${side} × ${side} cm`;q.unit='cm³';q.optimal={x:k,base,result:v};
      q.stages=[
        choices('底面每邊少了兩個 x，盒子體積 V 是？',`V = x(${side} − 2x)<sup>2</sup>`,[`V = x(${side} − x)<sup>2</sup>`,`V = (${side} − 2x)<sup>3</sup>`,`V = ${side*side}x`],'盒高為 x，底面兩邊均為紙張邊長減去 2x。',`V = 高 × 底面積 = x(${side} − 2x)<sup>2</sup>。`),
        null,
        number('三項相等時，裁角邊長與盒底邊長各是多少？',['裁角 x','底面邊長'],[k,base],`讓 4x = ${side} − 2x，先求 x；再求 ${side} − 2x。`,`6x = ${side}，所以 x = ${k}；底面每邊 = ${side} − 2 × ${k} = ${base}。`,['cm','cm']),
        number('算出無蓋紙盒的最大容積。',['最大容積'],[v],`底面 ${base} × ${base}，高度 ${k}。`,`V = ${base} × ${base} × ${k} = ${v} 立方公分。`,['cm³'])
      ];q.summary=[`三項和 ${2*side}`,`4x = ${side} − 2x`, `x = ${k}，底面 ${base} × ${base}`,`最大容積 ${v} cm³`];
    } else if(type==='crate') {
      const sum=3*k,v=k*k*k;
      q.story=`長方體貨箱的長 a、寬 b、高 c 都大於 0，三邊總和固定 <b>${sum} 公尺</b>。怎樣安排三個尺寸，讓體積最大？`;
      q.given=`三邊和 ${sum} m`;q.unit='m³';q.optimal={a:k,b:k,c:k,result:v};
      q.stages=[
        choices('哪一個式子表示三個尺寸的限制？',`a + b + c = ${sum}`,[`abc = ${sum}`,`2a + 2b + 2c = ${sum}`,`a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup> = ${sum}`],'題目固定的是長、寬、高的和。',`a + b + c = ${sum}，欲求最大體積 abc。`),
        null,
        number('等號成立時，長、寬、高各是多少？',['長 a','寬 b','高 c'],[k,k,k],'三數算幾的等號成立於 a = b = c。',`a = b = c = ${sum}÷3 = ${k}。`,['m','m','m']),
        number('算出貨箱的最大體積。',['最大體積'],[v],`體積 = ${k} × ${k} × ${k}。`,`最大體積 = ${v} 立方公尺。`,['m³'])
      ];q.summary=[`a + b + c = ${sum}`,`a = b = c = ${k}`,`最大體積 ${v} m³`];
    }
    const amgmTerms={garden:['L','W'],flag:['a<sup>2</sup>','b<sup>2</sup>'],pool:['L','W'],warehouse:['4L','2W'],robot:['x',frac(k*k,'x')],box:['u','v','w'],crate:['a','b','c']}[type];
    const equality={garden:'L = W',flag:'a² = b²',pool:'L = W',warehouse:'4L = 2W',robot:`x = ${frac(k*k,'x')}`,box:'u = v = w',crate:'a = b = c'}[type];
    const notation=type==='box'?`令 u = 4x，v = w = ${6*k} − 2x。三項均為正數，總和固定。`:'';
    const hint=`分母是 ${amgmTerms.length}；平均數 ≥ 乘積的${amgmTerms.length===3?'立方根':'平方根'}，等號可成立。`;
    q.stages[1]=originalAMGM(amgmTerms,hint,'',notation);
    q.stages[1].solution=`${q.stages[1].options[0].html}<br>平均數不小於幾何平均數；等號成立於 ${equality}。下一關用這個條件求最佳尺寸${type==='robot'?'或設定':''}。`;
    return q;
  }
  function shuffle(items, rng=Math.random) {const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function makeSession(settings, rng=Math.random) {
    const enabled=TYPES.filter(t=>settings.topics.includes(t.id)&&(!t.advanced||settings.advanced));
    if(!enabled.length) throw new Error('請至少選擇一種已啟用的題型。');
    const count=Math.max(1,Math.min(12,Number(settings.questions)||3));
    const schedule=[];
    while(schedule.length<count) schedule.push(...shuffle(enabled,rng));
    const players=[[],[],[]];
    schedule.slice(0,count).forEach(type=>{
      const values=shuffle(type.values,rng);
      players.forEach((qs,i)=>qs.push(createQuestion(type.id,values[i%values.length])));
    });
    return players;
  }
  function stageScore(stage, penalty=2) {
    if(!stage.completed) return 0;
    const base=stage.assistance===2?5:stage.assistance===1?15:25;
    return Math.max(0,base-stage.errors*penalty);
  }
  function questionScore(stages, penalty=2) {return stages.reduce((n,s)=>n+stageScore(s,penalty),0);}
  return {TYPES,STAGE_NAMES,frac,sqrt,cubeRoot,createQuestion,shuffle,makeSession,stageScore,questionScore};
});
