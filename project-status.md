- [x] Task 1 - 後端支援多 Repo 路徑解析與驗證
- [x] Task 2 - 調整 Tree API 結構支援多根目錄
- [x] Task 3 - 升級其他 API Endpoint 支援多 Repo
- [x] Task 4 - 調整 Sidebar UI 呈現與全域右鍵攔截
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

## Task 2 - 調整 Tree API 結構支援多根目錄

### Summary
升級了目錄樹 API，支援將多個 Repositories 整合進單一 JSON 結構。

### Changed Files
- `server/index.js`
- `scratch/task-2-harness.js` (Added)

### Notes
- 單一 Repo 模式下行為保持不變。
- 多 Repo 模式下會自動生成虛擬 `root` 節點。
- 每個 Repo 子樹的 root `path` 會包含其資料夾名稱作為前綴，例如 `/wiki-name/...`。

## Task 3 - 升級其他 API Endpoint 支援多 Repo

### Summary
升級了 `/api/resolve` 搜尋接口，支援跨多個 Repositories 的檔案名搜尋與 Wikilink 解析。

### Changed Files
- `server/index.js`
- `scratch/task-3-harness.js` (Added)

### Notes
- 採用順序遍歷優先級。
- 回傳路徑已標準化，包含 Repo Basename 前綴。

## Task 4 - 調整 Sidebar UI 呈現與全域右鍵攔截

### Summary
實作了前端 Sidebar 的多 Repo 偵測邏輯，並在多 Repo 模式下封鎖了側邊欄空白處的全域右鍵選單。

### Changed Files
- `client/src/components/Sidebar.vue`

### Notes
- 引入了 `isMultiRepo` 計算屬性。
- 修改了 `@contextmenu` 事件的動態觸發邏輯。
