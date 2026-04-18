<script setup>
import { ref, watch } from 'vue';
import Sidebar from './components/Sidebar.vue';
import WikiReader from './components/WikiReader.vue';
import WikiEditor from './components/WikiEditor.vue';

const selectedFilePath = ref('');
const isEditing = ref(false);

const handleSelect = (path) => {
  if (isEditing.value) {
    if (!confirm('You have unsaved changes. Discard and switch page?')) {
      return;
    }
  }
  selectedFilePath.value = path;
  isEditing.value = false;
};

const startEdit = () => {
  isEditing.value = true;
};

const handleSave = () => {
  isEditing.value = false;
};

const handleCancel = () => {
  isEditing.value = false;
};

// Reset edit mode when file path changes via other means
watch(selectedFilePath, () => {
  isEditing.value = false;
});
</script>

<template>
  <div class="app-layout">
    <Sidebar :selected-path="selectedFilePath" @select="handleSelect" />
    <main class="main-content">
      <!-- 頂部切換列 -->
      <div v-if="selectedFilePath" class="top-bar">
        <div class="view-toggle">
          <button 
            :class="['toggle-btn', { active: !isEditing }]" 
            @click="isEditing = false"
          >
            Preview
          </button>
          <button 
            :class="['toggle-btn', { active: isEditing }]" 
            @click="isEditing = true"
          >
            Edit
          </button>
        </div>
      </div>

      <template v-if="selectedFilePath">
        <div class="page-container">
          <WikiEditor 
            v-if="isEditing" 
            :path="selectedFilePath" 
            @save="handleSave"
            @cancel="handleCancel"
          />
          <WikiReader 
            v-else 
            :path="selectedFilePath" 
          />
        </div>
      </template>
      <div v-else class="empty-state">
        <div class="empty-msg">
          <span class="empty-icon">📖</span>
          <p>Select a wiki page to start reading</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Global Styles */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #fff;
  color: #2c3e50;
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
}

.top-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  flex-shrink: 0;
  z-index: 10;
}

.view-toggle {
  display: flex;
  background-color: #f1f3f5;
  padding: 4px;
  border-radius: 8px;
}

.toggle-btn {
  padding: 6px 20px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s;
}

.toggle-btn.active {
  background-color: #fff;
  color: #212529;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.page-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-msg {
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
}
</style>
