import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/albunes',
      name: 'albunes',
      component: () => import('../views/AlbunesView.vue')
    },
    {
      path: '/catalogos',
      redirect: { name: 'mediatypes' },
      children: [
        {
          path: 'media-types',
          name: 'mediatypes',
          component: () => import('../views/catalogos/MediaTypesView.vue'),
        },
        {
          path: 'genres',
          name: 'genres',
          component: () => import('../views/catalogos/GenresView.vue'),
        },
        {
          path: 'artists',
          name: 'artists',
          component: () => import('../views/catalogos/ArtistsView.vue'),
          children: [
          ],
        },
        {
          path: ':id/albunes',
          name: 'albunes-artist',
          component: () => import('../views/artists/AlbunesView.vue'),
          children: [
            {
              path: ':idalbum/tracks',
              name: 'tracks-albun',
              component: () => import('../views/artists/TraksView.vue')
            }
          ]
        },
      ],
    },
    {
      path: '/empleados',
      name: 'empleados',
      component: () => import('../views/empleados/EmpleadoView.vue'),
      children: [
        {
          path: 'nuevo',
          name: 'nuevo-empleado',
          meta: {type: 'insert'},
          components: {

                top: () => import('../views/empleados/FormEmpleadoView.vue')

              }
        },
        {
          path: 'detalle/:id',
          name: 'detalle-empleado',
          components: {

                bottom: () => import('../views/empleados/EmpleadoDetalleView.vue')

              }
        },
        {
          path: 'update/:id',
          name: 'update-empleado',
          meta: {type: 'update'},
          components: {

                bottom: () => import('../views/empleados/FormEmpleadoView.vue')

              }
        }
      ]
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})
router.beforeEach((to, from, next) => {
  document.title = to.name ? `${to.name} | Media Manager` : 'Media Manager'
  next()
})
export default router
