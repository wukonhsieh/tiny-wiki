# Todo List

- [x] Task 1 - 安裝套件並整合 KaTeX 數學公式渲染
- [ ] Task 2 - 實作 Mermaid placeholder 輸出與 mermaidPatcher
- [ ] Task 3 - 整合至 WikiReader 與 WikiEditor，新增 CSS 樣式

# Change Logs

## Task 1 - 安裝套件並整合 KaTeX 數學公式渲染

### Summary
安裝 `markdown-it-texmath` 與 `katex` 套件，並在 `markdown.js` 的 `MarkdownIt` 實例上以 `.use(tm, { engine: katex, delimiters: 'dollars', katexOptions: { throwOnError: false } })` 整合 KaTeX plugin。`$...$` inline 與 `$$...$$` block 公式均正確渲染為 KaTeX HTML，fenced code block 內容受保護不被處理。新增 3 個 math 測試，25 tests 全數通過。

### Changed Files
- `client/package.json` — 新增 `markdown-it-texmath`、`katex` 依賴
- `client/src/utils/markdown.js` — import tm/katex/katex CSS，初始化後 `.use(tm, ...)` 整合 plugin
- `client/src/utils/markdown.test.js` — 新增 Math-AC-1 ~ Math-AC-3 測試

### Notes
- `throwOnError: false` 確保公式語法錯誤時 fallback 顯示原文，不拋出例外
- KaTeX CSS 透過 `import 'katex/dist/katex.min.css'` 在 markdown.js 引入，Vite 會自動處理
