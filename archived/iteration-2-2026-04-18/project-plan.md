# Project Plan: tiny-wiki (Iteration 2)

## Phase 1: 基礎 UI 重構與響應式
- [ ] Task 1 - 前端 - 扁平化圖示替換與 Sidebar 清理
  - **Goal**: 移除所有舊版 Emoji 圖示，改用現代扁平化設計（如 Lucide Icons 或 Heroicons SVG）；移除 Sidebar 原本的 Refresh 按鈕。
  - **Harness**: `bash tiny-wiki/scratch/check_task_1.sh` (確認 Emoji 被移除，替換為 SVG 元件)。
- [ ] Task 2 - 前端 - 響應式佈局 (Responsive Layout)
  - **Goal**: 調整 `App.vue` 與側邊欄的 CSS，使用 Flex/Grid 確保在桌面端不同視窗寬度下，側邊欄與主要內容區的寬度分配正常（不包含極端行動版尺寸）。
  - **Harness**: 人工 UI 驗證（確保視窗縮放時無破版）。

## Phase 2: 閱讀體驗升級
- [ ] Task 3 - 前端 - Markdown 標題自動擷取
  - **Goal**: 在 `WikiReader.vue` 渲染前，擷取 Markdown 原始碼的第一行（通常是 `# Title`）作為頁面的大標題獨立顯示，其餘內容則正常渲染 HTML。
  - **Harness**: `bash tiny-wiki/scratch/check_task_3.sh` (驗證 Title 是否從原始碼中正確分離)。

## Phase 3: 編輯流程重構
- [ ] Task 4 - 前端 - 頂部 Preview/Edit Toggle 切換
  - **Goal**: 廢除雙欄預覽，在主要內容區頂部中央加入 Toggle UI（Preview / Edit）。預設進入 Preview 模式。點擊 Toggle 時，動態切換 `WikiReader` 與單欄編輯文字框。
  - **Harness**: `bash tiny-wiki/scratch/check_task_4.sh` (驗證 Toggle 狀態與組件切換邏輯)。
- [ ] Task 5 - 前端 - 未儲存提示 (Notification Bar) 與快捷鍵
  - **Goal**: 在編輯模式下，若內容發生變動 (`isDirty=true`)，網頁最上方需滑出 Notification Bar 提示儲存。綁定 `Ctrl+S` / `Cmd+S` 快捷鍵以呼叫儲存 API。
  - **Harness**: `bash tiny-wiki/scratch/check_task_5.sh` (驗證 `isDirty` 狀態變化及事件監聽)。

## Phase 4: 進階檔案管理
- [ ] Task 6 - 前端 - 側邊欄右鍵選單 (Context Menu)
  - **Goal**: 在資料夾節點攔截原生的右鍵事件 (`@contextmenu.prevent`)，並在游標位置彈出包含 "Create a new folder" 與 "Create a New Page" 的自訂選單 UI。
  - **Harness**: 人工 UI 驗證（確認選單能正確觸發並定位）。
- [ ] Task 7 - 前端 - 整合右鍵新增 API
  - **Goal**: 讓右鍵選單的新增操作可以自動將目標路徑設置為被點擊的資料夾之下，並調用 `POST /api/file` 或 `POST /api/directory`。
  - **Harness**: `bash tiny-wiki/scratch/check_task_7.sh` (模擬選單點擊並檢查 API 請求路徑是否正確對齊特定資料夾)。
