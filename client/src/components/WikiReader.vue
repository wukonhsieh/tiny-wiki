<script setup>
import { ref, watch } from 'vue';
import { renderMarkdown } from '../utils/markdown';
import 'highlight.js/styles/github.css';

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['edit']);

const renderedHtml = ref('');
const pageTitle = ref('');
const loading = ref(false);
const error = ref(null);

const fetchFileContent = async (filePath) => {
  if (!filePath) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) throw new Error('File not found or server error');
    
    const data = await response.json();
    const rawContent = data.content || '';
    
    // 擷取第一行作為標題
    const lines = rawContent.split('\n');
    const firstLine = lines[0] || '';
    
    // 移除 Markdown H1 前綴 # 
    pageTitle.value = firstLine.replace(/^#\s+/, '') || filePath.split('/').pop();
    
    // 其餘部分作為內文
    const bodyContent = lines.slice(1).join('\n');
    renderedHtml.value = renderMarkdown(bodyContent);
  } catch (err) {
    error.value = err.message;
    renderedHtml.value = '';
  } finally {
    loading.value = false;
  }
};

watch(() => props.path, (newPath) => {
  fetchFileContent(newPath);
}, { immediate: true });

</script>

<template>
  <div class="wiki-reader">
    <div class="reader-toolbar">
      <button class="btn-edit" @click="$emit('edit')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        Edit
      </button>
    </div>
    
    <div v-if="loading" class="state-msg">Loading content...</div>
    <div v-else-if="error" class="state-msg error">
      <h3>Error</h3>
      <p>{{ error }}</p>
    </div>
    <div v-else class="content-wrapper">
      <header class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </header>
      <div class="markdown-body" v-html="renderedHtml"></div>
    </div>
  </div>
</template>

<style scoped>
.wiki-reader {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
  position: relative;
}

.reader-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.page-title {
  margin: 0;
  font-size: 2.8rem;
  color: #1a1d21;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.state-msg {
  text-align: center;
  padding: 50px;
  color: #6c757d;
}

.error {
  color: #dc3545;
}

/* Markdown Styles */
:deep(.markdown-body) {
  line-height: 1.6;
  color: #24292e;
}

:deep(.markdown-body h1) {
  padding-bottom: 0.3em;
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
}

:deep(.markdown-body h2) {
  padding-bottom: 0.3em;
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  margin-top: 24px;
}

:deep(.markdown-body pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
}

:deep(.markdown-body code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}
</style>
