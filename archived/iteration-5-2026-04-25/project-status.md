# Todo List

- [x] Task 1 - 安裝套件並整合 KaTeX 數學公式渲染
- [x] Task 2 - 實作 Mermaid placeholder 輸出與 mermaidPatcher
- [x] Task 3 - 整合至 WikiReader 與 WikiEditor，新增 CSS 樣式

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

## Task 2 - 實作 Mermaid placeholder 輸出與 mermaidPatcher

### Summary
修改 `markdown.js` 的 `highlight` function：偵測 `lang === 'mermaid'` 時輸出 `<div class="mermaid-placeholder">` 而非 hljs 高亮。新建 `mermaidPatcher.js`，lazy init mermaid（`startOnLoad: false`），以 `Promise.allSettled` 並行渲染所有 placeholder；成功時替換為 `.mermaid-container`，失敗時插入 `.mermaid-error`。新增 3 個測試，28 tests 全數通過。

### Changed Files
- `client/package.json` — 新增 `mermaid` 依賴
- `client/src/utils/markdown.js` — highlight function 新增 mermaid placeholder 分支
- `client/src/utils/mermaidPatcher.js` — 新增，實作 `patchMermaid(container)`
- `client/src/utils/mermaidPatcher.test.js` — 新增，3 tests（AC-1 ~ AC-3）

### Notes
- Mermaid render ID 使用 `Date.now() + counter` 確保同頁多圖唯一
- `securityLevel: 'loose'` 允許圖表內含 HTML，與 Obsidian 預設行為一致

## Task 3 - 整合至 WikiReader 與 WikiEditor，新增 CSS 樣式

### Summary
在 `WikiReader.vue` 與 `WikiEditor.vue` 分別 import `patchMermaid`，並在各自的 `nextTick` 區塊內與 `patchEmbeds` 並排呼叫。在兩個 component 的 `<style scoped>` 新增 `.katex-display`（置中）、`.mermaid-container`（overflow-x: auto）、`.mermaid-error`（紅色虛線框）樣式。28 tests 全數通過，`vite build` 成功無編譯錯誤。

### Changed Files
- `client/src/components/WikiReader.vue` — import patchMermaid、nextTick 區塊加入呼叫、新增 CSS
- `client/src/components/WikiEditor.vue` — import patchMermaid、watch(renderedHtml) 加入呼叫、新增 CSS

### Notes
- Build 產生的 chunk size 警告（Mermaid ~434KB、KaTeX ~257KB）屬正常現象，未來可考慮 dynamic import() 優化，不影響功能
- `npm run build` 在 sandbox 內因舊 dist/ 權限問題須先清除目錄；本機執行無此問題
