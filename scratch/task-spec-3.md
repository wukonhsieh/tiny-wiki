# Task Spec — Task 3：前端：上傳檔案 + 插入 Markdown 語法

## Goal
- 在 `WikiEditor.vue` 的 `onDrop` handler 中，完成實際的上傳邏輯：呼叫 `POST /api/upload`，根據檔案 MIME type 決定插入格式，並將 Markdown 語法插入 `rawContent` 的 `dropTargetLine + 1` 行位置。
- 上傳期間顯示 uploading 狀態，防止重複上傳。
- 上傳失敗時顯示錯誤提示，不插入任何內容。

## Non-Goals
- 不處理多檔案同時拖曳（僅取 `e.dataTransfer.files[0]`，Task 2 已確立）
- 不改動後端 `POST /api/upload` 邏輯（Task 1 已完成）
- 不修改 embedPatcher、mermaidPatcher 或任何現有 render pipeline
- 不修改拖曳行視覺提示邏輯（Task 2 已完成）
- 不支援上傳進度條（僅 boolean loading 狀態）

## Functional Spec

### Input
- `e.dataTransfer.files[0]`：使用者拖入的單一檔案
- `props.path`：目前編輯的 markdown 檔案的 vault-relative 路徑（例如 `docs/note.md`）
- `props.repo`：目前的 repo index（Number）
- `dropTargetLine.value`：Task 2 計算出的目標行號（0-based），可能為 `null`

### Output
- 上傳成功：在 `rawContent` 第 `dropTargetLine + 1` 行插入 Markdown 語法
- 上傳失敗：`alert()` 錯誤訊息，rawContent 不變

### Markdown 插入格式規則
根據 `file.type`（MIME type）決定插入格式：

| 類型 | 判斷條件 | 插入格式 |
|------|----------|----------|
| 圖片 | `file.type.startsWith('image/')` | `![filename](/api/raw?path=VAULT_RELATIVE_PATH&repo=REPO)` |
| 影片 | `file.type.startsWith('video/')` | `![[filename]]` |
| 其他 | 其餘所有 MIME type | `[filename](/api/raw?path=VAULT_RELATIVE_PATH&repo=REPO)` |

- `filename`：伺服器回傳的 `response.filename`（已處理衝突重命名）
- `VAULT_RELATIVE_PATH`：伺服器回傳的 `response.path`（vault-root-relative）
- `REPO`：`props.repo`

### targetDir 計算
`targetDir` 為 `props.path` 去掉最後一個路徑段落的部分：
- `'docs/note.md'` → `'docs'`
- `'note.md'`（根目錄）→ `'.'`

```js
const targetDir = props.path.includes('/')
  ? props.path.substring(0, props.path.lastIndexOf('/'))
  : '.';
```

### 插入邏輯
1. 以 `\n` 分割 `rawContent.value` 為 lines array
2. 計算插入位置：`dropTargetLine.value !== null ? dropTargetLine.value + 1 : lines.length`
3. `lines.splice(insertAt, 0, markdownLine)` 插入新行
4. `rawContent.value = lines.join('\n')`

### State Transitions
- `onDrop` 開始 → `isUploading.value = true`，清除 `isDragging` / `dropTargetLine`
- 上傳完成（成功或失敗）→ `isUploading.value = false`
- `isUploading` 期間：若 `onDrop` 再次觸發，立即 return

## Constraints
- 只修改 `client/src/components/WikiEditor.vue`
- 不引入新前端套件，使用瀏覽器原生 `fetch` + `FormData`
- FormData 欄位名稱：`file`（File 物件）、`targetDir`（String）、`repo`（String，需轉型）
- 上傳端點：`POST /api/upload`
- `isUploading` 為 `WikiEditor.vue` 本地 `ref`，不 emit 至父元件
- 錯誤提示使用 `alert()`，與既有 `handleSave` 保持一致

## Acceptance Criteria

1. Given 使用者拖曳一張圖片（MIME `image/png`）到第 2 行
   When drop 完成且上傳成功
   Then `rawContent` 第 3 行出現 `![filename](/api/raw?path=...&repo=0)` 格式字串，filename 為伺服器回傳值

2. Given 使用者拖曳一個影片（MIME `video/mp4`）到任意行
   When drop 完成且上傳成功
   Then 在目標行下一行插入 `![[filename]]` 格式

3. Given 使用者拖曳一個 PDF（MIME `application/pdf`）
   When drop 完成且上傳成功
   Then 在目標行下一行插入 `[filename](/api/raw?path=...&repo=0)` 格式

4. Given 上傳進行中（`isUploading = true`）
   When 另一個 drop 事件觸發
   Then 不重複發送上傳請求（early return）

5. Given 後端回傳非 2xx 狀態
   When drop 事件觸發上傳
   Then 顯示 `alert()` 錯誤提示，`rawContent` 不插入任何內容

6. Given 拖曳目標行為第 0 行
   When drop 完成且上傳成功
   Then Markdown 插入在索引 1（即第 0 行之後）

7. Given `dropTargetLine.value === null`
   When drop 完成且上傳成功
   Then Markdown 插入到 `rawContent` 末尾
