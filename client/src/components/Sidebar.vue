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

onMounted(fetchTree);
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Tiny Wiki</h2>
    </div>
    <div class="sidebar-content">
      <div v-if="loading" class="state-msg">Loading...</div>
      <div v-else-if="error" class="state-msg error">{{ error }}</div>
      <div v-else-if="treeData" class="tree-container">
        <FileTreeItem 
          v-for="child in treeData.children" 
          :key="child.path" 
          :item="child"
          :selected-path="selectedPath"
          @select="(path) => $emit('select', path)"
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
  padding: 20px;
  border-bottom: 1px solid #eee;
}
.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
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
