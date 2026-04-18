# Todo List

- [x] Task 1 - 前端 - 扁平化圖示替換與 Sidebar 清理
- [ ] Task 2 - 前端 - 響應式佈局 (Responsive Layout)
- [ ] Task 3 - 前端 - Markdown 標題自動擷取
- [ ] Task 4 - 前端 - 頂部 Preview/Edit Toggle 切換
- [ ] Task 5 - 前端 - 未儲存提示 (Notification Bar) 與快捷鍵
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
