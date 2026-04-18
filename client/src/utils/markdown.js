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

export function renderMarkdown(content) {
  if (!content) return '';
  
  // Handle Wikilinks: [[path|alias]] or [[path]]
  // 我們先進行 Wikilink 的轉換，再交給 markdown-it
  // 這樣 [[...]] 就不會被 markdown-it 誤判為其他語法
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const processedContent = content.replace(wikilinkRegex, (match, target, alias) => {
    const label = alias || target;
    // 使用 data-wikilink 標記，方便在 WikiReader 中攔截處理
    return `<a href="${target}" class="wikilink" data-wikilink="true">${label}</a>`;
  });

  return md.render(processedContent);
}
