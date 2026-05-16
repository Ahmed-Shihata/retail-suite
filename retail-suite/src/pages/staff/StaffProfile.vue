<!-- StaffProfile.vue -->
<template>

    <div class=" bg-gray-50">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
          <p class="text-red-800 font-semibold">{{ error }}</p>
        </div>
      </div>

      <!-- Staff Profile -->
      <div v-else>
        <!-- Back Button & Header -->
      <header class="mx-3 mt-3 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">

        <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
          <router-link to="/staff" class="p-2 hover:bg-white rounded-lg transition border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </router-link>
          <div>
            <h1 class="text-lg font-bold text-gray-900">{{ staff.name }}</h1>
            <p class="text-gray-600 text-sm mt-1">#{{ staff.employee_name }} • {{ staff.designation }}</p>
          </div>
        </div>
        </div>
      </header>
        <!-- Statistics Cards -->
        <section class="px-6 py-2">
           <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition">
                 <div class="flex items-center justify-between">
                   <div>
                     <p class="text-green-600 text-sm font-semibold">الراتب الأساسي</p>
                     <p class="text-3xl font-bold text-green-900 mt-2">{{ formatCurrency(staff.salary) }}</p>
                   </div>
                   <div class="text-5xl opacity-20">💰</div>
                 </div>
               </div>

               <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition">
                 <div class="flex items-center justify-between">
                   <div>
                     <p class="text-blue-600 text-sm font-semibold">الصافي الشهري</p>
                     <p class="text-3xl font-bold text-blue-900 mt-2">{{ formatCurrency(netSalary) }}</p>
                   </div>
                   <div class="text-5xl opacity-20">📊</div>
                 </div>
               </div>

               <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition">
                 <div class="flex items-center justify-between">
                   <div>
                     <p class="text-purple-600 text-sm font-semibold">معدل الحضور</p>
                     <p class="text-3xl font-bold text-purple-900 mt-2">{{ attendanceStats.percentage }}%</p>
                   </div>
                   <div class="text-5xl opacity-20">📅</div>
                 </div>
               </div>

               <div :class="[
                 'rounded-xl p-6 border shadow-sm hover:shadow-md transition bg-gradient-to-br',
                 staff.status === 'Active'
                   ? 'from-emerald-50 to-emerald-100 border-emerald-200'
                   : staff.status === 'Left'
                   ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                   : 'from-gray-50 to-gray-100 border-gray-200',
               ]">
                 <div class="flex items-center justify-between">
                   <div>
                     <p :class="[
                       'text-sm font-semibold',
                       staff.status === 'Active' ? 'text-emerald-600' : staff.status === 'Left' ? 'text-yellow-600' : 'text-gray-600'
                     ]">الحالة</p>
                     <p :class="[
                       'text-3xl font-bold mt-2',
                       staff.status === 'Active' ? 'text-emerald-900' : staff.status === 'Left' ? 'text-yellow-900' : 'text-gray-900'
                     ]">{{ getStatusLabel(staff.status) }}</p>
                   </div>
                   <div class="text-5xl opacity-20">✓</div>
                 </div>
               </div>
             </div>
           </div>
        </section>

        <!-- Tabs -->
        <section class="px-6 py-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200 flex flex-wrap bg-gray-50">
              <button
                @click="activeTab = 'info'"
                :class="[
                  'px-6 py-4 font-semibold border-b-2 transition',
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ]"
              >
                📋 المعلومات الشخصية
              </button>
              <button
                @click="activeTab = 'salary'"
                :class="[
                  'px-6 py-4 font-semibold border-b-2 transition',
                  activeTab === 'salary'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ]"
              >
                💸 الرواتب
              </button>
              <button
                @click="activeTab = 'attendance'"
                :class="[
                  'px-6 py-4 font-semibold border-b-2 transition',
                  activeTab === 'attendance'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ]"
              >
                📅 الحضور
              </button>
              <button
                @click="activeTab = 'performance'"
                :class="[
                  'px-6 py-4 font-semibold border-b-2 transition',
                  activeTab === 'performance'
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900',
                ]"
              >
                ⭐ الأداء
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-8">
              <!-- Info Tab -->
              <div v-if="activeTab === 'info'" class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <!-- Personal Information -->
                  <div class="space-y-6">
                    <h3 class="text-xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3">👤 المعلومات الشخصية</h3>
                    <div class="space-y-4">
                      <div>
                        <p class="text-sm text-gray-600 font-semibold mb-2">الاسم الكامل</p>
                        <p class="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">{{ staff.name }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600 font-semibold mb-2">البريد الإلكتروني</p>
                        <p class="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">{{ staff.company_email  || 'غير محدد' }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600 font-semibold mb-2">رقم الهاتف</p>
                        <p class="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">{{ staff.cell_number || 'غير محدد' }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600 font-semibold mb-2">العنوان</p>
                        <p class="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">{{ staff.address || 'غير محدد' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Job Information -->
                  <div class="space-y-6">
                    <h3 class="text-xl font-bold text-gray-900 border-b-2 border-blue-600 pb-3">💼 المعلومات الوظيفية</h3>
                    <div class="space-y-3">
                      <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span class="text-sm text-gray-600 font-semibold">الرقم الوظيفي</span>
                        <span class="text-gray-900 font-bold text-lg">#{{ staff.name }}</span>
                      </div>
                      <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span class="text-sm text-gray-600 font-semibold">المسمى الوظيفي</span>
                        <span class="text-gray-900 font-bold text-lg">{{ staff.designation }}</span>
                      </div>
                      <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span class="text-sm text-gray-600 font-semibold">القسم</span>
                        <span class="text-gray-900 font-bold text-lg">{{ getDepartmentLabel(staff.department) }}</span>
                      </div>
                      <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span class="text-sm text-gray-600 font-semibold">الدور الوظيفي</span>
                        <span class="text-gray-900 font-bold text-lg">{{ getRoleLabel(staff.designation) }}</span>
                      </div>
                      <div class="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span class="text-sm text-emerald-600 font-semibold">تاريخ الالتحاق</span>
                        <span class="text-gray-900 font-bold text-lg">{{ formatDate(staff.date_of_joining) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Salary Tab -->
              <div v-if="activeTab === 'salary'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <p class="text-blue-600 text-sm font-semibold">الراتب الأساسي</p>
                    <p class="text-3xl font-bold text-blue-900 mt-3">{{ formatCurrency(staff.salary) }}</p>
                  </div>
                  <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                    <p class="text-emerald-600 text-sm font-semibold">العلاوة</p>
                    <p class="text-3xl font-bold text-emerald-900 mt-3">{{ formatCurrency(staff.bonus || 0) }}</p>
                  </div>
                  <div class="bg-red-50 rounded-xl p-6 border border-red-200">
                    <p class="text-red-600 text-sm font-semibold">الخصومات</p>
                    <p class="text-3xl font-bold text-red-900 mt-3">{{ formatCurrency(staff.deductions || 0) }}</p>
                  </div>
                </div>

                <!-- Salary History Table -->
                <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 class="font-bold text-gray-900">سجل الرواتب</h4>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th class="px-6 py-3 text-right font-semibold text-gray-900">الشهر</th>
                          <th class="px-6 py-3 text-right font-semibold text-gray-900">الراتب</th>
                          <th class="px-6 py-3 text-right font-semibold text-gray-900">العلاوة</th>
                          <th class="px-6 py-3 text-right font-semibold text-gray-900">الخصومات</th>
                          <th class="px-6 py-3 text-right font-semibold text-gray-900">الصافي</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200">
                        <tr v-for="(record, idx) in salaryHistory" :key="idx" class="hover:bg-gray-50 transition">
                          <td class="px-6 py-3 text-gray-600 font-medium">{{ record.month }}</td>
                          <td class="px-6 py-3 font-semibold text-gray-900">{{ formatCurrency(record.salary) }}</td>
                          <td class="px-6 py-3 text-emerald-600 font-semibold">+{{ formatCurrency(record.bonus) }}</td>
                          <td class="px-6 py-3 text-red-600 font-semibold">-{{ formatCurrency(record.deductions) }}</td>
                          <td class="px-6 py-3 font-bold text-gray-900 text-lg">{{ formatCurrency(record.net) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Attendance Tab -->
              <div v-if="activeTab === 'attendance'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                    <p class="text-emerald-600 text-sm font-semibold">أيام الحضور</p>
                    <p class="text-4xl font-bold text-emerald-900 mt-3">{{ attendanceStats.present }}</p>
                  </div>
                  <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <p class="text-yellow-600 text-sm font-semibold">أيام الغياب</p>
                    <p class="text-4xl font-bold text-yellow-900 mt-3">{{ attendanceStats.absent }}</p>
                  </div>
                  <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <p class="text-blue-600 text-sm font-semibold">معدل الحضور</p>
                    <p class="text-4xl font-bold text-blue-900 mt-3">{{ attendanceStats.percentage }}%</p>
                  </div>
                </div>

                <!-- Attendance Progress Bar -->
                <div class="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 class="font-bold text-gray-900 mb-4">شريط الحضور</h4>
                  <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div :style="{ width: attendanceStats.percentage + '%' }" class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-300"></div>
                  </div>
                </div>
              </div>

              <!-- Performance Tab -->
              <div v-if="activeTab === 'performance'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <p class="text-blue-600 text-sm font-semibold mb-4">تقييم الأداء</p>
                    <div class="flex items-center gap-3">
                      <div class="flex gap-1">
                        <span v-for="n in 5" :key="n" :class="[
                          'text-4xl transition',
                          n <= performance.rating ? 'text-yellow-400' : 'text-gray-300'
                        ]">★</span>
                      </div>
                      <span class="text-3xl font-bold text-blue-900">{{ performance.rating }}/5</span>
                    </div>
                  </div>

                  <div class="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <p class="text-purple-600 text-sm font-semibold mb-2">المبيعات هذا الشهر</p>
                    <p class="text-3xl font-bold text-purple-900">{{ formatCurrency(performance.sales) }}</p>
                  </div>
                </div>

                <!-- Performance Notes -->
                <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 class="font-bold text-gray-900 mb-3">ملاحظات الأداء</h4>
                  <p class="text-gray-700 leading-relaxed">{{ performance.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Action Buttons -->
        <section class="no-print">
          <div class="flex gap-3 pt-6 px-6 border-t border-gray-200">
            <router-link
              :to="`/staff/${staff.id}/edit`"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              ✏️ تعديل البيانات
            </router-link>
            <button
              @click="printProfile"
              class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center gap-2"
            >
              🖨️ طباعة
            </button>
            <router-link
              to="/staff"
              class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center gap-2 mr-auto"
            >
              ← العودة
            </router-link>
          </div>
        </section>
      </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import { useStaffStore } from "@/stores/staff";

    /*=========================================
       1. Setup - Initialize Store and Route
    =========================================*/
    const staffStore = useStaffStore();


    const route = useRoute();

    const staff = ref({});

    const loading = ref(false);
    const error = ref(null);
    const activeTab = ref("info");

 // Fetch Staff Details on Mount
    onMounted(async () => {
      loading.value = true;
      error.value = null;
      try {
        const staffId = route.params.staff_name;
        console.log("Fetching details for staff ID:", staffId);
        staff.value = await staffStore.fetchstaffDetails(staffId);
      } catch (err) {
        error.value = "حدث خطأ أثناء جلب بيانات الموظف.";
      } finally {
        loading.value = false;
      }
    });

    const salaryHistory = ref([
      { month: "يناير 2025", salary: 3000, bonus: 200, deductions: 150, net: 3050 },
      { month: "ديسمبر 2024", salary: 3000, bonus: 0, deductions: 150, net: 2850 },
      { month: "نوفمبر 2024", salary: 3000, bonus: 300, deductions: 100, net: 3200 },
    ]);

    const attendanceStats = ref({ present: 28, absent: 2, percentage: 93 });
    const performance = ref({
      rating: 4,
      sales: 150000,
      notes: "موظف متفاني ويعمل بجد، أداء ممتاز هذا الشهر وحافظ على معايير الجودة العالية",
    });

    const netSalary = computed(() => {
      return (staff.value.salary || 0) + (staff.value.bonus || 0) - (staff.value.deductions || 0);
    });

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(value);
    };

    const getDepartmentLabel = (dept) => {
      const labels = {
        sales: "المبيعات",
        warehouse: "المستودع",
        cashier: "الكاشيرز",
        management: "الإدارة",
        hr: "الموارد البشرية",
        finance: "المالية"
      };
      return labels[dept] || dept;
    };

    const getRoleLabel = (role) => {
      const labels = {
        junior: "مبتدئ",
        senior: "أول",
        manager: "مدير",
        director: "مدير إدارة",
        executive: "تنفيذي"
      };
      return labels[role] || role;
    };

    const getStatusLabel = (status) => {
      const labels = { Active: "نشط ✓", Inactive: "غير نشط", Left: "في إجازة" };
      return labels[status] || status;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("ar-EG");
    };

    const printProfile = () => {
      window.print();
    };


</script>

<style scoped>
@media print {
  .no-print { display: none; }
}
</style>
