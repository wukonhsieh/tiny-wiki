## 規劃摘要
- 目標: 將 `tiny-wiki` 的本地系統從單一 Repository 升級為支援多個 Repositories 共同瀏覽與管理。
- 假設:
  - 傳入的 `REPO_PATH` 環境變數將採用逗號分隔的絕對路徑或相對路徑（例如：`/path/A,/path/B`）。
  - 後端 API 與前端 UI 皆需同時兼顧「單一路徑」與「多重路徑」的情境，以保持回溯相容性。
- 風險:
  - **路徑越權存取漏洞**：後端處理寫讀功能 (`resolveSafePath`) 時，多路徑安全驗證可能出現漏洞。
  - **路徑識別混亂**：如果多個 Repo 存在相同的文件或路徑結構，API 返回與前端 UI 的 `path` 追蹤必須準確綁定其所屬的 Root Repository。

---

## 任務清單

### Task 1 - 後端支援多 Repo 路徑解析與驗證
- 為什麼現在做: 一切後續架構 (Tree API, File API) 都依賴正確的路徑解析與安全性。
- 目標: 讓伺服器能讀取逗號分隔的 `REPO_PATH`，並升級 `resolveSafePath` 來驗證與處理多重合法路徑。
- 背景 / 依賴: `server/index.js` 的 `REPO_PATH` 讀取邏輯、`resolveSafePath` 函數。
- 粗略作法: 
  - 將 `process.env.REPO_PATH` 以 `,` 拆分成陣列，並存入全域陣列常數。
  - 修改 `resolveSafePath(reqPath)`，使其能夠比對傳入的 `reqPath` 是否落在「任何一個」已設定合法的 Repository 陣列當中。
- 驗證方式: 在設定兩個不同的路徑後啟動伺服器，對這兩個路徑內的文件進行 Get / Post 測試皆能成功；發送未經授權的路徑（如 `../../etc/passwd`）則被有效阻擋。
- 風險 / 備註: 路徑遍歷 (Path Traversal) 漏洞需謹慎防範，尤其是在前/後端合併與拆分 Path 字串的地方。

### Task 2 - 調整 Tree API 結構支援多根目錄
- 為什麼現在做: 前端 Sidebar 渲染目錄樹完全依賴 Tree API 的 JSON 結構。
- 目標: 使 `/api/tree` 能夠根據指定的 Repo 數量回傳正確的層級結構。
- 背景 / 依賴: 依賴 Task 1 的多路徑變數管理。
- 粗略作法:
  - 數量 `= 1`：呼叫 `getTree(repos[0])`，維持原本邏輯。
  - 數量 `> 1`：建立一個虛擬的「根節點」或陣列。遞迴呼叫 `getTree` 將各個 Repo 的結果加入其中，`name` 使用該 Repo 的資料夾名稱 (Basename)。
  - 確保各子項目的 `path` 能夠被明確反查回對應的實體 Repo 絕對路徑。
- 驗證方式: 使用多路徑啟動時，呼叫 `/api/tree` 會獲得具有多個 Root Nodes 的 JSON。
- 風險 / 備註: 各個 Repo 可能會有一樣的 basename，在構建前端用的唯一 Key 時需要留意。

### Task 3 - 升級其他 API Endpoint 支援多 Repo
- 為什麼現在做: 內部連結、搜尋 (Resolve) 若未升級，會無法找到第二個 Repo 之後的內容。
- 目標: 讓 `/api/resolve` 的找檔邏輯可以遍歷所有設定的 Repositories。
- 背景 / 依賴: 依賴 Task 1 和 Task 2。
- 粗略作法:
  - 修改 `/api/resolve` 中的遞迴搜尋函數，依據設定的路徑順序迭代所有的 Repositories (`repos` array)。
  - 遇到相同名稱文件時回傳第一個找到的結果。
- 驗證方式: `GET /api/resolve?name=file_in_repo2` 能夠正確找到對應檔案的路徑。
- 風險 / 備註: 若資料夾過大，逐一掃描所有 Repo 的耗時會增加，這部分可暫時接受，未來需考慮快取。

### Task 4 - 調整 Sidebar UI 呈現與全域右鍵攔截
- 為什麼現在做: 所有的後端資料就緒，前端介面需要匹配多 Repo 的特性與限制。
- 目標: 左側 Sidebar 正確顯示第一層的各個 Repo 名稱，當 `isMultiRepo = true` 時，停止在空白處的右鍵新增功能。
- 背景 / 依賴: 依賴 Task 2，主要在 `client/src` 中負責 Tree 的渲染組件 (可能在 `App.vue` 或專門子組件)。
- 粗略作法:
  - 讀取到多 Repo 結構後，顯示資料夾外觀。
  - 若探測到回傳為多 Repo 模式結構，將 Sidebar 外層容器的全域的 `@contextmenu` 事件加上阻擋條件，發出禁止或是忽略空白區域右鍵行為。
- 驗證方式: 啟動多 Repo 時，畫面上會多出 Repository 的第一層級，在側邊欄空白處按右鍵，不再跳出「新增」選單。
- 風險 / 備註: 需注意 Vue 的事件冒泡機制，可能需要對不同子節點使用 `@contextmenu.stop` 單獨攔截。

### Task 5 - 將新增檔案選單 (Context Menu) 綁定至特定節點
- 為什麼現在做: 關閉全域空白處新增後，必須補回讓使用者可以在各別 Repo 內新增檔案與資料夾的能力。
- 目標: 右鍵點擊任一 Repo 目錄或之下的子目錄/檔案時，Context Menu 能開啟，且其目標路徑 `targetPath` 正確對應。
- 背景 / 依賴: 依賴 Task 4。
- 粗略作法:
  - 把 Context Menu 觸發邏輯從 Sidebar 根元件往下移動，監聽到「節點本身 (Node)」上。
  - 當點擊節點右鍵時，提取該節點的專屬 Path 並寫入建立檔案的請求（POST `/api/file`）中。
- 驗證方式: 對第一個 Repo 的資料夾按右鍵選擇新增，檔案順利出現在第一個 Repo 資料夾內；對第二個 Repo 進行同樣操作，能順利出現在第二個裡面。
- 風險 / 備註: 因為路徑解析邏輯變複雜，需小心測試前端傳送的 Path 對後端的 Payload 格式要求（如要求含 Repo Root 的字首還是純相對路徑）。
