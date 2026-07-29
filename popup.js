const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const scoreInput = document.getElementById("scoreInput");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const outputSection = document.getElementById("outputSection");
const progressBar = document.getElementById("progressBar");

startBtn.addEventListener("click", submitScore);
resetBtn.addEventListener("click", resetForm);

function submitScore() {
  const score = scoreInput.value;
  const scoreNum = parseInt(score, 10);

  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    statusEl.textContent = "enter 0-100";
    statusEl.className = "msg error";
    return;
  }

  startBtn.disabled = true;
  progressBar.style.width = "0%";
  outputEl.textContent = "";
  statusEl.className = "msg";
  outputSection.classList.add("active");

  outputEl.textContent = "…";
  progressBar.style.width = "25%";

  setTimeout(() => {
    progressBar.style.width = "50%";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        fail("no tab");
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          world: "MAIN",
          func: (v) => {
            const logs = [];
            const ol = console.log;
            const oe = console.error;
            console.log = (...a) => {
              logs.push("[L] " + a.join(" "));
              ol(...a);
            };
            console.error = (...a) => {
              logs.push("[E] " + a.join(" "));
              oe(...a);
            };

            try {
              const s = parseInt(v, 10);
              const sc = s / 100;
              const a = window.API || window.parent.API;
              const a2 = window.API_1484_11 || window.parent.API_1484_11;

              if (a) {
                logs.push("SCORM 1.2");
                a.LMSSetValue("cmi.core.lesson_status", "passed");
                a.LMSSetValue("cmi.core.score.raw", v);
                a.LMSSetValue("cmi.core.score.max", "100");
                a.LMSSetValue("cmi.core.score.min", "0");
                a.LMSCommit("");
              } else if (a2) {
                logs.push("SCORM 2004");
                a2.SetValue("cmi.completion_status", "completed");
                a2.SetValue("cmi.success_status", "passed");
                a2.SetValue("cmi.score.scaled", sc.toString());
                a2.SetValue("cmi.score.raw", v);
                a2.SetValue("cmi.score.max", "100");
                a2.SetValue("cmi.score.min", "0");
                a2.Terminate("");
              } else {
                logs.push("no SCORM API");
              }

              logs.push("done");
            } catch (e) {
              logs.push("err: " + e.message);
            }

            console.log = ol;
            console.error = oe;
            return logs;
          },
          args: [score],
        },
        (results) => {
          progressBar.style.width = "75%";

          setTimeout(() => {
            statusEl.textContent = "✅ Hoàn thành";
            statusEl.className = "hint success";
            outputSection.classList.remove("active");

            progressBar.style.width = "100%";
            setTimeout(() => {
              progressBar.style.width = "0%";
              startBtn.disabled = false;
            }, 600);
          }, 400);
        },
      );
    });
  }, 500);
}

function fail(msg) {
  statusEl.textContent = msg;
  statusEl.className = "msg error";
  progressBar.style.width = "0%";
  startBtn.disabled = false;
}

function resetForm() {
  scoreInput.value = "100";
  statusEl.className = "msg";
  outputSection.classList.remove("active");
  progressBar.style.width = "0%";
  startBtn.disabled = false;
}
