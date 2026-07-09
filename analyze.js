// analyze.js - 数据分析模块
const XLSX = require("xlsx");
const fs = require("fs");

function loadData(filePath) {
  const wb = XLSX.readFile(filePath);
  function sheetToObjects(sheetName) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const headers = rows[0];
    return rows.slice(1).filter(r => !r.every(c => c === "" || c === null)).map(row => {
      const obj = {};
      headers.forEach((h, j) => { if (h !== "") obj[h] = row[j] !== undefined ? row[j] : ""; });
      return obj;
    });
  }
  return {
    baseResins: sheetToObjects("基料数据库"),
    additives: sheetToObjects("助剂数据库"),
    formulas: sheetToObjects("配方实验记录表"),
    tests: sheetToObjects("性能测试表"),
    logs: sheetToObjects("实验日志表"),
    projectSummary: sheetToObjects("项目汇总表")
  };
}

function getCategory(name) {
  if (name.includes("基准")) return "基准对照";
  if (name.includes("成核剂") || name.includes("DBchem")) return "成核剂";
  if (name.includes("POE") || name.includes("陶氏") || name.includes("八碳")) return "POE增韧";
  if (name.includes("马来")) return "增容/复配";
  return "其他";
}

function analyze(data) {
  const { formulas, tests, projectSummary } = data;

  const completed = formulas.filter(f => f["是否成功"] === "是" && f["关联测试编号"]);
  const pending = formulas.filter(f => f["是否成功"] === "待定");

  const results = completed.map(f => {
    const t = tests.find(t => t["测试编号"] === f["关联测试编号"]);
    return {
      配方编号: f["配方编号"],
      配方名称: f["配方名称"],
      配料方案: f["配料方案"],
      实验目的: f["实验目的"],
      断裂伸长率: t ? parseFloat(t["平均断裂伸长率(%)"]) : null,
      拉伸强度: t ? parseFloat(t["平均拉伸强度(MPa)"]) : null,
      破坏载荷: t ? parseFloat(t["平均破坏载荷(N)"]) : null,
      实验日期: f["实验日期"],
      备注: f["备注"],
      类别: getCategory(f["配方名称"])
    };
  }).filter(r => r.断裂伸长率 !== null && !isNaN(r.断裂伸长率));

  const elongVals = results.map(r => r.断裂伸长率);
  const strengthVals = results.map(r => r.拉伸强度);

  const stats = {
    avgElong: elongVals.reduce((a, b) => a + b, 0) / elongVals.length,
    avgStrength: strengthVals.reduce((a, b) => a + b, 0) / strengthVals.length,
    maxElong: Math.max(...elongVals),
    maxStrength: Math.max(...strengthVals),
    minElong: Math.min(...elongVals),
    minStrength: Math.min(...strengthVals),
    targetElong: 550,
    baseElong: 483,
    baseStrength: 16.99
  };

  // Category aggregation
  const categories = {};
  results.forEach(r => {
    if (!categories[r.类别]) categories[r.类别] = { elong: [], strength: [], count: 0 };
    categories[r.类别].elong.push(r.断裂伸长率);
    categories[r.类别].strength.push(r.拉伸强度);
    categories[r.类别].count++;
  });

  // Build customer info from project summary
  const project = projectSummary[0] || {};
  function excelDateToStr(d) {
    if (typeof d === 'number' && d > 30000) {
      const dt = new Date((d - 25569) * 86400 * 1000);
      return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0');
    }
    return String(d || '');
  }
  const customerInfo = {
    "客户名称": project["客户名称"] || "",
    "项目名称": project["项目名称"] || "",
    "产品类型": "流延缠绕膜",
    "核心需求": project["客户需求"] || "",
    "技术指标": project["技术指标"] || "",
    "交付期限": excelDateToStr(project["交付日期"]),
    "备注": project["备注"] || ""
  };

  return { results, pending, stats, categories, customer: customerInfo };
}

function printReport(analysis) {
  const { results, pending, stats, categories, customer } = analysis;

  console.log("=".repeat(60));
  console.log("  缠绕膜配方研发 — 数据分析报告");
  console.log("=".repeat(60));
  console.log("项目:", customer["项目名称"]);
  console.log("客户:", customer["客户名称"]);
  console.log("产品:", customer["产品类型"]);
  console.log("核心需求:", customer["核心需求"]);
  console.log("技术指标:", customer["技术指标"]);
  console.log("交付期限:", customer["交付期限"]);
  console.log("");

  console.log("--- 统计摘要 ---");
  console.log("断裂伸长率: 均值" + stats.avgElong.toFixed(2) + "%  最高" + stats.maxElong.toFixed(2) + "%  最低" + stats.minElong.toFixed(2) + "%");
  console.log("拉伸强度:   均值" + stats.avgStrength.toFixed(2) + "MPa  最高" + stats.maxStrength.toFixed(2) + "MPa  最低" + stats.minStrength.toFixed(2) + "MPa");
  console.log("目标伸长率: " + stats.targetElong + "%  差距: " + (stats.targetElong - stats.maxElong).toFixed(2) + "%");
  console.log("目标强度: " + (stats.baseStrength * 1.1).toFixed(2) + "-" + (stats.baseStrength * 1.25).toFixed(2) + "MPa  " + (stats.maxStrength >= stats.baseStrength * 1.25 ? "✓ 已达标" : "✗ 未达标"));
  console.log("");

  console.log("--- 伸长率排名 TOP5 ---");
  [...results].sort((a, b) => b.断裂伸长率 - a.断裂伸长率).slice(0, 5).forEach((r, i) => {
    console.log("  " + (i + 1) + ". " + r.配方名称 + ": " + r.断裂伸长率.toFixed(2) + "% (强度: " + r.拉伸强度.toFixed(2) + "MPa)");
  });
  console.log("");

  console.log("--- 类别分析 ---");
  Object.entries(categories).forEach(([cat, vals]) => {
    const avgE = (vals.elong.reduce((a, b) => a + b, 0) / vals.elong.length).toFixed(2);
    const avgS = (vals.strength.reduce((a, b) => a + b, 0) / vals.strength.length).toFixed(2);
    console.log("  " + cat + " (" + vals.count + "个): 伸长率=" + avgE + "%  强度=" + avgS + "MPa");
  });
  console.log("");

  console.log("--- 待执行实验 (" + pending.length + "个) ---");
  pending.forEach(p => {
    console.log("  " + p["配方编号"] + ": " + p["配方名称"] + " | " + p["配料方案"]);
  });

  return analysis;
}

module.exports = { loadData, getCategory, analyze, printReport };
