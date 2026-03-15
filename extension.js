const vscode = require("vscode");
const path = require("path");

let extensionPath;

function activate(context) {
  extensionPath = context.extensionPath;

  const command = vscode.commands.registerCommand("scormTool.start", () => {
    const panel = vscode.window.createWebviewPanel(
      "scormTool",
      "SCORM Tool",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, "media")),
        ],
      },
    );

    const htmlPath = path.join(extensionPath, "webview.html");
    const scriptPath = path.join(extensionPath, "webview.js");

    const htmlUri = panel.webview.asWebviewUri(vscode.Uri.file(htmlPath));
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(scriptPath));

    panel.webview.html = getWebviewContent(htmlUri, scriptUri);

    panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === "runScript") {
          vscode.window.showInformationMessage(
            "Script executed: " + message.text,
          );
          const channel = vscode.window.createOutputChannel("SCORM Tool");
          channel.show();
          channel.appendLine(message.text);
        }
      },
      undefined,
      context.subscriptions,
    );
  });

  context.subscriptions.push(command);

  // Show extension on startup
  vscode.commands.executeCommand("scormTool.start");
}

function getWebviewContent(htmlUri, scriptUri) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCORM Tool</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 500px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .info-box {
            background: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 30px;
            color: #333;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .info-box strong {
            color: #667eea;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        button {
            flex: 1;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-start {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-start:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-start:active {
            transform: translateY(0);
        }
        
        .btn-copy {
            background: #e8e8e8;
            color: #333;
        }
        
        .btn-copy:hover {
            background: #d8d8d8;
        }
        
        .status {
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            font-weight: 500;
            display: none;
            margin-top: 20px;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            display: block;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            display: block;
        }
        
        .script-preview {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            max-height: 200px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SCORM Tool</h1>
            <p>Automated SCORM Status Manager</p>
        </div>
        
        <div class="info-box">
            <strong>Chức năng:</strong><br>
            Thiết lập trạng thái SCORM thành "Passed" hoặc "Completed" tùy theo phiên bản API.
        </div>
        
        <div class="button-group">
            <button class="btn-start" onclick="runScript()">▶ START</button>
            <button class="btn-copy" onclick="copyScript()">📋 Copy Script</button>
        </div>
        
        <div id="status" class="status"></div>
        
        <div class="script-preview" id="scriptPreview"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function runScript() {
            const scriptContent = \`// Thử tìm API SCORM 1.2
var api = window.API || window.parent.API;
if (api) {
  api.LMSSetValue("cmi.core.lesson_status", "passed");
  api.LMSSetValue("cmi.core.score.raw", "100");
  api.LMSCommit("");
  console.log("Đã set passed thành công!");
} else {
  var api2004 = window.API_1484_11 || window.parent.API_1484_11;
  if (api2004) {
    api2004.SetValue("cmi.completion_status", "completed");
    api2004.SetValue("cmi.success_status", "passed");
    api2004.SetValue("cmi.score.scaled", "1.0");
    api2004.Terminate("");
    console.log("Đã set passed (2004) thành công!");
  } else {
    console.log("Không tìm thấy API SCORM.");
  }
}\`;
            
            showStatus('✓ Script đã được thực thi!', 'success');
            vscode.postMessage({
                command: 'runScript',
                text: scriptContent
            });
            
            console.log('Script executed:', scriptContent);
        }
        
        function copyScript() {
            const scriptContent = \`// Thử tìm API SCORM 1.2
var api = window.API || window.parent.API;
if (api) {
  api.LMSSetValue("cmi.core.lesson_status", "passed");
  api.LMSSetValue("cmi.core.score.raw", "100");
  api.LMSCommit("");
  console.log("Đã set passed thành công!");
} else {
  var api2004 = window.API_1484_11 || window.parent.API_1484_11;
  if (api2004) {
    api2004.SetValue("cmi.completion_status", "completed");
    api2004.SetValue("cmi.success_status", "passed");
    api2004.SetValue("cmi.score.scaled", "1.0");
    api2004.Terminate("");
    console.log("Đã set passed (2004) thành công!");
  } else {
    console.log("Không tìm thấy API SCORM.");
  }
}\`;
            
            navigator.clipboard.writeText(scriptContent).then(() => {
                showStatus('✓ Script đã được copy!', 'success');
            });
        }
        
        function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + type;
            
            setTimeout(() => {
                status.className = 'status';
            }, 3000);
        }
        
        // Display script preview on load
        window.addEventListener('load', () => {
            const scriptContent = \`// Thử tìm API SCORM 1.2
var api = window.API || window.parent.API;
if (api) {
  api.LMSSetValue("cmi.core.lesson_status", "passed");
  api.LMSSetValue("cmi.core.score.raw", "100");
  api.LMSCommit("");
  console.log("Đã set passed thành công!");
} else {
  var api2004 = window.API_1484_11 || window.parent.API_1484_11;
  if (api2004) {
    api2004.SetValue("cmi.completion_status", "completed");
    api2004.SetValue("cmi.success_status", "passed");
    api2004.SetValue("cmi.score.scaled", "1.0");
    api2004.Terminate("");
    console.log("Đã set passed (2004) thành công!");
  } else {
    console.log("Không tìm thấy API SCORM.");
  }
}\`;
            document.getElementById('scriptPreview').textContent = scriptContent;
        });
    </script>
</body>
</html>`;
}

exports.activate = activate;
