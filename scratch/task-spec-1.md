# Task Spec — Task 1

## Goal

在 `server/index.js` 新增 `POST /api/upload` endpoint，能夠接收 multipart/form-data 格式的單一檔案上傳，將檔案寫入目標資料夾下的 `attachments/` 子目錄，並在同名衝突時自動改名，最終回傳實際儲存的檔名與相對 vault root 的路徑。

## Non-Goals

- 不處理前端的 drag-and-drop 邏輯（屬於 Task 2、Task 3）
- 不新增多檔案批次上傳能力
- 不修改現有 `/api/file` endpoint
- 不在本 task 調整 Preview renderer 對 embed 語法的支援
- 不實作上傳進度回報（streaming / SSE）

## Functional Spec

- **Input**：multipart/form-data POST request，包含：
  - `file`：binary 檔案（任意類型）
  - `targetDir`：字串，目標資料夾路徑（相對 vault root，例如 `notes` 或 `folder1/subfolder`）
  - `repo`：整數字串，vault index（與現有 API 的 `repo` 參數相同）

- **Output**：JSON 物件：
  - 成功：`{ filename: "photo_1.png", path: "notes/attachments/photo_1.png" }`
  - 失敗：`{ error: "..." }` 加上對應 HTTP status code

- **State Transitions**：
  1. 驗證 `targetDir` 合法性：透過現有 `resolveSafePath(targetDir, repo)` 確認路徑在 vault 內
  2. 計算 `attachmentsDir = <resolvedTargetDir>/attachments/`
  3. 建立 `attachmentsDir`（若不存在，`mkdir recursive`）
  4. 衝突偵測：若 `attachmentsDir/<originalFilename>` 已存在，在副檔名前加 `_1`、`_2` ... 直到找到不衝突的名稱
  5. 將檔案寫入 `attachmentsDir/<finalFilename>`
  6. 回傳 `{ filename, path }`，其中 `path` 格式為 `<targetDir>/attachments/<finalFilename>`

- **Rules**：
  - `targetDir` 未通過 `resolveSafePath` 驗證時回傳 400
  - `file` 欄位缺失時回傳 400
  - 改名上限：最多嘗試 `_1` 到 `_999`；超過上限回傳 500
  - 回傳的 `path` 以 `/` 為分隔符，與現有 `/api/file?path=` 格式一致

## Constraints

- 只修改 `server/index.js` 與 `server/package.json`（新增 `multer` dependency）
- 使用 `multer` 的 `diskStorage` 處理上傳，不使用 `memoryStorage`（避免大檔案佔用記憶體）
- 路徑驗證必須沿用現有 `resolveSafePath()`，不能繞過安全檢查
- 不引入任何其他新 npm 套件

## Acceptance Criteria

1. Given `targetDir=folder1` 與一張 `test.png`
   When POST `/api/upload` with repo=0
   Then 回傳 200、`{ filename: "test.png", path: "folder1/attachments/test.png" }`，且檔案實際存在於對應路徑

2. Given `attachments/` 中已有 `test.png`
   When 再次上傳同名 `test.png`
   Then 回傳 `{ filename: "test_1.png", path: "folder1/attachments/test_1.png" }`，且原始 `test.png` 未被覆蓋

3. Given `targetDir` 為嘗試路徑穿越的值（例如 `../../etc`）
   When POST `/api/upload`
   Then 回傳 400 且伺服器檔案系統未被修改

4. Given request 缺少 `file` 欄位
   When POST `/api/upload`
   Then 回傳 400 與錯誤訊息

5. Given `attachmentsDir` 不存在
   When 上傳任意檔案
   Then `attachments/` 目錄自動建立，檔案成功寫入
