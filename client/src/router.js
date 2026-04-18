import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:wikiPath(.*)*',
      component: App, // We just stay in App and handle logic there
    }
  ]
});

export default router;
