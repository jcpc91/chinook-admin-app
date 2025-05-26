<template>
  <h1>Empleados</h1>
  <Panel title="Empleados">

    <Vue3EasyDataTable ref="dataTable" :headers="headers" :items="items" v-model:items-selected="itemSelected"
      @click-row="on_click_row" show-index :rows-per-page="10" hide-footer
      header-item-class-name="px-6 py-3 text-left text-xs font-medium text-gray-500 bg-gray-100 uppercase tracking-wider"
      body-row-class-name="bg-white hover:bg-gray-100" body-item-class-name=" px-6 py-4 whitespace-nowrap" />
    <div class="flex justify-center items-center mt-6">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <a href="#" @click="prevPage"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Previous</span>
          <!-- Heroicon name: chevron-left -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </a>
        <a v-for="page in maxPaginationNumber" href="#"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">{{
            page }}</a>

        <a href="#" @click="nextPage"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <span class="sr-only">Next</span>
          <!-- Heroicon name: chevron-right -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>

      </nav>
    </div>
    <div class="bg-white hover:bg-gray-100">
      {{ itemSelected }}
    </div>
  </Panel>
  <RouterView />
</template>

<script setup>
import { ref, computed } from 'vue';
import Panel from "../../components/common/PanelComponent.vue";
import Vue3EasyDataTable from 'vue3-easy-data-table';
//import 'vue3-easy-data-table/dist/style.css';

const itemSelected = ref(null);
const headers = [
  { text: "PLAYER", value: "player" },
  { text: "TEAM", value: "team" },
  { text: "NUMBER", value: "number" },
  { text: "POSITION", value: "position" },
  { text: "HEIGHT", value: "indicator.height" },
  { text: "WEIGHT (lbs)", value: "indicator.weight", sortable: true },
  { text: "LAST ATTENDED", value: "lastAttended", width: 200 },
  { text: "COUNTRY", value: "country" },
];

const items = [
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
  { player: "Stephen Curry", team: "GSW", number: 30, position: 'G', indicator: { "height": '6-2', "weight": 185 }, lastAttended: "Davidson", country: "USA" },
  { player: "Lebron James", team: "LAL", number: 6, position: 'F', indicator: { "height": '6-9', "weight": 250 }, lastAttended: "St. Vincent-St. Mary HS (OH)", country: "USA" },
  { player: "Kevin Durant", team: "BKN", number: 7, position: 'F', indicator: { "height": '6-10', "weight": 240 }, lastAttended: "Texas-Austin", country: "USA" },
  { player: "Giannis Antetokounmpo", team: "MIL", number: 34, position: 'F', indicator: { "height": '6-11', "weight": 242 }, lastAttended: "Filathlitikos", country: "Greece" },
];

// $ref dataTable
const dataTable = ref();
// const {
//   currentPageFirstIndex,
//   currentPageLastIndex,
//   clientItemsLength,
//   maxPaginationNumber,
//   currentPaginationNumber,
//   isFirstPage,
//   isLastPage,
//   nextPage,
//   prevPage,
//   updatePage,
// } = usePagination(dataTable)

// index related
const currentPageFirstIndex = computed(() => dataTable.value?.currentPageFirstIndex);
const currentPageLastIndex = computed(() => dataTable.value?.currentPageLastIndex);
const clientItemsLength = computed(() => dataTable.value?.clientItemsLength);

// pagination related
const maxPaginationNumber = computed(() => dataTable.value?.maxPaginationNumber);
const currentPaginationNumber = computed(() => dataTable.value?.currentPaginationNumber);

const isFirstPage = computed(() => dataTable.value?.isFirstPage);
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
const rowsPerPageOptions = computed(() => dataTable.value?.rowsPerPageOptions);
const rowsPerPageActiveOption = computed(() => dataTable.value?.rowsPerPageActiveOption);

const updateRowsPerPageSelect = (e) => {
  dataTable.value.updateRowsPerPageActiveOption(Number((e.target).value));
};

function on_click_row(item) {
  console.log(item)

}
</script>
<style>
.vue3-easy-data-table table {
  border-collapse: initial;
  display: table;
  width: 100%;
  border-spacing: 0;
  margin: 0;
}
</style>
