<script setup>
import { onMounted, ref } from 'vue';
import FileTreeItem from './FileTreeItem.vue';
import ContextMenu from './ContextMenu.vue';

defineProps({
  selectedPath: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select']);

const treeData = ref(null);
const loading = ref(true);
const error = ref(null);

// Context Menu State
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  path: ''
});

const handleContextMenu = ({ e, path }) => {
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    path
  };
};

const handleContextMenuAction = ({ type, path }) => {
  if (type === 'new-page') {
    createNewFile(path);
  } else if (type === 'new-folder') {
    createNewFolder(path);
  }
  contextMenu.value.show = false;
};

const fetchTree = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/tree');
    if (!response.ok) throw new Error('Failed to fetch tree');
    treeData.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const createNewFile = async (targetDir = '') => {
  const name = prompt('Enter new file name (e.g., page.md):');
  if (!name) return;
  
  const fileName = name.endsWith('.md') ? name : `${name}.md`;
  const prefix = (targetDir && targetDir !== '/') ? `${targetDir}/` : '';
  const fullPath = `${prefix}${fileName}`;
  
  try {
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: fullPath, content: `# ${name}\n\nStart writing here...` })
    });
    if (!res.ok) throw new Error('Failed to create file');
    await fetchTree();
    emit('select', fullPath);
  } catch (err) {
    alert(err.message);
  }
};

const createNewFolder = async (targetDir = '') => {
  const name = prompt('Enter new folder name:');
  if (!name) return;
  
  const prefix = (targetDir && targetDir !== '/') ? `${targetDir}/` : '';
  const fullPath = `${prefix}${name}`;
  
  try {
    const res = await fetch('/api/directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: fullPath })
    });
    if (!res.ok) throw new Error('Failed to create folder');
    await fetchTree();
  } catch (err) {
    alert(err.message);
  }
};

const handleDelete = async (path) => {
  try {
    const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Delete failed');
    }
    await fetchTree();
    emit('select', ''); 
  } catch (err) {
    alert(err.message);
  }
};

onMounted(fetchTree);
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Tiny Wiki</h2>
    </div>
    <div class="sidebar-content" @contextmenu.prevent.stop="e => handleContextMenu({ e, path: '' })">
      <div v-if="loading && !treeData" class="state-msg">Loading...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>
      <div v-else-if="treeData" class="tree-container">
        <FileTreeItem 
          v-for="child in treeData.children" 
          :key="child.path" 
          :item="child"
          :selected-path="selectedPath"
          @select="(path) => $emit('select', path)"
          @delete="handleDelete"
          @contextmenu="handleContextMenu"
        />
      </div>
    </div>
    
    <ContextMenu 
      v-if="contextMenu.show" 
      :x="contextMenu.x" 
      :y="contextMenu.y" 
      :path="contextMenu.path"
      @close="contextMenu.show = false"
      @action="handleContextMenuAction"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  border-right: 1px solid var(--border);
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 25px 20px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}
.sidebar-header h2 {
  margin: 0;
  font-size: 2rem;
  color: var(--text-h);
  font-family: var(--handwriting);
  font-weight: 600;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.state-msg {
  padding: 20px;
  text-align: center;
  color: var(--text);
  opacity: 0.7;
}
.tree-container {
  text-align: left;
}
.error {
  color: #dc3545;
}
</style>
