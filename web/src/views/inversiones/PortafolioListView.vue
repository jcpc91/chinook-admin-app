<template>
    <div class="portafolio-list">
        <h1>Portafolio List</h1>
        <div class="actions">
            <button >Add Portafolio</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="portafolio in portafolios" :key="portafolio.id">
                    <td>{{ portafolio.id }}</td>
                    <td>{{ portafolio.name }}</td>
                    <td>
                        <button >View</button>
                        <button >Edit</button>
                        <button >Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';

const portafolios = ref([]);

onMounted(() => {
    console.log('PortafolioListView mounted');
})
</script>
