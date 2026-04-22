# Requirements Spec

## Project Summary

### 簡述

tiny-wiki 是一個基於 Vue 3 + Node.js 的個人 wiki 閱讀器，目前支援 Obsidian 的 `[[...]]` wikilink 語法（點擊後跳轉至對應 note）。本次 iteration 目標是新增 Obsidian 的 `![[...]]` embed 語法支援，讓使用者在 wiki 頁面中可以直接嵌入圖片、影片，以及用特殊樣式顯示 note heading 引用，其餘資源類型則退化為下載連結。

### 目標

在不破壞現有 wikilink 行為的前提下，讓 `![[...]]` 語法在渲染時產生正確的嵌入內容，包含圖片、影片、note heading 引用區塊，以及通用資源下載連結。

### 假設

- 靜態資源（圖片、影片、PDF 等）與 `.md` 筆記檔案放在同一個 repository 目錄下，可透過現有 `/api/file` API 讀取。
- Note heading embed（`![[Note Name#Heading]]`）採簡化版：不實際 fetch 並擷取 heading 內容，而是渲染為帶有連結的引用樣式 callout 區塊。
- 圖片、影片的路徑解析邏輯與現有 wikilink 的 `/api/resolve` 一致（先嘗試直接路徑，再遞迴搜尋檔名）。

---

## User Requirements

- 使用者需要能在 note 內嵌入圖片，使其在閱讀頁面中直接顯示。
- 使用者需要能在 note 內嵌入影片，使其在閱讀頁面中直接播放。
- 使用者需要能為嵌入的圖片或影片指定顯示尺寸（寬度，或寬 x 高）。
- 使用者需要能在 note 內引用另一篇 note 的特定 heading，並以視覺上明顯的引用區塊呈現，且可點擊跳轉。
- 使用者需要能在 note 內嵌入不支援預覽的資源（如音訊、PDF），系統應提供下載連結供使用者取用。
- 使用者需要上述所有嵌入語法與現有的 `[[...]]` wikilink 語法共存，不互相干擾。

---

## Use Cases

### Use Case 1 - 嵌入圖片

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `![[image.png]]` 或 `![[folder/image.png]]`
- **Outcome:** 閱讀頁面中渲染出對應圖片，圖片依原始尺寸顯示

### Use Case 2 - 嵌入指定尺寸的圖片

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `![[image.png|300]]` 或 `![[image.png|300x200]]`
- **Outcome:** 閱讀頁面中渲染出對應圖片，並套用指定的寬度或寬高

### Use Case 3 - 嵌入影片

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `![[video.mp4]]` 或附帶尺寸如 `![[video.mp4|300x200]]`
- **Outcome:** 閱讀頁面中渲染出 HTML5 video 播放器，可在頁面內直接播放，並套用指定尺寸（若有）

### Use Case 4 - 引用 Note Heading（簡化版）

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `![[Note Name#Heading]]`
- **Outcome:** 閱讀頁面中渲染出一個引用樣式 callout 區塊，顯示 note 名稱與 heading，並提供可點擊連結跳轉至該 note

### Use Case 5 - 嵌入不支援預覽的資源

- **Actor:** 閱讀 wiki 的使用者
- **Trigger:** Note 內容包含 `![[audio.mp3]]`、`![[document.pdf]]` 等非圖片、非影片、非 note 的資源
- **Outcome:** 閱讀頁面中渲染出一個下載連結，顯示檔案名稱，供使用者點擊下載

---

## Functional Requirements

1. The system shall detect `![[...]]` embed 語法，並與 `[[...]]` wikilink 語法明確區分，兩者互不干擾。
2. The system shall 根據 embed 目標的副檔名判斷 embed 類型：
   - 圖片類型（`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`）→ 渲染為 `<img>` 元素
   - 影片類型（`.mp4`, `.webm`, `.ogg`）→ 渲染為 `<video>` 元素
   - 包含 `#` 的目標（`Note Name#Heading`）→ 渲染為 note heading 引用區塊
   - 其他副檔名 → 渲染為下載連結
3. The system shall 解析 `|` 後的尺寸參數：
   - 只有一個數字（如 `|300`）→ 設定為寬度，高度依原始比例縮放
   - 兩個數字（如 `|300x200`）→ 分別設定為寬度與高度
4. The system shall 對圖片與影片的路徑，透過現有的 `/api/resolve` API 解析實際路徑，取得可存取的資源 URL。
5. The system shall 渲染圖片 embed 為 `<img>` 元素，src 指向解析後的資源路徑，並套用尺寸屬性（若有）。
6. The system shall 渲染影片 embed 為 `<video>` 元素，含 controls 屬性，src 指向解析後的資源路徑，並套用尺寸屬性（若有）。
7. The system shall 渲染 note heading embed（`![[Note Name#Heading]]`）為視覺上有別於正文的引用樣式 callout 區塊，區塊內顯示 note 名稱與 heading 文字，並提供可點擊的 wikilink 連結跳轉至該 note。
8. The system shall 渲染其他資源 embed 為帶有資源名稱的下載連結（`<a download>`），使用者點擊後觸發瀏覽器下載行為。
9. The system shall 在圖片或影片資源路徑無法解析時，以 broken embed 的視覺提示（例如顯示灰色佔位區塊與檔案名稱）代替空白或錯誤。

---

## Technical Specifications

- **Programming Language:** JavaScript
- **Framework:** Vue 3（frontend），Express（backend）
- **Runtime / Platform:** Node.js（server）、瀏覽器（client）
- **Build Tool:** Vite
- **Markdown Parser:** markdown-it（現有）
- **主要修改範圍:**
  - `client/src/utils/markdown.js`：新增 `![[...]]` regex 處理邏輯，在 `[[...]]` wikilink 正規表達式之前先行比對並轉換為對應 HTML 或 placeholder
  - `client/src/components/WikiReader.vue`：新增對 embed 元素的 CSS 樣式（圖片、影片、note heading callout、下載連結）；若採非同步解析路徑方案，需處理渲染後的 DOM patch
- **資源路徑解析:** 沿用現有 `/api/resolve` API，不需新增 backend endpoint
- **Assumptions / Notes:**
  - 圖片與影片的路徑解析需非同步呼叫 API，markdown-it render 為同步流程，因此建議在 render 時先產生帶有 `data-embed` 屬性的 placeholder 元素，再於 Vue 的 `nextTick` 或 `watch` 中非同步替換實際 src
  - Note heading embed 採簡化版（callout 樣式 + 連結），不實際 fetch note 內容，因此可在 render 時同步產生 HTML，無需非同步處理
