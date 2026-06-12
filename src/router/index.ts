import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import VerificationWorkstation from '@/pages/VerificationWorkstation.vue'
import ExceptionPool from '@/pages/ExceptionPool.vue'

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
  {
    path: '/exceptions',
    name: 'exceptions',
    component: ExceptionPool,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
