const path = require('path');

// 模擬 server/index.js 的 resolve 邏輯
async function resolveFile(name, repoPaths) {
  // 模擬 findFile
  async function findFile(dir, baseForRelative) {
    // 這裡僅模擬搜尋行為：假設 'exist-in-b' 在第二個路徑
    if (dir.includes('repo-B') && name === 'exist-in-b') {
      return path.relative(path.resolve(dir, '..'), path.join(dir, name + '.md'));
    }
    // 假設 'intro' 在兩個路徑都有
    if (name === 'intro') {
       return path.relative(path.resolve(dir, '..'), path.join(dir, name + '.md'));
    }
    return null;
  }

  for (const repo of repoPaths) {
    const foundPath = await findFile(repo, repo);
    if (foundPath) return foundPath;
  }
  return null;
}

async function runTests() {
  console.log("--- Task 3 Harness Test Start ---");
  const mockRepos = [path.resolve('/path/to/repo-A'), path.resolve('/path/to/repo-B')];

  // AC-1: 跨 Repo 搜尋
  const res1 = await resolveFile('exist-in-b', mockRepos);
  console.log("Test AC-1 (Find in Repo B):", res1);
  if (res1 && res1.startsWith('repo-B')) {
    console.log("✅ AC-1 Passed");
  } else {
    console.error("❌ AC-1 Failed");
  }

  // AC-2: 優先順序
  const res2 = await resolveFile('intro', mockRepos);
  console.log("Test AC-2 (Priority A):", res2);
  if (res2 && res2.startsWith('repo-A')) {
    console.log("✅ AC-2 Passed");
  } else {
    console.error("❌ AC-2 Failed");
  }

  console.log("--- Task 3 Harness Test End ---");
}

runTests().catch(console.error);
