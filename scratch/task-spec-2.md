# Task Spec — Task 2

## Goal

在 `WikiEditor.vue` 的 `<textarea>` 上加入 drag-and-drop 事件處理，讓使用者拖曳本機檔案懸停時能看到明確的插入行視覺提示（高亮橫線），放開後提示消失，瀏覽器不會開啟或下載被拖入的檔案。本 task 不執行上傳或插入文字（留給 Task 3）。

## Non-Goals

- 不呼叫 `/api/upload` 或任何上傳 API（屬於 Task 3）
- 不修改 `rawContent`、不插入任何 Markdown 語法（屬於 Task 3）
- 不處理從瀏覽器內部拖曳文字或其他非檔案的 drag 事件
- 不新增任何 npm 套件

## Functional Spec

- **Input**：使用者將本機檔案拖曳至 `<textarea>` 上方，滑鼠在 textarea 範圍內移動

- **Output / 視覺效果**：
  - 拖曳懸停期間：在 textarea 左側或上方顯示一條高亮橫線，位置對應滑鼠最近行的「下方」（即新內容將插入的位置）
  - 拖曳離開或放開後：高亮橫線消失

- **State Transitions**：
  1. `dragenter`（檔案進入 textarea）：設定 `isDragging = true`
  2. `dragover`（滑鼠在 textarea 上移動）：
     - 呼叫 `e.preventDefault()` 阻止瀏覽器預設行為
     - 根據 `e.clientY`、textarea 的 `getBoundingClientRect()`、`scrollTop`、`lineHeight` 計算目標行索引（0-based），存入 `dropTargetLine` ref
  3. `dragleave`（滑鼠離開 textarea）：`isDragging = false`，清除 `dropTargetLine`
  4. `drop`：
     - 呼叫 `e.preventDefault()`
     - `isDragging = false`，清除 `dropTargetLine`
     - `console.log` 目前 `dropTargetLine` 的值與 `e.dataTransfer.files[0]?.name`（供 Task 3 整合確認）

- **Rules**：
  - `lineHeight` 必須從 textarea 的 `getComputedStyle` 動態讀取，不得寫死
  - 行索引計算需加上 `textarea.scrollTop`（捲動補正），確保捲動後結果仍正確
  - 行索引不得超過 textarea 內容的實際行數（clamp 到 `lines.length - 1`）
  - 高亮橫線的垂直位置 = `(dropTargetLine + 1) * lineHeight - scrollTop`（對應目標行下方）
  - 拖曳非檔案內容（例如純文字選取）時，若 `dataTransfer.files.length === 0` 則不顯示提示，並允許瀏覽器預設行為

## Constraints

- 只修改 `client/src/components/WikiEditor.vue`（template、script、scoped style 均可）
- 不引入任何新 npm 套件
- 高亮橫線以 CSS 實作（絕對定位 overlay 或 pseudo-element），不使用 canvas 或 SVG
- 不影響現有的 save、keyboard shortcut 等功能

## Acceptance Criteria

1. Given Edit Mode 已開啟，且 textarea 有內容
   When 使用者拖曳一個本機檔案懸停於 textarea 上
   Then 顯示一條高亮橫線，位置對應滑鼠最近行的下方

2. Given 高亮橫線正在顯示
   When 使用者將滑鼠移往 textarea 的不同行
   Then 高亮橫線跟著移動到新的目標行下方

3. Given 高亮橫線正在顯示
   When 使用者將滑鼠拖曳離開 textarea 範圍
   Then 高亮橫線消失

4. Given 高亮橫線正在顯示
   When 使用者放開滑鼠（drop）
   Then 高亮橫線消失，瀏覽器未開啟或下載被拖入的檔案，console 印出目標行索引與檔名

5. Given textarea 已捲動至中段
   When 使用者拖曳檔案懸停於 textarea 可見區域的某行
   Then 高亮橫線位置與行號均正確反映捲動後的實際行，不偏移

6. Given 使用者拖曳的是瀏覽器內的純文字選取（非檔案）
   When dragover 觸發，`dataTransfer.files.length === 0`
   Then 不顯示高亮橫線，且不阻止瀏覽器預設行為
