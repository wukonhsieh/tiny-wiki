# Todo List

- [x] Task 1 - 專案基礎腳手架與環境設定
- [x] Task 2 - 後端 - 檔案樹檢索 (File Tree API)
- [x] Task 3 - Frontend - 側邊欄檔案導覽元件
- [x] Task 4 - 後端 - 檔案內容讀寫與刪除 API
- [x] Task 5 - 前端 - 閱讀模式 (Viewer)
- [x] Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
- [ ] Task 7 - 檔案生命週期管理 (新增與刪除功能)

# Change Logs

## Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
### Summary
實作了雙欄式編輯器，支援即時預覽與存檔功能。
### Changed Files
- tiny-wiki/client/src/components/WikiEditor.vue
- tiny-wiki/client/src/utils/markdown.js
- tiny-wiki/client/src/components/WikiReader.vue
- tiny-wiki/client/src/App.vue
- tiny-wiki/scratch/check_task_6.sh
### Notes
- 抽取了公共 Markdown 渲染邏輯。
- 加入了切換檔案時的未儲存提示。
