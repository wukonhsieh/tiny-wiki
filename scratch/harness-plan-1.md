# Harness Plan — Task 1

## 建議建立的護欄清單

| AC 編號 | 護欄形式 | 工具 | 預期輸出 |
|---------|---------|------|---------|
| AC-1 | Integration test（HTTP POST + 檔案系統驗證） | Node.js script + `fetch` + `FormData` | `{ filename: "test.png", path: "folder1/attachments/test.png" }`，且檔案實際存在 |
| AC-2 | Integration test（同名衝突改名） | Node.js script + `fetch` + `FormData` | 第二次回傳 `filename: "test_1.png"`，原始 `test.png` 仍存在 |
| AC-3 | Integration test（路徑穿越防護） | Node.js script + `fetch` | HTTP 400，檔案系統無異動 |
| AC-4 | Integration test（缺少 file 欄位） | Node.js script + `fetch` | HTTP 400 |
| AC-5 | Integration test（自動建立 attachments/） | Node.js script + `fetch` + `fs.access` | `attachments/` 目錄自動建立，檔案成功寫入 |

所有 AC 均可自動化。測試腳本需要伺服器已在 `localhost:3000` 啟動，並使用真實的 vault 目錄（`repository/`）作為測試沙盒。

## Domain Invariants

- `resolveSafePath()` 必須在所有寫入操作前被呼叫；任何繞過驗證的路徑寫入都應視為嚴重錯誤
- 衝突改名不得覆蓋既有檔案；改名後兩個檔案必須同時存在
- `path` 回傳值格式必須與現有 `/api/file?path=` 格式一致（`/` 分隔，相對 vault root）

## Contract Tests

`POST /api/upload` 的 response schema：
```json
{ "filename": "<string>", "path": "<string>" }
```
- 成功時 HTTP 200，body 含 `filename`（字串）與 `path`（字串）
- 失敗時 HTTP 400 或 500，body 含 `error`（字串）

測試腳本需驗證 response body 欄位存在且型別正確，避免後續 Task 3 整合時因 schema 不一致而靜默出錯。

## 快速執行命令

```bash
# 需先啟動 server（另一個 terminal）
cd server && node index.js

# 執行 harness
node scratch/task-1-harness-upload.js
```

測試腳本執行完畢後自動清理測試產生的 `repository/folder1/attachments/` 目錄內的測試檔案。
