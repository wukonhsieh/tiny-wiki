const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');
const fs = require('fs').promises;

app.use(cors());
app.use(express.json());

const rawRepoPaths = process.env.REPO_PATH || path.join(__dirname, '../repository');
const REPO_PATHS = rawRepoPaths.split(',').map(p => path.resolve(p.trim()));

// 啟動時驗證路徑有效性
(async () => {
  for (const repo of REPO_PATHS) {
    try {
      await fs.access(repo);
      console.log(`[INFO] Repository loaded: ${repo}`);
    } catch (e) {
      console.warn(`[WARNING] Repository path not found or inaccessible: ${repo}`);
    }
  }
})();

async function getTree(dirPath, relativePath = '', repoIndex = 0) {
  const name = path.basename(dirPath) || 'root';
  const stats = await fs.stat(dirPath);
  
  if (stats.isDirectory()) {
    const files = await fs.readdir(dirPath);
    const children = [];
    
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, file);
      const childRelativePath = path.join(relativePath, file);
      const childStats = await fs.stat(fullPath);
      
      if (childStats.isDirectory()) {
        const subtree = await getTree(fullPath, childRelativePath, repoIndex);
        if (subtree) children.push(subtree);
      } else if (file.endsWith('.md')) {
        children.push({
          name: file,
          type: 'file',
          path: childRelativePath,
          repo: repoIndex
        });
      }
    }
    
    return {
      name: name,
      type: 'directory',
      path: relativePath === '' ? '/' : relativePath,
      repo: repoIndex,
      children
    };
  }
  return null;
}

// 輔助函數：驗證路徑安全性
function resolveSafePath(reqPath, repoIndex = 0) {
  if (!reqPath) return null;
  
  const index = parseInt(repoIndex, 10);
  if (isNaN(index) || index < 0 || index >= REPO_PATHS.length) return null;
  
  const repo = REPO_PATHS[index];
  const fullPath = path.resolve(repo, reqPath);
  if (fullPath.startsWith(repo)) {
    return fullPath;
  }
  return null;
}

app.get('/api/tree', async (req, res) => {
  try {
    if (REPO_PATHS.length === 1) {
      const tree = await getTree(REPO_PATHS[0], '', 0);
      res.json(tree);
    } else {
      const children = [];
      for (let i = 0; i < REPO_PATHS.length; i++) {
        const repoPath = REPO_PATHS[i];
        // 多 Repo 模式下，每個 Repo 的根節點相對路徑從空字串開始，避免前綴衝突
        const subtree = await getTree(repoPath, '', i);
        if (subtree) children.push(subtree);
      }
      
      res.json({
        name: 'root',
        type: 'directory',
        path: '/',
        repo: -1, // 虛擬根節點不屬於任何 repo
        children
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/file - 讀取內容
app.get('/api/file', async (req, res) => {
  const fullPath = resolveSafePath(req.query.path, req.query.repo);
  if (!fullPath) return res.status(400).json({ error: "Invalid path" });

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    res.json({ content });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ error: "File not found" });
    res.status(500).json({ error: error.message });
  }
});

// POST /api/file - 儲存內容
app.post('/api/file', async (req, res) => {
  const { path: reqPath, content, repo } = req.body;
  const fullPath = resolveSafePath(reqPath, repo);
  if (!fullPath) return res.status(400).json({ error: "Invalid path" });

  try {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/file - 刪除項目
app.delete('/api/file', async (req, res) => {
  const fullPath = resolveSafePath(req.query.path, req.query.repo);
  if (!fullPath) return res.status(400).json({ error: "Invalid path" });

  try {
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath); // 僅允許刪除空目錄
    } else {
      await fs.unlink(fullPath);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/directory - 建立資料夾
app.post('/api/directory', async (req, res) => {
  const { path: reqPath, repo } = req.body;
  const fullPath = resolveSafePath(reqPath, repo);
  if (!fullPath) return res.status(400).json({ error: "Invalid path" });

  try {
    await fs.mkdir(fullPath, { recursive: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: "hello from server" });
});

// GET /api/resolve - 搜尋 Wikilink 對應的路徑
app.get('/api/resolve', async (req, res) => {
  const { name, repo } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name" });

  try {
    const repoIndex = repo !== undefined ? parseInt(repo, 10) : null;

    // 1. 如果包含 '/'，嘗試直接路徑解析
    if (name.includes('/')) {
      const targetPaths = [name.endsWith('.md') ? name : `${name}.md`];
      
      // 相容性處理：如果提供了 repo 且路徑開頭剛好是該 repo 的名稱，嘗試去掉前綴
      if (repoIndex !== null && repoIndex >= 0 && repoIndex < REPO_PATHS.length) {
        const repoBasename = path.basename(REPO_PATHS[repoIndex]);
        const segments = name.split('/');
        if (segments[0] === repoBasename) {
          const stripped = segments.slice(1).join('/');
          targetPaths.push(stripped.endsWith('.md') ? stripped : `${stripped}.md`);
        }
      }

      for (const tPath of targetPaths) {
        // 如果有指定 repo，優先在該 repo 找；否則在第一個找
        const fullPath = resolveSafePath(tPath, repoIndex !== null ? repoIndex : 0);
        if (fullPath) {
          try {
            await fs.access(fullPath);
            return res.json({ path: tPath, repo: repoIndex !== null ? repoIndex : 0 });
          } catch (e) {
            // 繼續嘗試下一個可能
          }
        }
      }
    }

    // 2. 遞迴搜尋符合檔名的第一個檔案
    async function findFile(dir, currentRelativePath, repoIdx) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules') continue;
        const fullPath = path.join(dir, file);
        const childRelativePath = path.join(currentRelativePath, file);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          const found = await findFile(fullPath, childRelativePath, repoIdx);
          if (found) return found;
        } else if (file === name || file === `${name}.md`) {
          return { path: childRelativePath, repo: repoIdx };
        }
      }
      return null;
    }

    let result = null;
    // 優先搜尋指定的 repo
    if (repoIndex !== null && repoIndex >= 0 && repoIndex < REPO_PATHS.length) {
      result = await findFile(REPO_PATHS[repoIndex], '', repoIndex);
    }
    
    // 若沒找到，再全域搜尋其他 repo
    if (!result) {
      for (let i = 0; i < REPO_PATHS.length; i++) {
        if (i === repoIndex) continue;
        result = await findFile(REPO_PATHS[i], '', i);
        if (result) break;
      }
    }

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
