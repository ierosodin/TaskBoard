// Composables
import { createRouter, createWebHistory } from 'vue-router'
import TaskBoard from '@/views/TaskBoard.vue'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: "any",
    component: () => TaskBoard,
  },
  {
    path: '/home',
    name: "home",
    component: () => TaskBoard,
  },
  {
    path: '/task-board',
    name: "task-board",
    component: () => TaskBoard,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
