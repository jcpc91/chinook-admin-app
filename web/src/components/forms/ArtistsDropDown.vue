<template>
  <DropDown v-model="value" label="Artista" name="artista" :options="store.items" item-value="id" item-title="title" />
</template>
<script setup>
import { computed } from "vue";
import DropDown from "@/components/forms/InputSelect.vue";
import { useartistsStore } from "@/store/artists";

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

const store = useartistsStore();

</script>
