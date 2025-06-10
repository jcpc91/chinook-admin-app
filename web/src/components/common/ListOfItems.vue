<template>
  <div
    class="max-w-sm mx-auto mt-20 p-4 shadow-md rounded-lg border-t-2 border-teal-400 bg-white dark:bg-gray-900 dark:text-white">
    <!-- Título del componente y botón para añadir un nuevo item -->
    <div class="flex justify-between pb-4">
      <p class="font-bold text-xl">
        {{ props.title }}
      </p>
      <button @click="addItem" class="text-teal-600 font-bold">+</button>
    </div>

    <!-- Lista de items existentes con inputs editables y botón para eliminar -->
    <ul class="flex flex-col pl-1">
      <li v-for="(link, index) in items" :key="link.id"
        class="border-b py-2 border-gray-600 flex justify-between items-center">
        <!-- Input enlazado con v-model para edición directa y evento blur -->
        <input v-model="link.title" type="text" :name="'_' + link.id" :id="'_' + link.id" @blur="notifyChange(link)"
          class="w-full bg-transparent border-none outline-none text-sm">

        <button @click="removeItem(index, link)" class="text-red-500 ml-2 mr-1">x</button>
        <slot name="buttons" :index="index" :item="link"></slot>
      </li>
    </ul>
  </div>
</template>

<script setup>
// Importamos funciones reactivas desde Vue
import { reactive, defineEmits, onMounted } from 'vue';

// Definición de eventos emitidos hacia el componente padre
const emit = defineEmits(['item-updated', 'item-added', 'item-deleted']);

// Definición de propiedades del componente que se reciben desde el padre
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  links: {
    type: Array,
    required: true,
  },
  // El componente espera funciones externas para persistencia de datos en el store
  fetch: {
    type: Function,
    required: false,
  },
  onAdd: {
    type: Function,
    required: true,
  },
  onUpdate: {
    type: Function,
    required: true,
  },
  onDelete: {
    type: Function,
    required: true,
  }
});

// Creamos una copia reactiva de los items originales para evitar mutar directamente las props
const items = reactive(props.links.map(link => ({ ...link })));

onMounted(async () => {
  if (props.fetch)
    await props.fetch()
})

// Funcón para añadir un nuevo item con un ID único basado en timestamp
function addItem() {
  const newItem = { id: Date.now(), title: '', isnew: true };
  const clonedItem = { ...newItem }; // Clonamos el objeto antes de enviarlo
  items.push(newItem);
  props.onAdd(clonedItem); // llamada a la función externa
}

// Funcón para eliminar un item según su índice en el array
function removeItem(index, item) {
  try {
    props.onDelete(item)
    items.splice(index, 1);
    emit('item-deleted', item);
  } catch (error) {
    console.log(error);
  }
}

// Funcón para notificar al componente padre cuando un item es modificado
function notifyChange(item) {
  props.onUpdate(item); // llamada a la función externa
  emit('item-updated', item);
}
</script>

<style scoped>
/* Estilo para los placeholders en inputs */
input[type="text"]::placeholder {
  color: #a0aec0;
}
</style>
