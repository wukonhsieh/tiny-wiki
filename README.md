# Tiny Wiki

一個極簡、優雅且具備設計感的 Markdown 維基系統。

## ✨ 特色

- **現代化美學**：採用暖色調大地色系（Earthy Tones）與頂級設計感字型（Outfit & Inter）。
- **滿版閱讀體驗**：100% 寬度佈局，讓您的知識庫在螢幕上更顯大氣。
- **輕量且快速**：基於 Vue 3 與 Node.js 構建，極速載入與流暢操作。
- **即時編輯切換**：整合 Preview/Edit 切換按鈕，支援全域快捷鍵存檔。
- **檔案管理系統**：支援目錄樹導航、右鍵新增檔案/資料夾以及刪除功能。

## 🚀 快速開始

### 1. 安裝依賴

在專案根目錄下，分別為 Server 與 Client 端安裝套件：

```bash
# 安裝 Server 依賴
cd server
npm install

# 安裝 Client 依賴
cd ../client
npm install
```

### 2. 啟動服務

我們提供了一鍵啟動的腳本，您可以選擇開發模式或正式使用模式：

#### 🛠️ 開發開發模式 (前後端分離，支援熱更新)
在根目錄執行：
```bash
npm run dev
```
此模式會同時啟動：
- 前端：`http://localhost:5173` (Vite dev server)
- 後端：`http://localhost:3000`

#### 📦 正式使用模式 (合併部署，只需開一個 Port)
此模式會先編譯前端檔案，並由後端 Server 統一處理所有請求：
```bash
npm start
```
啟動後，請訪問：`http://localhost:3000`

## 📂 如何指定 Repository

Tiny Wiki 預設會讀取專案根目錄下的 `repository` 資料夾作為檔案庫。如果您想指定自定義的 Markdown 存放路徑，可以透過環境變數 `REPO_PATH` 進行設定。

### 在啟動時指定路徑：

如果您是在根目錄啟動：

```bash
# macOS / Linux (開發模式)
REPO_PATH=/path/to/your/markdown/folder npm run dev

# macOS / Linux (正式模式)
REPO_PATH=/path/to/your/markdown/folder npm start

# Windows (PowerShell)
$env:REPO_PATH="/your/absolute/path"; npm start
```

*注意：指定的路徑必須為絕對路徑，或者相對於 `server/index.js` 的相對路徑。*

### ⚙️ 自定義環境變數

您可以透過環境變數來調整啟動參數（路徑、連接埠等）：

```bash
# macOS / Linux
PORT=8080 REPO_PATH=/your/path npm start

# Windows (PowerShell)
$env:PORT=8080; $env:REPO_PATH="/your/path"; npm start
```

## 🐳 Docker 部署

如果您想同時運行多個 Tiny Wiki 實例，分別對應不同的 Vault（知識庫），可以使用 Docker 方式部署。

### 1. 建立 Image

在專案根目錄執行：

```bash
docker build -t tiny-wiki .
```

### 2. 設定 docker-compose.yml

編輯 `docker-compose.yml`，將每個 service 的 volume 路徑換成您的實際 Vault 路徑：

```yaml
services:
  wiki-1:
    image: tiny-wiki
    ports:
      - "3101:3000"      # 對外 Port:容器內 Port
    volumes:
      - /your/vault-1:/vault:ro    # 掛載 Vault，:ro 為唯讀
    restart: unless-stopped

  wiki-2:
    image: tiny-wiki
    ports:
      - "3102:3000"
    volumes:
      - /your/vault-2:/vault:ro
    restart: unless-stopped
```

> 如需在 Wiki 介面中編輯儲存檔案，請將 `:ro` 拿掉改為讀寫掛載。

### 3. 啟動所有實例

```bash
docker compose up -d
```

啟動後：
- `http://localhost:3101` → vault-1
- `http://localhost:3102` → vault-2

每個 Port 對應獨立的 Vault，互相隔離、不會有存取衝突。

要新增更多實例，複製一個 service block 並換上新的 Port 與 Vault 路徑即可。

---

## ⌨️ 快捷鍵

- **Ctrl + S** (Windows) / **Cmd + S** (Mac)：在編輯模式下快速儲存當前文件。

## 📝 授權

MIT License
