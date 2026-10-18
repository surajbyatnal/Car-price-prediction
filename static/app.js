const $=s=>document.querySelector(s);
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const hist=()=>JSON.parse(localStorage.getItem('av_hist')||'[]');
const setHist=h=>localStorage.setItem('av_hist',JSON.stringify(h));
const NAV=[['dashboard','Dashboard','▦'],['predict','Predict Price','◎'],['analytics','Analytics','▮'],['history','History','↺'],['dataset','Dataset','▤'],['about','About','ⓘ']];
let last=null,q='';
const opts=a=>a.map(x=>`<option>${x}</option>`).join('');
async function apiFetch(path){
 const response=await fetch(path);
 let data;
 try{data=await response.json()}catch{throw new Error('The server returned an invalid response.')}
 if(!response.ok)throw new Error(data.error||`Request failed (${response.status}).`);
 return data}
const titleCase=s=>s.replace(/\b\w/g,c=>c.toUpperCase());
const stat=(i,l,v)=>`<div class="card stat"><span class="ico">${i}</span><div><small>${l}</small><b>${v}</b></div></div>`;
const side=r=>`<aside class="side"><div class="logo"><i>🚗</i>AutoValue AI</div>${NAV.map(([k,t,i])=>`<a href="#${k}" class="${k==r?'on':''}"><span>${i}</span>${t}</a>`).join('')}</aside>`;

