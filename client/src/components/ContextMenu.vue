<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  x: Number,
  y: Number,
  path: String
});

const emit = defineEmits(['close', 'action']);

const menuRef = ref(null);

const handleAction = (type) => {
  emit('action', { type, path: props.path });
  emit('close');
};

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  window.addEventListener('contextmenu', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
  window.removeEventListener('contextmenu', handleClickOutside);
});
</script>

<template>
  <div 
    ref="menuRef"
    class="context-menu" 
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div class="menu-item" @click="handleAction('new-page')">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
      New Page
    </div>
    <div class="menu-item" @click="handleAction('new-folder')">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
      New Folder
    </div>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 6px 0;
  min-width: 160px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: background 0.1s;
}

.menu-item:hover {
  background-color: #f8f9fa;
  color: #007bff;
}

.menu-item svg {
  color: #6c757d;
}

.menu-item:hover svg {
  color: #007bff;
}
</style>
