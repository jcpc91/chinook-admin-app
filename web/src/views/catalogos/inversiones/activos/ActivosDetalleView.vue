<template>
  <div class="w-2xl mx-auto">
    <Details  :headers="headers"
      :value="activo"
      />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import Details from "@/components/DetailsComponent.vue";
import { useActivosStore } from '@/stores/activos';

    const store = useActivosStore()
    const route = useRoute();
    //const router = useRouter();
    const headers =[
      { text: "Ticker", value: "ticker" },
      { text: "Nombre", value: "nombre" },
      { text: "Tipo", value: "tipo" },
      { text: "Valor Mercado", value: "valormercado" },
    ]

    const activo = ref(null);

    onMounted(async () => {
      try {
        activo.value = await store.fetchItemById(route.params.ticker);
      } catch (error) {
        console.error('Error fetching activo:', error);
      }
    })

  onBeforeRouteUpdate(async (to, from, next) => {
    try {
        activo.value = await store.fetchItemById(to.params.ticker);
      } catch (error) {
        console.error('Error fetching activo:', error);
      }
    next()
  })
</script>
