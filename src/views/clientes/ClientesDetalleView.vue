<template>
  <div class="w-2xl mx-auto">

    <Details :headers="config.clientesHeaders" :value="cliente" @edit="editcustomer"></Details>
    <div>

    </div>
    
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
  import config from "@/common/config";
  import Details from "@/components/DetailsComponent.vue";
  import { useClientesStore } from '@/store/clientes';
  const store = useClientesStore();
  const router = useRouter();
  const route = useRoute();
  const cliente = ref({});
  
  
  const editcustomer = () => {
    router.push({ name: 'editar-cliente', params: { id: cliente.value.CustomerId } });
  };
  store.$subscribe((mutation, state) => {
    console.log('suscribe:', mutation, state, store.customers, route.params);
    const c = store.getCustomerById(route.params.id);
    //console.log(c, route.params)
    cliente.value = c;
  })
  
  onMounted(() => {
    console.log('onMounted')
  });
  
  onBeforeRouteUpdate(async (to, from, next) => {
    console.log('onBeforeRouteUpdate')
    const c = store.getCustomerById(to.params.id);
    cliente.value = c;
    next()
  })
  

</script>

