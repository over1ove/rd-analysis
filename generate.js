// generate.js v2.0 - High-tech styled report generator
const fs = require("fs");

const d = JSON.parse(fs.readFileSync("analysis_data.json", "utf8"));
const R = d.results || [], P = d.pending || [], S = d.stats || {};
const PI = d.projectInfo || {}, E = d.equipment || [], CI = d.companyInfo || {};
const CAT = d.categories || [], AD = d.additives || [], BR = d.baseResins || [];

function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function jsesc(s) { return JSON.stringify(String(s||"")); }

const SE = R.slice().sort((a,b)=>b.断裂伸长率-a.断裂伸长率);
const SS = R.slice().sort((a,b)=>b.拉伸强度-a.拉伸强度);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(PI.项目名称||"配方研发分析平台")}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0a0e17;--bg2:#111827;--card:rgba(17,25,40,.85);--border:rgba(56,189,248,.15);
  --cyan:#22d3ee;--blue:#3b82f6;--green:#10b981;--amber:#f59e0b;--purple:#a855f7;
  --text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;
}
body{font-family:"PingFang SC","Microsoft YaHei","Helvetica Neue",sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
/* Animated BG */
.bg-canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}

/* Navigation */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,14,23,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:700;color:var(--cyan);letter-spacing:.5px}
.nav-logo .icon{font-size:24px}
.nav-links{display:flex;gap:4px}
.nav-link{background:none;border:none;color:var(--text2);padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;transition:all .25s;position:relative}
.nav-link:hover{color:var(--text);background:rgba(56,189,248,.08)}
.nav-link.active{color:var(--cyan);background:rgba(56,189,248,.12)}
.nav-link.active::after{content:"";position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);width:20px;height:2px;background:var(--cyan);border-radius:1px}

/* Pages */
.page{display:none;position:relative;z-index:1;padding:80px 24px 40px;max-width:1280px;margin:0 auto;animation:fadeIn .4s ease}
.page.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* Hero */
.hero{text-align:center;padding:60px 20px 40px}
.hero h1{font-size:42px;font-weight:800;background:linear-gradient(135deg,var(--cyan),var(--blue),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;letter-spacing:1px}
.hero .sub{font-size:16px;color:var(--text2);max-width:700px;margin:0 auto 32px;line-height:1.7}
.hero .sub strong{color:var(--cyan)}

/* Stats Grid */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:40px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center;backdrop-filter:blur(12px);transition:all .3s}
.stat-card:hover{border-color:rgba(56,189,248,.35);transform:translateY(-2px)}
.stat-card .val{font-size:36px;font-weight:800;margin-bottom:4px}
.stat-card .lbl{font-size:13px;color:var(--text2)}
.stat-card.cyan .val{color:var(--cyan)}
.stat-card.blue .val{color:var(--blue)}
.stat-card.green .val{color:var(--green)}
.stat-card.amber .val{color:var(--amber)}

/* Feature Cards */
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
.ft-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center;backdrop-filter:blur(12px);transition:all .3s}
.ft-card:hover{border-color:rgba(56,189,248,.3);transform:translateY(-3px)}
.ft-card .ft-icon{font-size:40px;margin-bottom:14px}
.ft-card h3{font-size:17px;margin-bottom:8px;color:var(--text)}
.ft-card p{font-size:13px;color:var(--text2);line-height:1.6}

/* Section */
.section{margin-bottom:36px}
.section h2{font-size:22px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px}
.section h2 .dot{width:8px;height:8px;background:var(--cyan);border-radius:50%;box-shadow:0 0 8px var(--cyan)}

/* Goal Bars */
.goal-bar{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px 24px;margin-bottom:12px}
.goal-bar .gb-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.goal-bar .gb-title{font-size:14px;font-weight:600}
.goal-bar .gb-val{font-size:13px;color:var(--text2)}
.goal-bar .gb-track{height:10px;background:rgba(255,255,255,.08);border-radius:5px;overflow:hidden}
.goal-bar .gb-fill{height:100%;border-radius:5px;transition:width 1s ease}

/* Card */
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;backdrop-filter:blur(12px)}

