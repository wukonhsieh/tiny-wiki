# Todo List

- [x] Task 1 - 專案基礎腳手架與環境設定
- [ ] Task 2 - 後端 - 檔案樹檢索 (File Tree API)
- [ ] Task 3 - Frontend - 側邊欄檔案導覽元件
- [ ] Task 4 - 後端 - 檔案內容讀寫與刪除 API
- [ ] Task 5 - 前端 - 閱讀模式 (Viewer)
- [ ] Task 6 - 前端 - 編輯模式與即時預覽 (Editor)
- [ ] Task 7 - 檔案生命週期管理 (新增與刪除功能)

# Change Logs

## Task 1 - 專案基礎腳手架與環境設定
### Summary
完成了 `tiny-wiki` 的基礎架構搭建，包含 Node.js (Express) 後端與 Vue 3 (Vite) 前端。設定了開發環境的 Proxy，使前端能透明地存取後端 API。
### Changed Files
- tiny-wiki/package.json
- tiny-wiki/server/index.js
- tiny-wiki/server/package.json
- tiny-wiki/client/package.json
- tiny-wiki/client/vite.config.js
- tiny-wiki/client/src/App.vue
- tiny-wiki/scratch/check_harness.sh
### Notes
- 已驗證 `/api/hello` 通訊正常。
- 專案根目錄可以使用 `npm run dev` 同時啟動前後端。
