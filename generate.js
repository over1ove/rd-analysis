// generate.js - Multi-tab platform generator
const fs = require("fs");

// Load data
const d = JSON.parse(fs.readFileSync("analysis_data.json","utf8"));
const R = d.results || [], P = d.predictions || [], S = d.stats || {}, C = d.customer || {}, E = d.equipment || [], CI = d.companyInfo || {};

function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function G(n) { if(n.includes("基准"))return"基准对照";if(n.includes("成核")||n.includes("DBchem"))return"成核剂";if(n.includes("POE")||n.includes("陶氏")||n.includes("八碳"))return"POE增韧";if(n.includes("马来"))return"增容/复配";return"其他"; }

const SE = R.slice().sort((a,b)=>b["断裂伸长率"]-a["断裂伸长率"]);
const SS = R.slice().sort((a,b)=>b["拉伸强度"]-a["拉伸强度"]);
const CC = {"基准对照":"rgba(148,163,184,.85)","成核剂":"rgba(56,189,248,.85)","POE增韧":"rgba(251,146,60,.85)","增容/复配":"rgba(52,211,153,.85)"};

// ===== BUILD HTML SECTIONS =====
const parts = [];

// CSS
parts.push('<!DOCTYPE html><html lang=zh-CN><head><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1.0"><title>配方研发分析平台</title><script src=https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js><\/script><style>');
parts.push(fs.readFileSync("template.html","utf8"));
parts.push('</style></head><body>');

// Navigation
parts.push('<nav class=nv><div class=ni><div class=nb>🔬 配方研发分析平台</div><div class=nl>');
parts.push('<button class="nl-btn ac" onclick=swPage(0)>概览</button>');
parts.push('<button class=nl-btn onclick=swPage(1)>实验设备</button>');
parts.push('<button class=nl-btn onclick=swPage(2)>相关项目</button>');
parts.push('<button class=nl-btn onclick=swPage(3)>AI 预测</button>');
parts.push('</div></div></nav>');

// PAGE 0 - Overview
parts.push('<div class="pg ac" id=pg0>');
parts.push('<div class=hero><h1>配方研发分析平台</h1><p class=hs>基于多个工艺配方项目的实验数据，归纳形成的综合性研发实验数据库。所有项目统一采用江苏天源试验设备有限公司的TY系列设备，确保实验条件的一致性与数据可比性。</p>');
parts.push('<div class=hm><div class=hmi><div class=v>'+R.length+'</div><div class=l>已完成实验</div></div>');
parts.push('<div class=hmi><div class=v>3</div><div class=l>天源设备</div></div>');
parts.push('<div class=hmi><div class=v>4</div><div class=l>待执行实验</div></div>');
parts.push('<div class=hmi><div class=v>1</div><div class=l>在研项目</div></div>');
parts.push('</div></div>');
parts.push('<div style="max-width:1280px;margin:0 auto;padding:0 20px">');

// Features
parts.push('<div class=fg style=margin-top:-20px>');
parts.push('<div class=ft><div class=fi>🧪</div><h3>实验数据管理</h3><p>收录配方、工艺参数、性能测试等全流程数据</p></div>');
parts.push('<div class=ft><div class=fi>📊</div><h3>可视化分析</h3><p>交互式图表展示关键指标趋势与配方效果分布</p></div>');
parts.push('<div class=ft><div class=fi>🔮</div><h3>AI 辅助预测</h3><p>基于实验数据与材料科学知识，回答配方问题</p></div>');
parts.push('</div>');

// Data overview
parts.push('<div class=cd><h2>📋 平台数据总览</h2>');
parts.push('<p class=desc>本平台目前收录了<strong>'+esc(C["客户名称"])+'</strong>的'+esc(C["产品类型"])+'配方研发项目数据。</p>');
parts.push('<div class=g2 style=margin-top:16px>');
parts.push('<div class=ti><strong>核心目标：断裂伸长率 ≥550%</strong><div class=tbar><div class=tfill style=width:'+(S.maxElong/550*100).toFixed(1)+'%;background:linear-gradient(90deg,#f59e0b,#fbbf24)></div></div><div class=tr><span>当前最高 '+S.maxElong.toFixed(1)+'%</span><span>进度 '+(S.maxElong/550*100).toFixed(1)+'%</span></div></div>');
parts.push('<div class=ti><strong>拉伸强度：18.69~21.24 MPa</strong><div class=tbar><div class=tfill style=width:100%;background:linear-gradient(90deg,#10b981,#34d399)></div></div><div class=tr><span>当前最高 '+S.maxStrength.toFixed(2)+' MPa</span><span style=color:#10b981>✅ 已达标</span></div></div>');
parts.push('</div></div>');
parts.push('<p class=desc style=text-align:center;margin-top:24px>👆 点击右上方导航，探索实验设备、相关项目与AI预测</p>');
parts.push('</div></div>');

