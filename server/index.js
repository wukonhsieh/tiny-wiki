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

async function getTree(dirPath, relativePath = '') {
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
        const subtree = await getTree(fullPath, childRelativePath);
        if (subtree) children.push(subtree);
      } else if (file.endsWith('.md')) {
        children.push({
          name: file,
          type: 'file',
          path: childRelativePath
        });
      }
    }
    
    return {
      name: name,
      type: 'directory',
      path: relativePath === '' ? '/' : relativePath,
      children
    };
  }
  return null;
}

// 輔助函數：驗證路徑安全性
function resolveSafePath(reqPath) {
  if (!reqPath) return null;
  
  // 遍歷所有合法的 Repository 絕對路徑進行驗證
  for (const repo of REPO_PATHS) {
    const fullPath = path.resolve(repo, reqPath);
    if (fullPath.startsWith(repo)) {
      return fullPath;
    }
  }
  return null;
}

app.get('/api/tree', async (req, res) => {
  try {
    if (REPO_PATHS.length === 1) {
      // 單一 Repo 模式：保持相容，回傳單一根目錄
      const tree = await getTree(REPO_PATHS[0]);
      res.json(tree);
    } else {
      // 多 Repo 模式：建立虛擬 root 節點
      const children = [];
      for (const repoPath of REPO_PATHS) {
        const basename = path.basename(repoPath);
        const subtree = await getTree(repoPath, basename);
        if (subtree) children.push(subtree);
      }
      
      res.json({
        name: 'root',
        type: 'directory',
        path: '/',
        children
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/file - 讀取內容
app.get('/api/file', async (req, res) => {
  const fullPath = resolveSafePath(req.query.path);
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
  const { path: reqPath, content } = req.body;
  const fullPath = resolveSafePath(reqPath);
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
  const fullPath = resolveSafePath(req.query.path);
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
  const { path: reqPath } = req.body;
  const fullPath = resolveSafePath(reqPath);
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
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name" });

  try {
    // 如果包含 '/'，直接嘗試解析路徑
    if (name.includes('/')) {
      const targetPath = name.endsWith('.md') ? name : `${name}.md`;
      const fullPath = resolveSafePath(targetPath);
      if (fullPath) {
        try {
          await fs.access(fullPath);
          return res.json({ path: targetPath });
        } catch (e) {
          // 繼續往下走搜尋邏輯，或者報錯
        }
      }
    }

    // 遞迴搜尋符合檔名的第一個檔案
    async function findFile(dir, currentRelativePath) {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file.startsWith('.') || file === 'node_modules') continue;
        const fullPath = path.join(dir, file);
        const childRelativePath = path.join(currentRelativePath, file);
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
          const found = await findFile(fullPath, childRelativePath);
          if (found) return found;
        } else if (file === name || file === `${name}.md`) {
          return childRelativePath;
        }
      }
      return null;
    }

    let foundPath = null;
    for (const repoPath of REPO_PATHS) {
      const basename = path.basename(repoPath);
      foundPath = await findFile(repoPath, basename);
      if (foundPath) break;
    }
    if (foundPath) {
      res.json({ path: foundPath });
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
