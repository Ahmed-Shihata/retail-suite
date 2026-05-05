<template>
  <div
    class="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"
      >
        <h2 class="text-xl font-bold text-gray-900">
          {{ staff ? `Edit Employee` : "New Employee" }}
          <span class="text-red-600 ml-1">
          {{ staff ? `${staff.employee_name}`: "" }}
        </span>
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Error Message -->
        <div
          v-if="modalError"
          class="bg-red-50 border border-red-200 text-red-700 p-4 rounded animate-pulse"
        >
          <p class="font-semibold">❌ Error:</p>
          <p>{{ modalError }}</p>
        </div>

        <!-- Personal Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.first_name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Gender <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.gender"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option disabled>Choose Gender</option>
                <option
                v-for="(gender, index) in genders"
                :key="index"
                :value="gender"
                > {{ gender }}</option>
              </select>
            </div>

            <!-- Middle Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                v-model="form.middle_name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter middle name"
              />
            </div>

            <!-- Mobile -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                v-model="form.cell_number"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Phone number"
              />
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                v-model="form.last_name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <!-- Birth Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Birth Date <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.date_of_birth"
                type="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Job Information -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Job Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Company Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Company Email
              </label>
              <input
                v-model="form.company_email"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company email"
              />
            </div>

            <!-- Department -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Department
                <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.department"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option disabled value="">Select Department</option>
                <option
                  v-for="dept in departments"
                  :key="dept.name"
                  :value="dept.name"
                >
                  {{ dept.name}}
                </option>
              </select>

            </div>

            <!-- Position -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Position
                <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.designation"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option disabled value="">Select Designation</option>
                <option
                  v-for="desig in designations"
                  :key="desig.name"
                  :value="desig.name"
                >
                  {{ desig.name }}
                </option>
              </select>
            </div>

            <!-- Join Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date of Joining <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.date_of_joining"
                type="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Salary Information -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Salary Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Basic Salary *
              </label>
              <input
                v-model.number="form.salary"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Salary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Bonus
              </label>
              <input
                v-model.number="form.bonus"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bonus"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Deductions
              </label>
              <input
                v-model.number="form.deductions"
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Deductions"
              />
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-4 border-t pt-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Status <span class="text-red-500">*</span>
          </h3>

          <select
            v-model="form.status"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Left">On Leave</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="border-t pt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg
                  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Saving..." : staff ? "Update" : "Add" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref, watch } from "vue";

/* props */
const props = defineProps({
  staff: {
    type: Object,
    default: null,
  },
  departments: {
    type: Array,
    default: () => [],
  },
  genders: {
    type: Array,
    default: () => [],
  },
  designations: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: "",
  },
});

/* emits */
const emit = defineEmits(["save", "close"]);

/* state */
const form = ref({
  id: null,
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "",
  company_email: "",
  cell_number: "",
  department: "",
  designation: "",
  date_of_joining: "",
  date_of_birth: "",
  salary: 0,
  bonus: 0,
  deductions: 0,
  status: "active",
});

const modalError = ref("");
const loading = ref(false);

/* watch error */
watch(
  () => props.error,
  (newError) => {
    modalError.value = newError;
  }
);

/* watch staff */
watch(
  () => props.staff,
  (newStaff) => {
    if (newStaff) {
      form.value = { ...newStaff };
    } else {
      form.value = {
        id: null,
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        company_email: "",
        cell_number: "",
        department: "",
        designation: "",
        date_of_joining: new Date().toISOString().split("T")[0],
        salary: 0,
        bonus: 0,
        deductions: 0,
        status: "Active",
      };
    }
  },
  { immediate: true }
);

/* submit */
const handleSubmit = async () => {
  modalError.value = "";
  loading.value = true;

  try {
    emit("save", { ...form.value });
  } catch (err) {
    modalError.value = err?.message || "Unexpected error occurred";
  } finally {
    loading.value = false;
  }
};
</script>
