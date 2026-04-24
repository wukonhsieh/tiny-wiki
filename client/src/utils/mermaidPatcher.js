import mermaid from 'mermaid';

let mermaidInitialized = false;
let idCounter = 0;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
  mermaidInitialized = true;
}

/**
 * 找出 container 內所有 .mermaid-placeholder，
 * 以 Mermaid 渲染為 SVG 並取代原 placeholder。
 * 語法錯誤時插入 .mermaid-error，不拋出例外。
 *
 * @param {Element} container - 目標 DOM container（如 .markdown-body）
 */
export async function patchMermaid(container) {
  if (!container) return;

  initMermaid();

  const placeholders = Array.from(container.querySelectorAll('.mermaid-placeholder'));
  if (placeholders.length === 0) return;

  await Promise.allSettled(
    placeholders.map(async (el) => {
      const graphDefinition = el.textContent || '';
      const id = `mermaid-${Date.now()}-${idCounter++}`;

      try {
        const { svg } = await mermaid.render(id, graphDefinition);
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-container';
        wrapper.innerHTML = svg;
        el.replaceWith(wrapper);
      } catch (err) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mermaid-error';
        errorDiv.textContent = `Mermaid 圖表渲染失敗：${err.message || err}`;
        el.replaceWith(errorDiv);
      }
    })
  );
}
