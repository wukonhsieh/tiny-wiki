# Todo List

- [x] Task 1 - 專案基礎腳手架與環境設定
- [x] Task 2 - 後端 - 檔案樹檢索 (File Tree API)
- [x] Task 3 - Frontend - 側邊欄檔案導覽元件
- [x] Task 4 - 後端 - 檔案內容讀寫與刪除 API
- [x] Task 5 - 前端 - 閱讀模式 (Viewer)
- [x] Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
- [x] Task 7 - 檔案生命週期管理 (新增與刪除功能)

# Change Logs

## Task 7 - 檔案生命週期管理 (新增與刪除功能)
### Summary
完善了 Wiki 的檔案生命週期管理，支援新增檔案、資料夾以及安全刪除。
### Changed Files
- tiny-wiki/server/index.js
- tiny-wiki/client/src/components/Sidebar.vue
- tiny-wiki/client/src/components/FileTreeItem.vue
- tiny-wiki/scratch/check_task_7.sh
### Notes
- 新增了 `POST /api/directory` 接口。
- 實作了 UI 上的操作按鈕與重新整理邏輯。
