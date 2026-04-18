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
      <div class="sidebar-actions">
        <button class="btn-action" title="New File" @click="createNewFile">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        </button>
        <button class="btn-action" title="New Folder" @click="createNewFolder">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
        </button>
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
  padding: 6px;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-action:hover {
  background: #e9ecef;
  border-color: #adb5bd;
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
