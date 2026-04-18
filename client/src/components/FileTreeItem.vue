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
    >
      <span class="icon">{{ item.type === 'directory' ? (isOpen ? '📂' : '📁') : '📄' }}</span>
      <span class="name">{{ item.name }}</span>
      <button class="btn-delete" @click="handleDelete">🗑️</button>
    </div>
    
    <div v-if="item.type === 'directory' && isOpen" class="item-children">
      <FileTreeItem 
        v-for="child in item.children" 
        :key="child.path" 
        :item="child"
        :selected-path="selectedPath"
        @select="(path) => $emit('select', path)"
        @delete="(path) => $emit('delete', path)"
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
