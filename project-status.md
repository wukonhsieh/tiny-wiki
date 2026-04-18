# Todo List

- [x] Task 1 - 專案基礎腳手架與環境設定
- [x] Task 2 - 後端 - 檔案樹檢索 (File Tree API)
- [x] Task 3 - Frontend - 側邊欄檔案導覽元件
- [x] Task 4 - 後端 - 檔案內容讀寫與刪除 API
- [ ] Task 5 - 前端 - 閱讀模式 (Viewer)
- [ ] Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
- [ ] Task 7 - 檔案生命週期管理 (新增與刪除功能)

# Change Logs

## Task 4 - 後端 - 檔案內容讀寫與刪除 API
### Summary
實作了檔案的讀取 (GET)、寫入 (POST) 與刪除 (DELETE) API，並加入路徑安全檢查。
### Changed Files
- tiny-wiki/server/index.js
- tiny-wiki/scratch/check_task_4.sh
### Notes
- 所有回傳與請求資料均使用 JSON 格式。
- 使用 `path.resolve` 確保路徑不會脫離 `REPO_PATH`。
