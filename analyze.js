// analyze.js - 数据分析模块 v2.0
const XLSX = require("xlsx");
const fs = require("fs");

function loadData(filePath) {
  const wb = XLSX.readFile(filePath);
  function sheetToObjects(sheetName) {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (rows.length < 2) return [];
    const headers = rows[0];
    return rows.slice(1).filter(r => !r.every(c => c === "" || c === null)).map(row => {
      const obj = {};
      headers.forEach((h, j) => { if (h !== "" && h !== undefined) obj[h] = row[j] !== undefined ? row[j] : ""; });
      return obj;
    });
  }
  return {
    projectSummary: sheetToObjects("项目汇总表"),
    baseResins: sheetToObjects("基料数据库"),
    additives: sheetToObjects("助剂数据库"),
    formulas: sheetToObjects("配方实验记录表"),
    tests: sheetToObjects("性能测试表"),
    logs: sheetToObjects("实验日志表")
  };
}

function excelDateToStr(d) {
  if (typeof d === 'number' && d > 30000) {
    const dt = new Date((d - 25569) * 86400 * 1000);
    return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0');
  }
  return String(d || '');
}

function getCategory(name) {
  if (name.includes("基准")) return "基准对照";
  if (name.includes("成核剂") || name.includes("DBchem")) return "成核剂";
  if (name.includes("POE") || name.includes("陶氏") || name.includes("八碳")) return "POE增韧";
  if (name.includes("马来")) return "增容/复配";
  return "其他";
}

