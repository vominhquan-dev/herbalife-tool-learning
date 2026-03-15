// Initialize event listeners
document.getElementById("scormForm").addEventListener("submit", function (e) {
  e.preventDefault();
  runScript();
});

document.getElementById("resetBtn").addEventListener("click", function () {
  resetForm();
});

// Load script.js from extension resources
async function loadScriptFile() {
  try {
    const response = await fetch(chrome.runtime.getURL("script.js"));
    const scriptContent = await response.text();
    return scriptContent;
  } catch (error) {
    console.error("Error loading script.js:", error);
    return getDefaultScormScript();
  }
}

function runScript() {
  const statusEl = document.getElementById("status");
  const outputEl = document.getElementById("output");
  const outputSection = document.getElementById("outputSection");
  const progressBar = document.getElementById("progressBar");
  const submitBtn = document.querySelector("button[type='submit']");

  try {
    // Disable button during execution
    submitBtn.disabled = true;

    // Reset progress
    progressBar.style.width = "0%";
    progressBar.classList.remove("active");
    outputEl.innerHTML = "";
    statusEl.className = "status";

    // Show output section immediately
    const runningDiv = document.createElement("div");
    runningDiv.className = "output-text-running";
    runningDiv.textContent = "⏳ Running script...";
    outputEl.appendChild(runningDiv);
    outputSection.classList.add("active");

    // Start progress animation
    progressBar.classList.add("active");
    progressBar.style.width = "25%";

    setTimeout(async () => {
      progressBar.style.width = "50%";

      // Get script input or load script.js
      let scriptToRun = document.getElementById("scriptInput").value.trim();
      if (!scriptToRun) {
        scriptToRun = await loadScriptFile();
      }

      // Get the active tab and execute script directly
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
          handleError(
            "No active tab found. Please open Herbalife page first.",
            statusEl,
            outputEl,
            outputSection,
            progressBar,
            submitBtn,
          );
          return;
        }

        // Execute script directly using chrome.scripting.executeScript
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            world: "MAIN",
            func: (scriptContent) => {
              window.__scormToolLogs = window.__scormToolLogs || [];
              const originalLog = console.log;
              const originalError = console.error;

              console.log = function (...args) {
                window.__scormToolLogs.push("[LOG] " + args.join(" "));
                originalLog.apply(console, args);
              };

              console.error = function (...args) {
                window.__scormToolLogs.push("[ERROR] " + args.join(" "));
                originalError.apply(console, args);
              };

              try {
                // Execute the script directly
                eval(scriptContent);
                window.__scormToolLogs.push("✅ Script executed successfully!");
              } catch (error) {
                window.__scormToolLogs.push(
                  `❌ Execution Error: ${error.message}`,
                );
              } finally {
                console.log = originalLog;
                console.error = originalError;
              }

              return window.__scormToolLogs;
            },
            args: [scriptToRun],
          },
          (results) => {
            progressBar.style.width = "75%";

            setTimeout(() => {
              const logs = results?.[0]?.result || [];

              // Show output
              outputEl.innerHTML = "";

              const timeDiv = document.createElement("div");
              timeDiv.textContent = `[${new Date().toLocaleTimeString()}] Executing Script...`;
              outputEl.appendChild(timeDiv);

              if (logs.length > 0) {
                logs.forEach((log) => {
                  const logDiv = document.createElement("div");
                  logDiv.textContent = log;
                  outputEl.appendChild(logDiv);
                });
              } else {
                const infoDiv = document.createElement("div");
                infoDiv.className = "output-text-warning";
                infoDiv.textContent = "ℹ️ Script executed (no output)";
                outputEl.appendChild(infoDiv);
              }

              const successDiv = document.createElement("div");
              successDiv.className = "output-text-success";
              successDiv.textContent = "✅ Script executed successfully!";
              outputEl.appendChild(successDiv);

              showStatus("✅ Script executed successfully!", "success");

              // Complete progress
              progressBar.style.width = "100%";

              setTimeout(() => {
                progressBar.classList.remove("active");
                progressBar.style.width = "0%";
                submitBtn.disabled = false;
              }, 800);
            }, 600);
          },
        );
      });
    }, 600);
  } catch (error) {
    handleError(
      error.message,
      statusEl,
      outputEl,
      outputSection,
      progressBar,
      submitBtn,
    );
  }
}

function getDefaultScormScript() {
  return `// SCORM 1.2 API
var api = window.API || window.parent.API;
if (api) {
  api.LMSSetValue("cmi.core.lesson_status", "passed");
  api.LMSSetValue("cmi.core.score.raw", "100");
  api.LMSCommit("");
  console.log("✅ SCORM 1.2: Set passed successfully!");
} else {
  var api2004 = window.API_1484_11 || window.parent.API_1484_11;
  if (api2004) {
    api2004.SetValue("cmi.completion_status", "completed");
    api2004.SetValue("cmi.success_status", "passed");
    api2004.SetValue("cmi.score.scaled", "1.0");
    api2004.Terminate("");
    console.log("✅ SCORM 2004: Set passed successfully!");
  } else {
    console.log("⚠️ No SCORM API found in window or parent frame.");
  }
}`;
}

function handleError(
  message,
  statusEl,
  outputEl,
  outputSection,
  progressBar,
  submitBtn,
) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "output-text-error";
  errorDiv.textContent = `❌ Error: ${message}`;
  outputEl.innerHTML = "";
  outputEl.appendChild(errorDiv);
  outputSection.classList.add("active");
  showStatus("❌ Error: " + message, "error");
  progressBar.style.width = "0%";
  progressBar.classList.remove("active");
  submitBtn.disabled = false;
}

function showStatus(message, type) {
  const statusEl = document.getElementById("status");
  statusEl.textContent = message;
  statusEl.className = "status " + type;
}

function resetForm() {
  document.getElementById("scormForm").reset();
  document.getElementById("status").className = "status";
  document.getElementById("outputSection").classList.remove("active");
  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = "0%";
  progressBar.classList.remove("active");
  const submitBtn = document.querySelector("button[type='submit']");
  submitBtn.disabled = false;
}
