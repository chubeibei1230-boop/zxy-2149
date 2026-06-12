import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import VerificationWorkstation from '@/pages/VerificationWorkstation.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/verification',
    name: 'verification',
    component: VerificationWorkstation,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
