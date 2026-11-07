const $ = (id) => document.getElementById(id);
const state = {layers:[], selected:null, seconds:0, playing:false, projectName:'Untitled Project', keyframes:[]};
let toastTimer;
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)}
function makeLayer(type, name){return {id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),type,name:name||`${type} Layer ${state.layers.length+1}`,text:type==='Text'?'Your text':name||'',opacity:100,scale:100,mediaUrl:null}}
function addLayer(type,name){const layer=makeLayer(type,name);state.layers.unshift(layer);state.selected=layer.id;render();toast(`${type} layer added`)}
function selected(){return state.layers.find(x=>x.id===state.selected)}
function render(){const list=$('layerList');list.innerHTML='';state.layers.forEach(layer=>{const row=document.createElement('div');row.className='layer-row'+(layer.id===state.selected?' selected':'');row.innerHTML=`<span class="layer-icon">${layer.type==='Text'?'T':layer.type==='Audio'?'♫':layer.type==='Video'?'▶':layer.type==='Image'?'▧':'◇'}</span><span class="layer-name"></span><span class="clip"></span><button class="layer-action" aria-label="Layer options">⋮</button>`;row.querySelector('.layer-name').textContent=layer.name;row.addEventListener('click',()=>{state.selected=layer.id;render()});list.appendChild(row)});if(!state.layers.length)list.innerHTML='<div class="layer-row"><span class="layer-name muted">Add a layer to begin</span></div>';updateInspector();updatePreview();saveLocal()}
function updateInspector(){const layer=selected();$('selectedLabel').textContent=layer?layer.name:'No layer selected';$('layerText').value=layer?(layer.type==='Text'?layer.text:layer.name):'';$('layerText').disabled=!layer;$('opacity').value=layer?layer.opacity:100;$('scale').value=layer?layer.scale:100;$('opacityValue').textContent=(layer?layer.opacity:100)+'%';$('scaleValue').textContent=(layer?layer.scale:100)+'%'}
function updatePreview(){const stage=$('previewContent');const textLayer=state.layers.find(l=>l.type==='Text');if(textLayer){stage.innerHTML='';const div=document.createElement('div');div.className='sample-title';div.textContent=textLayer.text||textLayer.name;stage.appendChild(div);stage.style.opacity=textLayer.opacity/100;stage.style.transform=`scale(${textLayer.scale/100})`}else{stage.innerHTML='<div class="sample-kicker">YOUR MOTION</div><div class="sample-title">STARTS<br><em>HERE</em></div><div class="sample-footer">SUREMOTION STUDIO</div>';stage.style.opacity=1;stage.style.transform='scale(1)'}}
function saveLocal(){try{localStorage.setItem('suremotion-project',JSON.stringify({projectName:state.projectName,layers:state.layers,seconds:state.seconds,keyframes:state.keyframes}))}catch(e){}}
function updateTime(){const s=state.seconds;const mm=String(Math.floor(s/60)).padStart(2,'0');const ss=String(Math.floor(s%60)).padStart(2,'0');$('timeReadout').textContent=`00:${mm}:${ss}`;$('playhead').value=s}
$('playhead').addEventListener('input',e=>{state.seconds=Number(e.target.value);updateTime();saveLocal()});
$('toStart').onclick=()=>{state.seconds=0;updateTime()};
$('toEnd').onclick=()=>{state.seconds=8;updateTime()};
$('playBtn').onclick=()=>{state.playing=!state.playing;$('playBtn').textContent=state.playing?'Ⅱ':'▶';if(state.playing){const tick=()=>{if(!state.playing)return;state.seconds=state.seconds>=8?0:state.seconds+.08;updateTime();requestAnimationFrame(tick)};requestAnimationFrame(tick)}};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addLayer(b.dataset.add));
$('layerText').addEventListener('input',e=>{const l=selected();if(!l)return;if(l.type==='Text')l.text=e.target.value;else l.name=e.target.value;render()});
$('opacity').oninput=e=>{const l=selected();if(!l)return;l.opacity=Number(e.target.value);$('opacityValue').textContent=l.opacity+'%';updatePreview();saveLocal()};
$('scale').oninput=e=>{const l=selected();if(!l)return;l.scale=Number(e.target.value);$('scaleValue').textContent=l.scale+'%';updatePreview();saveLocal()};
$('deleteLayer').onclick=()=>{if(!selected())return;state.layers=state.layers.filter(l=>l.id!==state.selected);state.selected=state.layers[0]?.id||null;render();toast('Layer deleted')};
$('addKeyframeBtn').onclick=()=>{const l=selected();if(!l){toast('Select a layer first');return}state.keyframes.push({layerId:l.id,time:state.seconds,opacity:l.opacity,scale:l.scale});saveLocal();toast(`Keyframe added at ${state.seconds.toFixed(2)}s`)};
$('keyframeTool').onclick=()=>$('addKeyframeBtn').click();
$('renameBtn').onclick=()=>{const n=prompt('Project name',state.projectName);if(n&&n.trim()){state.projectName=n.trim();$('projectName').textContent=state.projectName;saveLocal()}};
$('saveBtn').onclick=()=>{saveLocal();toast('Project saved on this device')};
$('exportBtn').onclick=()=>toast('MP4 rendering is planned for a later build. Your project is saved locally.');
$('effectsBtn').onclick=()=>toast('Effects library is coming in the next development milestone.');
$('projectsBtn').onclick=()=>toast('Project library is coming next. Current project saves on this device.');
$('layersBtn').onclick=()=>document.querySelector('.timeline-section').scrollIntoView({behavior:'smooth'});
$('settingsBtn').onclick=()=>toast('Settings will be added in a later build.');
function importMedia(kind){const picker=$('mediaPicker');picker.accept=kind==='image'?'image/*':kind==='video'?'video/*':'audio/*';picker.onchange=()=>{const file=picker.files[0];if(!file)return;const layer=makeLayer(kind[0].toUpperCase()+kind.slice(1),file.name);layer.mediaUrl=URL.createObjectURL(file);layer.fileName=file.name;state.layers.unshift(layer);state.selected=layer.id;render();toast(`${file.name} added for this session`);picker.value=''};picker.click()}
$('importImage').onclick=()=>importMedia('image');$('importVideo').onclick=()=>importMedia('video');$('importAudio').onclick=()=>importMedia('audio');
function loadLocal(){try{const saved=JSON.parse(localStorage.getItem('suremotion-project')||'null');if(saved){state.projectName=saved.projectName||state.projectName;state.layers=saved.layers||[];state.seconds=saved.seconds||0;state.keyframes=saved.keyframes||[];$('projectName').textContent=state.projectName;state.selected=state.layers[0]?.id||null}}catch(e){}}
loadLocal();render();updateTime();
if('serviceWorker' in navigator && location.protocol!=='file:'){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
