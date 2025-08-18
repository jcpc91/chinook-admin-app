<template>
  <DropDown v-model="value" name="generos" :options="store.items" item-value="id" item-title="title" class="w-full" />
</template>
<script setup>
import { computed, onMounted } from "vue";
import DropDown from "@/components/forms/InputSelect.vue";
import { useGenerosStore } from "@/store/generos";

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const store = useGenerosStore();
onMounted(async () => {
  await store.fetch();
})
</script>
