<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import WikiReader from './components/WikiReader.vue';
import WikiEditor from './components/WikiEditor.vue';

const router = useRouter();
const route = useRoute();

const selectedFilePath = ref('');
const isEditing = ref(false);
const isDirty = ref(false);
const is404 = ref(false);

const resolveAndLoad = async (wikiPath) => {
  // Reset states
  is404.value = false;
  
  let name = '';
  if (Array.isArray(wikiPath)) {
    name = wikiPath.filter(p => p).join('/');
  } else {
    name = wikiPath || '';
  }

  // Double check if we are at root using route.path to avoid false positives during transition
  const isRoot = !name || route.path === '/';

  if (isRoot) {
    try {
      const res = await fetch(`/api/resolve?name=index.md`);
      if (res.ok) {
        const data = await res.json();
        selectedFilePath.value = data.path;
      } else {
        selectedFilePath.value = '';
      }
    } catch (e) {
      selectedFilePath.value = '';
    }
    return;
  }

  try {
    const res = await fetch(`/api/resolve?name=${encodeURIComponent(name)}`);
    if (res.ok) {
      const data = await res.json();
      selectedFilePath.value = data.path;
    } else {
      is404.value = true;
      selectedFilePath.value = name;
    }
  } catch (e) {
    is404.value = true;
    selectedFilePath.value = name;
  }
};


watch(() => route.params.wikiPath, (newPath) => {
  if (isEditing.value && isDirty.value) {
    // If we are editing and dirty, we might have been triggered by browser back/forward
    // For simplicity, we just reload, but in a real app we might want to prevent navigation
  }
  resolveAndLoad(newPath);
}, { immediate: true });

const handleSelect = (path) => {
  if (isEditing.value && isDirty.value) {
    if (!confirm('You have unsaved changes. Discard and switch page?')) {
      return;
    }
  }
  
  // Navigate to clean URL
  let cleanUrl = '/' + path.replace(/\.md$/, '');
  router.push(cleanUrl);
  
  isEditing.value = false;
  isDirty.value = false;
};

const handleSave = () => {
  isEditing.value = false;
  isDirty.value = false;
};

const handleCancel = () => {
  isEditing.value = false;
  isDirty.value = false;
};
</script>

<template>
  <div class="app-layout">
    <Sidebar :selected-path="selectedFilePath" @select="handleSelect" />
    <main class="main-content">
      <!-- 頂部切換列 -->
      <div v-if="selectedFilePath && !is404" class="top-bar">
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

      <template v-if="is404">
        <div class="state-msg error-404">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon-404"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h1 class="error-title">404 - Page Not Found</h1>
          <p class="error-desc">The page "<code>{{ selectedFilePath }}</code>" does not exist.</p>
          <button class="btn btn-back-home" @click="router.push('/')">Back to Home</button>
        </div>
      </template>
      <template v-else-if="selectedFilePath">
        <div class="page-container">
          <WikiEditor 
            v-if="isEditing" 
            :path="selectedFilePath" 
            @save="handleSave"
            @cancel="handleCancel"
            @dirty-change="val => isDirty = val"
          />
          <WikiReader 
            v-else 
            :path="selectedFilePath" 
            @select="handleSelect"
          />
        </div>
      </template>
      <div v-else class="empty-state">
        <div class="state-msg welcome-state">
          <h2 class="welcome-title">Welcome to Tiny Wiki</h2>
          <p class="welcome-desc">Select a wiki page from the sidebar to start reading, or right-click to create a new one.</p>
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
  background-color: var(--bg);
  color: var(--text);
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
  background-color: var(--bg);
}

.top-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg);
  flex-shrink: 0;
  z-index: 10;
}

.view-toggle {
  display: flex;
  background-color: var(--code-bg);
  padding: 4px;
  border-radius: 25px;
}

.toggle-btn {
  padding: 6px 20px;
  border: none;
  background: transparent;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s;
}

.toggle-btn.active {
  background-color: var(--bg);
  color: var(--text-h);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.page-container {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.state-msg {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: var(--text);
}

.welcome-title, .error-title {
  font-family: var(--handwriting);
  font-size: 3rem;
  margin-bottom: 10px;
  color: var(--text-h);
}

.welcome-desc, .error-desc {
  font-size: 1.1rem;
  max-width: 500px;
  opacity: 0.8;
  line-height: 1.6;
}

.error-404 {
  color: #a67c52;
}

.icon-404 {
  margin-bottom: 20px;
  opacity: 0.3;
}

.btn-back-home {
  margin-top: 30px;
  padding: 10px 24px;
  background-color: var(--sidebar-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--sans);
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back-home:hover {
  background-color: var(--accent-bg);
  border-color: var(--accent);
}

.empty-state {
  flex: 1;
  display: flex;
}
</style>
