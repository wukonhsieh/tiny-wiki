# Todo List

- [x] Task 1 - 後端：新增 `POST /api/upload` endpoint
- [ ] Task 2 - 前端：drag-and-drop 事件處理與插入行視覺提示
- [ ] Task 3 - 前端：上傳檔案 + 插入 Markdown 語法

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
