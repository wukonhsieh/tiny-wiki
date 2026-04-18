# Requirements Spec: tiny-wiki

## Project Summary
### 簡述
`tiny-wiki` 是一個輕量級的個人 Wiki 系統，旨在讓使用者能夠透過 Web 界面管理本地資料夾中的 Markdown 筆記。它結合了 Node.js 的後端處理能力與 Vue 3 的現代化開發體驗，將指定的資料夾視為一個 Repository，直接在磁碟上進行讀寫。

### 目標
- 提供簡單直覺的介面來瀏覽、搜尋及組織 Markdown 文件的目錄結構。
- 實現「編輯即所得」的流暢體驗，支援 Markdown 純文字編輯與即時預覽。
- 確保資料主權，所有筆記均以標準 Markdown 格式存儲在本地。

### 假設
- 使用者已安裝 Node.js 環境。
- 系統啟動時會指定一個本地路徑作為 Root Repository。
- 主要運行於單機環境，不需要複雜的使用者權限管理或雲端同步。

## User Requirements
- 使用者需要能夠在左側側邊欄看見整個 Repository 的資料夾與檔案結構。
- 使用者需要能夠切換「閱讀」與「編輯」模式，以便流暢地查看或修改內容。
- 使用者需要能夠在編輯時看見即時的 Markdown 渲染預覽。
- 使用者需要能夠新增檔案或資料夾，並能刪除不再需要的 Wiki 頁面。
- 使用者需要能夠處理多層級的目錄結構，以便分類筆記。

## Use Cases
### Use Case 1 - 瀏覽與閱讀 Wiki
- **Actor**: 一般使用者
- **Trigger**: 使用者開啟瀏覽器進入首頁
- **Outcome**: 使用者看到左側檔案樹，點擊任一 Markdown 檔案後，右側顯示渲染後的 HTML 內容。

### Use Case 2 - 新增 Wiki 頁面
- **Actor**: 一般使用者
- **Trigger**: 使用者點擊導覽列或側邊欄的「新增頁面」按鈕
- **Outcome**: 系統在指定位置創建新的 `.md` 檔案，使用者進入編輯模式進行初始撰寫。

### Use Case 3 - 編輯並存檔
- **Actor**: 一般使用者
- **Trigger**: 使用者在閱讀模式點擊「編輯」按鈕
- **Outcome**: 右側介面切換為雙欄位（左：Markdown 原始碼，右：實時預覽），點擊「儲存」後，Node.js Server 更新磁碟上的實體檔案。

### Use Case 4 - 刪除 Wiki
- **Actor**: 一般使用者
- **Trigger**: 使用者點擊檔案樹旁的「刪除」圖示
- **Outcome**: 系統跳出確認視窗，確認後刪除該磁碟檔案，檔案樹同步更新。

## Functional Requirements
1. **後端檔案管理**: 系統應透過 Node.js `fs` 模組遞迴掃描指定目錄，並將目錄樹結構轉換為 JSON 回傳給前端。
2. **Markdown 渲染**: 系統應支援將 Markdown 語法轉換為標準 HTML（支援標題、列表、代碼塊、表格等）。
3. **模式切換**: 系統應提供全域狀態管理（如 Pinia 或簡單的 Reactive State）來控制當前頁面處於閱讀、預覽或編輯狀態。
4. **實時更新**: 在編輯模式下，內容變動應立即反映在預覽區域。
5. **持久化存儲**: 所有編輯操作應直接寫入磁碟，確保無資料遺失風險。
6. **多層級導覽**: 側邊欄應支援展開與收合資料夾，正確呈現巢狀目錄。

## Technical Specifications
- **Programming Language**: JavaScript / TypeScript
- **Framework**: Frontend: Vue 3 (Vite), Backend: Node.js (Express 或 Fastify)
- **Runtime / Platform**: Node.js 18+ / 現代瀏覽器
- **Database / Storage**: Local Filesystem (以 Markdown 檔案直接存儲)
- **3rd-party Packages**:
    - `markdown-it` 或 `marked` (Markdown 渲染)
    - `highlight.js` (程式碼高亮)
    - `chokidar` (可選：用於監控磁碟變動即時更新 UI)
- **Assumptions / Notes**:
    - 前端與後端通訊使用 RESTful API。
    - 編輯器使用標準 HTML `<textarea>` 或輕量級控制項（如 Codemirror）。
