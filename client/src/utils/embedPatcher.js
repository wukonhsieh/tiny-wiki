/**
 * embedPatcher.js
 *
 * 非同步替換 markdown.js 產生的 embed placeholder 元素。
 *
 * Task 1 在 render 時為圖片與影片輸出帶 data-embed-* 屬性的 placeholder：
 *   <span class="embed-placeholder" data-embed-type="image|video"
 *         data-embed-src="path/to/file" data-embed-size="300x200">
 *
 * 本模組提供 patchEmbeds(container, repo, fetchFn) 函式，
 * 在 DOM ready 後對所有 placeholder 並行呼叫 /api/resolve，
 * 再以 <img> 或 <video> 元素替換，解析失敗則顯示 broken embed 提示。
 */

/**
 * 解析 data-embed-size 字串為 { width, height } 物件。
 * - "300"     → { width: "300" }
 * - "300x200" → { width: "300", height: "200" }
 * - 空值      → {}
 *
 * @param {string|null|undefined} sizeStr
 * @returns {{ width?: string, height?: string }}
 */
export function parseSize(sizeStr) {
  if (!sizeStr) return {};
  if (sizeStr.includes('x')) {
    const [width, height] = sizeStr.split('x');
    return { width, height };
  }
  return { width: sizeStr };
}

/**
 * 建立 broken embed 提示元素。
 *
 * @param {string} src 原始 embed src（用於顯示檔名）
 * @returns {HTMLSpanElement}
 */
function createBrokenEmbed(src) {
  const filename = src.split('/').pop();
  const el = document.createElement('span');
  el.className = 'embed-broken';
  el.textContent = `⚠ ${filename}`;
  return el;
}

/**
 * 對 container 內所有 .embed-placeholder 元素執行非同步路徑解析，
 * 並以對應的 <img> 或 <video> 元素替換。
 *
 * @param {Element} container  包含 placeholder 的 DOM 元素（通常是 .markdown-body）
 * @param {number}  repo       目前頁面所屬的 repo index
 * @param {Function} [fetchFn=fetch]  可注入的 fetch 函式（方便測試 mock）
 */
export async function patchEmbeds(container, repo, fetchFn = fetch) {
  const placeholders = Array.from(container.querySelectorAll('.embed-placeholder'));
  if (!placeholders.length) return;

  await Promise.allSettled(
    placeholders.map(async (placeholder) => {
      const type = placeholder.dataset.embedType;
      const src = placeholder.dataset.embedSrc;
      const size = placeholder.dataset.embedSize;

      try {
        const res = await fetchFn(
          `/api/resolve?name=${encodeURIComponent(src)}&repo=${repo}`
        );
        if (!res.ok) throw new Error('resolve failed');

        const data = await res.json();
        const url = `/api/file?path=${encodeURIComponent(data.path)}&repo=${data.repo}`;
        const { width, height } = parseSize(size);

        let el;

        if (type === 'image') {
          el = document.createElement('img');
          el.src = url;
          el.className = 'embed-image';
          if (width) el.setAttribute('width', width);
          if (height) el.setAttribute('height', height);
        } else if (type === 'video') {
          el = document.createElement('video');
          el.controls = true;
          el.className = 'embed-video';
          if (width) el.setAttribute('width', width);
          if (height) el.setAttribute('height', height);
          const source = document.createElement('source');
          source.src = url;
          el.appendChild(source);
        }

        placeholder.replaceWith(el ?? createBrokenEmbed(src));
      } catch {
        placeholder.replaceWith(createBrokenEmbed(src));
      }
    })
  );
}
