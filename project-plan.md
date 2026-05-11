# Project Plan

## 規劃摘要

- **目標**：在 WikiEditor 的 Edit Mode 支援拖曳本機檔案，自動上傳至 `attachments/` 並插入對應 Markdown 語法
- **假設**：
  - 後端需新增 `POST /api/upload`（multipart），並安裝 `multer`
  - 前端 textarea 為現有元件，drag-and-drop 以原生 API 實作
  - 影片 embed 語法（`![[]]`）插入正確即可，Preview renderer 是否渲染列為範圍外
  - `relative_path` 格式與現有 `/api/file?path=` 一致（相對 vault root）
- **風險**：
  - textarea 的行號 / Y 座標換算在不同字型、行高、捲動位置下需仔細測試
  - `multer` 的 `dest` 需動態依 `targetDir` 決定，不能用靜態路徑；需搭配 `storage` 自訂設定

---

## 任務清單

### Task 1 - 後端：新增 `POST /api/upload` endpoint

- **為什麼現在做**：所有前端功能都依賴這支 API，需先建立讓後續任務可以整合測試
- **目標**：伺服器能接收 multipart 檔案上傳，寫入正確的 `attachments/` 目錄，並自動解決同名衝突
- **背景 / 依賴**：
  - 現有 `server/index.js` 已有 `resolveSafePath()` 做路徑安全驗證，可沿用
  - 目前只有 `POST /api/file` 處理 JSON 文字，沒有 binary 上傳能力
- **粗略作法**：
  1. 在 `server/` 安裝 `multer`
  2. 設定 `multer` 使用 `diskStorage`，`destination` 動態讀取 request body 的 `targetDir`，並透過 `resolveSafePath` 驗證，再加上 `/attachments/` 子路徑；`filename` 先用原始檔名
  3. 在 handler 內，上傳前先掃描目標目錄是否已有同名檔案，若有則在副檔名前加 `_1`、`_2` ... 直到不衝突，再完成寫入
  4. 回傳 `{ filename, path }` 其中 `path` 為相對 vault root 的路徑
- **驗證方式**：
  - `curl -F "file=@test.png" -F "targetDir=folder1" http://localhost:3000/api/upload` 回傳 200 與正確路徑
  - 重複上傳同名檔案，回傳的 filename 自動帶後綴，原始檔案未被覆蓋
- **風險 / 備註**：`multer` diskStorage 的 `destination` callback 在 `mkdir` 前必須確保目錄存在，需加 `fs.mkdir(..., { recursive: true })`

---

### Task 2 - 前端：drag-and-drop 事件處理與插入行視覺提示

- **為什麼現在做**：視覺提示與行號計算是後續插入邏輯的前置依賴；先單獨驗證 UX 行為
- **目標**：在 `WikiEditor.vue` 的 textarea 上，拖曳檔案懸停時顯示插入行高亮提示，放開後不做任何插入（暫時 log 行號），`dragover` / `drop` 事件正確阻擋瀏覽器預設行為
- **背景 / 依賴**：
  - 現有 `WikiEditor.vue` 的 `<textarea>` 沒有任何 drag 事件
  - 行號計算需根據 textarea 的 `scrollTop`、`lineHeight`、`paddingTop` 與滑鼠 Y 座標推算
- **粗略作法**：
  1. 在 `<textarea>` 上綁定 `@dragover.prevent`、`@dragleave`、`@drop.prevent`
  2. `dragover` handler：計算滑鼠相對 textarea 的 Y 位置，換算出目標行索引（0-based），存入 `dropTargetLine` ref
  3. 在 textarea wrapper 上疊加一個絕對定位的 overlay div，根據 `dropTargetLine` 和 `lineHeight` 計算 top 位置，顯示高亮橫線（僅在 dragging 時顯示）
  4. `dragleave` / `drop` 清除 `dropTargetLine`，隱藏 overlay
  5. `drop` 暫時 `console.log` 行號與 file 名稱
- **驗證方式**：
  - 拖曳任意檔案到 textarea 上，高亮橫線跟著滑鼠移動到對應行
  - 放開後高亮消失，瀏覽器不開啟或下載檔案
  - 捲動 textarea 後再拖曳，行號仍然正確
- **風險 / 備註**：
  - textarea 的行高需動態讀取（`getComputedStyle`），避免寫死
  - overlay 需與 textarea 完全重疊，注意 z-index 與 pointer-events 設定

---

### Task 3 - 前端：上傳檔案 + 插入 Markdown 語法

- **為什麼現在做**：Task 1 與 Task 2 都完成後，可以整合端到端流程
- **目標**：`drop` 事件觸發後，呼叫 `POST /api/upload` 上傳檔案，根據 MIME type 產生正確的 Markdown 語法，插入編輯器目標行的下一行
- **背景 / 依賴**：
  - Task 1 提供 `/api/upload` endpoint
  - Task 2 提供 `dropTargetLine` 行號與 drag 事件框架
  - 當前 wiki page 的路徑來自 `props.path`（例如 `notes/20260511_notes.md`），`targetDir` 為其所在資料夾（`notes`），`attachments/` 子目錄由後端自動建立
  - Markdown `relative_path` 為 `attachments/<filename>`（相對 page 所在目錄），實際 API path 為 `notes/attachments/<filename>`
- **粗略作法**：
  1. `drop` handler 讀取 `event.dataTransfer.files[0]`，若無檔案則 return
  2. 顯示上傳中狀態（`uploading` ref），禁止重複觸發
  3. 計算 `targetDir`：取 `props.path` 的 dirname
  4. 用 `FormData` POST 到 `/api/upload`，帶入 `file`、`targetDir`、`repo`
  5. 根據 `file.type`（MIME）決定 Markdown 語法：
     - `image/*` → `![filename](attachments/filename)`
     - `video/*` → `![[filename]]`
     - 其他 → `[filename](attachments/filename)`
  6. 將語法插入 `rawContent`：找到第 `dropTargetLine` 行結尾，在其後插入換行 + Markdown 語法
  7. 清除 `uploading` 狀態
  8. 上傳失敗時顯示錯誤提示（`alert` 或 toast），不修改 `rawContent`
- **驗證方式**：
  - 拖曳圖片 → `attachments/` 出現圖片檔，編輯器插入 `![...](...)`，Preview 顯示圖片
  - 拖曳影片 → 編輯器插入 `![[filename.mp4]]`
  - 拖曳 PDF → 編輯器插入 `[filename.pdf](...)`
  - 同名圖片再次拖曳 → 出現 `_1` 後綴，原檔案未被覆蓋
  - 插入位置在拖曳目標行的下一行，不覆蓋原有內容
- **風險 / 備註**：
  - `relative_path` 的格式（`attachments/filename` vs 完整 vault 路徑）需與 `embedPatcher.js` 解析邏輯確認相容，避免 Preview 無法顯示圖片
