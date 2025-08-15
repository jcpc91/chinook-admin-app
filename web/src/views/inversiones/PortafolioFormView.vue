<template>
    <div class="portafolio-form">
        <h1>{{ mode === 'create' ? 'Add' : 'Edit' }} Portafolio</h1>
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" v-model="formData.name" required />
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" v-model="formData.description"></textarea>
            </div>
            <div class="actions">
                <button type="submit">{{ mode === 'create' ? 'Add' : 'Save' }}</button>
                <button type="button" @click="cancelForm">Cancel</button>
            </div>
        </form>
    </div>
</template>