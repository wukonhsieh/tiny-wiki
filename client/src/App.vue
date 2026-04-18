<script setup>
import { ref, onMounted } from 'vue';

const message = ref('Loading...');

onMounted(async () => {
  try {
    const response = await fetch('/api/hello');
    const data = await response.json();
    message.value = data.message;
  } catch (error) {
    message.value = 'Error fetching from server: ' + error.message;
  }
});
</script>

<template>
  <div class="test-container">
    <h1>Tiny Wiki Test</h1>
    <p>Server Response: <strong>{{ message }}</strong></p>
  </div>
</template>

<style scoped>
.test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: sans-serif;
  background-color: #f0f2f5;
}
h1 {
  color: #2c3e50;
}
p {
  font-size: 1.2rem;
  color: #34495e;
}
strong {
  color: #42b983;
}
</style>
