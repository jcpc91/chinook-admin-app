<script setup>
import SideBar from "./components/SideBar.vue";
</script>

<template>
  <SideBar />

  <main class="flex-1 p-6 bg-gray-100">

    <RouterView />
  </main>
</template>

<style scoped></style>
