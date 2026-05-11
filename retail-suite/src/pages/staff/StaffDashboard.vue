<!-- Dashboard Staff.vue -->
<template>
<MainLayout>
  <div :class="isDark ? 'theme-dark' : 'theme-light'">
    <main class="flex flex-col flex-1">

      <!-- Header -->
      <Header pageTitle="Staff Management Dashboard" icon="Users" color="purple" />
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
          <DashboardCard title="UserDashboard List" description="UserDashboard" icon="Users" color="blue" @click="navigateTo('UserDashboard')" />
          <DashboardCard title="Staff List" description="View and manage all staff members" icon="Users" color="blue" @click="navigateTo('StaffList')" />
          <DashboardCard title="Staff Management Control" description="Create Role, Designation, Department" icon="User" color="purple" @click="navigateTo('StaffManagementControl')" />
          <DashboardCard title="Shifts Management" description="Manage work shifts and schedules" icon="Clock" color="indigo" @click="navigateTo('Shifts')" />
          <DashboardCard title="Shift Schedule" description="View and create shift schedules" icon="Calendar" color="cyan" @click="navigateTo('ShiftSchedule')" />
          <DashboardCard title="Attendance" description="Track attendance records" icon="CheckSquare" color="green" @click="navigateTo('Attendance')" />
          <DashboardCard title="Leave Management" description="Manage employee leaves and requests" icon="AlertTriangle" color="orange" @click="navigateTo('LeaveManagement')" />
          <DashboardCard title="Checkin List" description="Record and Manage employee Checkin" icon="AlertTriangle" color="orange" @click="navigateTo('CheckinList')" />
          <DashboardCard title="Shift Type" description="Record Types of Shift" icon="AlertTriangle" color="orange" @click="navigateTo('ShiftType')" />
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="px-2 pb-2">
        <Activity title = 'Recent Staff Activity'/>
      </section>

    </main>
  </div>
</MainLayout>
</template>

<script setup>
  import { ref, reactive, onMounted, computed } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import StatsCard from '@/layout/StatsCard.vue'
import Header from '@/layout/Header.vue'
import DashboardCard from '@/components/modals/DashboardCard.vue'
import Activity from '@/layout/Activity.vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
// import { useStaffStore } from '@/stores/staff'
import {
  Users,
  User,
  Clock,
  Calendar,
  AlertCircle,
  CheckSquare,
  AlertTriangle
} from 'lucide-vue-next'

const settingsStore = useSettingsStore()

  // ─── Theme ────────────────────────────────────────────────────────────────────
  const settings = computed(() => settingsStore.settings)


  const isDark    = computed(() => settings.value?.appearance?.theme !== 'light')

    const router = useRouter()
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
