# Project Plan

## 規劃摘要

- **目標:** 為 tiny-wiki 新增 KaTeX 數學公式與 Mermaid 圖表渲染支援，與 Obsidian 語法相容，覆蓋 WikiReader 及 WikiEditor Preview 兩個 component。
- **假設:**
  - 數學公式使用 KaTeX（透過 `markdown-it` plugin 整合），Plugin 確切套件在 Task 1 執行時依相容性確認。
  - Mermaid 採用與 `embedPatcher` 一致的 post-processing DOM patch 模式，在 Vue `nextTick` 後執行。
  - 現有 `processWikiSyntax()` 的 code block 保護邏輯（fenced code block pass-through）不干擾數學公式解析，因為 KaTeX plugin 在 markdown-it 層處理，早於 `processWikiSyntax`。
- **風險:**
  - `markdown-it-texmath` vs `@iktakahiro/markdown-it-katex` 套件相容性需在 Task 1 驗證，若有問題需切換。
  - Mermaid 套件體積較大（~2MB），若有 bundle size 考量可改用 CDN 引入，但本計畫預設 npm 安裝。
  - `processWikiSyntax` 的 combined regex 對 `$...$` 語法的交互影響需在 Task 1 測試中確認。

---

## 任務清單

### Task 1 - 安裝套件並整合 KaTeX 數學公式渲染

- **為什麼現在做:**
  數學公式渲染完全在 `markdown-it` plugin 層處理，不依賴 DOM post-processing，是最獨立的單元，可先驗收再進行 Mermaid 工作。

- **目標:**
  讓 `renderMarkdown()` 輸出的 HTML 中，`$...$` inline 與 `$$...$$` block 數學公式均被渲染為 KaTeX HTML，並且現有 wikilink / embed 功能的 regression 測試全數通過。

- **背景 / 依賴:**
  - `client/src/utils/markdown.js`：當前的 `markdown-it` 初始化點，需新增 plugin。
  - `client/src/utils/markdown.test.js`：現有測試套件，需新增 math 測試並確保 regression 通過。
  - `client/index.html` 或 Vite 入口點：需引入 KaTeX CSS stylesheet。
  - 無其他前置依賴任務。

- **粗略作法:**
  1. 在 `client/` 安裝 `katex` 與 `markdown-it-texmath`（或 `@iktakahiro/markdown-it-katex`），確認版本相容性。
  2. 在 `markdown.js` 的 `MarkdownIt` 初始化後，`.use()` 加入 KaTeX plugin，設定 inline delimiter `$...$` 與 block delimiter `$$...$$`。
  3. 在 `client/index.html`（或 `main.js`）引入 KaTeX CSS。
  4. 在 `markdown.test.js` 新增測試：inline 公式輸出含 KaTeX class、block 公式以 block element 輸出、原有 wikilink/embed/code block regression 全數通過。

- **驗證方式:**
  `cd client && npm test` 全數通過，包含新增的 math 測試與現有 regression。

- **風險 / 備註:**
  若 `markdown-it-texmath` 與當前 markdown-it v14 有相容問題，改用 `@iktakahiro/markdown-it-katex`。
  需確認 `processWikiSyntax` 的 combined regex 不誤匹配 `$...$` 中的 `[[` 語法（邊界情境）。

---

### Task 2 - 實作 Mermaid placeholder 輸出與 mermaidPatcher

- **為什麼現在做:**
  KaTeX 整合完成後，可獨立處理 Mermaid 的兩個子工作：（a）讓 `markdown.js` 將 mermaid code block 輸出為 placeholder；（b）建立 `mermaidPatcher.js` 負責 DOM patch。兩者合為一個 commit，因為 placeholder 格式由 patcher 消費，分開沒有獨立可驗收的意義。

