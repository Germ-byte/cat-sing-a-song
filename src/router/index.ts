import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/discover',
      children: [
        { path: 'discover', name: 'discover', component: () => import('@/views/DiscoverView.vue') },
        { path: 'new-songs', name: 'new-songs', component: () => import('@/views/NewSongsView.vue') },
        { path: 'rank', name: 'rank', component: () => import('@/views/RankView.vue') },
        { path: 'search', name: 'search', component: () => import('@/views/SearchView.vue') },
        { path: 'library', name: 'library', component: () => import('@/views/LibraryView.vue') },
        { path: 'history', name: 'history', component: () => import('@/views/HistoryView.vue') },
      ],
    },
  ],
})

export default router