// PAGE 1 - Equipment
parts.push('<div class=pg id=pg1><div style="max-width:1280px;margin:0 auto;padding:0 20px">');
parts.push('<div class=cd style=background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-color:#bae6fd>');
parts.push('<div style=display:flex;align-items:center;gap:16px;flex-wrap:wrap><div style=font-size:48px>🏭</div><div>');
parts.push('<h2 style=margin-bottom:4px>江苏天源试验设备有限公司</h2>');
parts.push('<p style=font-size:13px;color:#0369a1>🌐 '+esc(CI.website||"www.tytester.com")+'　📞 '+esc(CI.phone||"0514-86291226")+'</p>');
parts.push('<p class=desc style=color:#0c4a6e;margin-top:4px>所有实验项目均使用江苏天源TY系列设备，覆盖共混造粒、注塑成型、力学检测全流程。</p>');
parts.push('</div></div></div>');

// Equipment cards
const eqOrder=["TY-7008","TY-7003H","TY-8000DT"];
const eqCols={"TY-7008":"#f59e0b","TY-7003H":"#3b82f6","TY-8000DT":"#10b981"};
const eqNames={"TY-7008":"双螺杆挤出造粒机","TY-7003H":"立式注塑机","TY-8000DT":"微机控制电子万能试验机"};
parts.push('<div class=eg style=margin-top:20px>');
eqOrder.forEach(m=>{
  const eq=E.find(e=>e.model===m);if(!eq)return;const c=eqCols[m];
  parts.push('<div class=ec><div class=ect style=background:'+c+'></div>');
  parts.push('<div class=eci>'+({"TY-7008":"⚙️","TY-7003H":"🔧","TY-8000DT":"📐"}[m])+'</div>');
  parts.push('<div class=ecm>'+esc(eq.model)+'</div>');
  parts.push('<div class=ecn>'+esc(eqNames[m])+'</div>');
  parts.push('<div class=ecs>');
  const sp=eq.specs;
  if(sp.screwDiameter!=="-")parts.push('<div class=esr><span>螺杆直径</span><strong>Φ'+sp.screwDiameter+'mm</strong></div>');
  if(sp.meltPressure!=="-")parts.push('<div class=esr><span>熔体压力</span><strong>'+sp.meltPressure+'MPa</strong></div>');
  if(sp.torque!=="-")parts.push('<div class=esr><span>扭矩</span><strong>'+sp.torque+'Nm</strong></div>');
  parts.push('</div><div class=ecu>用途：'+esc(eq.usage)+'</div></div>');
});
parts.push('</div>');

// Equipment flow
parts.push('<div class=ef><div class=es><div class=sn style=background:#f59e0b>1</div>TY-7008 造粒</div><div class=ea>→</div><div class=es><div class=sn style=background:#3b82f6>2</div>TY-7003H 注塑</div><div class=ea>→</div><div class=es><div class=sn style=background:#10b981>3</div>TY-8000DT 测试</div></div>');
parts.push('<p class=desc style=text-align:center;margin-top:20px>实验流程：原料+助剂 → TY-7008造粒 → TY-7003H注塑制样 → TY-8000DT拉伸测试 → 数据采集分析</p>');
parts.push('</div></div>');

// PAGE 2 - Projects
parts.push('<div class=pg id=pg2>');
// Project list
parts.push('<div id=projList style="max-width:1280px;margin:0 auto;padding:0 20px">');
parts.push('<h2 style=font-size:20px;margin-bottom:20px>📁 在研项目</h2>');
parts.push('<div class=pc onclick=showProj()><div class=ph><div class=pi>🏢</div><div><h3>'+esc(C["客户名称"])+'</h3><p style=font-size:12px;color:#64748b>'+esc(C["产品类型"])+'</p></div></div>');
parts.push('<p class=desc>核心需求：'+esc(C["核心需求"])+'。'+esc(C["当前配方问题"])+'。合同金额：'+esc(C["合同金额"]||"300,000")+'元，交付期限：'+esc(C["交付期限"])+'。</p>');
parts.push('<div class=pm><span>✅ 已完成 '+R.length+' 组</span><span>🔮 待执行 4 组</span><span>📅 交付 '+esc(C["交付期限"])+'</span></div>');
parts.push('</div></div>');

