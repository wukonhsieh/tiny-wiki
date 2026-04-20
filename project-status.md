- [x] Task 1 - 後端支援多 Repo 路徑解析與驗證
- [ ] Task 2 - 調整 Tree API 結構支援多根目錄
- [ ] Task 3 - 升級其他 API Endpoint 支援多 Repo
- [ ] Task 4 - 調整 Sidebar UI 呈現與全域右鍵攔截
- [ ] Task 5 - 將新增檔案選單 (Context Menu) 綁定至特定節點

# Change Logs

## Task 1 - 後端支援多 Repo 路徑解析與驗證

### Summary
成功將後端 `REPO_PATH` 解析邏輯升級為支援逗號分隔的多路徑模式，並強化了 `resolveSafePath` 的安全檢查機制。

### Changed Files
- `server/index.js`
- `scratch/task-1-harness.js` (Added)

### Notes
- 目前為了維持相容性，`GET /api/tree` 暫時只回傳第一個 Repo 的目錄樹，這將在 Task 2 中處理。
- 加入了啟動時的路徑檢查，若有無效路徑會印出 Warning。
