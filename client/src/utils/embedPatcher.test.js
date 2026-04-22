// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { patchEmbeds, parseSize } from './embedPatcher.js';

// Helper: create a container div with placeholder spans
function makeContainer(placeholders) {
  const div = document.createElement('div');
  div.innerHTML = placeholders
    .map(({ type, src, size }) => {
      const sizeAttr = size ? ` data-embed-size="${size}"` : '';
      return `<span class="embed-placeholder" data-embed-type="${type}" data-embed-src="${src}"${sizeAttr}></span>`;
    })
    .join('');
  return div;
}

// Helper: mock fetch that resolves a path
function mockFetchSuccess(path = 'images/photo.jpg', repo = 0) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ path, repo }),
  });
}

function mockFetchFailure() {
  return vi.fn().mockResolvedValue({ ok: false });
}

// ─── parseSize ───────────────────────────────────────────────────────────────

describe('parseSize', () => {
  it('returns empty object for empty string', () => {
    expect(parseSize('')).toEqual({});
    expect(parseSize(null)).toEqual({});
    expect(parseSize(undefined)).toEqual({});
  });

  it('returns width only for single number', () => {
    expect(parseSize('300')).toEqual({ width: '300' });
  });

  it('returns width and height for WxH format', () => {
    expect(parseSize('300x200')).toEqual({ width: '300', height: '200' });
  });
});

// ─── patchEmbeds: image ───────────────────────────────────────────────────────

describe('patchEmbeds - image', () => {
  it('AC-1: replaces placeholder with <img> with correct src', async () => {
    const container = makeContainer([{ type: 'image', src: 'photo.jpg' }]);
    const fetchFn = mockFetchSuccess('images/photo.jpg', 0);
    await patchEmbeds(container, 0, fetchFn);

    const img = container.querySelector('img.embed-image');
    expect(img).not.toBeNull();
    expect(img.src).toContain('/api/raw?path=');
    expect(img.src).toContain('images%2Fphoto.jpg');
    expect(container.querySelector('.embed-placeholder')).toBeNull();
  });

  it('AC-2: applies width only when size is single number', async () => {
    const container = makeContainer([{ type: 'image', src: 'photo.jpg', size: '300' }]);
    await patchEmbeds(container, 0, mockFetchSuccess());

    const img = container.querySelector('img.embed-image');
    expect(img.getAttribute('width')).toBe('300');
    expect(img.getAttribute('height')).toBeNull();
  });

  it('AC-3: applies both width and height for WxH size', async () => {
    const container = makeContainer([{ type: 'image', src: 'photo.jpg', size: '300x200' }]);
    await patchEmbeds(container, 0, mockFetchSuccess());

    const img = container.querySelector('img.embed-image');
    expect(img.getAttribute('width')).toBe('300');
    expect(img.getAttribute('height')).toBe('200');
  });
});

// ─── patchEmbeds: video ───────────────────────────────────────────────────────

describe('patchEmbeds - video', () => {
  it('AC-4: replaces placeholder with <video controls> containing <source>', async () => {
    const container = makeContainer([{ type: 'video', src: 'clip.mp4' }]);
    await patchEmbeds(container, 0, mockFetchSuccess('videos/clip.mp4', 0));

    const video = container.querySelector('video.embed-video');
    expect(video).not.toBeNull();
    expect(video.controls).toBe(true);
    const source = video.querySelector('source');
    expect(source).not.toBeNull();
    expect(source.src).toContain('/api/raw?path=');
    expect(container.querySelector('.embed-placeholder')).toBeNull();
  });

  it('AC-5: applies width and height to video', async () => {
    const container = makeContainer([{ type: 'video', src: 'clip.mp4', size: '640x360' }]);
    await patchEmbeds(container, 0, mockFetchSuccess());

    const video = container.querySelector('video.embed-video');
    expect(video.getAttribute('width')).toBe('640');
    expect(video.getAttribute('height')).toBe('360');
  });
});

// ─── patchEmbeds: broken embed ────────────────────────────────────────────────

describe('patchEmbeds - broken embed', () => {
  it('AC-6: shows embed-broken span with filename when resolve fails', async () => {
    const container = makeContainer([{ type: 'image', src: 'nonexistent.png' }]);
    await patchEmbeds(container, 0, mockFetchFailure());

    const broken = container.querySelector('.embed-broken');
    expect(broken).not.toBeNull();
    expect(broken.textContent).toContain('nonexistent.png');
    expect(container.querySelector('.embed-placeholder')).toBeNull();
  });

  it('AC-6b: shows embed-broken when fetch throws', async () => {
    const container = makeContainer([{ type: 'image', src: 'error.png' }]);
    const fetchFn = vi.fn().mockRejectedValue(new Error('network error'));
    await patchEmbeds(container, 0, fetchFn);

    expect(container.querySelector('.embed-broken')).not.toBeNull();
    expect(container.querySelector('.embed-placeholder')).toBeNull();
  });
});

// ─── patchEmbeds: multiple placeholders ───────────────────────────────────────

describe('patchEmbeds - multiple placeholders', () => {
  it('AC-7: patches all placeholders, none remain', async () => {
    const container = makeContainer([
      { type: 'image', src: 'a.jpg' },
      { type: 'video', src: 'b.mp4' },
    ]);
    const fetchFn = mockFetchSuccess();
    await patchEmbeds(container, 0, fetchFn);

    expect(container.querySelectorAll('.embed-placeholder').length).toBe(0);
    expect(container.querySelector('img.embed-image')).not.toBeNull();
    expect(container.querySelector('video.embed-video')).not.toBeNull();
  });
});

// ─── domain invariant ─────────────────────────────────────────────────────────

describe('domain invariant - no placeholder remains', () => {
  it('no .embed-placeholder remains after patchEmbeds regardless of outcome', async () => {
    const container = makeContainer([
      { type: 'image', src: 'ok.jpg' },
      { type: 'video', src: 'missing.mp4' },
    ]);
    // first resolves ok, second fails
    const fetchFn = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ path: 'ok.jpg', repo: 0 }) })
      .mockResolvedValueOnce({ ok: false });

    await patchEmbeds(container, 0, fetchFn);
    expect(container.querySelectorAll('.embed-placeholder').length).toBe(0);
  });
});
