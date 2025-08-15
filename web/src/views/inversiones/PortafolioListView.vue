<template>
    <div class="portafolio-list">
        <h1>Portafolio List</h1>
        <div class="actions">
            <button @click="addPortafolio">Add Portafolio</button>
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
                        <button @click="viewPortafolio(portafolio.id)">View</button>
                        <button @click="editPortafolio(portafolio.id)">Edit</button>
                        <button @click="deletePortafolio(portafolio.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>