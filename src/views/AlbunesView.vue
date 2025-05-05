<template>
  <div class="w-auto">

    <form @submit="on_submit">
      <div class="grid grid-cols-3 gap-5">
        <div>

          <DropDownArtist v-model="artista.artistid" />

        </div>
        <div>

          <InputText v-model="artista.title" name="title" label="Titulo" type="text" />
        </div>
        <div>
          <Button label="Aceptar" type="submit"></Button>
        </div>
        <div>{{ artista }}</div>
      </div>

    </form>
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">Jane Doe</td>
          <td class="px-6 py-4 whitespace-nowrap">jane@example.com</td>
          <td class="px-6 py-4 whitespace-nowrap">Admin</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <button
              class="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue active:bg-blue-600 transition duration-150 ease-in-out">Edit</button>
            <button
              class="ml-2 px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-600 transition duration-150 ease-in-out">Delete</button>
          </td>
        </tr>
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">John Doe</td>
          <td class="px-6 py-4 whitespace-nowrap">john@example.com</td>
          <td class="px-6 py-4 whitespace-nowrap">User</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <button
              class="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue active:bg-blue-600 transition duration-150 ease-in-out">Edit</button>
            <button
              class="ml-2 px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:shadow-outline-red active:bg-red-600 transition duration-150 ease-in-out">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref } from "vue";
import DropDownArtist from "@/components/forms/ArtistsDropDown.vue";
import InputText from "@/components/forms/InputText.vue";
import Button from "@/components/forms/InputButton.vue";

const artista = ref({})

function on_submit(e) {
  e.preventDefault()
  console.log(artista.value)
}
</script>
