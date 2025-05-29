<template>
  <div class="employee-form">
    <h1>Edit Employee</h1>
    <p>Employee form will be here.</p>
    <!-- Basic form structure -->
    <form @submit.prevent="saveEmployee">
      <div>
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="employee.FirstName" />
      </div>
      <div>
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="employee.LastName" />
      </div>
      <!-- Add other fields as needed -->
      <button type="submit">Save</button>
      <button type="button" @click="cancelEdit">Cancel</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'FormEmpleadoView',
  data() {
    return {
      employee: { // Placeholder for employee data
        FirstName: '',
        LastName: ''
        // Initialize other fields based on what you expect to edit
      }
    };
  },
  created() {
    // In a real app, you would fetch the employee data based on this.$route.params.id
    // and populate the form. For now, we can leave it empty or with placeholders.
    console.log('FormEmpleadoView created for employee ID:', this.$route.params.id);
  },
  methods: {
    saveEmployee() {
      // Logic to save employee data
      console.log('Saving employee data:', this.employee);
      // After saving, you might navigate back to the detail view or a list view
      this.$router.push({ name: 'detalle-empleado', params: { id: this.$route.params.id } });
    },
    cancelEdit() {
      // Navigate back to the detail view without saving
      this.$router.push({ name: 'detalle-empleado', params: { id: this.$route.params.id } });
    }
  }
};
</script>

<style scoped>
.employee-form {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
}
.employee-form h1 {
  text-align: center;
  color: #333;
}
.employee-form div {
  margin-bottom: 15px;
}
.employee-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.employee-form input[type="text"] {
  width: calc(100% - 22px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.employee-form button {
  padding: 10px 15px;
  margin-right: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.employee-form button:hover {
  background-color: #0056b3;
}
.employee-form button[type="button"] {
  background-color: #6c757d;
}
.employee-form button[type="button"]:hover {
  background-color: #545b62;
}
</style>
