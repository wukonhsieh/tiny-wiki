import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderMarkdown } from './markdown.js';

// ---- AC-1: renderMarkdown 對 mermaid block 輸出 placeholder ----

describe('renderMarkdown - mermaid placeholder output', () => {

  it('Mermaid-AC-1: ```mermaid block renders as .mermaid-placeholder, not hljs', () => {
    const input = '```mermaid\nflowchart LR\nA-->B\n```';
    const html = renderMarkdown(input);
    expect(html).toContain('class="mermaid-placeholder"');
    expect(html).not.toContain('class="hljs"');
    expect(html).toContain('flowchart LR');
  });

});

// ---- AC-2 & AC-3: patchMermaid DOM patching ----

describe('patchMermaid - DOM patching', () => {

  beforeEach(() => {
    vi.resetModules();
  });

  it('Mermaid-AC-2: replaces .mermaid-placeholder with SVG on success', async () => {
    // Mock mermaid module
    vi.doMock('mermaid', () => ({
      default: {
        initialize: vi.fn(),
        render: vi.fn().mockResolvedValue({ svg: '<svg id="test"><g></g></svg>' }),
      },
    }));

    const { patchMermaid } = await import('./mermaidPatcher.js');

    const dom = new JSDOM('<div class="markdown-body"><div class="mermaid-placeholder">flowchart LR\nA--&gt;B</div></div>');
    const container = dom.window.document.querySelector('.markdown-body');

    // Provide document global for patchMermaid to use createElement
    global.document = dom.window.document;

    await patchMermaid(container);

    expect(container.querySelector('.mermaid-placeholder')).toBeNull();
    expect(container.querySelector('.mermaid-container')).not.toBeNull();
    expect(container.querySelector('.mermaid-container').innerHTML).toContain('<svg');
  });

  it('Mermaid-AC-3: inserts .mermaid-error on render failure', async () => {
    vi.doMock('mermaid', () => ({
      default: {
        initialize: vi.fn(),
        render: vi.fn().mockRejectedValue(new Error('Parse error')),
      },
    }));

    const { patchMermaid } = await import('./mermaidPatcher.js');

    const dom = new JSDOM('<div class="markdown-body"><div class="mermaid-placeholder">invalid!!!</div></div>');
    const container = dom.window.document.querySelector('.markdown-body');
    global.document = dom.window.document;

    await patchMermaid(container);

    expect(container.querySelector('.mermaid-placeholder')).toBeNull();
    expect(container.querySelector('.mermaid-error')).not.toBeNull();
    expect(container.querySelector('.mermaid-error').textContent).toContain('Parse error');
  });

});
