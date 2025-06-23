<template>
  <div class="bg-white overflow-hidden shadow rounded-lg ">
    <div class="px-4 py-5 sm:px-6">

        <p class="mt-1 max-w-2xl text-sm text-gray-500">
            This is some information about the user.
        </p>
        <div class="flex content-center">
          <h3 class="grow-7 not-[]:text-lg leading-6 font-medium text-gray-900 align-middle">
                      User Profile
                  </h3>
          <div class="grow-0 ">
            <Button label="Editar" @click="edit"></Button>
          </div>
      </div>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">

            <div v-for="item in props.headers" :key="item" class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                    {{ item.text }}
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ">
                  <span v-if="props.value">

                    {{props.value[item.value] || 'N/A'}}
                  </span>
                </dd>
            </div>
        </dl>
    </div>
</div>
</template>
<script setup>
  import Button from "@/components/forms/InputButton.vue";
  //**
  /* headers: { text: "Email", value: "Email" }
  /* value: { EmployeeId: 3, LastName: "Leverling", FirstName: "Janet", Title: "Sales Representative", ReportsTo: 2, BirthDate: "1963-08-30", HireDate: "1992-04-01", Address: "722 Moss Bay Blvd.", City: "Kirkland", State: "WA", Country: "USA", PostalCode: "98033", Phone: "(206) 555-3412", Fax: null, Email: "janet@northwindtraders.com" }
  */
  const props = defineProps({
    value: {
      type: Object,
      default: () => ({})
    },
    headers: {
      type: Array,
      required: true
    }
  });
  const emit = defineEmits(['edit']);
  const edit = () => {
    emit('edit');
  };
</script>
