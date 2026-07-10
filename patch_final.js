const fs = require("fs");
let g = fs.readFileSync("C:/Users/26921/Documents/Codex/2026-07-09/excel/generate.js","utf8");

// 1. Update canvas particle colors for light theme
g = g.replace(
  "for(var i=0;i<80;i++)particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,r:Math.random()*1.5+.5});",
  "for(var i=0;i<60;i++)particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:Math.random()*2+1});"
);
g = g.replace(
  "'rgba(34,211,238,'+(.15+p.r*.1)+')'",
  "'rgba(37,99,235,'+(.08+p.r*.04)+')'"
);
g = g.replace(
  "'rgba(34,211,238,'+(.04*(1-dist/120))+')'",
  "'rgba(37,99,235,'+(.025*(1-dist/150))+')'"
);

// 2. Add AI float button + scan line before footer
const footerM = '<div class="footer">';
const floatHTML = '<div class="scan-line"></div>\n<div class="ai-float" onclick="switchPage(4)" title="AI">\n  <span class="ai-tip">AI??</span>\n  ?\n</div>\n' + footerM;
g = g.replace(footerM, floatHTML);

// 3. Update embedded CSS with template.html
const t = fs.readFileSync("C:/Users/26921/Documents/Codex/2026-07-09/excel/template.html","utf8");
const a = g.indexOf("<style>");
const b = g.indexOf("</style>");
g = g.substring(0, a+7) + t + g.substring(b);

fs.writeFileSync("C:/Users/26921/Documents/Codex/2026-07-09/excel/generate.js", g);
console.log("generate.js updated, len:", g.length);
