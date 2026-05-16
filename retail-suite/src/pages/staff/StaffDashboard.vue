<!-- Dashboard Staff.vue -->
<template>

  <div :class="isDark ? 'theme-dark' : 'theme-light'">
    <main class="flex flex-col flex-1">

      <!-- Header -->
      <header
          class="mx-3 mt-1 sticky top-0 z-10 rounded-xl shadow-sm"
          :style="{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)'
          }"
        >
        <div class="px-4 py-3 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <Users class="w-8 h-8" :style="{color: primaryColor}" />
            <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">
              Staff Management Dashboard
            </h1>
          </div>
        </div>
      </header>
      <!-- Stats -->
      <section class="px-2 py-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <StatsCard title="Total Staff" :value="stats.totalStaff" icon="Users" color="blue" />
          <StatsCard title="On Duty" :value="stats.onDuty" icon="Clock" color="green" />
          <StatsCard title="On Leave" :value="stats.onLeave" icon="Calendar" color="yellow" />
          <StatsCard title="Absent" :value="stats.absent" icon="AlertCircle" color="red" />
        </div>
      </section>

      <!-- Dashboard Cards -->
      <section class="px-2 pb-2">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <DashboardCard title="Cachier Profile" description="Cachier Profile" icon="Users" color="blue" @click="navigateTo('user-profile')" />
          <DashboardCard title="Staff Management Control" description="Create Role, Designation, Department" icon="User" color="purple" @click="navigateTo('StaffManagementControl')" />
          <DashboardCard title="Shifts Management" description="Manage work shifts and schedules" icon="Clock" color="indigo" @click="navigateTo('Shifts')" />
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="px-2 pb-2">
        <Activity title = 'Recent Staff Activity'/>
      </section>

    </main>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

import StatsCard from '@/layout/StatsCard.vue'
import Header from '@/layout/Header.vue'
import DashboardCard from '@/components/modals/DashboardCard.vue'
import Activity from '@/layout/Activity.vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

import {
  Users,
  User,
  Clock,
  Calendar,
  AlertCircle,
  CheckSquare,
  AlertTriangle
} from 'lucide-vue-next'
// ─── Stores ────────────────────────────────────────────────────────────────────
const settingsStore = useSettingsStore()
const router = useRouter()


// ─── Theme ────────────────────────────────────────────────────────────────────
const settings = computed(() => settingsStore.settings)
const isDark    = computed(() => settings.value?.appearance?.theme !== 'light')
const primaryColor = computed(() => settings.value?.appearance?.primaryColor || '#06b6d4')


// const staffStore = useStaffStore()

const stats = reactive({
  totalStaff: 0,
  onDuty: 0,
  onLeave: 0,
  absent: 0
})

const recentActivities = ref([
  {
    id: 1,
    title: 'New staff added',
    timestamp: '2 hours ago',
    status: 'Added',
    bgColor: 'bg-blue-500',
    icon: Users,
    badgeClass: 'bg-blue-100 text-blue-800'
  },
  {
    id: 2,
    title: 'Shift schedule updated',
    timestamp: '4 hours ago',
    status: 'Updated',
    bgColor: 'bg-purple-500',
    icon: Calendar,
    badgeClass: 'bg-purple-100 text-purple-800'
  },
  {
    id: 3,
    title: 'Leave request approved',
    timestamp: '6 hours ago',
    status: 'Approved',
    bgColor: 'bg-green-500',
    icon: CheckSquare,
    badgeClass: 'bg-green-100 text-green-800'
  }
])

const calculateStats = () => {
//   stats.totalStaff = staffStore.staff?.length || 0
//   stats.onDuty = staffStore.staff?.filter(s => s.status === 'Active')?.length || 0
//   stats.onLeave = staffStore.staff?.filter(s => s.status === 'On Leave')?.length || 0
//   stats.absent = staffStore.staff?.filter(s => s.status === 'Absent')?.length || 0
}

const navigateTo = (route) => {
  console.log('route', route)
  router.push({ name: route })
}

onMounted(() => {
//   staffStore.loadStaffData()
  calculateStats()
})


</script>
