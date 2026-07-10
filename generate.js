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
<title>配方研发分析平台</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"><\/script>
<style>﻿*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f0f4f8;--card:#fff;--border:#bfdbfe;--border2:#e2e8f0;--primary:#1e3a5f;--primary2:#2563eb;--accent:#3b82f6;--green:#059669;--amber:#d97706;--purple:#7c3aed;--text:#1e293b;--text2:#475569;--text3:#94a3b8;--text4:#64748b;--shadow:0 2px 12px rgba(0,0,0,.06);--shadow2:0 4px 24px rgba(0,0,0,.08)}
body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.bg-canvas{display:none}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:linear-gradient(135deg,#1e3a5f,#1e40af);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 16px rgba(30,64,175,.15)}
.nav-logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:700;color:#fff;letter-spacing:.5px}
.nav-links{display:flex;gap:4px}
.nav-link{background:none;border:none;color:rgba(255,255,255,.75);padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;transition:all .25s}
.nav-link:hover{color:#fff;background:rgba(255,255,255,.12)}
.nav-link.active{color:#fff;background:rgba(255,255,255,.2);font-weight:600}
.page{display:none;position:relative;z-index:1;padding:68px 24px 40px;max-width:1280px;margin:0 auto;animation:fadeIn .4s ease}
.page.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.hero{text-align:center;padding:20px 20px 20px}
.hero h1{font-size:36px;font-weight:800;background:linear-gradient(135deg,#1e3a5f,#2563eb,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:14px}
.hero .sub{font-size:15px;color:var(--text2);max-width:700px;margin:0 auto 32px;line-height:1.7}
.hero .sub strong{color:var(--primary2)}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:40px}
.stat-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;text-align:center;box-shadow:var(--shadow);transition:all .3s;position:relative;overflow:hidden}
.stat-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px}
.stat-card.cyan::before{background:var(--accent)}.stat-card.amber::before{background:var(--amber)}
.stat-card.green::before{background:var(--green)}.stat-card.blue::before{background:var(--primary2)}
.stat-card:hover{transform:translateY(-2px);box-shadow:var(--shadow2)}
.stat-card .val{font-size:36px;font-weight:800;margin-bottom:4px}
.stat-card .lbl{font-size:13px;color:var(--text4)}
.stat-card.cyan .val{color:var(--accent)}.stat-card.blue .val{color:var(--primary2)}
.stat-card.green .val{color:var(--green)}.stat-card.amber .val{color:var(--amber)}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
.ft-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:28px;text-align:center;box-shadow:var(--shadow);transition:all .3s}
.ft-card:hover{transform:translateY(-3px);box-shadow:var(--shadow2);border-color:var(--border)}
.ft-card .ft-icon{font-size:40px;margin-bottom:14px}
.ft-card h3{font-size:17px;margin-bottom:8px;color:var(--text)}
.ft-card p{font-size:13px;color:var(--text2);line-height:1.6}
.section{margin-bottom:36px}
.section h2{font-size:22px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px;color:var(--text)}
.section h2 .dot{width:8px;height:8px;background:var(--accent);border-radius:50%}
.goal-bar{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:20px 24px;margin-bottom:12px;box-shadow:var(--shadow)}
.goal-bar .gb-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.goal-bar .gb-title{font-size:14px;font-weight:600}.goal-bar .gb-val{font-size:13px;color:var(--text2)}
.goal-bar .gb-track{height:10px;background:#e2e8f0;border-radius:5px;overflow:hidden}
.goal-bar .gb-fill{height:100%;border-radius:5px;transition:width 1s ease}
.card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;box-shadow:var(--shadow)}
.eq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.eq-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);transition:all .3s}
.eq-card:hover{transform:translateY(-4px);box-shadow:var(--shadow2);border-color:var(--border)}
.eq-card .eq-top{height:6px}.eq-card .eq-body{padding:24px}
.eq-card .eq-icon{font-size:36px;margin-bottom:12px}
.eq-card .eq-model{font-size:20px;font-weight:800;color:var(--primary)}
.eq-card .eq-name{font-size:13px;color:var(--text4);margin-bottom:16px}
.eq-card .eq-specs{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.eq-card .eq-spec{display:flex;justify-content:space-between;font-size:12px;padding:6px 10px;background:#f8fafc;border-radius:6px}
.eq-card .eq-spec .sk{color:var(--text4)}.eq-card .eq-spec .sv{color:var(--text);font-weight:500}
.eq-card .eq-use{font-size:12px;color:var(--primary2);padding:8px 12px;background:#eff6ff;border-radius:8px;text-align:center}
.eq-card .eq-link{display:block;margin-top:12px;font-size:12px;color:var(--accent);text-decoration:none;text-align:center}
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px}
.proj-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;cursor:pointer;box-shadow:var(--shadow);transition:all .3s}
.proj-card:hover{transform:translateY(-3px);border-color:var(--border);box-shadow:var(--shadow2)}
.proj-card .pc-header{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.proj-card .pc-avatar{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--primary2));display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff}
.proj-card .pc-title{font-size:16px;font-weight:700}.proj-card .pc-sub{font-size:12px;color:var(--text4)}
.proj-card .pc-desc{font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:14px}
.proj-card .pc-meta{display:flex;gap:16px;font-size:12px;color:var(--text3);flex-wrap:wrap}
.pd-back{background:none;border:none;color:var(--primary2);font-size:14px;cursor:pointer;margin-bottom:20px;display:flex;align-items:center;gap:6px}
.workflow{display:flex;align-items:center;justify-content:center;gap:0;margin:20px 0;flex-wrap:wrap}
.wf-step{display:flex;flex-direction:column;align-items:center;gap:8px}
.wf-step .wf-num{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#fff}
.wf-step .wf-label{font-size:12px;color:var(--text4)}.wf-arrow{font-size:24px;color:var(--text3);margin:0 12px}
.wf-desc{text-align:center;font-size:12px;color:var(--text4);margin-top:12px}
.chart-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.chart-box{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:20px;box-shadow:var(--shadow)}
.chart-box canvas{max-height:350px}.chart-wide{grid-column:1/-1}
.tbl-wrap{overflow-x:auto;margin-top:12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:10px 12px;color:var(--text4);font-weight:600;border-bottom:2px solid var(--border2);font-size:12px;background:#f8fafc}
td{padding:10px 12px;border-bottom:1px solid #f1f5f9;color:var(--text2)}
tr:hover td{background:#eff6ff;color:var(--text)}
.val-high{color:var(--green)!important;font-weight:600}.val-mid{color:var(--amber)!important;font-weight:600}
.ai-layout{display:grid;grid-template-columns:1fr 340px;gap:20px}
.ai-chat{background:var(--card);border:1px solid var(--border2);border-radius:14px;display:flex;flex-direction:column;height:500px;box-shadow:var(--shadow)}
.ai-msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
.ai-msg{display:flex;gap:10px;max-width:90%}
.ai-msg.user{align-self:flex-end;flex-direction:row-reverse}
.ai-msg .ai-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.ai-msg.assistant .ai-avatar{background:#ede9fe;color:var(--purple)}
.ai-msg.user .ai-avatar{background:#dbeafe;color:var(--primary2)}
.ai-msg .ai-bubble{background:#f8fafc;border-radius:12px;padding:12px 16px;font-size:13px;line-height:1.6;border:1px solid var(--border2)}
.ai-msg.user .ai-bubble{background:#eff6ff;border-color:var(--border)}
.ai-input-wrap{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border2)}
.ai-input{flex:1;background:#f8fafc;border:1px solid var(--border2);border-radius:10px;padding:10px 14px;color:var(--text);font-size:13px;outline:none;font-family:inherit}
.ai-input:focus{border-color:var(--accent);background:#fff}
.ai-send{background:linear-gradient(135deg,var(--accent),var(--primary2));border:none;color:#fff;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:600;font-size:13px;box-shadow:0 2px 8px rgba(37,99,235,.25)}
.ai-send:hover{opacity:.9}.ai-send:disabled{opacity:.5}
.ai-info{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:20px;box-shadow:var(--shadow)}
.ai-info h3{font-size:15px;margin-bottom:12px;color:var(--primary2)}
.ai-info p{font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:10px}
.ai-suggest{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.ai-suggest button{background:#eff6ff;border:1px solid var(--border);color:var(--primary2);font-size:12px;padding:6px 12px;border-radius:6px;cursor:pointer}
.ai-suggest button:hover{background:#dbeafe;border-color:var(--accent)}
.footer{text-align:center;padding:30px;color:var(--text3);font-size:12px;position:relative;z-index:1;background:#fff;border-top:1px solid var(--border2)}
.tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
.tag-cyan{background:#dbeafe;color:var(--primary2)}.tag-green{background:#d1fae5;color:var(--green)}
.tag-amber{background:#fef3c7;color:var(--amber)}.tag-purple{background:#ede9fe;color:var(--purple)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.file-upload{position:relative;border:2px dashed var(--border);border-radius:12px;padding:30px;text-align:center;cursor:pointer;transition:all .3s;margin-bottom:16px;background:#fafcff}
.file-upload:hover{border-color:var(--accent);background:#eff6ff}
.file-upload .fu-icon{font-size:40px;margin-bottom:8px}
.file-upload .fu-text{font-size:14px;color:var(--text2)}
.file-upload .fu-hint{font-size:11px;color:var(--text3);margin-top:4px}
.file-upload input{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-result{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;display:none;margin-top:12px;font-size:13px;line-height:1.6}
.sf{width:100%;background:#f8fafc;border:1px solid var(--border2);border-radius:8px;padding:10px 14px;color:var(--text);font-size:13px;outline:none;font-family:inherit}
.sf:focus{border-color:var(--accent);background:#fff}
.submit-btn{display:block;width:100%;padding:14px;background:linear-gradient(135deg,var(--accent),var(--primary2));border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,.25)}
.submit-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(37,99,235,.35)}
.submit-btn:disabled{opacity:.5}
@media(max-width:768px){.stats-grid{grid-template-columns:1fr 1fr}.features{grid-template-columns:1fr}.eq-grid{grid-template-columns:1fr}.chart-row{grid-template-columns:1fr}.ai-layout{grid-template-columns:1fr}.hero h1{font-size:28px}.proj-grid{grid-template-columns:1fr}.g2{grid-template-columns:1fr}}
.bg-canvas{display:block!important}
.hero{position:relative}.hero::after{content:"";position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:200px;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent)}
.card:hover{box-shadow:0 8px 32px rgba(37,99,235,.1)}
.ai-float{position:fixed;bottom:28px;right:28px;z-index:200;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#3b82f6);box-shadow:0 4px 24px rgba(37,99,235,.4);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:28px;transition:all .3s;animation:pulse 2s infinite}
.ai-float:hover{transform:scale(1.1);box-shadow:0 8px 36px rgba(37,99,235,.55)}
@keyframes pulse{0%,100%{box-shadow:0 4px 24px rgba(37,99,235,.4)}50%{box-shadow:0 4px 40px rgba(37,99,235,.7),0 0 60px rgba(59,130,246,.3)}}
.ai-float .ai-tip{position:absolute;right:72px;background:#1e293b;color:#fff;font-size:12px;padding:6px 14px;border-radius:20px;white-space:nowrap;opacity:0;transform:translateX(8px);transition:all .3s;pointer-events:none}
.ai-float:hover .ai-tip{opacity:1;transform:translateX(0)}
.scan-line{position:fixed;top:60px;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(37,99,235,.15),transparent);z-index:0;pointer-events:none;animation:scanDown 4s linear infinite}
@keyframes scanDown{0%{top:-2px}100%{top:100vh}}
</style></style>
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
    <button class="nav-link" onclick="switchPage(5)">数据提交</button>
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


<!-- Page 5: Data Submission -->\n<div class="page" id="page5">\n  <div style="max-width:800px;margin:0 auto">\n    <div class="section">\n      <h2><span class="dot"></span>数据提交</h2>\n      <p style="color:var(--text2);font-size:14px;margin-bottom:16px">提交项目实验数据，管理员审核通过后AI将自动分析并纳入数据库。</p>\n      <p style="color:var(--amber);font-size:12px;margin-bottom:24px" id="submitNote">需要本地服务器 (localhost:3000)，在线版无法提交。</p>\n    </div>\n    <div class="card" style="margin-bottom:16px">\n      <h3 style="font-size:15px;margin-bottom:16px;color:var(--cyan)">基本信息</h3>\n      <div><label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">项目名称 *</label><input class="sf" id="fProject" placeholder="如：黄山源点缠绕膜"></div>\n      <div style="margin-top:12px"><label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">提交人</label><input class="sf" id="fSubmitter" placeholder="您的姓名"></div>\n      <div style="margin-top:12px"><label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">备注说明</label><textarea class="sf" id="fNote" rows="2" style="resize:vertical" placeholder="简要描述提交的数据内容"></textarea></div>\n    </div>\n    <div class="card" style="margin-bottom:20px">\n      <h3 style="font-size:15px;margin-bottom:12px;color:var(--blue)">文件附件</h3>\n      <p style="font-size:12px;color:var(--text3);margin-bottom:16px">上传 Excel(.xlsx) 或 Word(.docx) 格式的实验数据文件。AI将自动解析内容。</p>\n      <div class="file-upload" id="fileDrop">\n        <div class="fu-icon">📤</div>\n        <div class="fu-text">点击选择文件或拖拽到此处</div>\n        <div class="fu-hint" id="fileHint">支持 .xlsx / .docx 格式</div>\n        <input type="file" id="fileInput" accept=".xlsx,.docx" onchange="handleFile(event)">\n      </div>\n    </div>\n    <button class="submit-btn" id="submitBtn" onclick="submitAll()">提交数据</button>\n    <div id="submitResult" style="margin-top:12px;text-align:center;font-size:13px"></div>\n  </div>\n</div><div class="scan-line"></div>
<div class="ai-float" onclick="switchPage(4)" title="AI">
  <span class="ai-tip">AI??</span>
  ?
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
  for(var i=0;i<60;i++)particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:Math.random()*2+1});
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(function(p,i){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(37,99,235,'+(.08+p.r*.04)+')';ctx.fill();
      for(var j=i+1;j<particles.length;j++){
        var q=particles[j],dx=p.x-q.x,dy=p.y-q.y,dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(37,99,235,'+(.025*(1-dist/150))+')';ctx.lineWidth=.5;ctx.stroke()}
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

// Submit tab switching
function switchSubmitTab(tab){
  document.getElementById("submitFormTab").style.display=tab==="form"?"":"none";
  document.getElementById("submitFileTab").style.display=tab==="file"?"":"none";
  document.getElementById("tabFormBtn").classList.toggle("active",tab==="form");
  document.getElementById("tabFileBtn").classList.toggle("active",tab==="file");
}
// File upload handling
var selectedFile=null;
function handleFile(e){
  selectedFile=e.target.files[0];
  var hint=document.getElementById("fileHint");
  if(selectedFile){hint.textContent=selectedFile.name+" ("+(selectedFile.size/1024).toFixed(1)+" KB)";document.getElementById("uploadBtn").disabled=false}
  else{hint.textContent="支持 .xlsx 格式";document.getElementById("uploadBtn").disabled=true}
}
function uploadFile(){
  if(!selectedFile){return}
  var btn=document.getElementById("uploadBtn"),r=document.getElementById("uploadResult2");
  btn.disabled=true;btn.textContent="上传分析中...";r.innerHTML='<span style="color:var(--text2)">⏳ AI正在分析...</span>';
  var reader=new FileReader();
  reader.onload=function(){
    var b64=reader.result.split(",")[1];
    fetch("/api/upload",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        filename:selectedFile.name,data:b64,
        submitter:document.getElementById("fUploadSubmitter").value.trim(),
        note:document.getElementById("fUploadNote").value.trim()
      })
    }).then(function(res){return res.json()}).then(function(d){
      if(d.success){
        r.innerHTML='<span style="color:var(--green)">✅ '+d.message+'</span>';
        var uc=document.getElementById("uploadContent");
        uc.innerHTML='<div style="margin-bottom:8px"><strong>📊 Sheet:</strong> '+d.sheets.join(", ")+'</div>'+
          (d.aiSummary?'<div><span class="ai-badge">🤖 AI分析</span><br>'+d.aiSummary+'</div>':'');
        document.getElementById("uploadResult").style.display="block";
        document.getElementById("fUploadSubmitter").value="";document.getElementById("fUploadNote").value="";
        selectedFile=null;document.getElementById("fileInput").value="";document.getElementById("fileHint").textContent="支持 .xlsx 格式";
        document.getElementById("uploadBtn").disabled=true;
      }else{r.innerHTML='<span style="color:#f87171">❌ '+(d.error||"上传失败")+'</span>'}
      btn.disabled=false;btn.textContent="上传并分析";
    }).catch(function(e){
      r.innerHTML='<span style="color:#f87171">❌ 无法连接服务器，请确认已启动 node server.js</span>';
      btn.disabled=false;btn.textContent="上传并分析";
    });
  };
  reader.readAsDataURL(selectedFile);
}
// Data Submission
function submitData(){
  var btn=document.getElementById("submitBtn"),result=document.getElementById("submitResult");
  var code=document.getElementById("fCode").value.trim(),name=document.getElementById("fName").value.trim();
  if(!code||!name){result.innerHTML='<span style="color:#f87171">请填写配方编号和配方名称</span>';return}
  btn.disabled=true;btn.textContent="提交中...";
  var data={
    项目名称:document.getElementById("fProject").value.trim(),
    配方编号:code,配方名称:name,
    配料方案:document.getElementById("fFormula").value.trim(),
    实验目的:document.getElementById("fPurpose").value.trim(),
    断裂伸长率:document.getElementById("fElong").value,
    拉伸强度:document.getElementById("fStrength").value,
    破坏载荷:document.getElementById("fLoad").value,
    提交人:document.getElementById("fSubmitter").value.trim(),
    备注:document.getElementById("fNote").value.trim()
  };
  fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
    .then(function(r){return r.json()})
    .then(function(d){
      if(d.success){result.innerHTML='<span style="color:var(--green)">✅ '+d.message+'</span>';
        ["fCode","fName","fFormula","fPurpose","fElong","fStrength","fLoad","fNote"].forEach(function(id){document.getElementById(id).value=""})}
      else{result.innerHTML='<span style="color:#f87171">❌ '+(d.error||"提交失败")+'</span>'}
      btn.disabled=false;btn.textContent="提交数据";
    })
    .catch(function(e){
      result.innerHTML='<span style="color:#f87171">❌ 无法连接服务器，请确认已启动本地服务 (node server.js)</span>';
      btn.disabled=false;btn.textContent="提交数据";
    });
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
