# Harness Plan — Task 3：前端：上傳檔案 + 插入 Markdown 語法

## 建議建立的護欄清單

| AC 編號 | 護欄形式 | 工具 | 預期輸出 |
|---|---|---|---|
| AC-1 | Unit test (buildMarkdownLine, image) | Vitest | `![filename](/api/raw?path=...&repo=0)` |
| AC-2 | Unit test (buildMarkdownLine, video) | Vitest | `![[filename]]` |
| AC-3 | Unit test (buildMarkdownLine, other) | Vitest | `[filename](/api/raw?path=...&repo=0)` |
| AC-4 | Unit test (isUploading guard) | Vitest (mock) | early return, fetch 不呼叫 |
| AC-5 | Unit test (error path) | Vitest (mock fetch) | alert 呼叫，rawContent 不變 |
| AC-6 | Unit test (computeInsertAt, line=0) | Vitest | insertAt = 1 |
| AC-7 | Unit test (computeInsertAt, null) | Vitest | insertAt = lines.length |

策略：將兩個純函式提取到 `client/src/utils/uploadHelper.js`，以 Vitest 單元測試涵蓋 AC-1~7。
AC-4 和 AC-5 透過 mock `fetch` 在 uploadHelper 的整合測試層驗證行為。

## Domain Invariants
- 上傳失敗後 `rawContent` 必須維持不變（不做 partial 插入再 rollback）
- `isUploading` 期間不允許第二次 upload 請求發出

## Contract Tests
`POST /api/upload` 回傳結構：`{ filename: string, path: string }`
- `filename`：最終存檔名稱（已處理衝突）
- `path`：vault-root-relative 路徑，使用 `/` 分隔符

Task 1 已驗證此 contract。本 task 的 unit test 假設 mock response 符合此結構，不重複做整合測試。

## 快速執行命令
```
cd /Users/wukon/git/github/tiny-wiki/.claude/worktrees/youthful-proskuriakova-7f8173/client && npx vitest run src/utils/uploadHelper.test.js
```
