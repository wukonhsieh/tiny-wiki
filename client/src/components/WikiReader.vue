<script setup>
import { ref, watch, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 使用 GitHub 風格的高亮

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const content = ref('');
const renderedHtml = ref('');
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
    content.value = data.content;
    renderedHtml.value = md.render(data.content);
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
    <div v-else class="markdown-body" v-html="renderedHtml"></div>
  </div>
</template>

<style scoped>
.wiki-reader {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.state-msg {
  text-align: center;
  padding: 50px;
  color: #666;
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

:deep(.markdown-body blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e1;
  margin: 0 0 16px 0;
}
</style>
