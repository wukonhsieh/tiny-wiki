# Markdown 語法全攻略

這是一份完整的 Markdown 語法教學範例，您可以透過這份文件了解 Tiny Wiki 支援的所有排版功能。

---

## 1. 標題 (Headers)

使用 `#` 來定義標題，`#` 的數量代表標題的等級（建議一頁只有一個一級標題）。

# 一級標題 (H1)
## 二級標題 (H2)
### 三級標題 (H3)
#### 四級標題 (H4)
##### 五級標題 (H5)

---

## 2. 文字樣式 (Emphasis)

您可以使用符號來強調特定的文字：

*   **粗體**：使用 `**文字**` 或 `__文字__`
*   *斜體*：使用 `*文字*` 或 `_文字_`
*   ***粗斜體***：使用 `***文字***`
*   ~~刪除線~~：使用 `~~文字~~`

---

## 3. 列表 (Lists)

### 無序列表
*   項目一
*   項目二
    *   子項目 A
    *   子項目 B

### 有序列表
1.  第一步
2.  第二步
3.  第三步

---

## 4. 連結與圖片 (Links & Images)

*   **連結**：[點擊前往 Google](https://www.google.com)
*   **圖片**：
    ![設計感圖片](https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=300&q=80)

---

## 5. 引用 (Blockquotes)

> 這是引用的樣式。
> 適合用來標註名言、參考資料或是補充說明。
> 
> > 甚至支援巢狀引用。

---

## 6. 程式碼 (Code)

### 行內程式碼
在句子中插入 `const app = createApp(App)` 這樣的程式碼。

### 程式碼區塊
支援語法高亮 (Syntax Highlighting)：

```javascript
// 這是一段 JavaScript 範例
function welcome() {
  const message = "歡迎使用 Tiny Wiki！";
  console.log(message);
}

welcome();
```

```css
/* 這是一段 CSS 範例 */
.wiki-reader {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}
```

---

## 7. 表格 (Tables)

| 功能 | 語法範例 | 預覽 |
| :--- | :--- | :--- |
| **粗體** | `**Bold**` | **範例** |
| **斜體** | `*Italic*` | *範例* |
| **程式碼** | `` `Code` `` | `範例` |

---

## 8. 分隔線 (Horizontal Rules)

使用三個以上的破折號 `---` 即可產生：

---

## 9. 任務列表 (Task Lists)

* [x] 已完成配色優化 (Earthy Tones)
* [x] 已整合頂級字型 (Outfit & Inter)
* [ ] 規劃下一個新功能

---

## 10. 自動連結 (Auto-links)

直接輸入網址也會自動轉為連結：https://github.com/
