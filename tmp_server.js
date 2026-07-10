const fs = require('fs');
const path = require('path');
const serverPath = 'C:/Users/26921/Documents/Codex/2026-07-09/excel/server.js';
let s = fs.readFileSync(serverPath, 'utf8');

// Add submit-all route before api/submit
const oldRoute = "  if (req.url === \"/api/submit\" && req.method === \"POST\") {";
const newRoute =   // Unified submit (form + file)
  if (req.url === "/api/submit-all" && req.method === "POST") {
    let b = ""; req.on("data", c => b += c); req.on("end", () => {
      try {
        const { project, submitter, note, file } = JSON.parse(b);
        if (!project) return jsonRes(res, 400, { error: "请填写项目名称" });
        let fileInfo = null;
        if (file && file.data) {
          const buf = Buffer.from(file.data, "base64");
          const ext = path.extname(file.filename || ".xlsx").toLowerCase();
          const safeName = (file.filename || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
          const filePath = path.join(UPLOADS_DIR, Date.now() + "_" + safeName);
          fs.writeFileSync(filePath, buf);
          let parsed = null, textContent = "";
          if (ext === ".xlsx") { const r = parseExcelBuffer(buf); parsed = { type: "excel", sheets: r.sheets, summary: r.sheets.map(s=>s+" ("+(r.data[s]?.data?.length||0)+")").join(", ") }; }
          else if (ext === ".docx") { textContent = parseDocx(buf); parsed = { type: "word", textLen: textContent.length, preview: textContent.substring(0, 300) }; }
          fileInfo = { filename: safeName, filePath, ext, parsed };
        }
        const entry = { id: Date.now(), project, submitter: submitter || "", note: note || "",
          time: new Date().toISOString(), status: "pending", file: fileInfo };
        const subs = loadSubmissions(); subs.push(entry); saveJSON(SUBMISSIONS_FILE, subs);
        console.log("Submit-all:", project, fileInfo ? "(with file: " + fileInfo.filename + ")" : "(no file)");
        jsonRes(res, 200, { success: true, message: "提交成功！管理员审核后将纳入数据库。", id: entry.id });
      } catch(e) { jsonRes(res, 400, { error: "提交失败: " + e.message }); }
    }); return;
  }

  if (req.url === "/api/submit" && req.method === "POST") {;

s = s.replace(oldRoute, newRoute);

// Add docx parser function
const docxParser = 
function parseDocx(buf) {
  try {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(buf);
    const entry = zip.getEntry("word/document.xml");
    if (!entry) return "";
    let xml = entry.getData().toString("utf8");
    xml = xml.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
    return xml;
  } catch(e) { return "无法解析docx"; }
}
;
s = s.replace("function parseExcelBuffer(buf) {", docxParser + "function parseExcelBuffer(buf) {");

fs.writeFileSync(serverPath, s);
console.log("server.js updated");