/* Equipment Grid */
.eq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.eq-card{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;backdrop-filter:blur(12px);transition:all .3s}
.eq-card:hover{transform:translateY(-4px);border-color:rgba(56,189,248,.35)}
.eq-card .eq-top{height:6px}
.eq-card .eq-body{padding:24px}
.eq-card .eq-icon{font-size:36px;margin-bottom:12px}
.eq-card .eq-model{font-size:20px;font-weight:800;margin-bottom:4px}
.eq-card .eq-name{font-size:13px;color:var(--text2);margin-bottom:16px}
.eq-card .eq-specs{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.eq-card .eq-spec{display:flex;justify-content:space-between;font-size:12px;padding:6px 10px;background:rgba(255,255,255,.03);border-radius:6px}
.eq-card .eq-spec .sk{color:var(--text3)}.eq-card .eq-spec .sv{color:var(--text);font-weight:500}
.eq-card .eq-use{font-size:12px;color:var(--cyan);padding:8px 12px;background:rgba(34,211,238,.08);border-radius:8px;text-align:center}
.eq-card .eq-link{display:block;margin-top:12px;font-size:12px;color:var(--blue);text-decoration:none;text-align:center}

/* Project Grid */
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px}
.proj-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;cursor:pointer;backdrop-filter:blur(12px);transition:all .3s}
.proj-card:hover{transform:translateY(-3px);border-color:rgba(56,189,248,.35);box-shadow:0 8px 32px rgba(56,189,248,.08)}
.proj-card .pc-header{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.proj-card .pc-avatar{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--cyan),var(--blue));display:flex;align-items:center;justify-content:center;font-size:22px}
.proj-card .pc-title{font-size:16px;font-weight:700}.proj-card .pc-sub{font-size:12px;color:var(--text2)}
.proj-card .pc-desc{font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:14px}
.proj-card .pc-meta{display:flex;gap:16px;font-size:12px;color:var(--text3)}
.proj-card .pc-meta span{display:flex;align-items:center;gap:4px}

/* Project Detail */
.pd-back{background:none;border:none;color:var(--cyan);font-size:14px;cursor:pointer;margin-bottom:20px;display:flex;align-items:center;gap:6px;transition:opacity .2s}
.pd-back:hover{opacity:.7}

/* Workflow */
.workflow{display:flex;align-items:center;justify-content:center;gap:0;margin:20px 0;flex-wrap:wrap}
.wf-step{display:flex;flex-direction:column;align-items:center;gap:8px}
.wf-step .wf-num{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff}
.wf-step .wf-label{font-size:12px;color:var(--text2)}
.wf-arrow{font-size:24px;color:var(--text3);margin:0 12px}
.wf-desc{text-align:center;font-size:12px;color:var(--text3);margin-top:12px}

/* Charts */
.chart-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.chart-box{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px}
.chart-box canvas{max-height:350px}
.chart-wide{grid-column:1/-1}

/* Table */
.tbl-wrap{overflow-x:auto;margin-top:12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:10px 12px;color:var(--text3);font-weight:500;border-bottom:2px solid var(--border);font-size:12px;text-transform:uppercase;letter-spacing:.5px}
td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);color:var(--text2)}
tr:hover td{background:rgba(56,189,248,.04);color:var(--text)}
.val-high{color:var(--green)!important;font-weight:600}
.val-mid{color:var(--amber)!important;font-weight:600}

