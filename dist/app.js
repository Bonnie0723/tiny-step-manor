const STORAGE_KEY='tiny-manor-v1';
const todayKey=()=>new Date().toLocaleDateString('en-CA');
const dateLabel=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
const defaultState={date:todayKey(),tasks:[],streak:0,lastCompletedDay:null,sound:true,totalXp:0};
let state=load();
let deferredPrompt=null;
if(new URLSearchParams(location.search).has('demo')&&!state.tasks.length){state.totalXp=70;state.tasks=[{id:'demo-1',text:'完成今日方案初稿',time:'09:00',kind:'grow',done:true},{id:'demo-2',text:'和团队同步项目进度',time:'11:30',kind:'grow',done:false},{id:'demo-3',text:'喝水并休息 10 分钟',time:'15:00',kind:'water',done:true}]}

function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved)return {...defaultState};
    if(saved.date!==todayKey())return {...saved,date:todayKey(),tasks:[]};
    return {...defaultState,...saved};
  }catch{return {...defaultState};}
}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));document.querySelector('#saveStatus').textContent='刚刚已保存';setTimeout(()=>document.querySelector('#saveStatus').textContent='进度已保存在此设备',1200)}
function done(){return state.tasks.filter(t=>t.done).length}
function taskKind(task){return task.kind||(/喝水|休息|睡觉|放松|散步/.test(task.text)?'water':'grow')}
function house(){const xp=state.totalXp||0;if(xp>=300)return ['🏰','Lv.5 湖畔豪宅'];if(xp>=180)return ['🏛️','Lv.4 花园别墅'];if(xp>=90)return ['🏠','Lv.3 舒适小屋'];if(xp>=30)return ['🏡','Lv.2 温暖农舍'];return ['🛖','Lv.1 木屋']}
function currentNpc(){const xp=state.totalXp||0;if(xp>=180)return{name:'管家陆叔',rank:'伙伴 4/4 · 豪宅顾问',avatar:3};if(xp>=90)return{name:'花艺师小满',rank:'伙伴 3/4 · 庄园设计',avatar:2};if(xp>=30)return{name:'木匠阿森',rank:'伙伴 2/4 · 房屋营造',avatar:1};return{name:'园丁阿禾',rank:'伙伴 1/4 · 种植入门',avatar:0}}
function npc(){const n=state.tasks.length,d=done(),guide=currentNpc();if(!n)return guide.avatar===0?'早上好！写下今天最重要的三件事，我们从第一颗种子开始。':`${guide.name}来值班了。种下今天的目标，让庄园继续向下一阶段生长。`;if(d===0)return `种子已经埋好了。先完成「${state.tasks[0].text}」，我会帮你照看第一次成长。`;if(d<n)return `做得好，已经完成 ${d} 件！再推进 ${n-d} 件，距离下一位伙伴和新庄园又近了一步。`;return '今天的花圃全开了！每一次完成都算数，这座庄园正是被你一点点建起来的。';}
function plantFor(task,index){if(task.done&&taskKind(task)==='water')return '💦';if(task.done)return index%3===0?'🌳':index%3===1?'🌻':'🍎';return '🌱'}
function render(){
  const d=done(),n=state.tasks.length,watered=state.tasks.filter(t=>t.done&&taskKind(t)==='water').length,grown=state.tasks.filter(t=>t.done&&taskKind(t)==='grow').length,todayIncome=grown*500+watered*100,xp=d*10,pct=n?Math.round(d/n*100):0,[icon,lvl]=house();
  const monthChecks=Math.floor((state.totalXp||0)/10),monthPct=Math.min(100,Math.round(monthChecks/30*100));
  document.querySelector('#todayLabel').textContent=dateLabel;
  document.querySelector('#streakCount').textContent=state.streak;
  document.querySelector('#doneCount').textContent=`${d}/${n}`;
  document.querySelector('#todayStat').textContent=`${d}/${n}`;document.querySelector('#goalStat').textContent=monthChecks;
  document.querySelector('#incomeStat').textContent=todayIncome.toLocaleString();
  document.querySelector('#xpLabel').textContent=`🌱 今日解锁 ${d} 块 · 💧浇水 ${watered} 次`;
  document.querySelector('#xpPercent').textContent=`${pct}%`;
  document.querySelector('#xpFill').style.width=`${pct}%`;
  document.querySelector('#monthDone').textContent=monthChecks;document.querySelector('#monthPercent').textContent=`${monthPct}%`;document.querySelector('#monthFill').style.width=`${monthPct}%`;
  const week=document.querySelector('#weekStrip');week.innerHTML='';const now=new Date(),monday=new Date(now);monday.setDate(now.getDate()-((now.getDay()+6)%7));['一','二','三','四','五','六','日'].forEach((w,i)=>{const day=new Date(monday);day.setDate(monday.getDate()+i);const el=document.createElement('div');el.className=day.toDateString()===now.toDateString()?'today':'';el.innerHTML=`<small>周${w}</small><b>${day.getDate()}</b>`;week.appendChild(el)});
  document.querySelector('#houseIcon').textContent=icon;document.querySelector('#houseLevel').textContent=lvl;
  const guide=currentNpc();document.querySelector('#npcName').textContent=guide.name;document.querySelector('#npcRank').textContent=guide.rank;document.querySelector('#npcText').textContent=npc();document.querySelector('#npcAvatar').className=`npc-avatar npc-${guide.avatar}`;
  document.querySelector('#soundBtn').textContent=state.sound?'🔊':'🔇';document.querySelector('#soundBtn').setAttribute('aria-pressed',String(state.sound));
  const list=document.querySelector('#taskList');list.innerHTML='';
  state.tasks.forEach(task=>{const water=taskKind(task)==='water',el=document.createElement('article');el.className=`task-card ${task.done?'completed':''}`;el.innerHTML=`<div class="task-time">${task.time||'09:00'}</div><button class="check-btn" aria-label="${task.done?'取消完成':'完成'} ${escapeHtml(task.text)}">${task.done?'✓':'○'}</button><div class="task-copy"><b>${water?'💧 ':''}${escapeHtml(task.text)}</b><small>${task.done?(water?'浇水打卡完成 · 田地已恢复':'目标打卡完成 · 解锁 1 块田'):(water?'待打卡 · 完成后浇水':'待打卡 · 完成后解锁田地')}</small></div><button class="delete-btn" aria-label="删除 ${escapeHtml(task.text)}">×</button>`;el.querySelector('.check-btn').onclick=()=>toggleTask(task.id);el.querySelector('.delete-btn').onclick=()=>deleteTask(task.id);list.appendChild(el)});
  const garden=document.querySelector('#garden');garden.innerHTML='';state.tasks.slice(0,4).forEach((task,i)=>{const p=document.createElement('div');p.className=`plot ${task.done?'done':''}`;p.innerHTML=`<div class="plant" aria-hidden="true">${plantFor(task,i)}</div><div class="soil"></div><small>${escapeHtml(task.text)}</small>`;garden.appendChild(p)});
  document.querySelector('#emptyState').hidden=n>0;
  renderEstate();
}
function renderEstate(){const xp=state.totalXp||0,[,level]=house(),unlocked=xp>=180?4:xp>=90?3:xp>=30?2:1,plots=Math.min(12,Math.floor(xp/10)),coins=300+xp*12,houseValue=3500+xp*45,fieldValue=plots*400,collection=Math.floor(xp/90)*800,total=coins+houseValue+fieldValue+collection,next=Math.ceil((total+1)/10000)*10000;document.querySelector('#estateLevel').textContent=level.split(' ')[0];document.querySelector('#assetTotal').textContent=total.toLocaleString();document.querySelector('#assetNext').textContent=`距离下一阶段豪宅还差 ${(next-total).toLocaleString()}`;document.querySelector('#assetProgress').style.width=`${Math.round(total/next*100)}%`;document.querySelector('#houseAsset').textContent=houseValue.toLocaleString();document.querySelector('#fieldAsset').textContent=fieldValue.toLocaleString();document.querySelector('#coinAsset').textContent=coins.toLocaleString();document.querySelector('#collectionAsset').textContent=collection.toLocaleString();document.querySelector('#plotCount').textContent=`${plots} / 12 块`;document.querySelector('#partnerCount').textContent=`${unlocked} / 4 人`;const land=document.querySelector('#estatePlots');land.innerHTML='';for(let i=0;i<12;i++){const p=document.createElement('div');p.className=`estate-plot ${i>=plots?'locked':''}`;p.textContent=i<plots?(i%3===0?'🌳':i%3===1?'🌱':'🌻'):'🔒';land.appendChild(p)}const rail=document.querySelector('#partnerRail');rail.innerHTML='';['阿禾','阿森','小满','陆叔'].forEach((name,i)=>{const p=document.createElement('div');p.className=`mini-partner ${i>=unlocked?'locked':''}`;p.innerHTML=`<div class="mini-face mini-${i}"></div><small>${i<unlocked?name:'未解锁'}</small>`;rail.appendChild(p)})}
function showView(view){const manor=view==='manor';document.querySelector('#todayView').hidden=manor;document.querySelector('#manorView').hidden=!manor;document.querySelector('#navToday').classList.toggle('active',!manor);document.querySelector('#navManor').classList.toggle('active',manor);window.scrollTo(0,0)}
function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function addTask(text,time='09:00'){const clean=text.trim();if(!clean)return;if(state.tasks.length>=6){toast('今天先专注 6 件事，少一点，更容易完成。');return}const kind=/喝水|休息|睡觉|放松|散步/.test(clean)?'water':'grow';state.tasks.push({id:crypto.randomUUID?.()||Date.now().toString(),text:clean,time,kind,done:false});state.tasks.sort((a,b)=>(a.time||'23:59').localeCompare(b.time||'23:59'));save();render();toast(kind==='water'?'养护任务已加入 💧':'目标已种下 🌱')}
function toggleTask(id){const task=state.tasks.find(t=>t.id===id);if(!task)return;const wasAll=state.tasks.length>0&&done()===state.tasks.length,oldGuide=currentNpc().avatar;task.done=!task.done;if(task.done){state.totalXp=(state.totalXp||0)+10;playChime();burst();}else state.totalXp=Math.max(0,(state.totalXp||0)-10);const isAll=state.tasks.length>0&&done()===state.tasks.length,newGuide=currentNpc().avatar;if(newGuide>oldGuide)setTimeout(()=>toast(`新伙伴「${currentNpc().name}」已到访！`),250);else if(isAll&&!wasAll)setTimeout(()=>toast('今日花圃全部盛开！连胜 +1 🎉'),150);if(isAll&&!wasAll&&state.lastCompletedDay!==todayKey()){state.streak=(state.streak||0)+1;state.lastCompletedDay=todayKey()}save();render()}
function deleteTask(id){state.tasks=state.tasks.filter(t=>t.id!==id);save();render()}
function playChime(){if(!state.sound)return;try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[523,659,784].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;g.gain.setValueAtTime(.05,ctx.currentTime+i*.08);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.08+.22);o.start(ctx.currentTime+i*.08);o.stop(ctx.currentTime+i*.08+.24)})}catch{}}
function burst(){const box=document.querySelector('#celebration');for(let i=0;i<16;i++){const s=document.createElement('span');s.className='confetti';s.textContent=['🌿','✨','🌼','🍃'][i%4];s.style.left=`${10+Math.random()*80}%`;s.style.animationDelay=`${Math.random()*.3}s`;box.appendChild(s);setTimeout(()=>s.remove(),2200)}}
let toastTimer;function toast(msg){const el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
document.querySelector('#quickForm').addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#taskInput'),time=document.querySelector('#taskTime');addTask(input.value,time.value);input.value='';input.focus()});
document.querySelector('#mobileAdd').onclick=()=>{showView('today');document.querySelector('#taskInput').focus();document.querySelector('#questTitle').scrollIntoView()};
document.querySelector('#navToday').onclick=()=>showView('today');document.querySelector('#navManor').onclick=()=>showView('manor');document.querySelector('#backToday').onclick=()=>showView('today');
document.querySelector('#soundBtn').onclick=()=>{state.sound=!state.sound;save();render()};
document.querySelector('#resetBtn').onclick=()=>{if(!confirm('清空今天的任务，重新开始吗？'))return;state.tasks=[];state.date=todayKey();save();render()};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.querySelector('#installBtn').hidden=false});
document.querySelector('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.querySelector('#installBtn').hidden=true};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
function registerWebMcp(){const c=document.modelContext;if(!c?.registerTool)return;c.registerTool({name:'add_daily_task',title:'添加今日任务',description:'向小步庄园添加一个今天要完成的任务。',inputSchema:{type:'object',properties:{text:{type:'string',minLength:1,maxLength:60}},required:['text'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:({text})=>{if(typeof text!=='string'||!text.trim())throw new Error('任务内容不能为空');addTask(text);return{added:text.trim(),taskCount:state.tasks.length}}});}
registerWebMcp();render();if(new URLSearchParams(location.search).get('view')==='manor')showView('manor');