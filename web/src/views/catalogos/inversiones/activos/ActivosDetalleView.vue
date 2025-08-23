<template>
  <div class="w-2xl mx-auto">
    <Details :headers="headers"

      />
  </div>
</template>
<script setup>
    import {  onMounted } from 'vue';
    import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
    import Details from "@/components/DetailsComponent.vue";

    const route = useRoute();
    const router = useRouter();
    const headers =[
      { text: "Código", value: "codigo" },
      { text: "Categoría", value: "categoria" },
      { text: "Subcategoría", value: "subcategoria" },
      { text: "Nivel de Riesgo", value: "nivelriesgo" },
      { text: "Horizonte de Inversión", value: "horizonteinversion" },
      { text: "Liquidez", value: "liquidez" }
    ]

onMounted(() => {
  console.log('TiposActivosDetalleView.vue mounted')
})

  onBeforeRouteUpdate((to, from, next) => {
    console.log('TiposActivosDetalleView.vue onBeforeRouteUpdate', to, from)
    next()
  })
</script>
