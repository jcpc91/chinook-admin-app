<template>
  <Panel title="Clientes">
    <template #buttons>
      <Button label="Nuevo" @click="router.push({name: 'nuevo-cliente'})"></Button>
    </template>
    <div>
      <RouterView name="top" />
    </div>

    <RouterView name="bottom"/>
  </Panel>
</template>
<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  import Panel from "../../components/common/PanelComponent.vue";
  import Button from '@/components/forms/InputButton.vue'

  const router = useRouter()
  

</script>
