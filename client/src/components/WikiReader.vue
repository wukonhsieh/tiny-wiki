<script setup>
import { ref, watch } from 'vue';
import { renderMarkdown } from '../utils/markdown';
import 'highlight.js/styles/github.css';

const props = defineProps({
  path: {
    type: String,
    required: true
  },
  repo: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['edit', 'select']);

const handleLinkClick = async (event) => {
  const target = event.target.closest('a');
  if (!target) return;

  const href = target.getAttribute('href');
  const isWikilink = target.dataset.wikilink === 'true';

  if (isWikilink) {
    event.preventDefault();
    try {
      const res = await fetch(`/api/resolve?name=${encodeURIComponent(href)}&repo=${props.repo}`);
      if (res.ok) {
        const data = await res.json();
        emit('select', data.path, data.repo !== undefined ? data.repo : props.repo);
      } else {
        console.warn('Wikilink resolution failed:', href);
        // 如果找不到，可以考慮給個視覺提示，但目前先不跳 alert 以免干擾
      }
    } catch (err) {
      console.error('Failed to resolve wikilink', err);
    }
    return;
  }
  
  // 檢查是否為內部連結 (以 .md 結尾且非 http 開頭)
  if (href && href.endsWith('.md') && !href.startsWith('http')) {
    event.preventDefault();
    let cleanPath = href.startsWith('./') ? href.substring(2) : href;
    
    if (!cleanPath.startsWith('/') && props.path.includes('/')) {
      const currentDir = props.path.substring(0, props.path.lastIndexOf('/'));
      cleanPath = `${currentDir}/${cleanPath}`;
    }
    
    emit('select', cleanPath, props.repo);
  }
};

import yaml from 'js-yaml';

const renderedHtml = ref('');
const pageTitle = ref('');
const loading = ref(false);
const error = ref(null);
const frontmatter = ref({});
const rawBodyContent = ref('');

const removeTag = async (key, index) => {
  if (!frontmatter.value[key] || !Array.isArray(frontmatter.value[key])) return;
  
  frontmatter.value[key].splice(index, 1);
  
  let fmString = '';
  if (Object.keys(frontmatter.value).length > 0) {
    fmString = '---\n' + yaml.dump(frontmatter.value) + '---\n';
  }
  
  const fullContent = fmString + rawBodyContent.value;
  
  try {
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: props.path, content: fullContent, repo: props.repo })
    });
    if (!res.ok) throw new Error('Failed to update frontmatter');
  } catch (err) {
    console.error(err);
    alert('Failed to save frontmatter tag removal');
  }
};

const fetchFileContent = async (filePath) => {
  if (!filePath) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}&repo=${props.repo}`);
    if (!response.ok) throw new Error('File not found or server error');
    
    const data = await response.json();
    const rawContent = data.content || '';
    
    let bodyContentStr = rawContent;
    let frontmatterStr = '';
    
    const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (match) {
      frontmatterStr = match[1];
      bodyContentStr = rawContent.substring(match[0].length);
    }
    
    rawBodyContent.value = bodyContentStr;
    
    if (frontmatterStr) {
      try {
        frontmatter.value = yaml.load(frontmatterStr) || {};
      } catch (e) {
        console.error("Failed to parse YAML frontmatter", e);
        frontmatter.value = {};
      }
    } else {
      frontmatter.value = {};
    }
    
    const lines = bodyContentStr.split('\n');
    let titleLine = '';
    
    let firstNonEmptyIndex = lines.findIndex(line => line.trim().length > 0);
    if (firstNonEmptyIndex !== -1) {
      titleLine = lines[firstNonEmptyIndex];
      pageTitle.value = titleLine.replace(/^#+\s+/, '') || filePath.split('/').pop();
      lines.splice(firstNonEmptyIndex, 1);
    } else {
      pageTitle.value = filePath.split('/').pop();
    }
    
    const bodyContent = lines.join('\n');
    renderedHtml.value = renderMarkdown(bodyContent);
  } catch (err) {
    error.value = err.message;
    renderedHtml.value = '';
  } finally {
    loading.value = false;
  }
};


watch(() => [props.path, props.repo], ([newPath]) => {
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
      
      <div v-if="Object.keys(frontmatter).length > 0" class="frontmatter-table-container">
        <table class="frontmatter-table">
          <tbody>
            <tr v-for="(value, key) in frontmatter" :key="key">
              <th class="fm-key">{{ key }}</th>
              <td class="fm-value">
                <template v-if="Array.isArray(value)">
                  <span class="fm-tag" v-for="(item, idx) in value" :key="idx">
                    {{ item }}
                    <span class="fm-tag-remove" @click="removeTag(key, idx)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                  </span>
                </template>
                <template v-else>
                  {{ value }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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

.frontmatter-table-container {
  margin-bottom: 24px;
  overflow-x: auto;
}
.frontmatter-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.frontmatter-table th, .frontmatter-table td {
  border: 1px solid var(--border);
  padding: 10px 14px;
  text-align: left;
}
.fm-key {
  width: 150px;
  background-color: var(--code-bg);
  font-weight: 500;
  color: var(--text-h);
}
.fm-tag {
  display: inline-flex;
  align-items: center;
  background-color: var(--accent-bg);
  color: var(--text-h);
  padding: 4px 10px;
  border-radius: 12px;
  margin-right: 8px;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}
.fm-tag:hover {
  background-color: var(--accent);
}

:deep(.wikilink) {
  color: #a67c52; /* Earthy brown */
  text-decoration: none;
  border-bottom: 1px dashed #a67c52;
  transition: all 0.2s;
}

:deep(.wikilink):hover {
  background-color: var(--accent-bg);
  border-bottom-style: solid;
}

.fm-tag-remove {
  margin-left: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.fm-tag:hover .fm-tag-remove {
  opacity: 1;
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
  font-family: var(--mono);
}

:deep(.markdown-body pre code) {
  display: block;
  padding: 0;
  background-color: transparent;
  font-size: 100%;
}

</style>
