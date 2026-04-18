# Todo List

- [x] Task 1 - 前端 - 扁平化圖示替換與 Sidebar 清理
- [x] Task 2 - 前端 - 響應式佈局 (Responsive Layout)
- [x] Task 3 - 前端 - Markdown 標題自動擷取
- [x] Task 4 - 前端 - 頂部 Preview/Edit Toggle 切換
- [x] Task 5 - 前端 - 未儲存提示 (Notification Bar) 與快捷鍵
- [ ] Task 6 - 前端 - 側邊欄右鍵選單 (Context Menu)
- [ ] Task 7 - 前端 - 整合右鍵新增 API

# Change Logs

## Task 1 - 前端 - 扁平化圖示替換與 Sidebar 清理
### Summary
將 Emoji 圖示替換為現代扁平化的 SVG 圖示，並移除了 Sidebar 中不再需要的手動 Refresh 按鈕。
### Changed Files
- tiny-wiki/client/src/components/FileTreeItem.vue
- tiny-wiki/client/src/components/Sidebar.vue
- tiny-wiki/scratch/check_task_1_iter2.sh
### Notes
- 移除了 📁, 📄, 🗑️, 🔄 等 Emoji。
- 引入了 Feather-style SVG 路徑。

## Task 2 - 前端 - 響應式佈局 (Responsive Layout)
### Summary
優化了應用的響應式佈局，確保側邊欄與內容區域在不同桌面視窗寬度下皆能正確顯示。
### Changed Files
- tiny-wiki/client/src/App.vue
- tiny-wiki/client/src/components/FileTreeItem.vue
- tiny-wiki/client/src/components/WikiReader.vue
- tiny-wiki/scratch/check_task_2_iter2.sh
### Notes
- 引入了 `min-width: 0` 確保 Flex 佈局穩定。
- 實作了側邊欄檔名的自動截斷 (Ellipsis)。

## Task 3 - 前端 - Markdown 標題自動擷取
### Summary
實作了從 Markdown 第一行自動擷取標題的邏輯，並在 `WikiReader` 頂部獨立顯示，提升了頁面的閱讀質感。
### Changed Files
- tiny-wiki/client/src/components/WikiReader.vue
- tiny-wiki/scratch/check_task_3_iter2.sh
### Notes
- 自動移除第一行的 `# ` 前綴。
- 採用了更大的字體與細緻的邊框設計作為頁面 Header。
- 優化了 Edit 按鈕的樣式，改為 Feather 圖示與藍色主題。

## Task 4 - 前端 - 頂部 Preview/Edit Toggle 切換
### Summary
在 `App.vue` 頂部實作了置中的 Preview/Edit 切換器，統一了全域的檢視模式管理，並優化了整體的佈局層級。
### Changed Files
- tiny-wiki/client/src/App.vue
- tiny-wiki/client/src/components/WikiReader.vue
- tiny-wiki/scratch/check_task_4_iter2.sh
### Notes
- 移除了 `WikiReader` 內部的編輯按鈕。
- 引入了 `top-bar` 容器與 `view-toggle` 組件。
- 切換器採用了現代化的按鈕組設計，具備平滑的切換效果。

## Task 5 - 前端 - 未儲存提示 (Notification Bar) 與快捷鍵
### Summary
在編輯器中引入了 `isDirty` 狀態監控，當內容有變動時會在頂部浮現通知列提醒儲存，並支援了全域 `Ctrl+S` 快捷鍵。
### Changed Files
- tiny-wiki/client/src/components/WikiEditor.vue
- tiny-wiki/scratch/check_task_5_iter2.sh
### Notes
- 使用了 Vue 的 `<transition>` 實作通知列的平滑滑入效果。
- 快捷鍵同時支援 `Ctrl+S` 與 Mac 的 `Cmd+S`。
- 存檔成功後自動重設 `isDirty` 狀態並隱藏通知列。
