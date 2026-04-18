# Todo List

- [x] Task 1 - 專案基礎腳手架與環境設定
- [x] Task 2 - 後端 - 檔案樹檢索 (File Tree API)
- [ ] Task 3 - Frontend - 側邊欄檔案導覽元件
- [ ] Task 4 - 後端 - 檔案內容讀寫與刪除 API
- [ ] Task 5 - 前端 - 閱讀模式 (Viewer)
- [ ] Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
- [ ] Task 7 - 檔案生命週期管理 (新增與刪除功能)

# Change Logs

## Task 2 - 後端 - 檔案樹檢索 (File Tree API)
### Summary
在後端實作了 `GET /api/tree` 接口，使用 Node.js `fs.promises` 遞迴掃描指定目錄。
### Changed Files
- tiny-wiki/server/index.js
- tiny-wiki/scratch/check_task_2.sh
- tiny-wiki/repository/ (測試用的 Mock 資料)
### Notes
- 僅回傳 `.md` 檔案與資料夾結構。
- 已自動過濾 `.git`, `node_modules` 等不相關目錄。