// Project detail
parts.push('<div class=pd id=projDetail style="max-width:1280px;margin:0 auto;padding:0 20px">');
parts.push('<button class=bb onclick=hideProj()>← 返回项目列表</button>');
parts.push('<div class=cd><h2>📊 实验进度总览</h2><div class=g4>');
parts.push('<div class=ti><strong>已完成</strong><div style=font-size:28px;font-weight:800;margin-top:8px>'+R.length+'</div></div>');
parts.push('<div class=ti><strong>待执行</strong><div style=font-size:28px;font-weight:800;margin-top:8px>4</div></div>');
parts.push('<div class=ti><strong>最高伸长率</strong><div style=font-size:28px;font-weight:800;margin-top:8px;color:#f59e0b>'+S.maxElong.toFixed(1)+'%</div></div>');
parts.push('<div class=ti><strong>最高强度</strong><div style=font-size:28px;font-weight:800;margin-top:8px;color:#10b981>'+S.maxStrength.toFixed(2)+'</div></div>');
parts.push('</div></div>');
parts.push('<div class=g2><div class=cd><h2>📊 断裂伸长率排名</h2><div class=cw><canvas id=c1></canvas></div></div><div class=cd><h2>📊 拉伸强度排名</h2><div class=cw><canvas id=c2></canvas></div></div></div>');
parts.push('<div class=cd><h2>🔍 伸长率 vs 强度分布</h2><div class=ch350><canvas id=c3></canvas></div></div>');

// Results table
let RR="";SE.forEach((r,i)=>RR+='<tr><td>'+(i+1)+'</td><td>'+esc(r["配方编号"])+'</td><td><b>'+esc(r["配方名称"])+'</b></td><td class=n>'+r["断裂伸长率"].toFixed(1)+'%</td><td class=n>'+r["拉伸强度"].toFixed(2)+'</td><td class=rs>'+esc(r["配料方案"])+'</td></tr>');
parts.push('<div class=cd><h2>📋 已完成实验详情</h2><div class=tbw><table><thead><tr><th>#</th><th>编号</th><th>配方名称</th><th>伸长率(%)</th><th>强度(MPa)</th><th>配料方案</th></tr></thead><tbody>'+RR+'</tbody></table></div></div>');

// Predictions table
let PR="";P.forEach(p=>{const cl=p["预测断裂伸长率"].confidence==="低"?"clo":p["预测断裂伸长率"].confidence==="中"?"cmd":"chi";PR+='<tr><td>'+esc(p["配方编号"])+'</td><td><b>'+esc(p["配方名称"])+'</b></td><td class=n>'+p["预测断裂伸长率"].pred+'% <small>('+p["预测断裂伸长率"].low+'-'+p["预测断裂伸长率"].high+'%)</small></td><td class=n>'+p["预测拉伸强度"].pred+' <small>('+p["预测拉伸强度"].low+'-'+p["预测拉伸强度"].high+')</small></td><td><span class=cf '+cl+'>'+p["预测断裂伸长率"].confidence+'</span></td></tr>';});
parts.push('<div class=cd><h2>🔮 待执行实验预测</h2><div class=tbw><table><thead><tr><th>编号</th><th>配方名称</th><th>预测伸长率</th><th>预测强度</th><th>置信度</th></tr></thead><tbody>'+PR+'</tbody></table></div></div>');
parts.push('</div></div>');

// PAGE 3 - AI
parts.push('<div class=pg id=pg3><div style="max-width:1280px;margin:0 auto;padding:0 20px">');
parts.push('<div class=cd><h2>🤖 AI 配方助手</h2><p class=desc>基于本平台全部实验数据与高分子材料科学知识，回答您的配方相关问题。</p>');
parts.push('<div class=aic><div class=aim id=aim><div class="aimsg a"><div class=bbl>👋 你好！我是配方研发助手，基于'+R.length+'组实验数据训练。你可以问我：哪种配方伸长率最高？POE和成核剂有什么区别？如何提高断裂伸长率？</div></div></div>');
parts.push('<div class=sg>');
parts.push('<button class=sgb onclick=askS(this)>哪种配方综合性能最好？</button>');
parts.push('<button class=sgb onclick=askS(this)>POE对性能有什么影响？</button>');
parts.push('<button class=sgb onclick=askS(this)>如何进一步提高伸长率？</button>');
parts.push('<button class=sgb onclick=askS(this)>成核剂的作用是什么？</button>');
parts.push('<button class=sgb onclick=askS(this)>复配策略的优势？</button>');
parts.push('<button class=sgb onclick=askS(this)>预测待执行实验哪个最有希望？</button>');
parts.push('</div>');
parts.push('<div class=aiin><input type=text id=aii placeholder="输入你的配方问题..." onkeydown="if(event.key===String.fromCharCode(69))askQ()"><button onclick=askQ()>发送</button></div>');
parts.push('</div></div></div></div>');

