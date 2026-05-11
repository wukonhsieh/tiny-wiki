import { describe, it, expect } from 'vitest';
import { buildMarkdownLine, computeInsertAt } from './uploadHelper.js';

describe('buildMarkdownLine', () => {
  it('AC-1: image/* → standard markdown image with /api/raw URL', () => {
    const result = buildMarkdownLine('image/png', 'photo.png', 'docs/attachments/photo.png', 0);
    expect(result).toBe('![photo.png](/api/raw?path=docs%2Fattachments%2Fphoto.png&repo=0)');
  });

  it('AC-2: video/* → Obsidian embed', () => {
    const result = buildMarkdownLine('video/mp4', 'clip.mp4', 'docs/attachments/clip.mp4', 0);
    expect(result).toBe('![[clip.mp4]]');
  });

  it('AC-3: other MIME → download link with /api/raw URL', () => {
    const result = buildMarkdownLine('application/pdf', 'report.pdf', 'docs/attachments/report.pdf', 1);
    expect(result).toBe('[report.pdf](/api/raw?path=docs%2Fattachments%2Freport.pdf&repo=1)');
  });

  it('AC-3b: text/plain → download link', () => {
    const result = buildMarkdownLine('text/plain', 'notes.txt', 'attachments/notes.txt', 0);
    expect(result).toBe('[notes.txt](/api/raw?path=attachments%2Fnotes.txt&repo=0)');
  });
});

describe('computeInsertAt', () => {
  it('AC-6: dropTargetLine=0 → insertAt=1', () => {
    expect(computeInsertAt(0, 5)).toBe(1);
  });

  it('AC-6b: dropTargetLine=2 → insertAt=3', () => {
    expect(computeInsertAt(2, 5)).toBe(3);
  });

  it('AC-7: dropTargetLine=null → insertAt=lineCount', () => {
    expect(computeInsertAt(null, 5)).toBe(5);
  });

  it('AC-7b: dropTargetLine=undefined → insertAt=lineCount', () => {
    expect(computeInsertAt(undefined, 3)).toBe(3);
  });
});
