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

app.get('/api/tree', async (req, res) => {
  try {
    const tree = await getTree(REPO_PATH);
    res.json(tree);
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
