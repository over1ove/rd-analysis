const fs = require('fs');
const c = fs.readFileSync('C:/Users/26921/Documents/Codex/2026-07-09/excel/generate.js','utf8');

const startM = '\x3C!-- Page 5: Data Submission --\x3E';
const endM = '\x3Cdiv class=\"footer\"\x3E';
const p5s = c.indexOf(startM);
const p5e = c.indexOf(endM, p5s);
const oldPage5 = c.substring(p5s, p5e);

const parts = [];
parts.push('\x3C!-- Page 5: Data Submission --\x3E');
parts.push('\x3Cdiv class=\"page\" id=\"page5\"\x3E');
parts.push('  \x3Cdiv style=\"max-width:800px;margin:0 auto\"\x3E');
parts.push('    \x3Cdiv class=\"section\"\x3E');
parts.push('      \x3Ch2\x3E\x3Cspan class=\"dot\"\x3E\x3C/span\x3E数据提交\x3C/h2\x3E');
parts.push('      \x3Cp style=\"color:var(--text2);font-size:14px;margin-bottom:16px\"\x3E提交项目实验数据，管理员审核通过后AI将自动分析并纳入数据库。\x3C/p\x3E');
parts.push('      \x3Cp style=\"color:var(--amber);font-size:12px;margin-bottom:24px\" id=\"submitNote\"\x3E需要本地服务器 (localhost:3000)，在线版无法提交。\x3C/p\x3E');
parts.push('    \x3C/div\x3E');
parts.push('    \x3Cdiv class=\"card\" style=\"margin-bottom:16px\"\x3E');
parts.push('      \x3Ch3 style=\"font-size:15px;margin-bottom:16px;color:var(--cyan)\"\x3E基本信息\x3C/h3\x3E');
parts.push('      \x3Cdiv\x3E\x3Clabel style=\"font-size:12px;color:var(--text3);display:block;margin-bottom:4px\"\x3E项目名称 *\x3C/label\x3E\x3Cinput class=\"sf\" id=\"fProject\" placeholder=\"如：黄山源点缠绕膜\"\x3E\x3C/div\x3E');
parts.push('      \x3Cdiv style=\"margin-top:12px\"\x3E\x3Clabel style=\"font-size:12px;color:var(--text3);display:block;margin-bottom:4px\"\x3E提交人\x3C/label\x3E\x3Cinput class=\"sf\" id=\"fSubmitter\" placeholder=\"您的姓名\"\x3E\x3C/div\x3E');
parts.push('      \x3Cdiv style=\"margin-top:12px\"\x3E\x3Clabel style=\"font-size:12px;color:var(--text3);display:block;margin-bottom:4px\"\x3E备注说明\x3C/label\x3E\x3Ctextarea class=\"sf\" id=\"fNote\" rows=\"2\" style=\"resize:vertical\" placeholder=\"简要描述提交的数据内容\"\x3E\x3C/textarea\x3E\x3C/div\x3E');
parts.push('    \x3C/div\x3E');
parts.push('    \x3Cdiv class=\"card\" style=\"margin-bottom:20px\"\x3E');
parts.push('      \x3Ch3 style=\"font-size:15px;margin-bottom:12px;color:var(--blue)\"\x3E文件附件\x3C/h3\x3E');
parts.push('      \x3Cp style=\"font-size:12px;color:var(--text3);margin-bottom:16px\"\x3E上传 Excel(.xlsx) 或 Word(.docx) 格式的实验数据文件。AI将自动解析内容。\x3C/p\x3E');
parts.push('      \x3Cdiv class=\"file-upload\" id=\"fileDrop\"\x3E');
parts.push('        \x3Cdiv class=\"fu-icon\"\x3E📤\x3C/div\x3E');
parts.push('        \x3Cdiv class=\"fu-text\"\x3E点击选择文件或拖拽到此处\x3C/div\x3E');
parts.push('        \x3Cdiv class=\"fu-hint\" id=\"fileHint\"\x3E支持 .xlsx / .docx 格式\x3C/div\x3E');
parts.push('        \x3Cinput type=\"file\" id=\"fileInput\" accept=\".xlsx,.docx\" onchange=\"handleFile(event)\"\x3E');
parts.push('      \x3C/div\x3E');
parts.push('    \x3C/div\x3E');
parts.push('    \x3Cbutton class=\"submit-btn\" id=\"submitBtn\" onclick=\"submitAll()\"\x3E提交数据\x3C/button\x3E');
parts.push('    \x3Cdiv id=\"submitResult\" style=\"margin-top:12px;text-align:center;font-size:13px\"\x3E\x3C/div\x3E');
parts.push('  \x3C/div\x3E');
parts.push('\x3C/div\x3E');
const newPage5 = parts.join('\\n');

