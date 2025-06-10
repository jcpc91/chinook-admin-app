import { defineStore } from 'pinia';

export const useCatalogosStore = defineStore('catalogos', {
  state: () => ({
    generos: []
  }),
  actions: {
    async fetchCatalogos() {
      // this.isLoading = true;
      // this.error = null;
      // try {
      //   // Replace with your API endpoint
      //   const response = await fetch('/api/catalogos');
      //   if (!response.ok) {
      //     throw new Error('Failed to fetch catalogos');
      //   }
      //   this.items = await response.json();
      // } catch (err) {
      //   this.error = err.message;
      // } finally {
      //   this.isLoading = false;
      // }
    },
    addGenero(item) {
      this.generos.push(item);
    },
    updateGenero(updatedItem) {
      const index = this.generos.findIndex(i => i.id === updatedItem.id)
      if (index !== -1) {
        this.generos[index] = { ...this.generos[index], ...updatedItem }
      }
    },

    deleteGenero(itemToRemove) {
      const index = this.generos.findIndex(i => i.id === itemToRemove.id)
      this.generos.splice(index, 1)
    },


  },
  getters: {
    Generos: (state) => state.generos
  },
});