const V={
home:()=>`<header class="top"><div class="logo"><i>🚗</i>AutoValue AI</div><nav><a href="#home">Home</a><a href="#dashboard">Dashboard</a><a href="#predict">Predict</a><a href="#analytics">Analytics</a><a href="#history">History</a><a href="#about">About</a></nav><a class="btn" href="#predict">Login</a></header>
 <section class="hero"><h1>Smart Car <span>Price</span> Prediction</h1><p>Get the estimated resale value of any used car using machine learning. Make better buying and selling decisions with data.</p><a class="btn" href="#predict">Predict Price →</a></section>
 <section class="features">${[['🚘','Accurate Predictions','Powered by a trained ML model'],['◎','Multiple Features','Year, mileage, fuel, and model'],['✎','Easy to Use','Simple and clean interface'],['↺','Save History','Track your predictions']].map(f=>`<div class="feat"><span class="ico">${f[0]}</span><b>${f[1]}</b><small>${f[2]}</small></div>`).join('')}</section>`,
dashboard:()=>{const h=hist(),avg=h.length?h.reduce((a,b)=>a+b.price,0)/h.length:0;
 return `<h2>Dashboard</h2><p class="sub">Overview of your car price prediction system</p>
 <div class="grid g4">${stat('▦','Total Predictions',h.length)}${stat('₹','Average Predicted Price',avg?inr(avg):'—')}${stat('⚙','Supported Brands','—')}${stat('◷','API Status','Loading…')}</div>
 <div id="dashboardInfo" class="card"><p class="sub">Loading model information…</p></div>
 <div class="card"><h3>Recent Predictions</h3>${table(h.slice(0,3))}</div>`},
predict:()=>`<h2>Predict Car Price</h2><p class="sub">Enter the car details to estimate its price from the available dataset.</p><div class="card"><form id="f"><div class="form">
<div><label>Brand</label><select id="brand" disabled><option>Loading…</option></select></div><div><label>Model</label><select id="model" disabled></select></div>
<div><label>Model Year</label><select id="year" disabled></select></div><div><label>Kilometres Driven</label><input id="km" type="number" required disabled></div>
<div><label>Fuel Type</label><select id="fuel" disabled></select></div></div>
<p class="note" id="limits">Loading supported input ranges…</p><p id="error" role="alert" style="color:var(--red);margin-bottom:12px"></p>
<button class="btn full" id="go" disabled>Get Estimated Price</button></form></div>`,
result:()=>{const c=last;return `<h2>Estimated Selling Price</h2><br><div class="card price"><span class="ico">₹</span><div><b>${inr(c.price)}</b><small>Estimated price based on the available training data</small></div></div>
 <div class="card"><h3>Car Details</h3><div class="kv">${[['Brand',c.brand],['Model',c.model],['Year',c.year],['Kilometres Driven',c.km],['Fuel Type',c.fuel]].map(([k,v])=>`<span>${k}</span><span>${v}</span>`).join('')}</div>
 <div class="note">ⓘ This estimate uses historical data and does not account for location, trim, ownership, or condition. The actual selling price may differ.</div>
 <div class="row"><button class="btn" id="sv">Save to History</button><a class="btn ghost" href="#predict">Predict Another Car</a></div></div>`},
analytics:()=>`<h2>Analytics</h2><p class="sub">Feature importance from the trained prediction model</p><div id="analyticsInfo" class="card"><p class="sub">Loading model analytics…</p></div>`,
history:()=>{const h=hist().filter(x=>(x.brand+x.model).toLowerCase().includes(q));
 return `<div class="row" style="justify-content:space-between;align-items:center"><div><h2>Prediction History</h2><p class="sub">View and manage your past predictions</p></div><input id="q" placeholder="Search by brand or model..." value="${q}" style="max-width:260px"></div>
 <div class="card">${table(h,true)}<div class="row" style="justify-content:space-between;align-items:center;margin-top:14px"><small style="color:var(--mut)">Showing ${h.length} entries</small><button class="btn ghost" id="exp">⬇ Export CSV</button></div></div>`},
dataset:()=>`<h2>Dataset</h2><p class="sub">Inspect the training dataset or analyze a local CSV file</p><div id="datasetInfo" class="card"><p class="sub">Loading bundled dataset details…</p></div><div class="card drop">☁<br>Select a CSV file to inspect it in your browser<br><br><label class="btn" style="margin:0">Choose File<input id="file" type="file" accept=".csv" hidden></label></div><div id="info"></div>`,
about:()=>`<h2>About This Project</h2><p class="sub">Car Price Prediction using Machine Learning</p><div class="grid g2"><div class="card"><h3>Problem Statement</h3><p style="line-height:1.6;color:#44536b">Predict the resale price of a car from its features, helping buyers and sellers make decisions with accurate price estimation.</p><h3 style="margin-top:16px">Objectives</h3><ul style="padding-left:18px;line-height:1.9;color:#44536b"><li>Build an ML model to predict selling price</li><li>Handle missing values and categorical data</li><li>Use Extra Trees with a train/test evaluation</li><li>Provide a simple, user-friendly web interface</li></ul></div>
 <div class="card"><h3>Methodology</h3>${[['Data Preprocessing','Clean data, impute missing values, encode'],['Train/Test Split','80% training, 20% testing'],['Model Training','Extra Trees Regressor'],['Evaluation','R² score and mean absolute error']].map((s,i)=>`<div class="step"><b>${i+1}</b><div><b style="all:unset;font-weight:600">${s[0]}</b><br><small style="color:var(--mut)">${s[1]}</small></div></div>`).join('')}<h3 style="margin-top:16px">Technology Stack</h3><p style="color:#44536b">Python · Flask · Pandas · Scikit-learn · HTML/CSS/JS</p></div></div>`};

function table(h,act){if(!h.length)return '<p style="color:var(--mut);padding:10px">No predictions yet. Predict a car price to see it here.</p>';
 return `<table><tr><th>#</th><th>Brand</th><th>Model</th><th>Year</th><th>Predicted Price</th><th>Date</th>${act?'<th>Actions</th>':''}</tr>${h.map((x,i)=>`<tr><td>${i+1}</td><td>${x.brand}</td><td>${x.model}</td><td>${x.year}</td><td>${inr(x.price)}</td><td>${x.date}</td>${act?`<td><button class="x" data-d="${i}" aria-label="Delete">🗑</button></td>`:''}</tr>`).join('')}</table>`}

