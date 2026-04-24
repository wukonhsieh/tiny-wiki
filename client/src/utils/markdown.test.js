import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.js';

describe('renderMarkdown - embed syntax ![[...]]', () => {

  // AC-1: image embed
  it('AC-1: ![[photo.jpg]] renders image placeholder', () => {
    const html = renderMarkdown('![[photo.jpg]]');
    expect(html).toContain('data-embed-type="image"');
    expect(html).toContain('data-embed-src="photo.jpg"');
  });

  // AC-2: image with width only
  it('AC-2: ![[photo.jpg|300]] includes data-embed-size="300"', () => {
    const html = renderMarkdown('![[photo.jpg|300]]');
    expect(html).toContain('data-embed-size="300"');
  });

  // AC-3: image with width and height
  it('AC-3: ![[photo.jpg|300x200]] includes data-embed-size="300x200"', () => {
    const html = renderMarkdown('![[photo.jpg|300x200]]');
    expect(html).toContain('data-embed-size="300x200"');
  });

  // AC-4: video embed
  it('AC-4: ![[clip.mp4]] renders video placeholder', () => {
    const html = renderMarkdown('![[clip.mp4]]');
    expect(html).toContain('data-embed-type="video"');
  });

  // AC-5: note heading embed -> callout with wikilink
  it('AC-5: ![[MyNote#Introduction]] renders embed-callout with wikilink to note', () => {
    const html = renderMarkdown('![[MyNote#Introduction]]');
    expect(html).toContain('class="embed-callout"');
    expect(html).toContain('href="MyNote"');
    expect(html).toContain('data-wikilink="true"');
  });

  // AC-6: other resource -> download link
  it('AC-6: ![[audio.mp3]] renders embed-download link with download attribute', () => {
    const html = renderMarkdown('![[audio.mp3]]');
    expect(html).toContain('class="embed-download"');
    expect(html).toContain('download=');
  });

  // AC-7: fenced code block protection
  it('AC-7: ![[image.png]] inside fenced code block is NOT converted', () => {
    const input = '```\n![[image.png]]\n```';
    const html = renderMarkdown(input);
    expect(html).toContain('![[image.png]]');
    expect(html).not.toContain('data-embed-type');
  });

  // AC-8: wikilink and embed coexistence
  it('AC-8: [[link]] and ![[photo.jpg]] both convert correctly without interfering', () => {
    const input = '[[my-note]] and ![[photo.jpg]]';
    const html = renderMarkdown(input);
    expect(html).toContain('class="wikilink"');
    expect(html).toContain('data-embed-type="image"');
  });

});

describe('renderMarkdown - KaTeX math rendering', () => {

  // Math AC-1: inline math $...$ 輸出含 katex class
  it('Math-AC-1: $E=mc^2$ inline renders with katex class', () => {
    const html = renderMarkdown('inline: $E=mc^2$ end');
    expect(html).toContain('katex');
    expect(html).not.toContain('$E=mc^2$');
  });

  // Math AC-2: block math $$...$$ 輸出含 katex-display
  it('Math-AC-2: $$\\int$$ block renders with katex-display', () => {
    const html = renderMarkdown('$$\n\\int_0^\\infty f(x)\\,dx\n$$');
    expect(html).toContain('katex-display');
  });

  // Math AC-3: fenced code block 內的 $x^2$ 不被 KaTeX 處理
  it('Math-AC-3: $x^2$ inside fenced code block is NOT processed by KaTeX', () => {
    const input = '```\n$x^2$\n```';
    const html = renderMarkdown(input);
    expect(html).toContain('$x^2$');
    expect(html).not.toContain('katex');
  });

});

describe('renderMarkdown - wikilink regression', () => {

  it('regression: [[target]] still renders as wikilink', () => {
    const html = renderMarkdown('[[my-note]]');
    expect(html).toContain('href="my-note"');
    expect(html).toContain('class="wikilink"');
    expect(html).toContain('data-wikilink="true"');
  });

  it('regression: [[target|alias]] still renders with alias label', () => {
    const html = renderMarkdown('[[my-note|My Note]]');
    expect(html).toContain('href="my-note"');
    expect(html).toContain('>My Note<');
  });

});
