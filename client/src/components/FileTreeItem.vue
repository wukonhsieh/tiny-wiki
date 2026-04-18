<script setup>
import { ref } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selectedPath: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select', 'delete']);

const isOpen = ref(false);

const toggle = () => {
  if (props.item.type === 'directory') {
    isOpen.value = !isOpen.value;
  }
};

const selectItem = () => {
  if (props.item.type === 'file') {
    emit('select', props.item.path);
  } else {
    toggle();
  }
};

const handleDelete = (e) => {
  e.stopPropagation();
  if (confirm(`Are you sure you want to delete ${props.item.name}?`)) {
    emit('delete', props.item.path);
  }
};
</script>

<template>
  <div class="file-tree-item">
    <div 
      class="item-label" 
      :class="{ 
        'is-active': selectedPath === item.path,
        'is-directory': item.type === 'directory' 
      }"
      @click="selectItem"
      @contextmenu.prevent="e => item.type === 'directory' && $emit('contextmenu', { e, path: item.path })"
    >
      <span class="icon">
        <!-- Folder Icon -->
        <svg v-if="item.type === 'directory'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <!-- File Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </span>
      <span class="name">{{ item.name }}</span>
      <button class="btn-delete" title="Delete" @click="handleDelete">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
    
    <div v-if="item.type === 'directory' && isOpen" class="item-children">
      <FileTreeItem 
        v-for="child in item.children" 
        :key="child.path" 
        :item="child"
        :selected-path="selectedPath"
        @select="(path) => $emit('select', path)"
        @delete="(path) => $emit('delete', path)"
        @contextmenu="(payload) => $emit('contextmenu', payload)"
      />
    </div>
  </div>
</template>

<style scoped>
.file-tree-item {
  user-select: none;
}
.item-label {
  display: flex;
  padding: 6px 12px;
  cursor: pointer;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 0.9rem;
  position: relative;
  group: hover;
}
.item-label:hover {
  background-color: #e9ecef;
}
.item-label:hover .btn-delete {
  opacity: 1;
}
.item-label.is-active {
  background-color: #e7f1ff;
  color: #007bff;
  font-weight: 600;
}
.icon {
  margin-right: 8px;
  font-size: 1rem;
}
.name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}
.btn-delete {
  opacity: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px 5px;
  font-size: 0.8rem;
  transition: opacity 0.2s;
}
.btn-delete:hover {
  background: #f8d7da;
  border-radius: 3px;
}
.item-children {
  margin-left: 18px;
  border-left: 1px solid #dee2e6;
}
</style>