function bind(r){
 if(r=='dashboard'){
  Promise.all([apiFetch('/api/health'),apiFetch('/api/analytics')]).then(([health,data])=>{
   if(!$('#dashboardInfo'))return;
   const values=document.querySelectorAll('.grid.g4 .stat b');
   values[2].textContent=data.supported_brands;
   values[3].textContent=health.status=='ok'?'Online':'Unavailable';
   $('#dashboardInfo').innerHTML=`<h3>Model Coverage</h3><div class="kv"><span>Model</span><span>${data.model_type}</span><span>Ensemble estimators</span><span>${data.estimator_count}</span><span>Supported models</span><span>${data.supported_models}</span><span>Supported fuels</span><span>${data.supported_fuel_types.map(titleCase).join(', ')}</span><span>Dataset</span><span>${health.dataset_available?'Available':'Unavailable'}</span></div>`;
  }).catch(error=>{const target=$('#dashboardInfo');if(target)target.textContent=`Unable to load model status: ${error.message}`})}
 if(r=='predict'){
  const form=$('#f'),b=$('#brand'),m=$('#model'),y=$('#year'),fuel=$('#fuel'),km=$('#km'),button=$('#go');
  const loadOptions=async()=>{
   try{
    const data=await apiFetch('/api/options');
    if(!form.isConnected)return;
    const brands=Object.keys(data.brands);
    b.innerHTML=brands.map(x=>`<option value="${x}">${titleCase(x)}</option>`).join('');
    const fill=()=>{m.innerHTML=data.brands[b.value].map(x=>`<option value="${x}">${titleCase(x)}</option>`).join('');m.disabled=false};
    b.onchange=fill;fill();
    const years=Array.from({length:data.year.max-data.year.min+1},(_,i)=>data.year.max-i);
    y.innerHTML=opts(years);y.disabled=false;
    fuel.innerHTML=data.fuel_types.map(x=>`<option value="${x}">${titleCase(x)}</option>`).join('');
    fuel.value=data.fuel_types.includes('petrol')?'petrol':data.fuel_types[0];fuel.disabled=false;
    km.min=data.kms_driven.min;km.max=data.kms_driven.max;km.value=45000;km.disabled=false;
    b.disabled=false;button.disabled=false;
    $('#limits').textContent=`Supported model years: ${data.year.min}–${data.year.max}; mileage: ${data.kms_driven.min.toLocaleString()}–${data.kms_driven.max.toLocaleString()} km. Only the brands, models, and fuels listed here are supported.`;
   }catch(error){if(form.isConnected)$('#error').textContent=`Unable to load prediction options: ${error.message}`}
  };
  loadOptions();
  $('#f').onsubmit=async e=>{e.preventDefault();const button=$('#go'),error=$('#error');button.textContent='Estimating...';button.disabled=true;error.textContent='';
   const c={brand:b.value,model:m.value,year:+$('#year').value,km:+$('#km').value,fuel:$('#fuel').value};
   try{const response=await fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)});let data;try{data=await response.json()}catch{throw new Error('The server returned an invalid response.')}if(!response.ok)throw new Error(data.error||'The prediction request failed.');if(typeof data.price!=='number'||!Number.isFinite(data.price))throw new Error('The prediction service returned an invalid price.');c.price=data.price;
    c.date=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});last=c;location.hash='result'}
   catch(error){error.textContent=error.message||'Unable to get a prediction. Please try again.'}
   finally{button.textContent='Get Estimated Price';button.disabled=false}}}
 if(r=='analytics'){
  apiFetch('/api/analytics').then(data=>{
   const target=$('#analyticsInfo');if(!target)return;
   const features=data.feature_importances.slice().sort((a,b)=>b.importance-a.importance);
   target.innerHTML=`<div class="kv"><span>Model</span><span>${data.model_type}</span><span>Ensemble estimators</span><span>${data.estimator_count}</span><span>Supported brands</span><span>${data.supported_brands}</span><span>Supported models</span><span>${data.supported_models}</span></div><h3 style="margin-top:20px">Feature Importance</h3><table><tr><th>Feature</th><th>Importance</th></tr>${features.map(item=>`<tr><td>${titleCase(item.feature.replace('_',' '))}</td><td><div style="display:flex;align-items:center;gap:10px"><div style="width:180px;height:8px;background:#e5ebf4;border-radius:4px"><div style="width:${(item.importance*100).toFixed(2)}%;height:8px;background:#2563eb;border-radius:4px"></div></div>${(item.importance*100).toFixed(2)}%</div></td></tr>`).join('')}</table>`;
  }).catch(error=>{const target=$('#analyticsInfo');if(target)target.textContent=`Unable to load model analytics: ${error.message}`})}
 if(r=='result')$('#sv').onclick=e=>{const h=hist();h.unshift(last);setHist(h);e.target.textContent='Saved ✓'};
 if(r=='history'){$('#q').oninput=e=>{q=e.target.value.toLowerCase();render();const i=$('#q');i.focus();i.setSelectionRange(99,99)};
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const h=hist();h.splice(+b.dataset.d,1);setHist(h);render()});
  $('#exp').onclick=()=>{const rows=['brand,model,year,price,date',...hist().map(x=>[x.brand,x.model,x.year,x.price,x.date].join(','))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));a.download='history.csv';a.click()}}
 if(r=='dataset'){
  apiFetch('/api/dataset').then(data=>{
   const target=$('#datasetInfo');if(!target)return;
   target.innerHTML=`<h3>Bundled Training Dataset</h3><div class="kv"><span>File Name</span><span>${data.file}</span><span>Total Rows</span><span>${data.rows}</span><span>Total Columns</span><span>${data.columns.length}</span><span>Missing Values</span><span>${data.missing_values}</span></div><h3 style="margin-top:16px">Columns</h3><table><tr><th>Column</th><th>Missing Values</th></tr>${data.columns.map(column=>`<tr><td>${column.name}</td><td>${column.missing}</td></tr>`).join('')}</table>`;
  }).catch(error=>{const target=$('#datasetInfo');if(target)target.textContent=`Unable to load dataset details: ${error.message}`});
  $('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{
  const L=t.trim().split(/\r?\n/),sp=s=>s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/),H=sp(L[0]),R=L.slice(1).map(sp);
  const cols=H.map((n,i)=>{const v=R.map(r=>(r[i]||'').trim()),ok=v.filter(Boolean);return{n,miss:v.length-ok.length,t:ok.length&&ok.every(x=>!isNaN(x))?'numeric':'object'}});
  $('#info').innerHTML=`<div class="grid g2"><div class="card"><h3>Dataset Info</h3><div class="kv"><span>File Name</span><span>${f.name}</span><span>Total Rows</span><span>${R.length}</span><span>Total Columns</span><span>${H.length}</span><span>Missing Values</span><span>${cols.reduce((a,c)=>a+c.miss,0)}</span></div></div>
  <div class="card"><h3>Missing Values</h3><table><tr><th>Column</th><th>Missing Count</th></tr>${cols.filter(c=>c.miss).map(c=>`<tr><td>${c.n}</td><td>${c.miss}</td></tr>`).join('')||'<tr><td colspan=2>None</td></tr>'}</table></div></div>
  <div class="card"><h3>Columns</h3><table><tr><th>Column Name</th><th>Data Type</th></tr>${cols.map(c=>`<tr><td>${c.n}</td><td>${c.t}</td></tr>`).join('')}</table></div>`})}}
}
function render(){const r=location.hash.slice(1)||'home';let v=r;
 if(r=='result'&&!last){location.hash='predict';return}
 if(!V[v])v='home';
 $('#app').innerHTML=v=='home'?V.home():`<div class="shell">${side(v=='result'?'predict':v)}<div><div class="main"><div class="bar">👤 User</div>${V[v]()}</div></div></div>`;
 window.scrollTo(0,0);bind(v)}
addEventListener('hashchange',render);render();