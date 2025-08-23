<template>
  <div class="w-2xl mx-auto">
    <Details :headers="headers"
      :value="store.fetchItemById(route.params.codigo)"
      @edit="router.push({ name: 'inversiones-tiposactivos-update', params: { codigo: route.query.codigo } })"
      />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
  import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
  import Details from "@/components/DetailsComponent.vue";
  import { useTipoActivosStore } from '@/stores/tiposActivos';

    const store = useTipoActivosStore()
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
    const itemSelected = ref(null)

    onMounted(() => {
        const item = store.fetchItemById(route.params.codigo)
        itemSelected.value = item
    })

    onBeforeRouteUpdate((to, from, next) => {
        const item = store.fetchItemById(route.params.codigo)
        itemSelected.value = item
        next()
    })
</script>
