export function buildMarkdownLine(fileType, filename, vaultPath, repo) {
  if (fileType.startsWith('image/')) {
    return `![${filename}](/api/raw?path=${encodeURIComponent(vaultPath)}&repo=${repo})`;
  }
  if (fileType.startsWith('video/')) {
    return `![[${filename}]]`;
  }
  return `[${filename}](/api/raw?path=${encodeURIComponent(vaultPath)}&repo=${repo})`;
}

export function computeInsertAt(dropTargetLine, lineCount) {
  if (dropTargetLine === null || dropTargetLine === undefined) return lineCount;
  return dropTargetLine + 1;
}
