const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const path = require('path');
const fs = require('fs').promises;

app.use(cors());
app.use(express.json());

const REPO_PATH = process.env.REPO_PATH || path.join(__dirname, '../repository');

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
      name: relativePath === '' ? 'root' : name,
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
  // 使用 path.resolve 取得絕對路徑，並比對是否在 REPO_PATH 內
  const fullPath = path.resolve(REPO_PATH, reqPath);
  if (!fullPath.startsWith(REPO_PATH)) {
    return null;
  }
  return fullPath;
}

app.get('/api/tree', async (req, res) => {
  try {
    const tree = await getTree(REPO_PATH);
    res.json(tree);
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

app.get('/api/hello', (req, res) => {
  res.json({ message: "hello from server" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