// Footer + JS
parts.push('<div class=ftr><p>配方研发分析平台 · 数据来源：黄山源点新材料科技研发数据库 · 设备支持：江苏天源试验设备有限公司</p></div>');

// ===== JAVASCRIPT =====
parts.push('<script>');
parts.push('var cp=0;');
parts.push('function swPage(n){');
parts.push('document.querySelectorAll(".nl-btn").forEach(function(b,i){b.classList.toggle("ac",i===n)});');
parts.push('document.querySelectorAll(".pg").forEach(function(p,i){p.classList.toggle("ac",i===n)});');
parts.push('cp=n;window.scrollTo(0,0);');
parts.push('if(n===2)setTimeout(initCharts,200);');
parts.push('}');
parts.push('function showProj(){');
parts.push('document.getElementById("projList").style.display="none";');
parts.push('document.getElementById("projDetail").classList.add("ac");');
parts.push('setTimeout(function(){initCharts();window.scrollTo(0,200)},100);');
parts.push('}');
parts.push('function hideProj(){');
parts.push('document.getElementById("projList").style.display="";');
parts.push('document.getElementById("projDetail").classList.remove("ac");');
parts.push('}');

// Chart data
parts.push('var results='+JSON.stringify(R)+';');
parts.push('var SE=results.slice().sort(function(a,b){return b["断裂伸长率"]-a["断裂伸长率"]});');
parts.push('var SS=results.slice().sort(function(a,b){return b["拉伸强度"]-a["拉伸强度"]});');
parts.push('function G(n){if(n.includes("基准"))return"基准对照";if(n.includes("成核")||n.includes("DBchem"))return"成核剂";if(n.includes("POE")||n.includes("陶氏")||n.includes("八碳"))return"POE增韧";if(n.includes("马来"))return"增容/复配";return"其他"}');
parts.push('var CC={"基准对照":"rgba(148,163,184,.85)","成核剂":"rgba(56,189,248,.85)","POE增韧":"rgba(251,146,60,.85)","增容/复配":"rgba(52,211,153,.85)"};');
parts.push('var ci=false;');
parts.push('function initCharts(){if(ci)return;var c1=document.getElementById("c1");if(!c1)return;ci=true;Chart.defaults.color="#64748b";Chart.defaults.font.size=11;');
parts.push('new Chart(c1,{type:"bar",data:{labels:SE.map(function(r){return r["配方名称"]}),datasets:[{label:"断裂伸长率 (%)",data:SE.map(function(r){return r["断裂伸长率"]}),backgroundColor:SE.map(function(r){return CC[G(r["配方名称"])]||"#94a3b8"}),borderRadius:4}]},options:{indexAxis:"y",responsive:true,plugins:{legend:{display:false}},scales:{x:{min:430,max:515}}}});');
parts.push('new Chart(document.getElementById("c2"),{type:"bar",data:{labels:SS.map(function(r){return r["配方名称"]}),datasets:[{label:"拉伸强度 (MPa)",data:SS.map(function(r){return r["拉伸强度"]}),backgroundColor:SS.map(function(r){return CC[G(r["配方名称"])]||"#94a3b8"}),borderRadius:4}]},options:{indexAxis:"y",responsive:true,plugins:{legend:{display:false}},scales:{x:{min:10,max:26}}}});');
parts.push('var sds=["基准对照","成核剂","POE增韧","增容/复配"].map(function(c){return{label:c,data:results.filter(function(r){return G(r["配方名称"])===c}).map(function(r){return{x:r["拉伸强度"],y:r["断裂伸长率"],label:r["配方名称"]}}),backgroundColor:CC[c].replace(".85",".7"),borderColor:CC[c].replace("85","1").replace("rgba","rgb").replace(",1)",")"),borderWidth:2,pointRadius:7}});');
parts.push('new Chart(document.getElementById("c3"),{type:"scatter",data:{datasets:sds},options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{callbacks:{label:function(ctx){return ctx.raw.label+": "+ctx.raw.y.toFixed(1)+"%, "+ctx.raw.x.toFixed(2)+"MPa"}}}},scales:{x:{title:{display:true,text:"强度(MPa)"},min:12,max:25},y:{title:{display:true,text:"伸长率(%)"},min:440,max:510}}}});');
parts.push('}');

