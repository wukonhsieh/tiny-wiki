# Harness Plan — Task 2

## 建議建立的護欄清單

| AC 編號 | 護欄形式 | 工具 | 預期輸出 |
|---------|---------|------|---------|
| AC-1 | 手動確認（視覺） | 瀏覽器 | 拖曳檔案進 textarea 時出現高亮橫線 |
| AC-2 | 手動確認（視覺） | 瀏覽器 | 橫線跟著滑鼠移動到不同行 |
| AC-3 | 手動確認（視覺） | 瀏覽器 | 滑鼠離開 textarea 後橫線消失 |
| AC-4 | 手動確認 + console 驗證 | 瀏覽器 DevTools | 放開後橫線消失、console 印出行索引與檔名、瀏覽器未開啟檔案 |
| AC-5 | Unit test（行號計算邏輯） | Vitest | 捲動補正後行索引計算正確 |
| AC-6 | 手動確認 | 瀏覽器 | 拖曳純文字選取時不顯示橫線 |

**說明**：AC-1 ~ AC-4、AC-6 為純視覺 / 瀏覽器互動行為，無法在 headless 環境中自動化，標記為手動確認。AC-5 的行號計算邏輯為純函式，可獨立 unit test，提取為 `calcDropLine(clientY, rect, scrollTop, lineHeight, lineCount)` 後以 Vitest 測試。

## Domain Invariants

- `dropTargetLine` 的值必須永遠 ≥ 0 且 ≤ `lineCount - 1`（clamp 不得超出實際行數）
- 當 `dataTransfer.files.length === 0` 時，`isDragging` 必須保持 `false`，`dropTargetLine` 不得被設定

## Contract Tests

本 task 不觸及任何 API 或資料合約邊界（上傳 API 屬於 Task 3）。

Task 2 唯一的對外接口是：實作完成後，`WikiEditor.vue` 需向 Task 3 提供：
- `dropTargetLine`（ref，Number）— 拖曳目標行索引
- `isDragging`（ref，Boolean）— 拖曳中狀態

這兩個 ref 不需要正式 contract test，但實作時應確保命名穩定，讓 Task 3 可直接引用。

## 快速執行命令

```bash
# Unit test（行號計算邏輯）
cd client && npx vitest run src/utils/dropLine.test.js

# 手動確認流程（需先啟動 dev server）
cd .. && npm run dev
# 瀏覽器開啟 http://localhost:5173，進入任一 wiki page 的 Edit Mode，
# 拖曳一個本機檔案到 textarea，依 AC-1 ~ AC-6 逐項確認
```
