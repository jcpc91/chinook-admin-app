<template>
  <form v-if="!props.isReadonly">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th v-for="column in props.columns" :key="column"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 bg-gray-100  tracking-wider">
            {{ column.label }}
          </th>
          <th v-if="!props.isReadonly">..</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(row, index) in data" :key="index" class="hover:bg-gray-100">
          <td v-for="column in columns" :key="column" class="px-6 py-4 whitespace-nowrap">
            <div v-if="props.isReadonly">

              {{ row[column.field] }}
            </div>
            <div v-else>
              <input v-model="row[column.field]" :type="column.type || 'text'" />
            </div>
          </td>
        </tr>
        <tr>
          <td :colspan="columns.length" class="px-6 py-4 whitespace-nowrap text-center">
            <button class="text-indigo-600 hover:text-indigo-900">Add</button>
          </td>
        </tr>

        <tr v-if="data.length === 0">
          <td :colspan="columns.length" class="px-6 py-4 whitespace-nowrap text-center">
            No data available
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  columns: {
    type: [
      {
        label: String,
        field: String,
        sortable: Boolean
      }
    ],
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  isReadonly: {
    type: Boolean,
    default: true
  }
})
</script>
