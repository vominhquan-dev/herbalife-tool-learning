const vscode = acquireVsCodeApi();

document.getElementById("scormForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const scriptName = document.getElementById("scriptName").value;
  const scriptCode = document.getElementById("scriptCode").value;

  if (!scriptName || !scriptCode) {
    alert("Please fill in all fields");
    return;
  }

  const message = `[${scriptName}] ${scriptCode}`;

  vscode.postMessage({
    command: "runScript",
    text: message,
  });

  // Reset form
  document.getElementById("scormForm").reset();
  alert("Script executed! Check the output channel.");
});
