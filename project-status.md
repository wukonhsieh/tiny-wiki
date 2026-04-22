# Todo List

- [x] Task 1 - 建立 `![[...]]` embed 語法解析器
- [x] Task 2 - 實作圖片與影片 embed 非同步渲染
- [ ] Task 3 - 實作 Note Heading Callout、下載連結與整體 embed 樣式

# Change Logs

## Task 1 - 建立 `![[...]]` embed 語法解析器

### Summary

在 `markdown.js` 中以 single-pass combined regex 同時處理 embed 語法、wikilink 語法，並保護 fenced code block 與 inline code 內的內容不被誤轉換。新增 Vitest 測試套件，10 個測試全數通過（8 個 embed AC + 2 個 wikilink regression）。

### Changed Files

- `client/package.json` — 新增 `"test": "vitest run"` script
- `client/src/utils/markdown.js` — 重構 `renderMarkdown`，新增 `processWikiSyntax` 函式，實作 embed 語法解析
- `client/src/utils/markdown.test.js` — 新增 Vitest 測試檔（AC-1 ~ AC-8 + regression x2）

### Notes

- 圖片與影片 embed 輸出 `<span class="embed-placeholder" data-embed-type="..." data-embed-src="..." data-embed-size="...">` placeholder，供 Task 2 非同步 patch
- Note heading callout 與下載連結已在本 task 輸出最終 HTML，CSS 樣式留待 Task 3
- fenced code block 以 `(```[\s\S]*?```)` 保護，但巢狀 code fence（罕見）尚未處理，若日後需要可升級為 stateful parser

## Task 2 - 實作圖片與影片 embed 非同步渲染

### Summary

新增 `client/src/utils/embedPatcher.js`，實作 `patchEmbeds(container, repo, fetchFn)` 與 `parseSize()` 工具函式。`WikiReader.vue` 在每次 `fetchFileContent` 完成後呼叫 `nextTick`，再對 `.markdown-body` 執行 `patchEmbeds`，以 `Promise.allSettled` 並行解析所有 placeholder，替換為 `<img>` 或 `<video>`；解析失敗顯示 `.embed-broken`。新增 Vitest jsdom 測試（12 tests），累計 22 tests 全數通過。

### Changed Files

- `client/src/utils/embedPatcher.js` — 新增，實作 `patchEmbeds` 與 `parseSize`
- `client/src/utils/embedPatcher.test.js` — 新增，jsdom 環境 12 tests
- `client/src/components/WikiReader.vue` — import `patchEmbeds`、`nextTick`，於 `fetchFileContent` 完成後呼叫

### Notes

- CSS 樣式（`.embed-image`、`.embed-video`、`.embed-broken`、`.embed-callout`、`.embed-download`）留待 Task 3
- `fetchFn` 可注入設計讓測試完全不依賴網路，方便 CI 執行
