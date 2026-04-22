# Todo List

- [x] Task 1 - 建立 `![[...]]` embed 語法解析器
- [ ] Task 2 - 實作圖片與影片 embed 非同步渲染
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