let result = c.replace(oldPage5, newPage5);

// Replace JS
const oldJsStart = '// Submit tab switching';
const oldJsEnd = '// Data Submission (legacy)\\nfunction submitData(){';
const jsS = result.indexOf(oldJsStart);
const jsE = result.indexOf(oldJsEnd, jsS);
if (jsS >= 0 && jsE > jsS) {
  const oldJs = result.substring(jsS, jsE);
  const newJs = '// File handling\\nvar selectedFile=null;\\nfunction handleFile(e){\\n  selectedFile=e.target.files[0];\\n  var hint=document.getElementById(\"fileHint\");\\n  if(selectedFile){hint.textContent=selectedFile.name+\" (\"+(selectedFile.size/1024).toFixed(1)+\" KB)\";}\\n}\\n// Unified submit\\nfunction submitAll(){\\n  var project=document.getElementById(\"fProject\").value.trim();\\n  if(!project){document.getElementById(\"submitResult\").innerHTML=\"\x3Cspan style=color:#f87171\x3E请填写项目名称\x3C/span\x3E\";return}\\n  var btn=document.getElementById(\"submitBtn\"),r=document.getElementById(\"submitResult\");\\n  btn.disabled=true;btn.textContent=\"提交中...\";r.innerHTML=\"\";\\n  var submitter=document.getElementById(\"fSubmitter\").value.trim();\\n  var note=document.getElementById(\"fNote\").value.trim();\\n  function doSubmit(fileData){\\n    fetch(\"/api/submit-all\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},\\n      body:JSON.stringify({project:project,submitter:submitter,note:note,file:fileData})\\n    }).then(function(res){return res.json()}).then(function(d){\\n      if(d.success){\\n        r.innerHTML=\"\x3Cspan style=color:var(--green)\x3E\"+d.message+\"\x3C/span\x3E\";\\n        document.getElementById(\"fProject\").value=\"\";document.getElementById(\"fSubmitter\").value=\"\";\\n        document.getElementById(\"fNote\").value=\"\";selectedFile=null;\\n        document.getElementById(\"fileInput\").value=\"\";document.getElementById(\"fileHint\").textContent=\"支持 .xlsx / .docx 格式\";\\n      }else{r.innerHTML=\"\x3Cspan style=color:#f87171\x3E\"+(d.error||\"提交失败\")+\"\x3C/span\x3E\"}\\n      btn.disabled=false;btn.textContent=\"提交数据\";\\n    }).catch(function(e){\\n      r.innerHTML=\"\x3Cspan style=color:#f87171\x3E无法连接服务器，请确认已启动 node server.js\x3C/span\x3E\";\\n      btn.disabled=false;btn.textContent=\"提交数据\";\\n    });\\n  }\\n  if(selectedFile){\\n    var reader=new FileReader();\\n    reader.onload=function(){doSubmit({filename:selectedFile.name,data:reader.result.split(\",\")[1],size:selectedFile.size})};\\n    reader.readAsDataURL(selectedFile);\\n  }else{doSubmit(null)}\\n}\\n';
  result = result.substring(0, jsS) + newJs + result.substring(jsE);
}

fs.writeFileSync('C:/Users/26921/Documents/Codex/2026-07-09/excel/generate.js', result);
console.log('generate.js updated');
