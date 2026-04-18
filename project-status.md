# Todo List

- [x] Task 1 - 專案基礎腳手架與環境設定
- [x] Task 2 - 後端 - 檔案樹檢索 (File Tree API)
- [x] Task 3 - Frontend - 側邊欄檔案導覽元件
- [x] Task 4 - 後端 - 檔案內容讀寫與刪除 API
- [x] Task 5 - 前端 - 閱讀模式 (Viewer)
- [ ] Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
- [ ] Task 7 - 檔案生命週期管理 (新增與刪除功能)

# Change Logs

## Task 5 - 前端 - 閱讀模式 (Viewer)
### Summary
實作了 Markdown 內容渲染，並整合了程式碼高亮。
### Changed Files
- tiny-wiki/client/src/components/WikiReader.vue
- tiny-wiki/client/src/App.vue
- tiny-wiki/client/package.json
- tiny-wiki/scratch/check_task_5.sh
### Notes
- 使用 `markdown-it` 進行渲染。
- 使用 `highlight.js` 實現程式碼語法高亮 (GitHub 風格)。
