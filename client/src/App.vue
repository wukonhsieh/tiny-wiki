<script setup>
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue';
import WikiReader from './components/WikiReader.vue';

const selectedFilePath = ref('');

const handleSelect = (path) => {
  selectedFilePath.value = path;
};
</script>

<template>
  <div class="app-layout">
    <Sidebar :selected-path="selectedFilePath" @select="handleSelect" />
    <main class="main-content">
      <WikiReader v-if="selectedFilePath" :path="selectedFilePath" />
      <div v-else class="empty-state">
        <div class="empty-msg">
          <span class="empty-icon">📖</span>
          <p>Select a wiki page to start reading</p>
        </div>
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
  color: #2c3e50;
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-msg {
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.2rem;
  margin: 0;
}
</style>
