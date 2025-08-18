
<template>
  <vue3-easy-data-table ref="dataTable" v-model:items-selected="itemSelected" :headers="headers" :items="props.items"
    table-class-name="tableClassName" @click-row="on_click_row" show-index :rows-per-page="10" hide-footer
    :header-item-class-name="headerItemClassNameFunction"
    body-row-class-name="bg-white hover:bg-gray-100 hover:cursor-pointer"
    body-item-class-name=" px-3 py-2 whitespace-nowrap">
    <template #item-LastName="{ LastName }">
      {{ LastName }}
    </template>
  </vue3-easy-data-table>

  <div class="flex justify-center items-center mt-6">
    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
      <a href="#" @click="prevPage"
        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
        <span class="sr-only">Previous</span>
        <!-- Heroicon name: chevron-left -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </a>
      <a v-for="page in maxPaginationNumber" :key="page" href="#top" @click="updatePage(page)"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">{{
          page }}</a>

      <a href="#" @click="nextPage"
        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
        <span class="sr-only">Next</span>
        <!-- Heroicon name: chevron-right -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>

    </nav>
  </div>
</template>
<script setup>
import { ref, computed, defineModel, defineEmits } from 'vue';
import Vue3EasyDataTable from "vue3-easy-data-table";
//import "vue3-easy-data-table/dist/style.css";
const dataTable = ref();
const emit = defineEmits(["clickRow"])
const itemSelected = defineModel([]);
const props = defineProps({
  items: {
    type: Array,
    required: true,
  }
});

/*
[CustomerId] INTEGER  NOT NULL,
[FirstName] NVARCHAR(40)  NOT NULL,
[LastName] NVARCHAR(20)  NOT NULL,
[Company] NVARCHAR(80),
[Address] NVARCHAR(70),
[City] NVARCHAR(40),
[State] NVARCHAR(40),
[Country] NVARCHAR(40),
[PostalCode] NVARCHAR(10),
[Phone] NVARCHAR(24),
[Fax] NVARCHAR(24),
[Email] NVARCHAR(60)  NOT NULL,
[SupportRepId] INTEGER,
**/
const headers = [
  { text: "Apellido", value: "LastName" },
  { text: "Nombre", value: "FirstName" },
  { text: "Compañía", value: "Company" },
  { text: "Dirección", value: "Address" },
  { text: "Ciudad", value: "City" },
  { text: "Estado", value: "State" },
  { text: "País", value: "Country" },
  { text: "Código Postal", value: "PostalCode" },
  { text: "Teléfono", value: "Phone" },
  { text: "Fax", value: "Fax" },
  { text: "Email", value: "Email" },
  { text: "Soporte", value: "SupportRepId" }
];

// eslint-disable-next-line no-unused-vars
const currentPageFirstIndex = computed(() => dataTable.value?.currentPageFirstIndex);
// eslint-disable-next-line no-unused-vars
const currentPageLastIndex = computed(() => dataTable.value?.currentPageLastIndex);
// eslint-disable-next-line no-unused-vars
const clientItemsLength = computed(() => dataTable.value?.clientItemsLength);

// pagination related
const maxPaginationNumber = computed(() => dataTable.value?.maxPaginationNumber);
// eslint-disable-next-line no-unused-vars
const currentPaginationNumber = computed(() => dataTable.value?.currentPaginationNumber);

// eslint-disable-next-line no-unused-vars
const isFirstPage = computed(() => dataTable.value?.isFirstPage);
// eslint-disable-next-line no-unused-vars
const isLastPage = computed(() => dataTable.value?.isLastPage);

const nextPage = () => {
  dataTable.value.nextPage();
};
const prevPage = () => {
  dataTable.value.prevPage();
};
const updatePage = (paginationNumber) => {
  dataTable.value.updatePage(paginationNumber);
};

// rows per page related
// eslint-disable-next-line no-unused-vars
const rowsPerPageOptions = computed(() => dataTable.value?.rowsPerPageOptions);
// eslint-disable-next-line no-unused-vars
const rowsPerPageActiveOption = computed(() => dataTable.value?.rowsPerPageActiveOption);

// eslint-disable-next-line no-unused-vars
const updateRowsPerPageSelect = (e) => {
  dataTable.value.updateRowsPerPageActiveOption(Number((e.target).value));
};

// eslint-disable-next-line no-unused-vars
const headerItemClassNameFunction = (header, columnNumber) => {
  let classes = "px-6 py-3 text-left text-xs font-medium text-gray-500 bg-gray-100 uppercase tracking-wider w-8";

  return classes.trim();
};

function on_click_row(item) {
  emit("clickRow", item)
}
</script>

<style >
.vue3-easy-data-table table {
  border-collapse: initial;
  display: table;
  width: 100%;
  border-spacing: 0;
  margin: 0;
}

@media screen {}
</style>

