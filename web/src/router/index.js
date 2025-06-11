import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue'; // Import LoginView
import { useAuthStore } from '@/stores/auth'; // Import auth store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login', // Login route
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false } // Does not require authentication
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true } // Requires authentication
    },
    {
      path: '/albunes',
      name: 'albunes',
      component: () => import('../views/AlbunesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/catalogos',
      redirect: { name: 'mediatypes' },
      meta: { requiresAuth: true }, // Children will inherit this if not overridden
      children: [
        {
          path: 'media-types',
          name: 'mediatypes',
          component: () => import('../views/catalogos/MediaTypesView.vue'),
          // meta: { requiresAuth: true } // This is inherited
        },
        {
          path: 'genres',
          name: 'genres',
          component: () => import('../views/catalogos/GenresView.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: 'artists',
          name: 'artists',
          component: () => import('../views/catalogos/ArtistsView.vue'),
          // meta: { requiresAuth: true }
        },
        {
          path: ':id/albunes',
          name: 'albunes-artist',
          component: () => import('../views/artists/AlbunesView.vue'),
          // meta: { requiresAuth: true }
          children: [
            {
              path: ':idalbum/tracks',
              name: 'tracks-albun',
              component: () => import('../views/artists/TraksView.vue'),
              // meta: { requiresAuth: true }
            }
          ]
        },
      ],
    },
    {
      path: '/empleados',
      name: 'empleados',
      component: () => import('../views/empleados/EmpleadoView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'nuevo',
          name: 'nuevo-empleado',
          meta: {type: 'insert', requiresAuth: true}, // Ensure meta is merged or overridden correctly
          components: {
                top: () => import('../views/empleados/FormEmpleadoView.vue')
              }
        },
        {
          path: 'detalle/:id',
          name: 'detalle-empleado',
          meta: { requiresAuth: true },
          components: {
                bottom: () => import('../views/empleados/EmpleadoDetalleView.vue')
              }
        },
        {
          path: 'update/:id',
          name: 'update-empleado',
          meta: {type: 'update', requiresAuth: true},
          components: {
                bottom: () => import('../views/empleados/FormEmpleadoView.vue')
              }
        }
      ]
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('../views/clientes/ClientesView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'nuevo',
          name: 'nuevo-cliente',
          components: {
            top: () => import('../views/clientes/FormClienteView.vue')
          },
          meta: { mode: 'create', requiresAuth: true }
        },
        {
          path: 'editar/:id',
          name: 'editar-cliente',
          components: {
            bottom: () => import('../views/clientes/FormClienteView.vue')
          },
          props: true,
          meta: { mode: 'edit', requiresAuth: true }
        },
        {
          path: 'detalle/:id',
          name: 'detalle-cliente',
          meta: { requiresAuth: true },
          components:{
            bottom:() => import('../views/clientes/ClientesDetalleView.vue')
          }
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
  ],
});

router.beforeEach((to, from, next) => {
  document.title = to.name ? `${to.name} | Media Manager` : 'Media Manager';

  const authStore = useAuthStore(); // Get store instance

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isLoggedIn) {
    // If route requires auth and user is not logged in, redirect to login
    // Pass the intended route as a query parameter for redirection after login
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authStore.isLoggedIn) {
    // If user is logged in and tries to access login page, redirect to home
    next({ name: 'home' });
  } else {
    // Otherwise, proceed as normal
    next();
  }
});

export default router;
