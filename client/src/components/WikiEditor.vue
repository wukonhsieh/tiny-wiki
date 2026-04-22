<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { renderMarkdown } from '../utils/markdown';
import { patchEmbeds } from '../utils/embedPatcher';
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

const emit = defineEmits(['save', 'cancel', 'dirtyChange']);

const rawContent = ref('');
const originalContent = ref('');
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const previewBodyRef = ref(null);

const renderedHtml = computed(() => {
  let bodyStr = rawContent.value;
  const match = bodyStr.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (match) {
    bodyStr = bodyStr.substring(match[0].length);
  }
  
  return renderMarkdown(bodyStr);
});
const isDirty = computed(() => rawContent.value !== originalContent.value);

watch(isDirty, (val) => {
  emit('dirtyChange', val);
}, { immediate: true });

// 每次 preview 內容更新後，等 Vue re-render 再執行 embed patch
watch(renderedHtml, async () => {
  await nextTick();
  if (previewBodyRef.value) {
    patchEmbeds(previewBodyRef.value, props.repo);
  }
});


const fetchContent = async () => {
  loading.value = true;
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(props.path)}&repo=${props.repo}`);
    if (!response.ok) throw new Error('Failed to load file');
    const data = await response.json();
    rawContent.value = data.content;
    originalContent.value = data.content;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    const response = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: props.path,
        content: rawContent.value,
        repo: props.repo
      })
    });
    if (!response.ok) throw new Error('Save failed');
    originalContent.value = rawContent.value;
    emit('save');
  } catch (err) {
    alert('Error saving: ' + err.message);
  } finally {
    saving.value = false;
  }
};

const handleKeyboard = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (isDirty.value) {
      handleSave();
    }
  }
};

onMounted(() => {
  fetchContent();
  window.addEventListener('keydown', handleKeyboard);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
});
</script>

<template>
  <div class="wiki-editor">
    <transition name="slide-down">
      <div v-if="isDirty" class="notification-bar">
        <div class="notification-content">
          <span class="notification-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-inline"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            You have unsaved changes.
          </span>
          <button class="btn btn-save-now" :disabled="saving" @click="handleSave">
            <template v-if="saving">Saving...</template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-inline"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Save Now
            </template>
          </button>
        </div>
      </div>
    </transition>

    <div class="editor-toolbar">
      <span class="editing-path">Editing: <code>{{ path }}</code></span>
      <div class="actions">
        <button class="btn btn-cancel" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-save" :disabled="saving" @click="handleSave">
          <template v-if="saving">Saving...</template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-inline"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Save
          </template>
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="state-msg">Preparing editor...</div>
    <div v-else class="editor-main">
      <div class="editor-pane">
        <textarea 
          v-model="rawContent" 
          placeholder="Write markdown here..."
        ></textarea>
      </div>
      <div class="preview-pane">
        <div ref="previewBodyRef" class="markdown-body" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wiki-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  text-align: left;
}

.notification-bar {
  background-color: var(--accent-bg);
  border-bottom: 1px solid var(--accent-border);
  color: var(--text-h);
  padding: 10px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.notification-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

.notification-text {
  font-weight: 500;
}

.btn-save-now {
  background-color: var(--accent);
  color: var(--text-h);
  border: 1px solid var(--accent-border);
  font-weight: 600;
  padding: 4px 12px;
  font-size: 0.85rem;
  border-radius: 4px;
}

.btn-save-now:hover {
  background-color: var(--border);
}

.btn-save-now:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.editor-toolbar {
  padding: 10px 20px;
  background: var(--sidebar-bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editing-path code {
  background: var(--accent-bg);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-h);
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid var(--border);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.icon-inline {
  flex-shrink: 0;
}

.notification-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-save {
  background: var(--accent);
  color: var(--text-h);
  border-color: var(--accent-border);
}

.btn-save:hover {
  background: var(--border);
}

.btn-cancel {
  background: var(--bg);
  color: var(--text);
}

.btn-cancel:hover {
  background: var(--code-bg);
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-pane, .preview-pane {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

.editor-pane {
  border-right: 1px solid var(--border);
}

textarea {
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  background-color: var(--bg);
  color: var(--text-h);
}

.preview-pane {
  padding: 20px;
  background: var(--bg);
}

.state-msg {
  padding: 50px;
  text-align: center;
  color: var(--text);
}

/* Re-use Markdown Styles */
:deep(.markdown-body) {
  line-height: 1.6;
  color: var(--text-h);
}
:deep(.markdown-body h1) { border-bottom: 1px solid var(--border); }
:deep(.markdown-body pre) {
  padding: 16px;
  background-color: var(--code-bg);
  border-radius: 6px;
  overflow: auto;
}

:deep(.markdown-body code) {
  padding: 0.2em 0.4em;
  background-color: var(--accent-bg);
  border-radius: 3px;
  font-size: 85%;
  font-family: var(--mono);
}

:deep(.markdown-body pre code) {
  display: block;
  padding: 0;
  background-color: transparent;
  font-size: 100%;
}

/* ── Embed Styles ─────────────────────────────────────────────────────────── */

:deep(.embed-image) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1em 0;
  border-radius: 6px;
}

:deep(.embed-video) {
  display: block;
  max-width: 100%;
  margin: 1em 0;
  border-radius: 6px;
  background-color: #000;
}

:deep(.embed-callout) {
  display: block;
  margin: 1em 0;
  padding: 10px 16px;
  border-left: 3px solid var(--accent);
  background-color: var(--accent-bg);
  border-radius: 0 6px 6px 0;
  font-size: 0.95rem;
  color: var(--text-h);
}

:deep(.embed-download) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #a67c52;
  text-decoration: none;
  border-bottom: 1px dashed #a67c52;
  font-size: 0.95rem;
  transition: all 0.2s;
}

:deep(.embed-download)::before {
  content: '📎';
  font-size: 0.9em;
}

:deep(.embed-download):hover {
  background-color: var(--accent-bg);
  border-bottom-style: solid;
}

:deep(.embed-broken) {
  display: inline-block;
  padding: 4px 10px;
  background-color: var(--code-bg);
  border: 1px dashed var(--border);
  border-radius: 4px;
  color: var(--text);
  opacity: 0.6;
  font-size: 0.85rem;
  font-family: var(--mono);
  margin: 2px 0;
}

</style>
