const path = require('path');

// 模擬 server/index.js 的 getTree 邏輯 (簡化版)
async function getTreeMock(dirPath, relativePath = '') {
  const name = path.basename(dirPath) || 'root';
  // 模擬檔案結構
  return {
    name: relativePath === '' ? 'root' : name,
    type: 'directory',
    path: relativePath === '' ? '/' : relativePath,
    children: [
      { name: 'note.md', type: 'file', path: path.join(relativePath, 'note.md') }
    ]
  };
}

// 模擬修改後的 /api/tree 邏輯
async function getFullTree(repoPaths) {
  if (repoPaths.length === 1) {
    return await getTreeMock(repoPaths[0]);
  } else {
    const children = [];
    for (const repo of repoPaths) {
      const basename = path.basename(repo);
      const subtree = await getTreeMock(repo, basename);
      if (subtree) children.push(subtree);
    }
    return {
      name: 'root',
      type: 'directory',
      path: '/',
      children
    };
  }
}

async function runTests() {
  console.log("--- Task 2 Harness Test Start ---");

  // AC-1: 單 Repo 測試
  const res1 = await getFullTree(['/path/to/wiki-A']);
  console.log("Test AC-1 (Single Repo):", res1.name);
  if (res1.name === 'wiki-A' && !res1.children.find(c => c.name === 'wiki-A')) {
    console.log("✅ AC-1 Passed");
  } else {
    console.error("❌ AC-1 Failed");
  }

  // AC-2 & AC-4: 多 Repo 測試
  const res2 = await getFullTree(['/path/to/wiki-A', '/path/to/wiki-B']);
  console.log("Test AC-2 (Multi Repo Root):", res2.name);
  if (res2.name === 'root' && res2.children.length === 2 && res2.path === '/') {
    console.log("✅ AC-2 & AC-4 Passed");
  } else {
    console.error("❌ AC-2 & AC-4 Failed");
  }

  // AC-3: Path 拼接測試
  const repoBNote = res2.children[1].children[0];
  console.log("Test AC-3 (Nested Path):", repoBNote.path);
  if (repoBNote.path.startsWith('wiki-B')) {
    console.log("✅ AC-3 Passed");
  } else {
    console.error("❌ AC-3 Failed");
  }

  console.log("--- Task 2 Harness Test End ---");
}

runTests().catch(console.error);
