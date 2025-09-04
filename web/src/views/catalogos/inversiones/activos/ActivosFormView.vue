<template>
    <form @submit.prevent="on_submit" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <!--ticker-->
        <div class="lg:flex lg:flex-row gap-3">
            <Label label="Código:" name="ticker" class="lg:w-2xs" />
            <InputText name="ticker" v-model="form.ticker" required class="basis-full" />
        </div>
        <!--nombre-->
        <div class="lg:flex lg:flex-row gap-3">
            <Label label="Nombre:" name="nombre" class="lg:w-2xs" />
            <InputText name="nombre" v-model="form.nombre" required class="basis-full" />
        </div>
        <!--tipo-->
        <div class="lg:flex lg:flex-row gap-3">
            <Label label="Tipo:" name="tipo" class="lg:w-2xs" />
            <TipoActivoDropDown name="tipo" v-model="form.tipo" required class="basis-full" />
        </div>
        <!--valormercado-->
        <div class="lg:flex lg:flex-row gap-3">
            <Label label="Valor Mercado:" name="valormercado" class="lg:w-2xs" />
            <InputText name="valormercado" v-model="form.valormercado" required class="basis-full" />
        </div>
        <div class="col-span-1 lg:col-span-2">
            <div class="flex justify-end">
                <Button label="Guardar" type="submit" class="mt-4" />
                <Button label="Cancelar" type="button" class="mt-4 ml-2" @click="router.back()" />
            </div>
        </div>
        <div>{{ form }}</div>
    </form>
</template>

<script setup>
/**
 * @file share\schemas\activos.schema.js
 */
import { reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TipoActivoDropDown from '@/components/forms/TipoActivoDropDown.vue'
import Button from '@/components/forms/InputButton.vue';
import Label from "@/components/forms/EtiquetaLabel.vue";
import InputText from '@/components/forms/InputText.vue';
import { useActivosStore } from '@/stores/activos';

const store = useActivosStore()
const router = useRouter();
const route = useRoute();


const form = reactive({
});



const on_submit = async () => {
    try {
        if (route.meta.type === 'create') {
            store.addItem(form.value)
            await router.push({ name: 'inversiones-activos-detalle', params: { ticker: form.value.ticker } })
        } else if (route.meta.type === 'update') {
            store.updateItem(form.value)
            await router.back()
        }
    } catch (error) {
        console.error('Error al guardar el activo:', error);
    }
};

onMounted(() => {
    if (route.meta.type === 'update') {
        // TODO: Cargar datos existentes del activo
        // form.codigo = datosExistentes.codigo;
        // form.categoria_principal = datosExistentes.categoria_principal;
        // ...etc
    }
});
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>
