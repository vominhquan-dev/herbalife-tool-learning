// Content script injected into Herbalife pages
// Immediately log to verify it's loaded
console.log("🎓 SCORM Tool content script loaded!");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "executeScript") {
    console.log("📨 Received message to execute script");

    const script = request.script;
    window.__scormToolLogs = window.__scormToolLogs || [];

    // Capture console logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const captureLog = function (...args) {
      window.__scormToolLogs.push(args.join(" "));
      originalLog.apply(console, args);
    };

    console.log = captureLog;
    console.warn = captureLog;
    console.error = captureLog;

    try {
      // Execute script directly using Function constructor
      // If it fails, the error will be caught below
      const executeFunc = new Function(script);
      executeFunc();

      window.__scormToolLogs.push("✅ Script executed successfully!");
      console.log("✅ Script completed");
    } catch (error) {
      // If Function() fails due to CSP, try creating a script element instead
      console.log("⚠️ Direct execution failed, trying script injection...");
      window.__scormToolLogs.push(
        `⚠️ Note: Using script tag injection due to CSP`,
      );

      try {
        // Create script tag and inject it
        const scriptEl = document.createElement("script");
        scriptEl.type = "text/javascript";
        scriptEl.textContent = script;

        // Track if it executed
        let executed = false;
        scriptEl.onload = () => {
          executed = true;
          window.__scormToolLogs.push("✅ Script tag executed successfully!");
        };

        // Inject into page
        (document.head || document.documentElement).appendChild(scriptEl);

        // If onload didn't fire, it might have executed synchronously
        if (!executed) {
          window.__scormToolLogs.push("✅ Script executed (synchronous)");
        }
      } catch (injectionError) {
        window.__scormToolLogs.push(`❌ Error: ${injectionError.message}`);
      }
    } finally {
      // Restore console
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }

    // Send response back to popup
    console.log("📤 Sending logs back to popup:", window.__scormToolLogs);
    sendResponse({ logs: window.__scormToolLogs });
  }

  // Return true to keep the channel open for async response
  return true;
});
