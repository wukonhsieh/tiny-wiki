<script setup>
import { onMounted, ref } from 'vue';
import FileTreeItem from './FileTreeItem.vue';

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

const createNewFile = async () => {
  const name = prompt('Enter new file name (e.g., page.md):');
  if (!name) return;
  
  const path = name.endsWith('.md') ? name : `${name}.md`;
  
  try {
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content: `# ${name}\n\nStart writing here...` })
    });
    if (!res.ok) throw new Error('Failed to create file');
    await fetchTree();
    emit('select', path);
  } catch (err) {
    alert(err.message);
  }
};

const createNewFolder = async () => {
  const name = prompt('Enter new folder name:');
  if (!name) return;
  
  try {
    const res = await fetch('/api/directory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: name })
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
    emit('select', ''); // Clear selection if deleted file was active
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
      <div class="sidebar-actions">
        <button class="btn-action" title="New File" @click="createNewFile">📄+</button>
        <button class="btn-action" title="New Folder" @click="createNewFolder">📁+</button>
        <button class="btn-action" title="Refresh" @click="fetchTree">🔄</button>
      </div>
    </div>
    <div class="sidebar-content">
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
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  border-right: 1px solid #ddd;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}
.sidebar-header h2 {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  color: #333;
}
.sidebar-actions {
  display: flex;
  gap: 8px;
}
.btn-action {
  padding: 4px 8px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-action:hover {
  background: #e9ecef;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.state-msg {
  padding: 20px;
  text-align: center;
  color: #666;
}
.error {
  color: #dc3545;
}
</style>
