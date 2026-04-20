const path = require('path');

// 模擬 server/index.js 的解析邏輯
function parseRepoPaths(envValue) {
  const defaultPath = path.resolve(__dirname, '../repository');
  if (!envValue) return [defaultPath];
  
  return envValue.split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => path.resolve(p));
}

// 模擬升級後的 resolveSafePath
function resolveSafePath(reqPath, repoPaths) {
  if (!reqPath) return null;
  
  for (const repo of repoPaths) {
    const fullPath = path.resolve(repo, reqPath);
    if (fullPath.startsWith(repo)) {
      return fullPath;
    }
  }
  return null;
}

// 測試案例
async function runTests() {
  console.log("--- Task 1 Harness Test Start ---");

  // AC-1: 解析測試
  const env1 = "/path/A, /path/B ";
  const paths1 = parseRepoPaths(env1);
  console.log("Test AC-1 (Parsed Paths):", paths1);
  if (paths1.length === 2 && paths1[0].endsWith('A') && paths1[1].endsWith('B')) {
    console.log("✅ AC-1 Passed");
  } else {
    console.error("❌ AC-1 Failed");
  }

  // AC-2 & AC-3: 安全性測試
  // 假設合法路徑為當前目錄和根目錄(僅模擬)
  const mockRepos = [path.resolve(__dirname), path.resolve(__dirname, '..')];
  
  const safeFile = "task-1-harness.js"; // 在第一個 repo 內
  const resultSafe = resolveSafePath(safeFile, mockRepos);
  console.log("Test AC-2 (Safe Access):", resultSafe);
  if (resultSafe && resultSafe.includes(safeFile)) {
    console.log("✅ AC-2 Passed");
  } else {
    console.error("❌ AC-2 Failed");
  }

  const unsafeFile = "../../etc/passwd";
  const resultUnsafe = resolveSafePath(unsafeFile, mockRepos);
  console.log("Test AC-3 (Unsafe Access):", resultUnsafe);
  if (resultUnsafe === null) {
    console.log("✅ AC-3 Passed");
  } else {
    console.error("❌ AC-3 Failed");
  }

  console.log("--- Task 1 Harness Test End ---");
}

runTests().catch(console.error);
