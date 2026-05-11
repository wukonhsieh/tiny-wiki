# Todo List

- [x] Task 1 - 後端：新增 `POST /api/upload` endpoint
- [x] Task 2 - 前端：drag-and-drop 事件處理與插入行視覺提示
- [x] Task 3 - 前端：上傳檔案 + 插入 Markdown 語法

# Change Logs

## Task 1 - 後端：新增 `POST /api/upload` endpoint

### Summary
新增 `POST /api/upload` endpoint，使用 `multer` memoryStorage 接收 multipart/form-data 上傳，寫入目標資料夾的 `attachments/` 子目錄。同名衝突時自動在副檔名前加 `_1`、`_2` ... 後綴，最多嘗試 999 次。回傳 `{ filename, path }`，path 格式與現有 `/api/file?path=` 一致。路徑安全驗證沿用既有 `resolveSafePath()`。

### Changed Files
- `server/index.js`
- `server/package.json`
- `server/package-lock.json`
- `scratch/task-1-harness-upload.js`

### Notes
- 使用 `multer` memoryStorage（而非 diskStorage）以簡化動態目標路徑的處理，buffer 寫入由 `fs.writeFile` 完成。
- Harness 全 5 AC 通過（AC-1 ~ AC-5）。

## Task 2 - 前端：drag-and-drop 事件處理與插入行視覺提示

### Summary
在 `WikiEditor.vue` 的 textarea 上加入 drag-and-drop 事件處理。拖曳檔案懸停時根據滑鼠 Y 座標計算目標行（`calcDropLine` utility），顯示 `.drop-indicator` 高亮橫線；dragleave 或 drop 後清除提示。drop 事件 console.log 行號與檔名，供 Task 3 整合。同時修正 Express 5 的 SPA fallback（regex route → `app.use` + `fs.readFile`）與 dotfile path 問題。

### Changed Files
- `client/src/components/WikiEditor.vue`
- `client/src/utils/dropLine.js`
- `client/src/utils/dropLine.test.js`
- `server/index.js`（SPA fallback 修正）
- `scratch/task-spec-2.md`
- `scratch/harness-plan-2.md`

### Notes
- `calcDropLine` 提取為純函式並以 Vitest 測試（6 AC 全過），確保捲動補正邏輯正確。
- SPA fallback 從 regex route（Express 5 不支援）改為 `app.use` + `fs.readFile`，並加上 `dotfiles: 'allow'` 解決 `.claude/worktrees/` 路徑的 send 模組限制。
- 視覺 AC（AC-1 ~ AC-4、AC-6）以瀏覽器模擬拖曳事件驗證，indicator 出現/消失行為正確。

## Task 3 - 前端：上傳檔案 + 插入 Markdown 語法

### Summary
在 `WikiEditor.vue` 的 `onDrop` handler 整合實際上傳邏輯：呼叫 `POST /api/upload`（FormData 含 file/targetDir/repo），根據 MIME type 產生 Markdown 語法（image→`![name](url)`、video→`![[name]]`、其他→`[name](url)`），並以 `computeInsertAt` 計算插入位置（`dropTargetLine+1`，null→末尾），以 `splice` 插入 `rawContent`。上傳中顯示 `.upload-overlay`，防止重複觸發。失敗以 `alert()` 提示。兩個純函式 `buildMarkdownLine`/`computeInsertAt` 提取至 `uploadHelper.js`，Vitest 8 AC 全過。

### Changed Files
- `client/src/components/WikiEditor.vue`
- `client/src/utils/uploadHelper.js`
- `client/src/utils/uploadHelper.test.js`
- `scratch/task-spec-3.md`
- `scratch/harness-plan-3.md`
- `project-status.md`

### Notes
- 圖片和一般檔案使用 `/api/raw?path=VAULT_RELATIVE&repo=N` URL，影片使用 Obsidian `![[filename]]` embed（由 embedPatcher 解析）。
- Vitest 全 8 AC 通過；後端上傳 API 以 curl-equivalent Node fetch 驗證；Vite build 成功無編譯錯誤。