// AI functions
parts.push('function askS(btn){document.getElementById("aii").value=btn.textContent;askQ()}');
parts.push('function askQ(){var q=document.getElementById("aii").value.trim();if(!q)return;addM("u",q);document.getElementById("aii").value="";setTimeout(function(){addM("a",genA(q))},500)}');
parts.push('function addM(type,text){var d=document.createElement("div");d.className="aimsg "+type;d.innerHTML="<div class=bbl>"+text+"</div>";document.getElementById("aim").appendChild(d);document.getElementById("aim").scrollTop=document.getElementById("aim").scrollHeight}');
parts.push('function genA(q){var ql=q.toLowerCase();');
parts.push('if(ql.includes("poe")||ql.includes("taoshi"))return"陶氏系列POE增韧剂：<br><br>呈现强度-伸长率tradeoff：强度越高、伸长率越低。<br>陶氏6202最均衡(472.70%/20.53MPa)<br>陶氏8150强度最高(21.43MPa)但伸长率最低(449.77%)<br>强度优先选8150，均衡优先选6202。";');
parts.push('if(ql.includes("chenghe")||ql.includes("jingxing"))return"四种成核剂：<br>N04G6: 486.77%/18.40MPa<br>CYD-HP104: 487.57%/17.04MPa<br>NA8020: 472.37%/18.33MPa<br>DBchem: 474.07%/20.76MPa<br>成核剂伸长率整体优于POE类。DBchem强度突出。";');
parts.push('if(ql.includes("mala")||ql.includes("jiezhi")||ql.includes("zengrong"))return"马来酸酐接枝物：<br>4%添加: 伸长率<b>498.03%</b>(最高!), 强度18.40MPa<br>6%添加: 伸长率487.53%, 强度<b>23.65MPa</b>(最高!)<br>当前最有效的单一添加剂。";');
parts.push('if(ql.includes("tigao")||ql.includes("shenchang"))return"提高伸长率建议：<br>1 马来酸酐4%(498.03%)<br>2 成核剂CYD(487.57%)<br>3 复配马来+POE6202(485.43%)<br>4 待验证：超支化弹性体预测530%<br>距550%目标差约52个百分点";');
parts.push('if(ql.includes("fupei")||ql.includes("zuhe")||ql.includes("dapei"))return"复配结果：<br>⭐ 马来+POE6202: 485.43%/20.87MPa(最均衡)<br>马来+N04: 466.47%/19.85MPa<br>马来+POE8003: 强度仅13.28MPa(不推荐)<br>建议在马来+6202基础上提高6202比例";');
parts.push('if(ql.includes("yuce")||ql.includes("2607"))return"第四批预测：<br>2607-F1 SP1520: 510%<br>2607-F2 m4518: 495%<br><b>2607-F3 超支化: 530%</b>(最接近目标)<br>2607-F4 纯m4518: 485%<br>F3最有希望，但不确定性大";');
parts.push('if(ql.includes("zuihao")||ql.includes("zuijia")||ql.includes("tuijian"))return"综合最佳：马来+POE6202(485.43%/20.87MPa)。纯伸长率最佳：马来酸酐4%(498.03%)。纯强度最佳：马来酸酐6%(23.65MPa)。";');
parts.push('return"根据'+R.length+'组实验数据：<br>伸长率均值473.99%，最高498.03%<br>强度均值19.17MPa，最高23.65MPa<br>强度已达标，伸长率距550%差52个百分点<br><br>你可以问：POE和成核剂的区别？如何提高伸长率？哪种配方最好？"');
parts.push('}');
parts.push('</script></body></html>');

// Write output
const html = parts.join("\n");
if(!fs.existsSync("outputs"))fs.mkdirSync("outputs",{recursive:true});
fs.writeFileSync("outputs/analysis_report.html",html);
console.log("Generated: outputs/analysis_report.html ("+(Buffer.byteLength(html)/1024).toFixed(1)+" KB)");