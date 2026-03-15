# SCORM Tool Extension

Một extension VS Code để quản lý trạng thái SCORM một cách tự động.

## Chức năng

- ▶ **START**: Chạy script SCORM và hiển thị kết quả
- 📋 **Copy Script**: Sao chép script vào clipboard

## Sử dụng

1. Cài đặt extension
2. Nhấn nút "START" để thực thi script
3. Kiểm tra kết quả trong Output Console

## Script

Script này hỗ trợ cả hai phiên bản SCORM:

- SCORM 1.2 (API)
- SCORM 2004 (API_1484_11)

Nó sẽ tự động:

- Thiết lập trạng thái bài học thành "passed/completed"
- Thiết lập điểm số thành 100 (SCORM 1.2) hoặc 1.0 (SCORM 2004)
- Commit dữ liệu hoặc Terminate phiên làm việc
