# Requirements Spec: Multiple Repositories Support

## Project Summary
### 簡述
本需求旨在讓 `tiny-wiki` 的本地端系統從「單一 Git Repository」升級為「支援多個 Repositories」的管理模式。
### 目標
允許使用者透過單次啟動，同時瀏覽與管理多來源的筆記庫。左側 Sidebar 將能呈現多個 Repositories 作為根節點，並調整對應的右鍵選單互動邏輯以支援跨資料夾的新增操作。
### 假設
- 配置此功能的輸入格式為逗號分隔的路徑字串（例如：`/path/A,/path/B`）。
- 為了維持現有使用習慣，若僅輸入單一 Repository，整體的 Sidebar 結構與操作流程應維持完全回溯相容。

## User Requirements
- 使用者需要能夠在應用程式的啟動配置中，一次傳入多個 Repository 的路徑。
- 使用者需要在左側的 Sidebar 中，清楚辨識出不同的 Repository，以便在不混淆的情況下瀏覽各別的筆記結構。
- 使用者需要在特定的 Repository 內部，透過右鍵選單輕鬆新增筆記或目錄，並確保建立在正確的 Repository 底下。
- 若使用者僅傳入一個 Repository，系統應保持與舊版相同的使用者體驗，不增加額外的節點層級。

## Use Cases
### Use Case 1 - 瀏覽多個 Repositories
- **Actor**: 一般使用者
- **Trigger**: 使用者以包含多個逗號分隔路徑的設定啟動 `tiny-wiki`。
- **Outcome**: 左側 Sidebar 的最上層會顯示各個 Repository 的資料夾名稱（Basename）。使用者可以展開每一個節點，查看各別 Repository 內部的筆記結構。

### Use Case 2 - 在特定的 Repository 新增筆記
- **Actor**: 一般使用者
- **Trigger**: 使用者在 Sidebar 中的「某個特定 Repository 節點」或是「其內部的任何子目錄/檔案」上點擊右鍵。
- **Outcome**: 系統顯示右鍵選單（Context Menu），允許使用者在該 Repository 範圍內新增筆記或資料夾。

### Use Case 3 - 嘗試在空白處新增筆記（無效操作）
- **Actor**: 一般使用者
- **Trigger**: 在載入多個 Repositories 的情況下，使用者在 Sidebar 下方的空白區域點擊右鍵。
- **Outcome**: 系統不會顯示新增檔案的右鍵選單（選單無效/被停用），以防止系統無法判斷新增檔案應歸屬於哪一個 Repository。

### Use Case 4 - 啟動單一 Repository（回溯相容）
- **Actor**: 一般使用者
- **Trigger**: 使用者僅傳入一個 Repository 路徑。
- **Outcome**: Sidebar 第一層直接顯示該 Repository 裡面的內容（沒有額外的 Repository 根節點），且使用者可以如同舊版一樣，在 Sidebar 任何空白處點擊右鍵來新增檔案。

## Functional Requirements
1. 系統必須能夠解析以逗號 `,` 分隔的路徑字串，並驗證每個路徑的有效性。
2. 當解析出的路徑數量 `> 1` 時，系統必須切換為「多 Repo UI 模式」。
3. 在「多 Repo UI 模式」下，左側 Sidebar 的第一層節點必須顯示為各個 Repository 的最後一層資料夾名稱（Basename）。若有同名，系統應有適當的處理（如 Hover 顯示完整路徑 Tooltip）。
4. 在「多 Repo UI 模式」下，Sidebar 空白區域的右鍵事件必須被攔截或停用，不顯示全域的新增選單。
5. 在「多 Repo UI 模式」下，右鍵選單（Context Menu）必須綁定在各個 Repository 節點本身以及其子節點上，且新增的檔案必須寫入對應的 Repository 路徑。
6. 當解析出的路徑數量 `= 1` 時，系統必須沿用舊版的 Sidebar 樹狀結構與空白處右鍵綁定邏輯。

## Technical Specifications
- **Input Strategy**: 啟動時的參數或環境變數解析邏輯需從 `string` 變更為 `string[]`。
- **UI Component (Sidebar)**: 需根據 Repository 數量動態決定根節點的渲染方式。
- **Context Menu Handling**: 事件監聽器需區分事件觸發的目標元素。在多 Repo 環境下，應阻擋冒泡至外層容器的預設右鍵行為，將狀態機中的目標路徑強制綁定於當下 Focus 的 Node。
- **Assumptions / Notes**:
  - 此階段不涉及內部搜尋（Search）或是 Git 操作（Commit/Push）的跨 Repo 邏輯，僅聚焦於介面渲染與檔案新增操作的歸屬問題。
