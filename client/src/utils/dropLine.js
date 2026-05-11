/**
 * 根據滑鼠 Y 座標計算拖曳目標行索引（0-based）。
 * 結果 clamp 在 [0, lineCount - 1]。
 *
 * @param {number} clientY   - 滑鼠的 viewport Y 座標（e.clientY）
 * @param {DOMRect} rect     - textarea.getBoundingClientRect()
 * @param {number} scrollTop - textarea.scrollTop
 * @param {number} paddingTop - textarea 的 paddingTop（px）
 * @param {number} lineHeight - textarea 的 lineHeight（px）
 * @param {number} lineCount  - textarea 內容的實際行數
 */
export function calcDropLine(clientY, rect, scrollTop, paddingTop, lineHeight, lineCount) {
  const relativeY = clientY - rect.top + scrollTop - paddingTop;
  const line = Math.floor(relativeY / lineHeight);
  return Math.max(0, Math.min(line, lineCount - 1));
}
