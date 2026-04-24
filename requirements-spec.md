# Requirements Spec

## Project Summary

### 簡述

tiny-wiki 是一個基於 Vue 3 + Node.js 的個人 wiki 閱讀器，使用 `markdown-it` 作為 Markdown 渲染引擎。本次 iteration 目標是新增兩種 Obsidian 相容的進階語法支援：**數學公式**（KaTeX）與 **Mermaid 繪圖**，並確保閱讀模式（WikiReader）與編輯器預覽模式（WikiEditor Preview）均能正確渲染。

### 目標

- 讓使用者可在 note 中撰寫 KaTeX 數學公式（inline 與 block），並在渲染後顯示為正確的數學符號。
- 讓使用者可在 note 中撰寫 Mermaid 圖表語法（支援所有 Mermaid 類型），並在渲染後顯示為對應的 SVG 圖形。
- 新語法與 Obsidian 的數學公式及 Mermaid 語法完全相容。
- 閱讀模式（WikiReader）與編輯模式的 Preview 側欄（WikiEditor）均支援上述新語法。

### 假設

- 數學公式渲染引擎採用 **KaTeX**（透過 `markdown-it` plugin 整合），不使用 MathJax。
- Mermaid 採用官方 `mermaid` npm 套件，以 client-side 方式渲染，不依賴後端。
- 現有的 `renderMarkdown()` 函式（`client/src/utils/markdown.js`）為主要修改點；`WikiReader.vue` 與 `WikiEditor.vue` 透過同一函式渲染，因此兩者同步受益。
- Mermaid 的渲染採用與 `embedPatcher` 相似的 post-processing 模式（DOM patch），在 Vue `nextTick` 後對目標容器內的 `<code class="language-mermaid">` block 執行渲染。
- 渲染失敗時（語法錯誤）顯示 styled error message，不讓頁面崩潰。

---

## User Requirements

- 使用者需要能在 note 中以 `$...$` 撰寫 inline 數學公式，閱讀時顯示為正確的數學符號。
- 使用者需要能在 note 中以 `$$...$$`（獨立區塊）撰寫 block 數學公式，閱讀時以置中區塊方式顯示。
- 使用者需要能在 note 中以 ` ```mermaid ` code block 撰寫 Mermaid 圖表，閱讀時顯示為 SVG 圖形。
- 使用者需要上述語法在 WikiReader 閱讀模式與 WikiEditor Preview 模式中均能正確渲染。
- 使用者需要在公式或圖表語法錯誤時，能看到明確的錯誤提示，而非空白或頁面崩潰。

---

## Use Cases

### Use Case 1 - 閱讀含 inline 數學公式的 note

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `$E = mc^2$` 之類的 inline 公式
- **Outcome:** 閱讀頁面中公式渲染為正確的數學符號，與周圍文字在同一行顯示

### Use Case 2 - 閱讀含 block 數學公式的 note

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `$$\int_0^\infty f(x)dx$$` 之類的獨立公式區塊
- **Outcome:** 閱讀頁面中公式以獨立置中區塊渲染，與正文分開顯示

### Use Case 3 - 閱讀含 Mermaid flowchart 的 note

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 ` ```mermaid ` block，內容為 flowchart 語法
- **Outcome:** 閱讀頁面中渲染出對應的流程圖 SVG，不顯示原始文字

### Use Case 4 - 閱讀含 Mermaid class diagram 的 note

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 ` ```mermaid ` block，內容為 class diagram 語法
- **Outcome:** 閱讀頁面中渲染出對應的類別圖 SVG

### Use Case 5 - 編輯模式 Preview 同步顯示公式與圖表

- **Actor:** 編輯 note 的使用者
- **Trigger:** 使用者在 WikiEditor 左側輸入含公式或 Mermaid 語法的 Markdown
- **Outcome:** 右側 Preview 側欄即時渲染對應的數學公式或圖表

### Use Case 6 - 公式或圖表語法錯誤時的處理

- **Actor:** 使用者
- **Trigger:** Note 內容含有語法錯誤的公式（如 `$\invalidcmd$`）或無效的 Mermaid 語法
- **Outcome:** 對應位置顯示 styled error message，頁面其餘內容正常顯示，不崩潰

---

## Functional Requirements

1. The system shall 支援 inline 數學公式語法 `$...$`，渲染為 KaTeX inline 元素。
2. The system shall 支援 block 數學公式語法 `$$...$$`，渲染為 KaTeX block 元素（置中顯示）。
3. The system shall 支援 Obsidian 相容的數學公式語法，即單行 `$$...$$` 與多行 `$$\n...\n$$` 均可正確解析。
4. The system shall 對 ` ```mermaid ` fenced code block 攔截，不渲染為一般 `<pre><code>` 區塊，而是交由 Mermaid 渲染為 SVG。
5. The system shall 支援所有 Mermaid 官方語法類型（包含但不限於 flowchart、class diagram、sequence diagram、ER diagram、Gantt chart）。
6. The system shall 在 Mermaid 渲染完成後，以 SVG 取代原始 code block 的位置，保持頁面版面正常。
7. The system shall 在 KaTeX 渲染失敗時，顯示 styled error message（標示公式原文與錯誤說明），頁面不崩潰。
8. The system shall 在 Mermaid 渲染失敗時，顯示 styled error message（標示圖表類型與錯誤說明），頁面不崩潰。
9. The system shall 確保數學公式與 Mermaid 語法不干擾現有的 `[[...]]` wikilink 與 `![[...]]` embed 語法。
10. The application must 在 WikiReader 閱讀模式與 WikiEditor Preview 模式中，均正確渲染數學公式與 Mermaid 圖表。

---

## Technical Specifications

- **Programming Language:** JavaScript (ES Module)
- **Framework:** Vue 3
- **Runtime / Platform:** Browser (client-side rendering)
- **Math Rendering Library:** KaTeX（透過 `markdown-it-texmath` 或 `@iktakahiro/markdown-it-katex` plugin 整合至現有 `markdown-it` 實例）
- **Diagram Rendering Library:** Mermaid（官方 `mermaid` npm 套件）
- **Markdown Engine:** 現有 `markdown-it`（`client/src/utils/markdown.js`），新增 plugin 擴充
- **Mermaid Rendering 方式:** Post-processing DOM patch（在 Vue `nextTick` 後對 `.markdown-body` 內的 mermaid placeholder 執行 `mermaid.render()`），與現有 `embedPatcher` 模式一致
- **主要修改檔案:**
  - `client/src/utils/markdown.js` — 整合 KaTeX plugin、將 mermaid code block 輸出為可辨識的 placeholder
  - `client/src/utils/mermaidPatcher.js` — 新增，負責 post-process mermaid placeholder 為 SVG
  - `client/src/components/WikiReader.vue` — 引入並呼叫 `mermaidPatcher`
  - `client/src/components/WikiEditor.vue` — 引入並呼叫 `mermaidPatcher`
  - `client/package.json` — 新增 KaTeX 與 Mermaid 相依套件
- **Assumptions / Notes:**
  - KaTeX plugin 的確切套件名稱（`markdown-it-texmath` vs `@iktakahiro/markdown-it-katex`）於 Task planning 階段根據套件相容性確認
  - Mermaid 圖表 ID 需唯一（可用遞增 counter 或 crypto.randomUUID() 產生），避免同頁多圖衝突
  - 數學公式的 CSS（KaTeX stylesheet）需在 `index.html` 或 Vite 入口點引入
