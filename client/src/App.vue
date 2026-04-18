<script setup>
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue';

const selectedFilePath = ref('');

const handleSelect = (path) => {
  selectedFilePath.value = path;
};
</script>

<template>
  <div class="app-layout">
    <Sidebar :selected-path="selectedFilePath" @select="handleSelect" />
    <main class="main-content">
      <div v-if="selectedFilePath" class="content-header">
        <h1>Selected: {{ selectedFilePath }}</h1>
      </div>
      <div v-else class="empty-state">
        <p>Select a wiki page to start reading</p>
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
  background-color: #fff;
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.content-header h1 {
  font-size: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.2rem;
}
</style>
