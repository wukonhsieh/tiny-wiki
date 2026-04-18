# Todo List

- [x] Task 1 - 前端 - 扁平化圖示替換與 Sidebar 清理
- [x] Task 2 - 前端 - 響應式佈局 (Responsive Layout)
- [x] Task 3 - 前端 - Markdown 標題自動擷取
- [x] Task 4 - 前端 - 頂部 Preview/Edit Toggle 切換
- [x] Task 5 - 前端 - 未儲存提示 (Notification Bar) 與快捷鍵
- [x] Task 6 - 前端 - 側邊欄右鍵選單 (Context Menu)
- [x] Task 7 - 前端 - 整合右鍵新增 API
- [x] Task 8 - 前端 - 滿版佈局優化 (Full-screen Refinement)
- [x] Task 9 - 前端 - 大地色系調色盤套用 (Earthy Theme Application)

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

## Task 6 - 前端 - 側邊欄右鍵選單 (Context Menu)
### Summary
實作了側邊欄目錄的右鍵選單功能，提供 "New Page" 與 "New Folder" 的快速操作入口。
### Changed Files
- tiny-wiki/client/src/components/ContextMenu.vue
- tiny-wiki/client/src/components/FileTreeItem.vue
- tiny-wiki/client/src/components/Sidebar.vue
- tiny-wiki/scratch/check_task_6_iter2.sh
### Notes
- 目錄項目支援 `contextmenu` 事件監聽。
- 實作了全域點擊自動關閉選單的邏輯。
- 選單採用現代化的懸浮設計，具備磨砂質感與微影效果。

## Task 7 - 前端 - 整合右鍵新增 API
### Summary
將側邊欄右鍵選單的操作與後端 API 正式整合，支援在特定目錄下建立新頁面或資料夾。
### Changed Files
- tiny-wiki/client/src/components/Sidebar.vue
- tiny-wiki/scratch/check_task_7_iter2.sh
### Notes
- 重構了 `createNewFile` 與 `createNewFolder` 以支援 `targetDir` 參數。
- 修正了路徑拼接邏輯，確保在子目錄建立檔案時路徑正確。
- 整合了 `handleContextMenuAction` 以觸發對應的 API 請求並自動重新整理檔案樹。

## Task 8 - 前端 - 滿版佈局優化 (Full-screen Refinement)
### Summary
修正了 `#app` 與 `.app-layout` 的寬度衝突，將應用改為 100% 滿版設計，解決了畫面偏向一側的問題並移除了多餘的邊框。
### Changed Files
- tiny-wiki/client/src/App.vue
- tiny-wiki/client/src/style.css
### Notes
- 將 `#app` 的 `width: 1126px` 改為 `100%`。
- 將 `.app-layout` 的 `width: 100vw` 改為 `100%` 以避免潛在的滾動條問題。
- 移除了 `#app` 的側邊邊框 (`border-inline`)。

## Task 9 - 前端 - 大地色系調色盤套用 (Earthy Theme Application)
### Summary
根據使用者提供的調色盤，將應用介面全面更新為溫暖的大地色系 (Earthy Tones)，並將文字顏色統一為黑色，提升視覺層次感與閱讀舒適度。
### Changed Files
- tiny-wiki/client/src/style.css
- tiny-wiki/client/src/App.vue
- tiny-wiki/client/src/components/Sidebar.vue
- tiny-wiki/client/src/components/WikiReader.vue
- tiny-wiki/client/src/components/WikiEditor.vue
- tiny-wiki/client/src/components/FileTreeItem.vue
- tiny-wiki/client/src/components/ContextMenu.vue
### Notes
- 在 `:root` 中定義了新的 CSS 變數：`--sidebar-bg` (大地淺色), `--border` (暖灰褐), `--accent` (柔和棕)。
- 移除了所有硬編碼的顏色 (如 `#fff`, `#eee`, `#007bff`)，全面改用 CSS 變數以維持一致性。
- 將所有 Wiki 內容文字與標題顏色設定為純黑 (`#000000`)。
- 優化了 Hover 與 Active 狀態，採用調色盤中的相鄰色系進行細微變化。
