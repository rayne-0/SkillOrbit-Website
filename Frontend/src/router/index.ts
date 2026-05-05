import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // Auth — no layout
    { path: '/login', component: () => import('../pages/LoginSignupPage.vue') },

    // Lecture — no shared layout (full-screen)
    { path: '/learn/:courseId/lecture/:lectureId', component: () => import('../pages/LecturePage.vue'), meta: { requiresAuth: true } },

    // Public pages — with layout
    {
      path: '/',
      component: () => import('../components/AppLayout.vue'),
      children: [
        { path: '',            component: () => import('../pages/HomePage.vue') },
        { path: 'courses',     component: () => import('../pages/CoursesPage.vue') },
        { path: 'courses/:id', component: () => import('../pages/CourseDetailPage.vue') },
        { path: 'about',       component: () => import('../pages/AboutPage.vue') },
        { path: 'contact',     component: () => import('../pages/ContactPage.vue') },
        { path: 'leaderboard', component: () => import('../pages/LeaderboardPage.vue') },
        { path: 'search',      component: () => import('../pages/SearchResultsPage.vue') },
        { path: 'instructor/:name', component: () => import('../pages/InstructorPage.vue') },
      ],
    },

    // Protected pages — with layout
    {
      path: '/dashboard',
      component: () => import('../components/AppLayout.vue'),
      children: [
        { path: '', component: () => import('../pages/DashboardPage.vue'), meta: { requiresAuth: true } },
      ],
    },
    {
      path: '/certificate/:courseId',
      component: () => import('../components/AppLayout.vue'),
      children: [
        { path: '', component: () => import('../pages/CertificatePage.vue'), meta: { requiresAuth: true } },
      ],
    },

    // Admin — with layout
    {
      path: '/admin',
      component: () => import('../components/AppLayout.vue'),
      children: [
        { path: '',           component: () => import('../pages/admin/AdminDashboardPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'dashboard',  component: () => import('../pages/admin/AdminDashboardPage.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'courses',    component: () => import('../pages/admin/AdminCoursesPanel.vue'),  meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'users',      component: () => import('../pages/admin/AdminUsersPanel.vue'),    meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'mentors',    component: () => import('../pages/admin/AdminMentorsPanel.vue'),  meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'assignments',component: () => import('../pages/admin/AdminAssignmentsPanel.vue'),meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'announcements',component: () => import('../pages/admin/AdminAnnouncementsPanel.vue'),meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'reports',    component: () => import('../pages/admin/AdminReportsPanel.vue'),  meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'financials', component: () => import('../pages/admin/AdminFinancialsPanel.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
        { path: 'settings',   component: () => import('../pages/admin/AdminSettingsPanel.vue'),   meta: { requiresAuth: true, requiresAdmin: true } },
      ],
    },

    // Course learning — with layout
    {
      path: '/learn/:courseId',
      component: () => import('../components/AppLayout.vue'),
      children: [
        { path: '',      component: () => import('../pages/CourseHomePage.vue'),  meta: { requiresAuth: true } },
        { path: 'notes', component: () => import('../pages/CourseNotesPage.vue'), meta: { requiresAuth: true } },
      ],
    },

    // 404 — must be last
    { path: '/:pathMatch(.*)*', component: () => import('../pages/NotFoundPage.vue') },
  ],
})

// Navigation guards
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.loading) {
    await new Promise<void>((resolve) => {
      const stop = setInterval(() => { if (!auth.loading) { clearInterval(stop); resolve() } }, 50)
    })
  }
  if (to.meta.requiresAuth  && !auth.isAuthenticated)  return { path: '/login' }
  if (to.meta.requiresAdmin && !auth.user?.is_admin)   return { path: '/dashboard' }
  if (auth.isAuthenticated  &&  to.path === '/login')  return auth.user?.is_admin ? { path: '/admin' } : { path: '/dashboard' }
})

export default router
