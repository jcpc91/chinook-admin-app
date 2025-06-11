<script setup>
import { onMounted } from "vue";
import SideBar from "./components/SideBar.vue";
onMounted(() =>{
  console.log(import.meta.env);

})
</script>

<template>
  <SideBar />

  <main class="flex-1 p-6 bg-gray-100">

    <RouterView />
  </main>
</template>