function analyze(data) {
  const { formulas, tests, projectSummary, additives, baseResins } = data;

  const completed = formulas.filter(f => f["是否成功"] === "是" && f["关联测试编号"]);
  const pending = formulas.filter(f => f["是否成功"] === "待定");

  const results = completed.map(f => {
    const t = tests.find(t => t["测试编号"] === f["关联测试编号"]);
    return {
      配方编号: f["配方编号"],
      配方名称: f["配方名称"],
      配料方案: f["配料方案"],
      实验目的: f["实验目的"],
      实验日期: excelDateToStr(f["实验日期"]),
      断裂伸长率: t ? parseFloat(t["平均断裂伸长率(%)"]) : null,
      拉伸强度: t ? parseFloat(t["平均拉伸强度(MPa)"]) : null,
      破坏载荷: t ? parseFloat(t["平均破坏荷载(N)"]) : null,
      备注: f["备注"] || "",
      类别: getCategory(f["配方名称"])
    };
  }).filter(r => r.断裂伸长率 !== null && !isNaN(r.断裂伸长率));

  const pendingList = pending.map(p => ({
    配方编号: p["配方编号"],
    配方名称: p["配方名称"],
    配料方案: p["配料方案"],
    实验目的: p["实验目的"],
    备注: p["备注"] || ""
  }));

  const elongVals = results.map(r => r.断裂伸长率);
  const strengthVals = results.map(r => r.拉伸强度);

  const stats = {
    avgElong: +(elongVals.reduce((a, b) => a + b, 0) / elongVals.length).toFixed(2),
    avgStrength: +(strengthVals.reduce((a, b) => a + b, 0) / strengthVals.length).toFixed(2),
    maxElong: +Math.max(...elongVals).toFixed(2),
    maxStrength: +Math.max(...strengthVals).toFixed(2),
    minElong: +Math.min(...elongVals).toFixed(2),
    minStrength: +Math.min(...strengthVals).toFixed(2),
    targetElong: 550,
    completed: results.length,
    pending: pending.length
  };

  // Category aggregation
  const categories = {};
  results.forEach(r => {
    if (!categories[r.类别]) categories[r.类别] = { elong: [], strength: [], count: 0 };
    categories[r.类别].elong.push(r.断裂伸长率);
    categories[r.类别].strength.push(r.拉伸强度);
    categories[r.类别].count++;
  });
  const catList = Object.entries(categories).map(([name, vals]) => ({
    name,
    count: vals.count,
    avgElong: +(vals.elong.reduce((a,b)=>a+b,0)/vals.elong.length).toFixed(2),
    avgStrength: +(vals.strength.reduce((a,b)=>a+b,0)/vals.strength.length).toFixed(2)
  }));

  // Project info
  const proj = projectSummary[0] || {};
  const projectInfo = {
    项目名称: proj["项目名称"] || "",
    客户名称: proj["客户名称"] || "",
    产品类型: "流延缠绕膜",
    客户需求: proj["客户需求"] || "",
    技术指标: proj["技术指标"] || "",
    交付日期: excelDateToStr(proj["交付日期"]),
    开始时间: excelDateToStr(proj["时间"]),
    备注: proj["备注"] || ""
  };

  // Equipment
  const equipment = [
    { model: "TY-7008", name: "双螺杆挤出造粒机", icon: "⚙️", color: "#f59e0b", specs: { 螺杆直径: "Φ20mm", 熔体压力: "0.74 MPa", 扭矩: "20.02 N·m", 温区: "机头190/3区185/2区180/1区175°C" }, usage: "原料共混造粒", url: "http://www.tytester.com/jichuchengxingxilie/" },
    { model: "TY-7003H", name: "立式注塑机", icon: "🔧", color: "#3b82f6", specs: { 螺杆直径: "Φ20mm", 熔体压力: "3.8 MPa", 温区: "模具40/3区150/2区200/1区190°C" }, usage: "注塑成型制样", url: "http://www.tytester.com/zhusumoyachengxingxilie/" },
    { model: "TY-8000DT", name: "微机控制电子万能试验机", icon: "📐", color: "#10b981", specs: { 执行标准: "GB/T 1040", 样条数: "3根/组", 测试项目: "拉伸强度、断裂伸长率、破坏载荷" }, usage: "力学性能测试", url: "http://www.tytester.com/xiangsujiancexilie/" }
  ];

  const companyInfo = {
    name: "江苏天源试验设备有限公司",
    website: "www.tytester.com",
    phone: "0514-86291226",
    logo: "http://www.tytester.com/data/upload/image/20251219/1766134655531958.png"
  };

  return {
    projectInfo,
    stats,
    results,
    pending: pendingList,
    categories: catList,
    equipment,
    companyInfo,
    additives: additives.filter(a => a["商品名/牌号"]).map(a => ({
      编号: a["助剂编号"],
      商品名: a["商品名/牌号"],
      供应商: a["供应商"],
      类型: a["类型（助剂/基料）"] || a["化学成分"],
      形态: a["形态"],
      推荐添加量: a["推荐添加量"],
      测试添加量: a["已测试添加量"],
      平均伸长率: a["项目中平均断裂伸长率(%)"],
      平均强度: a["项目中平均拉伸强度(MPa)"]
    })),
    baseResins: baseResins.filter(b => b["商品名/牌号"]).map(b => ({
      编号: b["基料编号"],
      商品名: b["商品名/牌号"],
      供应商: b["供应商"],
      类型: b["基料类型"],
      MI: b["MI(g/10min)"],
      密度: b["密度(g/cm³)"],
      拉伸强度: b["拉伸强度(MPa)"],
      伸长率: b["断裂伸长率(%)"]
    }))
  };
}

function printReport(analysis) {
  const { projectInfo, stats, results } = analysis;
  console.log("=".repeat(60));
  console.log("  " + projectInfo.项目名称 + " — 数据分析报告");
  console.log("=".repeat(60));
  console.log("客户:", projectInfo.客户名称);
  console.log("需求:", projectInfo.客户需求);
  console.log("指标:", projectInfo.技术指标);
  console.log("");
  console.log("已完成:", stats.completed, "组  |  待执行:", stats.pending, "组");
  console.log("伸长率: 均值" + stats.avgElong + "%  最高" + stats.maxElong + "%  目标550%");
  console.log("强度:   均值" + stats.avgStrength + "MPa  最高" + stats.maxStrength + "MPa");
  return analysis;
}

module.exports = { loadData, analyze, printReport };