- **目標:**
  `renderMarkdown()` 對 ` ```mermaid ` block 輸出可辨識的 placeholder HTML；`mermaidPatcher.js` 能找到該 placeholder 並以 Mermaid 渲染為 SVG；語法錯誤時顯示 styled error message 而非崩潰。

- **背景 / 依賴:**
  - 依賴 Task 1（markdown-it 整合穩定後再修改 highlight function，避免反覆改同一檔案）。
  - `client/src/utils/markdown.js`：需修改 `highlight` function，偵測 `lang === 'mermaid'` 時輸出 `<div class="mermaid-placeholder">` 而非 hljs highlighted code。
  - `client/src/utils/embedPatcher.js`：參考架構，新建 `mermaidPatcher.js`。
  - `client/src/utils/embedPatcher.test.js`：參考測試模式，新建 `mermaidPatcher.test.js`。

- **粗略作法:**
  1. 安裝 `mermaid` npm 套件。
  2. 修改 `markdown.js` 的 `highlight` function：當 `lang === 'mermaid'` 時，回傳 `<div class="mermaid-placeholder">${md.utils.escapeHtml(str)}</div>`，跳過 hljs。
  3. 新建 `client/src/utils/mermaidPatcher.js`：
     - `initMermaid()` 初始化 Mermaid（僅執行一次，lazy init）。
     - `patchMermaid(container)` 找出 container 內所有 `.mermaid-placeholder`，對每個元素呼叫 `mermaid.render(uniqueId, graphDefinition)`，將回傳的 SVG 替換原 placeholder。
     - 錯誤時在原位置插入 `<div class="mermaid-error">` 顯示錯誤訊息。
  4. 新建 `mermaidPatcher.test.js`（jsdom 環境）：測試 placeholder 被正確替換、錯誤狀態正確顯示（可 mock `mermaid.render`）。

- **驗證方式:**
  `cd client && npm test` 全數通過，包含新增的 mermaidPatcher 測試與所有 regression。

- **風險 / 備註:**
  Mermaid `render()` API 在 v10+ 為非同步（回傳 Promise），需用 `Promise.allSettled` 並行處理多個圖表。
  Mermaid 初始化設定建議加上 `startOnLoad: false` 避免自動掃描 DOM。

---

### Task 3 - 整合至 WikiReader 與 WikiEditor，新增 CSS 樣式

- **為什麼現在做:**
  `mermaidPatcher` 建好後，最後一步是將其接入兩個 Vue component，並補齊數學公式與圖表的視覺樣式，讓功能對使用者完整可見。

- **目標:**
  WikiReader 閱讀模式與 WikiEditor Preview 均能正確渲染數學公式與 Mermaid 圖表；math block 置中顯示；Mermaid SVG 有適當容器樣式；error 狀態有 styled 提示；所有現有測試通過；手動瀏覽器驗收可操作。

- **背景 / 依賴:**
  - 依賴 Task 2（`mermaidPatcher.js` 存在且通過測試）。
  - `client/src/components/WikiReader.vue`：需 import `patchMermaid`，在 `fetchFileContent` 完成後的 `nextTick` 呼叫（與 `patchEmbeds` 並行）。
  - `client/src/components/WikiEditor.vue`：需 import `patchMermaid`，在 `watch(renderedHtml)` 的 `nextTick` 回呼中呼叫（與 `patchEmbeds` 並行）。
  - 兩個 component 的 `<style scoped>`：新增 CSS。

- **粗略作法:**
  1. 在 `WikiReader.vue` import `patchMermaid`，在渲染後的 `nextTick` block 中呼叫 `patchMermaid(markdownBodyRef.value)`，與 `patchEmbeds` 並排。
  2. 在 `WikiEditor.vue` 同樣 import 並呼叫，位置在 `watch(renderedHtml)` → `nextTick` → `patchEmbeds` 旁。
  3. 在兩個 component 的 `:deep(.markdown-body)` 樣式區塊新增：
     - `.katex-display`：`display: block; text-align: center; margin: 1em 0;`
     - `.mermaid-container`（或直接 `.mermaid-placeholder` 替換後的 wrapper）：`overflow-x: auto; margin: 1em 0;`
     - `.mermaid-error`：灰色虛線框 + 紅色文字，風格參考現有 `.embed-broken`。
  4. `npm run build` 確認無 TypeScript / Vite 編譯錯誤。

- **驗證方式:**
  1. `cd client && npm test` 全數通過（regression）。
  2. `npm run build` 無錯誤。
  3. 手動瀏覽器測試：新增含 `$E=mc^2$`、`$$\int$$` block、` ```mermaid flowchart ` 的 note，在 WikiReader 與 WikiEditor Preview 均正確渲染。

- **風險 / 備註:**
  WikiReader 的 `markdownBodyRef` 命名需確認（與 WikiEditor 的 `previewBodyRef` 不同）；執行時以實際 codebase 為準。
  Mermaid SVG 在 scoped CSS 下可能需要 `:deep(...)` 穿透，參考現有 embed 樣式處理方式。