/* AI Chat */
.ai-layout{display:grid;grid-template-columns:1fr 340px;gap:20px}
.ai-chat{background:var(--card);border:1px solid var(--border);border-radius:16px;display:flex;flex-direction:column;height:500px}
.ai-msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
.ai-msg{display:flex;gap:10px;max-width:90%}
.ai-msg.user{align-self:flex-end;flex-direction:row-reverse}
.ai-msg .ai-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.ai-msg.assistant .ai-avatar{background:rgba(168,85,247,.2);color:var(--purple)}
.ai-msg.user .ai-avatar{background:rgba(34,211,238,.2);color:var(--cyan)}
.ai-msg .ai-bubble{background:rgba(255,255,255,.05);border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.6}
.ai-msg.user .ai-bubble{background:rgba(34,211,238,.12)}
.ai-input-wrap{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border)}
.ai-input{flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--text);font-size:13px;outline:none;transition:border-color .2s}
.ai-input:focus{border-color:var(--cyan)}
.ai-send{background:linear-gradient(135deg,var(--cyan),var(--blue));border:none;color:#fff;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:600;font-size:13px;transition:opacity .2s}
.ai-send:hover{opacity:.85}
.ai-send:disabled{opacity:.5;cursor:not-allowed}
.ai-info{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px}
.ai-info h3{font-size:15px;margin-bottom:12px;color:var(--cyan)}
.ai-info p{font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:10px}
.ai-suggest{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.ai-suggest button{background:rgba(56,189,248,.08);border:1px solid var(--border);color:var(--cyan);font-size:12px;padding:6px 12px;border-radius:6px;cursor:pointer;transition:all .2s}
.ai-suggest button:hover{background:rgba(56,189,248,.15)}

/* Footer */
.footer{text-align:center;padding:30px;color:var(--text3);font-size:12px;position:relative;z-index:1}

/* Responsive */
@media(max-width:768px){
  .stats-grid{grid-template-columns:1fr 1fr}
  .features{grid-template-columns:1fr}
  .eq-grid{grid-template-columns:1fr}
  .chart-row{grid-template-columns:1fr}
  .ai-layout{grid-template-columns:1fr}
  .nav{padding:0 12px}
  .nav-logo{font-size:15px}
  .nav-link{padding:6px 10px;font-size:12px}
  .hero h1{font-size:28px}
  .proj-grid{grid-template-columns:1fr}
}

/* Tags */
.tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
.tag-cyan{background:rgba(34,211,238,.12);color:var(--cyan)}
.tag-green{background:rgba(16,185,129,.12);color:var(--green)}
.tag-amber{background:rgba(245,158,11,.12);color:var(--amber)}
.tag-purple{background:rgba(168,85,247,.12);color:var(--purple)}

/* Grid helper */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:768px){.g2{grid-template-columns:1fr}}
</style>
</head>
<body>
<canvas class="bg-canvas" id="bgCanvas"></canvas>

<!-- Navigation -->
<nav class="nav">
  <div class="nav-logo"><span class="icon">🧪</span>配方研发分析平台</div>
  <div class="nav-links">
    <button class="nav-link active" onclick="switchPage(0)">概览</button>
    <button class="nav-link" onclick="switchPage(1)">实验设备</button>
    <button class="nav-link" onclick="switchPage(2)">相关项目</button>
    <button class="nav-link" onclick="switchPage(3)">材料</button>
    <button class="nav-link" onclick="switchPage(4)">AI预测</button>
  </div>
</nav>

<!-- Page 0: Overview -->
<div class="page active" id="page0">
  <div class="hero">
    <h1>配方研发分析</h1>
    <p class="sub">本平台基于多个工艺配方项目中的实验数据进行系统归纳，以此构建该配方研发实验数据库。所有实验项目统一采用<strong>${esc(CI.name)}</strong>的TY系列设备，覆盖共混造粒、注塑成型、力学检测全流程。</p>
  </div>

  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
    <div class="stat-card cyan"><div class="val">${S.completed}</div><div class="lbl">已完成实验组</div></div>
    <div class="stat-card amber" onclick="switchPage(2)" style="cursor:pointer"><div class="val">${S.projectCount||1}</div><div class="lbl">已收录项目 ↗</div></div>
    <div class="stat-card green" onclick="switchPage(3)" style="cursor:pointer"><div class="val">${AD.length+BR.length}</div><div class="lbl">已收录材料 ↗</div></div>
  </div>

  <div class="features">
    <div class="ft-card"><div class="ft-icon">📊</div><h3>实验数据管理</h3><p>收录配方、工艺参数、性能测试等全流程数据，支持多维度检索与对比</p></div>
    <div class="ft-card"><div class="ft-icon">📈</div><h3>可视化分析</h3><p>交互式图表展示伸长率、强度等关键指标趋势与类别分布</p></div>
    <div class="ft-card"><div class="ft-icon">🤖</div><h3>DeepSeek AI 助手</h3><p>结合实验数据与材料科学知识，以工艺配方工程师视角智能回答配方问题</p></div>
  </div>




  <div class="section">
    <h2><span class="dot"></span>项目总览</h2>'
    <div class="stats-grid" style="grid-template-columns:1fr 1fr">
      <div class="stat-card cyan"><div class="val">${S.inProgressCount||0}</div><div class="lbl">正在进行中的项目</div></div>
      <div class="stat-card green"><div class="val">${S.completedProjectCount||0}</div><div class="lbl">已完成历史项目</div></div>
    </div>
  </div>
</div>

<!-- Page 1: Equipment -->
<div class="page" id="page1">
  <div class="section">
    <h2><span class="dot"></span>${esc(CI.name)}</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:20px">🌐 ${esc(CI.website)}　📞 ${esc(CI.phone)}　|　所有实验项目均使用以下TY系列设备</p>
  </div>
  <div class="eq-grid">
    ${E.map(eq=>`
    <div class="eq-card">
      <div class="eq-top" style="background:${eq.color}"></div>
      <div class="eq-body">
        <div class="eq-icon">${eq.icon}</div>
        <div class="eq-model">${esc(eq.model)}</div>
        <div class="eq-name">${esc(eq.name)}</div>
        <div class="eq-specs">
          ${Object.entries(eq.specs).map(([k,v])=>`<div class="eq-spec"><span class="sk">${k}</span><span class="sv">${esc(v)}</span></div>`).join('')}
        </div>
        <div class="eq-use">用途：${esc(eq.usage)}</div>
        <a class="eq-link" href="${esc(eq.url)}" target="_blank" rel="noopener">查看官网详情 →</a>
      </div>
    </div>`).join('')}
  </div>
</div>

<!-- Page 2: Projects -->
<div class="page" id="page2">
  <div id="projList">
    <div class="section">
      <h2><span class="dot"></span>在研项目</h2>
    </div>
    <div class="proj-grid">
      <div class="proj-card" onclick="showProject()">
        <div class="pc-header">
          <div class="pc-avatar">🏢</div>
          <div>
            <div class="pc-title">${esc(PI.项目名称)}</div>
            <div class="pc-sub">${esc(PI.客户名称)}</div>
          </div>
        </div>
        <p class="pc-desc">客户需求：${esc(PI.客户需求)}。技术指标：${esc(PI.技术指标)}。交付日期：${esc(PI.交付日期)}。</p>
        <div class="pc-meta">
          <span><span class="tag tag-green">已完成 ${S.completed}组</span></span>
          <span><span class="tag tag-amber">待执行 ${S.pending}组</span></span>
          <span>📅 ${esc(PI.交付日期)}</span>
        </div>
      </div>
    </div>
  </div>

  <div id="projDetail" style="display:none">
    <button class="pd-back" onclick="hideProject()">← 返回项目列表</button>

    <div class="section">
      <h2><span class="dot"></span>📊 ${esc(PI.项目名称)} 进度总览</h2>
      <div class="stats-grid" style="margin-top:16px">
        <div class="stat-card green"><div class="val">${S.completed}</div><div class="lbl">已完成实验</div></div>
        <div class="stat-card amber"><div class="val">${S.pending}</div><div class="lbl">待执行实验</div></div>
        <div class="stat-card cyan"><div class="val">${S.maxElong}%</div><div class="lbl">最高伸长率</div></div>
        <div class="stat-card blue"><div class="val">${S.maxStrength}</div><div class="lbl">最高强度 MPa</div></div>
      </div>
    </div>

    <!-- Workflow -->
    <div class="card" style="margin-bottom:24px">
      <h3 style="font-size:15px;margin-bottom:16px;color:var(--cyan)">🔬 实验流程</h3>
      <div class="workflow">
        <div class="wf-step"><div class="wf-num" style="background:var(--amber)">1</div><div class="wf-label">TY-7008 造粒</div></div>
        <div class="wf-arrow">→</div>
        <div class="wf-step"><div class="wf-num" style="background:var(--blue)">2</div><div class="wf-label">TY-7003H 注塑</div></div>
        <div class="wf-arrow">→</div>
        <div class="wf-step"><div class="wf-num" style="background:var(--green)">3</div><div class="wf-label">TY-8000DT 测试</div></div>
      </div>
      <p class="wf-desc">原料+助剂 → TY-7008双螺杆挤出造粒 → TY-7003H注塑成型制样 → TY-8000DT万能试验机拉伸测试 → 数据采集分析</p>
    </div>

    <!-- Charts -->
    <div class="chart-row">
      <div class="chart-box"><h3 style="font-size:14px;margin-bottom:12px;color:var(--text)">断裂伸长率排名</h3><div style="height:380px"><canvas id="chartElong"></canvas></div></div>
      <div class="chart-box"><h3 style="font-size:14px;margin-bottom:12px;color:var(--text)">拉伸强度排名</h3><div style="height:380px"><canvas id="chartStrength"></canvas></div></div>
    </div>
    <div class="chart-row">
      <div class="chart-box chart-wide"><h3 style="font-size:14px;margin-bottom:12px;color:var(--text)">伸长率 vs 强度 分布</h3><div style="height:350px"><canvas id="chartScatter"></canvas></div></div>
    </div>

    <!-- Results Table -->
    <div class="card" style="margin-bottom:20px">
      <h3 style="font-size:15px;margin-bottom:12px">📋 已完成实验详情</h3>
      <div class="tbl-wrap"><table><thead><tr><th>#</th><th>编号</th><th>配方名称</th><th>配料方案</th><th>伸长率(%)</th><th>强度(MPa)</th><th>类别</th></tr></thead><tbody>
      ${SE.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.配方编号)}</td><td><b>${esc(r.配方名称)}</b></td><td style="font-size:12px;color:var(--text3)">${esc(r.配料方案)}</td><td class="val-mid">${r.断裂伸长率}</td><td>${r.拉伸强度}</td><td><span class="tag tag-purple">${esc(r.类别)}</span></td></tr>`).join('')}
      </tbody></table></div>
    </div>

    <!-- Pending Table -->
    <div class="card">
      <h3 style="font-size:15px;margin-bottom:12px">🔮 待执行实验</h3>
      <div class="tbl-wrap"><table><thead><tr><th>编号</th><th>配方名称</th><th>配料方案</th><th>实验目的</th></tr></thead><tbody>
      ${P.map(p=>`<tr><td>${esc(p.配方编号)}</td><td><b>${esc(p.配方名称)}</b></td><td>${esc(p.配料方案)}</td><td>${esc(p.实验目的)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>
</div>


<!-- Page 3: Materials -->
<div class="page" id="page3">
  <div class="section">
    <h2><span class="dot"></span>已收录材料</h2>
    <p style="color:var(--text2);font-size:14px;margin-bottom:20px">收录所有项目中涉及的助剂与聚合物基料信息，共 <strong style="color:var(--cyan)">${AD.length+BR.length}</strong> 种材料</p>
  </div>
  <div class="card" style="margin-bottom:20px">
    <h3 style="font-size:15px;margin-bottom:12px;color:var(--cyan)">🧪 助剂 (${AD.length}种)</h3>
    <div class="tbl-wrap"><table><thead><tr><th>商品名/牌号</th><th>供应商</th><th>类型</th><th>推荐添加量</th><th>使用项目</th></tr></thead><tbody>
    ${AD.map(a=>'<tr><td><b>'+esc(a.商品名)+'</b></td><td>'+esc(a.供应商)+'</td><td>'+esc(a.类型)+'</td><td>'+esc(a.推荐添加量||a.测试添加量||'')+'</td><td>黄山源点缠绕膜</td></tr>').join('')}
    </tbody></table></div>
  </div>
  <div class="card">
    <h3 style="font-size:15px;margin-bottom:12px;color:var(--blue)">🔬 聚合物基料 (${BR.length}种)</h3>
    <div class="tbl-wrap"><table><thead><tr><th>商品名/牌号</th><th>供应商</th><th>类型</th><th>MI(g/10min)</th><th>密度(g/cm³)</th><th>拉伸强度(MPa)</th><th>断裂伸长率(%)</th><th>使用项目</th></tr></thead><tbody>
    ${BR.map(b=>'<tr><td><b>'+esc(b.商品名)+'</b></td><td>'+esc(b.供应商)+'</td><td>'+esc(b.类型)+'</td><td>'+(b.MI||'-')+'</td><td>'+(b.密度||'-')+'</td><td>'+(b.拉伸强度||'-')+'</td><td>'+(b.伸长率||'-')+'</td><td>黄山源点缠绕膜</td></tr>').join('')}
    </tbody></table></div>
  </div>
</div>
<!-- Page 4: AI Prediction -->
<div class="page" id="page4">
  <div class="ai-layout">
    <div class="ai-chat">
      <div class="ai-msgs" id="aiMsgs">
        <div class="ai-msg assistant">
          <div class="ai-avatar">🤖</div>
          <div class="ai-bubble">你好！我是配方研发AI助手，基于DeepSeek大模型。我熟悉${esc(PI.项目名称)}项目的${S.completed}组实验数据，可以结合材料科学知识回答你的配方问题。请直接提问！</div>
        </div>
      </div>
      <div class="ai-input-wrap">
        <input class="ai-input" id="aiInput" placeholder="输入配方问题，按 Enter 发送..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();askAI()}">
        <button class="ai-send" id="aiSendBtn" onclick="askAI()">发送</button>
      </div>
    </div>
    <div class="ai-info">
      <h3>💡 你可以这样问</h3>
      <p>AI助手基于所有实验数据与材料科学知识，以工艺配方工程师视角回答。</p>
      <div class="ai-suggest">
        <button onclick="quickAsk(this.textContent)">POE增韧效果最好的牌号是哪款？</button>
        <button onclick="quickAsk(this.textContent)">马来酸酐接枝物的最佳添加比例？</button>
        <button onclick="quickAsk(this.textContent)">成核剂和POE哪个对伸长率提升更有效？</button>
        <button onclick="quickAsk(this.textContent)">6202和8003的性能差异是什么？</button>
        <button onclick="quickAsk(this.textContent)">如何进一步提升断裂伸长率？</button>
        <button onclick="quickAsk(this.textContent)">LLDPE+HDPE+SP1520方案的预期效果如何？</button>
      </div>
    </div>
  </div>
</div>

<div class="footer">
  <p>配方研发分析平台 · 数据来源：江苏天源试验设备有限公司数据库 · 设备支持：${esc(CI.name)} · AI：DeepSeek</p>
</div>

<script>
// Background animation
(function(){
  var c=document.getElementById('bgCanvas'),ctx=c.getContext('2d');
  var w,h,particles=[];
  function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  for(var i=0;i<80;i++)particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,r:Math.random()*1.5+.5});
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(function(p,i){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(34,211,238,'+(.15+p.r*.1)+')';ctx.fill();
      for(var j=i+1;j<particles.length;j++){
        var q=particles[j],dx=p.x-q.x,dy=p.y-q.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(34,211,238,'+(.04*(1-dist/120))+')';ctx.lineWidth=.5;ctx.stroke()}
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// Page switching
var currentPage=0;
function switchPage(n){
  currentPage=n;
  document.querySelectorAll('.nav-link').forEach(function(l,i){l.classList.toggle('active',i===n)});
  document.querySelectorAll('.page').forEach(function(p,i){p.classList.toggle('active',i===n)});
  if(n===0)document.getElementById('projDetail').style.display='none';
  window.scrollTo(0,0);
  if(n===2)setTimeout(initCharts,300);
}

// Project detail
function showProject(){
  document.getElementById('projList').style.display='none';
  document.getElementById('projDetail').style.display='block';
  setTimeout(function(){initCharts();window.scrollTo(0,100)},200);
}
function hideProject(){
  document.getElementById('projList').style.display='';
  document.getElementById('projDetail').style.display='none';
  window.scrollTo(0,100);
}

// Charts
var chartsInit=false;
function initCharts(){
  if(chartsInit)return;
  var c1=document.getElementById('chartElong');
  if(!c1)return;chartsInit=true;
  Chart.defaults.color='#94a3b8';Chart.defaults.font.size=11;
  var elongData=${JSON.stringify(SE.map(r=>({name:r.配方名称,val:r.断裂伸长率,cat:r.类别})))}.reverse();
  var catColors={"基准对照":"rgba(148,163,184,.8)","成核剂":"rgba(56,189,248,.8)","POE增韧":"rgba(251,146,60,.8)","增容/复配":"rgba(52,211,153,.8)"};
  new Chart(c1,{type:'bar',data:{labels:elongData.map(function(d){return d.name}),datasets:[{label:'断裂伸长率 (%)',data:elongData.map(function(d){return d.val}),backgroundColor:elongData.map(function(d){return catColors[d.cat]||'#94a3b8'}),borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:430,max:515}}}});

  var strengthData=${JSON.stringify(SS.map(r=>({name:r.配方名称,val:r.拉伸强度,cat:r.类别})))}.reverse();
  new Chart(document.getElementById('chartStrength'),{type:'bar',data:{labels:strengthData.map(function(d){return d.name}),datasets:[{label:'拉伸强度 (MPa)',data:strengthData.map(function(d){return d.val}),backgroundColor:strengthData.map(function(d){return catColors[d.cat]||'#94a3b8'}),borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:10,max:26}}}});

  var scatterData=["基准对照","成核剂","POE增韧","增容/复配"].map(function(cat){
    var pts=${JSON.stringify(R)}.filter(function(r){return r.类别===cat});
    return {label:cat,data:pts.map(function(r){return {x:r.拉伸强度,y:r.断裂伸长率,label:r.配方名称}}),backgroundColor:catColors[cat].replace('.8','.6'),borderColor:catColors[cat],borderWidth:2,pointRadius:7}
  });
  new Chart(document.getElementById('chartScatter'),{type:'scatter',data:{datasets:scatterData},options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{callbacks:{label:function(ctx){return ctx.raw.label+': '+ctx.raw.y.toFixed(1)+'%, '+ctx.raw.x.toFixed(2)+'MPa'}}}},scales:{x:{title:{display:true,text:'强度 (MPa)',color:'#94a3b8'},min:12,max:25},y:{title:{display:true,text:'伸长率 (%)',color:'#94a3b8'},min:440,max:510}}}});
}

// AI Chat
var aiLoading=false;
function quickAsk(q){document.getElementById('aiInput').value=q;askAI()}
function askAI(){
  if(aiLoading)return;
  var input=document.getElementById('aiInput'),q=input.value.trim();
  if(!q)return;
  addMsg('user',q);input.value='';aiLoading=true;
  document.getElementById('aiSendBtn').disabled=true;
  var ld=addMsg('assistant','<span style="color:var(--text3)">⏳ 正在请求 DeepSeek AI...</span>');
  fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})})
    .then(function(r){return r.json()})
    .then(function(d){
      var a=(d.answer||d.error||'无回复').replace(/\\n/g,'<br>');
      ld.querySelector('.ai-bubble').innerHTML=a;
      aiLoading=false;document.getElementById('aiSendBtn').disabled=false;
    })
    .catch(function(e){
      ld.querySelector('.ai-bubble').innerHTML='<span style="color:#f87171">⚠️ 无法连接AI服务，请确认服务器已启动 (node server.js)</span>';
      aiLoading=false;document.getElementById('aiSendBtn').disabled=false;
    });
}
function addMsg(type,text){
  var d=document.createElement('div');d.className='ai-msg '+type;
  d.innerHTML='<div class="ai-avatar">'+(type==='user'?'👤':'🤖')+'</div><div class="ai-bubble">'+text+'</div>';
  document.getElementById('aiMsgs').appendChild(d);
  document.getElementById('aiMsgs').scrollTop=document.getElementById('aiMsgs').scrollHeight;
  return d;
}
</script>
</body></html>`;

if(!fs.existsSync("outputs"))fs.mkdirSync("outputs",{recursive:true});
fs.writeFileSync("outputs/analysis_report.html",html);
console.log("Generated: outputs/analysis_report.html ("+(Buffer.byteLength(html)/1024).toFixed(1)+" KB)");
