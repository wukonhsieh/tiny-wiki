# Requirements Spec: tiny-wiki (Iteration 2)

## Project Summary
### 簡述
`tiny-wiki` 是一個輕量級的個人 Wiki 系統，旨在讓使用者能夠透過 Web 界面管理本地資料夾中的 Markdown 筆記。它結合了 Node.js 的後端處理能力與 Vue 3 的現代化開發體驗，將指定的資料夾視為一個 Repository，直接在磁碟上進行讀寫。本迭代 (Iteration 2) 著重於優化使用者體驗、編輯流程及介面美觀性。

### 目標
- 提供簡單直覺的介面來瀏覽、搜尋及組織 Markdown 文件的目錄結構。
- 實現「編輯即所得」的流暢體驗，優化預覽與編輯的切換流程。
- 確保資料主權，所有筆記均以標準 Markdown 格式存儲在本地。
- **(New)** 提升介面現代感，採用扁平化設計 (Flat Design) 的圖示。
- **(New)** 支援響應式佈局 (Responsive Design)，適應不同桌面視窗大小。

### 假設
- 使用者已安裝 Node.js 環境。
- 系統啟動時會指定一個本地路徑作為 Root Repository。
- 主要運行於單機環境，不需要複雜的使用者權限管理或雲端同步。

## User Requirements
- 使用者需要能夠在左側側邊欄看見整個 Repository 的資料夾與檔案結構。
- 使用者需要能夠切換「閱讀 (Preview)」與「編輯 (Edit)」模式，預設進入為 Preview 模式。
- **(New)** 使用者需要透過頁面頂部中央的 Toggle 按鈕快速切換 Preview / Edit 模式。
- **(New)** 在 Edit 模式下，若內容有修改（Dirty State），頁面頂端需浮現 Notification Bar 提醒使用者儲存，並提供儲存按鈕。
- **(New)** 使用者需要能夠使用快捷鍵 `Ctrl + S` 進行儲存。
- **(New)** 使用者需要在側邊欄的資料夾上點擊右鍵 (Context Menu)，以在該目錄下建立新資料夾或新頁面。
- **(New)** 使用者不需要手動重新整理檔案樹按鈕，直接依靠瀏覽器重新整理即可。
- **(New)** 頁面的大標題應自動提取 Markdown 檔案的第一行作為 Title。
- 使用者需要能夠處理多層級的目錄結構，以便分類筆記。

## Use Cases
### Use Case 1 - 瀏覽與閱讀 Wiki
- **Actor**: 一般使用者
- **Trigger**: 使用者開啟瀏覽器進入首頁並點擊側邊欄檔案
- **Outcome**: 進入 Preview 模式，右側顯示渲染後的 HTML 內容，並將 Markdown 第一行自動擷取顯示為頁面標題。

### Use Case 2 - 透過右鍵選單新增檔案/資料夾
- **Actor**: 一般使用者
- **Trigger**: 使用者在側邊欄的特定資料夾上點擊右鍵
- **Outcome**: 出現 Context Menu，提供 "Create a new folder" 與 "Create a New Page" 選項。選擇後，新項目將建立在被點擊的資料夾層級之下。

### Use Case 3 - 編輯與存檔流程
- **Actor**: 一般使用者
- **Trigger**: 使用者點擊頂部中央的 Preview / Edit Toggle 切換至 Edit 模式
- **Outcome**: 進入編輯模式，當使用者開始修改內容時，頂端滑出 Notification Bar 提示有未儲存的變更。使用者可點擊 Bar 上的 Save 按鈕或按下 `Ctrl + S` 存檔。存檔成功後，Notification Bar 消失。

## Functional Requirements
1. **後端檔案管理**: 系統應透過 Node.js `fs` 模組遞迴掃描指定目錄，將目錄樹結構轉換為 JSON 回傳。支援基於相對路徑的 CRUD 操作。
2. **Markdown 解析與標題擷取**: 系統應將 Markdown 第一行文字解析為頁面 Title 顯示於頂部，其餘內容渲染為 HTML。
3. **視圖切換與狀態管理**:
    - 頂部需配置置中的 Toggle 控制項。
    - 編輯區需具備未儲存狀態 (isDirty) 追蹤，以控制 Notification Bar 顯示。
4. **快捷鍵綁定**: 監聽全域或編輯區內的 `Ctrl+S` (或 `Cmd+S`) 事件觸發存檔 API。
5. **Context Menu 實作**: 攔截側邊欄資料夾的右鍵事件 (`contextmenu`)，顯示自訂選單並處理相對路徑的新增邏輯。
6. **響應式與扁平化設計**: 佈局需使用 Flexbox/Grid 確保在不同桌面視窗寬度下比例正確，並移除舊有 emoji 圖示，改用現代扁平化 SVG 或字體圖示。

## Technical Specifications
- **Programming Language**: JavaScript
- **Framework**: Frontend: Vue 3 (Vite), Backend: Node.js (Express)
- **Runtime / Platform**: Node.js 18+ / 現代桌面瀏覽器
- **Database / Storage**: Local Filesystem
- **3rd-party Packages**:
    - `markdown-it` (Markdown 渲染)
    - `highlight.js` (程式碼高亮)
    - 可選：扁平化圖示庫 (如 Phosphor Icons, Heroicons 或自訂 SVG)
- **Assumptions / Notes**:
    - 移除原本側邊欄的 Refresh 按鈕。
    - 不包含行動裝置 (Mobile) 的極端小螢幕適配，僅針對桌面端不同視窗大小優化。
