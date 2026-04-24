# Project Plan

## 規劃摘要

- **目標:** 在 tiny-wiki 中新增 Obsidian `![[...]]` embed 語法支援，涵蓋圖片、影片、note heading 引用區塊（簡化 callout）、其他資源下載連結四種類型
- **假設:**
  - 靜態資源（圖片、影片等）與 `.md` 筆記同存於 repository 目錄，可透過現有 `/api/resolve` + `/api/file` 取得
  - Note heading embed 採簡化版：渲染為帶連結的 callout 區塊，不 fetch note 內容
  - 圖片與影片路徑解析為非同步操作，需在 Vue `nextTick` 後以 DOM patch 方式注入實際 src
  - markdown-it 的 render pipeline 為同步，因此 image/video embed 在解析階段先輸出 placeholder，後續 patch 處理
- **風險:**
  - `![[...]]` regex 若在 code block 內容中誤觸發，會破壞程式碼範例的顯示，需在 code block 保護後再處理
  - 多個圖片/影片同時 async resolve 時，需確保 DOM patch 時序正確，避免 race condition
  - `/api/resolve` 目前以檔名搜尋，同名資源可能解析到錯誤路徑

---

## 任務清單

### Task 1 - 建立 `![[...]]` embed 語法解析器

- **為什麼現在做:** 所有後續 embed 功能都依賴此解析邏輯，必須優先建立；且此 task 純粹修改 `markdown.js`，不牽涉 Vue 元件，是風險最低的切入點
- **目標:** 讓 `markdown.js` 的 `renderMarkdown` 函式能正確識別並轉換 `![[...]]` 語法，輸出帶有足夠資訊的 HTML，供後續 Vue 層消費
- **背景 / 依賴:**
  - 現有 `markdown.js` 以 regex 處理 `[[...]]` wikilink，需確保 `![[...]]` 的 regex 在 `[[...]]` 之前執行，避免被吃掉
  - markdown-it 在處理前已將 code block 內容保護，但自訂 pre-process 需自行排除 fenced code block（\`\`\`...```）與 inline code（`` `...` ``）區段
- **粗略作法:**
  - 在 `renderMarkdown` 中，先以 regex 保護 code block 內容（可暫時替換成佔位符再還原），再執行 `![[...]]` 的替換
  - 解析 `![[target|size]]` 或 `![[target]]`，其中 size 格式為 `300` 或 `300x200`
  - 依副檔名或 `#` 判斷類型：
    - 圖片（`.png/.jpg/.jpeg/.gif/.svg/.webp`）→ 輸出 `<span data-embed-type="image" data-embed-src="..." data-embed-size="..."></span>` placeholder
    - 影片（`.mp4/.webm/.ogg`）→ 輸出 `<span data-embed-type="video" ...></span>` placeholder
    - 包含 `#` 的目標 → 直接輸出 note heading callout HTML（`<div class="embed-callout">`）
    - 其他 → 直接輸出下載連結 HTML（`<a class="embed-download" href="/api/file?path=..." download>`）
- **驗證方式:** 在測試 note 中寫入各類型 `![[...]]`，打開 DevTools 確認 DOM 中出現正確的 placeholder/HTML 結構；確認在 fenced code block 內的 `![[...]]` 未被轉換
- **風險 / 備註:** code block 保護的實作細節需小心，建議先跑現有 wikilink 相關手動測試確認沒有 regression

---

### Task 2 - 實作圖片與影片 embed 非同步渲染

- **為什麼現在做:** Task 1 只產生 placeholder，此 task 補完圖片與影片的實際渲染，讓使用者看到有意義的內容
- **目標:** 在 `WikiReader.vue` 中，於每次 `renderedHtml` 更新後，找出所有 image/video placeholder，非同步呼叫 `/api/resolve` 取得實際路徑，再以 `<img>` 或 `<video>` 元素取代 placeholder；套用尺寸屬性，並處理路徑無法解析的 broken embed 情況
- **背景 / 依賴:**
  - 依賴 Task 1 產出的 `data-embed-type` / `data-embed-src` / `data-embed-size` placeholder
  - 現有 `WikiReader.vue` 的 `handleLinkClick` 已示範了 `/api/resolve` 的呼叫方式，可沿用相同模式
  - Vue 需在 `renderedHtml` 賦值後的 `nextTick` 才能操作 DOM
