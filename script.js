// Thử tìm API SCORM 1.2
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
}
