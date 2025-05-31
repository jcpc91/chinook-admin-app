<template>
  <div class="employee-detail">
    <h1>Employee Details</h1>
    <div v-if="employee">
      <p><strong>Employee ID:</strong> {{ employee.EmployeeId }}</p>
      <p><strong>Last Name:</strong> {{ employee.LastName }}</p>
      <p><strong>First Name:</strong> {{ employee.FirstName }}</p>
      <p><strong>Title:</strong> {{ employee.Title }}</p>
      <p><strong>Reports To:</strong> {{ employee.ReportsTo }}</p>
      <p><strong>Birth Date:</strong> {{ employee.BirthDate }}</p>
      <p><strong>Hire Date:</strong> {{ employee.HireDate }}</p>
      <p><strong>Address:</strong> {{ employee.Address }}</p>
      <p><strong>City:</strong> {{ employee.City }}</p>
      <p><strong>State:</strong> {{ employee.State }}</p>
      <p><strong>Country:</strong> {{ employee.Country }}</p>
      <p><strong>Postal Code:</strong> {{ employee.PostalCode }}</p>
      <p><strong>Phone:</strong> {{ employee.Phone }}</p>
      <p><strong>Fax:</strong> {{ employee.Fax }}</p>
      <p><strong>Email:</strong> {{ employee.Email }}</p>
      <button @click="editEmployee">Edit</button>
    </div>
    <div v-else>
      <p>Loading employee data...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmpleadoDetalleView',
  data() {
    return {
      employee: null,
      // Sample data - in a real app, you'd fetch this based on route param :id
      sampleEmployeeData: { EmployeeId: 3, LastName: "Leverling", FirstName: "Janet", Title: "Sales Representative", ReportsTo: 2, BirthDate: "1963-08-30", HireDate: "1992-04-01", Address: "722 Moss Bay Blvd.", City: "Kirkland", State: "WA", Country: "USA", PostalCode: "98033", Phone: "(206) 555-3412", Fax: null, Email: "janet@northwindtraders.com" }
    };
  },
  created() {
    // Simulate fetching data
    // In a real application, you would fetch the employee data from an API
    // using this.$route.params.id
    this.employee = this.sampleEmployeeData;
  },
  methods: {
    editEmployee() {
      // Navigate to the update-empleado route, passing the employee ID
      this.$router.push({ name: 'update-empleado', params: { id: this.employee.EmployeeId } });
    }
  }
};
</script>

<style scoped>
.employee-detail {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
}
.employee-detail h1 {
  text-align: center;
  color: #333;
}
.employee-detail p {
  margin: 10px 0;
  line-height: 1.6;
}
.employee-detail p strong {
  color: #555;
}
.employee-detail button {
  display: block;
  width: 100px;
  padding: 10px;
  margin: 20px auto 0;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}
.employee-detail button:hover {
  background-color: #0056b3;
}
</style>
