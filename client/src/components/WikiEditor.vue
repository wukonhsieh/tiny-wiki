<script setup>
import { ref, onMounted, computed } from 'vue';
import { renderMarkdown } from '../utils/markdown';
import 'highlight.js/styles/github.css';

const props = defineProps({
  path: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['save', 'cancel']);

const rawContent = ref('');
const loading = ref(true);
const saving = ref(false);
const error = ref(null);

const renderedHtml = computed(() => renderMarkdown(rawContent.value));

const fetchContent = async () => {
  loading.value = true;
  try {
    const response = await fetch(`/api/file?path=${encodeURIComponent(props.path)}`);
    if (!response.ok) throw new Error('Failed to load file');
    const data = await response.json();
    rawContent.value = data.content;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    const response = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: props.path,
        content: rawContent.value
      })
    });
    if (!response.ok) throw new Error('Save failed');
    emit('save');
  } catch (err) {
    alert('Error saving: ' + err.message);
  } finally {
    saving.value = false;
  }
};

onMounted(fetchContent);
</script>

<template>
  <div class="wiki-editor">
    <div class="editor-toolbar">
      <span class="editing-path">Editing: <code>{{ path }}</code></span>
      <div class="actions">
        <button class="btn btn-cancel" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-save" :disabled="saving" @click="handleSave">
          {{ saving ? 'Saving...' : '💾 Save' }}
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
        <div class="markdown-body" v-html="renderedHtml"></div>
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
}

.editor-toolbar {
  padding: 10px 20px;
  background: #f1f3f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editing-path code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ced4da;
}

.btn-save {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-save:hover {
  background: #218838;
}

.btn-cancel:hover {
  background: #e2e6ea;
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
  border-right: 1px solid #eee;
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
  background-color: #fcfcfc;
}

.preview-pane {
  padding: 20px;
  background: white;
}

.state-msg {
  padding: 50px;
  text-align: center;
}

/* Re-use Markdown Styles */
:deep(.markdown-body) {
  line-height: 1.6;
  color: #24292e;
}
:deep(.markdown-body h1) { border-bottom: 1px solid #eaecef; }
:deep(.markdown-body pre) {
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 6px;
}
</style>
