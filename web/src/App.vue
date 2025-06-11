<script setup>
import { computed } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import SideBar from "./components/SideBar.vue";
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isLoggedIn = computed(() => authStore.isLoggedIn);

// Determine if the current route is the login page
const isLoginPage = computed(() => route.name === 'login');

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="app-container flex h-screen">
    <div class="flex-none">

      <SideBar v-if="isLoggedIn && !isLoginPage" />

    </div>

    <main class="grow p-6 bg-gray-100 overflow-auto">
      <div v-if="isLoggedIn && !isLoginPage" class="logout-button-container text-right mb-4">
        <button @click="handleLogout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">
          Logout
        </button>
      </div>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>

</style>
