// main.js - 缠绕膜配方研发数据分析系统
// 用法: node main.js [analyze|predict|report|all]

const fs = require("fs");
const path = require("path");
const { loadData, analyze, printReport } = require("./analyze");
const { predictAll, printPredictions } = require("./predict");

const EXCEL_PATH = process.argv[3] || "C:\\Users\\26921\\Desktop\\研发数据库.xlsx";
const OUTPUT_DIR = path.join(__dirname, "outputs");
const DATA_FILE = path.join(__dirname, "analysis_data.json");
const PRED_FILE = path.join(__dirname, "prediction_data.json");

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function cmdAnalyze() {
  console.log("正在加载数据: " + EXCEL_PATH);
  const data = loadData(EXCEL_PATH);
  const analysis = analyze(data);
  printReport(analysis);
  fs.writeFileSync(DATA_FILE, JSON.stringify(analysis, null, 2));
  console.log("\n分析数据已保存至: " + DATA_FILE);
  return analysis;
}

function cmdPredict() {
  let analysis;
  if (fs.existsSync(DATA_FILE)) {
    analysis = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } else {
    const data = loadData(EXCEL_PATH);
    analysis = analyze(data);
  }
  const predictions = predictAll(analysis.pending, analysis.results);
  printPredictions(predictions);
  fs.writeFileSync(PRED_FILE, JSON.stringify(predictions, null, 2));
  // Merge predictions into analysis data
  analysis.predictions = predictions;
  fs.writeFileSync(DATA_FILE, JSON.stringify(analysis, null, 2));
  return predictions;
}

function cmdReport() {
  const { execSync } = require("child_process");
  ensureOutputDir();
  
  // Ensure merged data exists
  if (!fs.existsSync(DATA_FILE)) {
    console.log("请先运行 analyze 和 predict");
    return;
  }
  
  console.log("正在生成交互式HTML报告...");
  const result = execSync("node generate.js", { cwd: __dirname, encoding: "utf8" });
  console.log(result);
  const reportPath = path.join(OUTPUT_DIR, "analysis_report.html");
  console.log("报告路径: " + reportPath);
  return reportPath;
}

function cmdAll() {
  console.log("=== 步骤 1/3: 数据分析 ===\n");
  cmdAnalyze();
  console.log("\n=== 步骤 2/3: 实验预测 ===\n");
  cmdPredict();
  console.log("\n=== 步骤 3/3: 生成报告 ===\n");
  cmdReport();
  console.log("\n✓ 全部完成！\n  打开 outputs/analysis_report.html 查看交互式报告");
}

const command = process.argv[2] || "all";

console.log("缠绕膜配方研发数据分析系统 v1.0");
console.log("=".repeat(50) + "\n");

const commands = { analyze: cmdAnalyze, predict: cmdPredict, report: cmdReport, all: cmdAll };
if (commands[command]) {
  commands[command]();
} else {
  console.log("用法: node main.js [analyze|predict|report|all]");
  console.log("  analyze  - 运行数据分析");
  console.log("  predict  - 预测待执行实验");
  console.log("  report   - 生成HTML报告");
  console.log("  all      - 全部执行 (默认)");
}