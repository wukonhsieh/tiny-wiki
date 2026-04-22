import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const md = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// 支援的圖片與影片副檔名
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg']);

/**
 * 使用 single-pass combined regex 同時處理：
 * - fenced code block / inline code（pass-through，不轉換內部語法）
 * - ![[...]] embed 語法
 * - [[...]] wikilink 語法
 *
 * 順序：code block 保護 > embed > wikilink，確保 code block 內的語法不被誤轉換。
 *
 * Group 1: fenced code block 或 inline code（pass-through）
 * Group 2: embed target
 * Group 3: embed size（可選）
 * Group 4: wikilink target
 * Group 5: wikilink alias（可選）
 */
function processWikiSyntax(content) {
  const combinedRegex = /(```[\s\S]*?```|`[^`\n]+`)|!\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

  return content.replace(combinedRegex, (match, codeBlock, embedTarget, embedSize, wikiTarget, wikiAlias) => {
    // Code block 內容原封不動
    if (codeBlock !== undefined) return codeBlock;

    // ![[...]] embed 語法
    if (embedTarget !== undefined) {
      const trimmedTarget = embedTarget.trim();
      const sizeVal = embedSize ? embedSize.trim() : '';
      const sizeAttr = sizeVal ? ` data-embed-size="${sizeVal}"` : '';

      // Note heading embed：target 包含 '#'
      if (trimmedTarget.includes('#')) {
        const hashIndex = trimmedTarget.indexOf('#');
        const noteName = trimmedTarget.substring(0, hashIndex);
        const heading = trimmedTarget.substring(hashIndex + 1);
        return `<div class="embed-callout"><a href="${noteName}" class="wikilink" data-wikilink="true">📎 ${noteName} § ${heading}</a></div>`;
      }

      const ext = trimmedTarget.split('.').pop().toLowerCase();

      if (IMAGE_EXTS.has(ext)) {
        return `<span class="embed-placeholder" data-embed-type="image" data-embed-src="${trimmedTarget}"${sizeAttr}></span>`;
      } else if (VIDEO_EXTS.has(ext)) {
        return `<span class="embed-placeholder" data-embed-type="video" data-embed-src="${trimmedTarget}"${sizeAttr}></span>`;
      } else {
        // 其他資源（audio、pdf 等）→ 下載連結
        const filename = trimmedTarget.split('/').pop();
        const encodedTarget = encodeURIComponent(trimmedTarget);
        return `<a class="embed-download" href="/api/file?path=${encodedTarget}&repo=0" download="${filename}">${filename}</a>`;
      }
    }

    // [[...]] wikilink 語法
    if (wikiTarget !== undefined) {
      const label = wikiAlias || wikiTarget;
      return `<a href="${wikiTarget}" class="wikilink" data-wikilink="true">${label}</a>`;
    }

    return match;
  });
}

export function renderMarkdown(content) {
  if (!content) return '';

  // 使用 single-pass 處理 embed 與 wikilink，code block 內容受到保護
  const processedContent = processWikiSyntax(content);

  return md.render(processedContent);
}