- **粗略作法:**
  - 在 `fetchFileContent` 完成、`renderedHtml.value` 更新後，呼叫 `nextTick`，再 `querySelectorAll('[data-embed-type]')` 找出所有 placeholder
  - 對每個 placeholder 以 `Promise.all` 並行 fetch `/api/resolve?name=...&repo=...`
  - 成功解析後，依 `data-embed-type`：
    - `image` → 建立 `<img>` 元素，設定 `src`、`width`/`height`（依 size 格式），加上 `class="embed-image"`
    - `video` → 建立 `<video controls>` 元素，加上 `<source src="...">` 子元素，設定尺寸，加上 `class="embed-video"`
  - 解析失敗時（404 或 network error）→ 以 `<span class="embed-broken">` 取代，顯示檔案名稱與灰色提示樣式
  - 以 `placeholder.replaceWith(element)` 替換 DOM
- **驗證方式:**
  - 在 repository 放入測試圖片與影片，note 中寫入 `![[image.png]]`、`![[image.png|300]]`、`![[image.png|300x200]]`、`![[video.mp4]]`
  - 確認圖片正常顯示且尺寸正確；確認影片可在頁面內播放
  - 測試不存在的檔案 `![[nonexistent.png]]`，確認顯示 broken embed 提示而非空白
- **風險 / 備註:** `replaceWith` 在 Vue v-html 管理的 DOM 上直接操作屬於 imperative patch，需確認不會在 reactive re-render 時導致異常；建議每次 `renderedHtml` 改變時重新執行一次 patch 流程

---

### Task 3 - 實作 Note Heading Callout、下載連結與整體 embed 樣式

- **為什麼現在做:** Task 1 已在 render 時輸出了 callout 與下載連結的 HTML 結構，此 task 補完 CSS 樣式與互動行為，讓所有 embed 類型在視覺上都有完整呈現
- **目標:**
  - Note heading callout（`![[Note Name#Heading]]`）顯示為視覺明顯的引用區塊，含 note 名稱與 heading 文字，可點擊跳轉
  - 其他資源（`.mp3`、`.pdf` 等）顯示為帶有檔名的下載連結，點擊觸發瀏覽器下載
  - 所有 embed 元素（圖片、影片、callout、下載連結）有一致的視覺風格
- **背景 / 依賴:**
  - 依賴 Task 1 輸出的 `.embed-callout`、`.embed-download` class 與 HTML 結構
  - 依賴 Task 2 產出的 `.embed-image`、`.embed-video`、`.embed-broken` class
  - Callout 內的連結需被 `handleLinkClick` 攔截，走 wikilink 解析流程（已有現成邏輯，確認 `data-wikilink="true"` 屬性存在即可）
- **粗略作法:**
  - 在 `WikiReader.vue` 的 `<style scoped>` 中，以 `:deep(...)` 新增各類型 embed 的樣式：
    - `.embed-image`：`max-width: 100%`、block display、適當的 margin
    - `.embed-video`：`max-width: 100%`、block display
    - `.embed-callout`：左側 border accent、`background: var(--accent-bg)`、padding、含 icon 的 callout 外觀
    - `.embed-download`：帶有附件/下載 icon 的連結樣式，使用與 wikilink 相似的顏色體系
    - `.embed-broken`：灰色背景、虛線 border、顯示檔案名稱，視覺上明顯是佔位符而非空白
  - 確認 Task 1 產出的 callout HTML 中的連結帶有 `data-wikilink="true"` 與 `href` 為 note 路徑，確保 `handleLinkClick` 能正常攔截
- **驗證方式:**
  - 瀏覽器中確認各 embed 類型的視覺呈現符合預期
  - 點擊 callout 連結，確認跳轉至對應 note
  - 點擊下載連結，確認瀏覽器觸發下載行為
  - 確認 embed 樣式在深色/淺色模式下均正常顯示（使用現有 CSS 變數）
- **風險 / 備註:** 下載連結的 `href` 需指向 `/api/file?path=...&repo=...` 並加上 `download` 屬性，但 `path` 此時尚未 resolve（Task 1 是 sync 階段），若目標為相對路徑可能需要 best-effort 組裝；若不確定，可先以檔名作為 link label，等未來有需求再補 async resolve
