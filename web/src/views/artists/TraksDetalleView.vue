<template>
  <div class="w-2xl mx-auto">

    <Details :headers="config.traksHeaders" :value="track" @edit="edit_item" ></Details>

  </div>
</template>
<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
  import config from "@/common/config";

  
  import { useTraksStore } from "@/store/traks";
  import Details from "@/components/DetailsComponent.vue";

  const route = useRoute();
  const router = useRouter()
  const track = ref({});
  const store = useTraksStore();
  

  onMounted(async() => {
    track.value = await store.fetchTrak(route.params.idTrack)
  })

  onBeforeRouteUpdate(async (to, from, next) => {
    track.value = await store.fetchTrak(to.params.idTrack)
    next()
  })

  function edit_item() {
    router.push({name: 'edit-track', params: {idTrack: route.params.idTrack }})
  }
</script>