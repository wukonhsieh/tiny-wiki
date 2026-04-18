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

const emit = defineEmits(['edit', 'select']);

const handleLinkClick = (event) => {
  const target = event.target.closest('a');
  if (!target) return;

  const href = target.getAttribute('href');
  
  // 檢查是否為內部連結 (以 .md 結尾且非 http 開頭)
  if (href && href.endsWith('.md') && !href.startsWith('http')) {
    event.preventDefault();
    // 這裡我們需要處理相對路徑
    // 簡單起見，如果是以 ./ 開頭則移除，或者直接傳遞給父組件處理
    // 在這個專案中，所有的 path 都是相對於 repository 的
    let cleanPath = href.startsWith('./') ? href.substring(2) : href;
    
    // 如果目前的頁面在子目錄中，相對路徑需要正確拼接
    if (!cleanPath.startsWith('/') && props.path.includes('/')) {
      const currentDir = props.path.substring(0, props.path.lastIndexOf('/'));
      cleanPath = `${currentDir}/${cleanPath}`;
    }
    
    emit('select', cleanPath);
  }
};

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
    <div v-if="loading" class="state-msg">Loading content...</div>
    <div v-else-if="error" class="state-msg error">
      <h3>Error</h3>
      <p>{{ error }}</p>
    </div>
    <div v-else class="content-wrapper">
      <header class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </header>
      <div class="markdown-body" v-html="renderedHtml" @click="handleLinkClick"></div>
    </div>
  </div>
</template>

<style scoped>
.wiki-reader {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
  position: relative;
  text-align: left;
}

.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.page-title {
  margin: 0;
  font-size: 2.8rem;
  color: var(--text-h);
  font-family: var(--heading);
  font-weight: 300;
  letter-spacing: -0.02em;
}

.state-msg {
  text-align: center;
  padding: 50px;
  color: var(--text);
  opacity: 0.7;
}

.error {
  color: #dc3545;
}

/* Markdown Styles */
:deep(.markdown-body) {
  line-height: 1.6;
  color: var(--text-h);
}

:deep(.markdown-body h1) {
  padding-bottom: 0.3em;
  font-size: 2em;
  border-bottom: 1px solid var(--border);
  font-family: var(--heading);
  font-weight: 400;
}

:deep(.markdown-body h2) {
  padding-bottom: 0.3em;
  font-size: 1.5em;
  border-bottom: 1px solid var(--border);
  margin-top: 24px;
  font-family: var(--heading);
  font-weight: 400;
}

:deep(.markdown-body pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--code-bg);
  border-radius: 6px;
}

:deep(.markdown-body code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: var(--accent-bg);
  border-radius: 3px;
}
</style>
