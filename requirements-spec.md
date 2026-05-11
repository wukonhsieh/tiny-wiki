# Requirements Spec

## Project Summary

### 簡述
在 Tiny Wiki 的 Edit Mode 中，支援拖曳本機檔案到編輯器特定行，自動將檔案上傳至當前 wiki page 所屬資料夾的 `attachments/` 子目錄，並在指定行插入對應的 Markdown 語法。

### 目標
讓使用者在不離開編輯器的情況下，快速附加圖片、影片或其他檔案，並自動產生正確的 Markdown 語法，減少手動複製路徑的操作成本。

### 假設
- 編輯器為純文字 `<textarea>` 或等效的 code editor 元件（現有實作）。
- 伺服器端已有寫入 vault 的能力（現有 `POST /api/file`）。
- 需新增一支上傳 binary 檔案的 API endpoint。
- Obsidian 風格影片 embed 語法為 `![[filename]]`，在現有 preview renderer 中已支援或列入本次範圍外。

---

## User Requirements

- 使用者需要能在 Edit Mode 將本機檔案拖曳至編輯器中的任意行位置。
- 使用者需要在拖曳過程中看到明確的視覺提示，知道檔案將插入哪一行的下方。
- 使用者需要檔案自動上傳到當前 page 所在資料夾的 `attachments/` 子目錄，不需要手動選擇上傳路徑。
- 使用者需要同名檔案發生衝突時，系統自動重新命名而非覆蓋，確保既有附件不被意外覆寫。
- 使用者需要上傳完成後，Markdown 語法自動插入拖曳目標行的下一行，不需要手動輸入路徑。
- 使用者需要根據檔案類型自動產生對應的 Markdown 語法（圖片、影片、一般檔案各有不同格式）。

---

## Use Cases

### Use Case 1 - 拖曳圖片插入 wiki
- **Actor**：Wiki 編輯者
- **Trigger**：在 Edit Mode 下，將本機圖片檔（`.png` / `.jpg` / `.gif` / `.webp` / `.svg` 等）拖曳至編輯器某一行上方
- **Outcome**：圖片上傳至 `attachments/`，游標行下方插入 `![filename](relative/path/to/attachments/filename.png)`，Preview 可直接顯示圖片

### Use Case 2 - 拖曳影片插入 wiki
- **Actor**：Wiki 編輯者
- **Trigger**：在 Edit Mode 下，將本機影片檔（`.mp4` / `.webm` / `.mov` 等）拖曳至編輯器某一行上方
- **Outcome**：影片上傳至 `attachments/`，游標行下方插入 `![[filename.mp4]]`（Obsidian embed 語法）

### Use Case 3 - 拖曳一般檔案插入 wiki
- **Actor**：Wiki 編輯者
- **Trigger**：在 Edit Mode 下，將非圖片非影片的檔案（`.pdf` / `.zip` / `.docx` 等）拖曳至編輯器某一行上方
- **Outcome**：檔案上傳至 `attachments/`，游標行下方插入 `[filename.pdf](relative/path/to/attachments/filename.pdf)`

### Use Case 4 - 同名檔案自動改名
- **Actor**：Wiki 編輯者
- **Trigger**：上傳的檔案名稱與 `attachments/` 中既有檔案重複
- **Outcome**：系統自動將新檔案重新命名（例如 `photo_1.png`、`photo_2.png`），再完成上傳並插入 Markdown

### Use Case 5 - 拖曳時顯示插入行提示
- **Actor**：Wiki 編輯者
- **Trigger**：拖曳檔案懸停於編輯器某行上方時
- **Outcome**：該行下方顯示高亮分隔線或插入提示，明確指示新內容將插入的位置

---

## Functional Requirements

1. The system shall detect `dragover` 與 `drop` 事件於 Edit Mode 的編輯器元件上。
2. The system shall 在 `dragover` 期間，根據滑鼠 Y 座標計算最近的行，並在該行下方渲染視覺插入提示（例如高亮橫線）。
3. The system shall 在 `drop` 事件觸發後，讀取拖曳的 `File` 物件並阻止瀏覽器預設行為（避免開啟或下載檔案）。
4. The system shall 根據當前編輯中的 wiki page 路徑，計算 `attachments/` 的目標路徑（與 page 同層資料夾下的 `attachments/` 子目錄）。
5. The system shall 在上傳前檢查 `attachments/` 目錄中是否已存在同名檔案；若衝突，自動在檔名（副檔名前）加上 `_1`、`_2` ... 直到不衝突為止。
6. The system shall 透過新增的 `POST /api/upload` endpoint 將 binary 檔案上傳至指定的 `attachments/` 路徑。
7. The system shall 根據檔案的 MIME type 決定插入的 Markdown 語法：
   - 圖片（`image/*`）：`![filename](relative_path)`
   - 影片（`video/*`）：`![[filename]]`
   - 其他：`[filename](relative_path)`
8. The system shall 將產生的 Markdown 語法插入編輯器中拖曳目標行的下一行（新增一行插入，不覆蓋原有內容）。
9. The system shall 在上傳過程中顯示 loading 狀態或禁用重複上傳，避免使用者重複觸發。
10. The system shall 在上傳失敗時顯示錯誤提示，並且不修改編輯器內容。

---

## Technical Specifications

- **Programming Language**：JavaScript（前端 Vue 3、後端 Node.js）
- **Framework**：Vue 3（前端）、Express 5（後端）
- **Runtime / Platform**：瀏覽器 + Node.js
- **Database / Storage**：本機檔案系統（Vault 資料夾）
- **新增 API**：`POST /api/upload`，接受 `multipart/form-data`，欄位包含 `file`（binary）與 `targetDir`（目標資料夾路徑），回傳實際儲存的檔名與相對路徑
- **3rd-party Packages**：
  - 後端：`multer`（處理 multipart 上傳）
  - 前端：無新增，使用原生 Drag and Drop API
- **Assumptions / Notes**：
  - 影片 embed 語法 `![[filename]]` 目前 Preview renderer 是否支援列為本 iteration 範圍外，先確保語法正確插入。
  - `relative_path` 計算基準為 vault root，與現有 `/api/file?path=` 的路徑格式一致。
