import { describe, it, expect } from 'vitest';
import { calcDropLine } from './dropLine.js';

describe('calcDropLine', () => {
  const rect = { top: 100 };
  const paddingTop = 20;
  const lineHeight = 24;
  const lineCount = 10;

  it('returns 0 for mouse at top of first line', () => {
    const clientY = rect.top + paddingTop + 12; // middle of line 0
    expect(calcDropLine(clientY, rect, 0, paddingTop, lineHeight, lineCount)).toBe(0);
  });

  it('returns correct index for mid-content line', () => {
    // Line 3 starts at rect.top + paddingTop + 3 * lineHeight = 100 + 20 + 72 = 192
    const clientY = 192 + 12; // middle of line 3
    expect(calcDropLine(clientY, rect, 0, paddingTop, lineHeight, lineCount)).toBe(3);
  });

  it('clamps to lineCount - 1 when mouse is below content', () => {
    expect(calcDropLine(99999, rect, 0, paddingTop, lineHeight, lineCount)).toBe(lineCount - 1);
  });

  it('clamps to 0 when mouse is above content area', () => {
    expect(calcDropLine(0, rect, 0, paddingTop, lineHeight, lineCount)).toBe(0);
  });

  it('accounts for scrollTop correctly', () => {
    // scrollTop = 48px = 2 lines scrolled
    // Mouse at rect.top + paddingTop + 12 (looks like line 0 visually)
    // relativeY = 12 + 48 = 60 → line = floor(60 / 24) = 2
    const clientY = rect.top + paddingTop + 12;
    expect(calcDropLine(clientY, rect, 48, paddingTop, lineHeight, lineCount)).toBe(2);
  });

  it('returns last line when mouse is exactly at boundary of last line', () => {
    // line 9 starts at paddingTop + 9 * lineHeight = 20 + 216 = 236 from rect.top
    const clientY = rect.top + paddingTop + 9 * lineHeight + 1;
    expect(calcDropLine(clientY, rect, 0, paddingTop, lineHeight, lineCount)).toBe(9);
  });
});
