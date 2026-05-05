<template>
<MainLayout>
  <div class="w-full flex min-h-screen bg-gray-50">
    <main class="flex flex-col flex-1 min-h-screen">

      <!-- Header -->
      <header class="mx-3 mt-1 sticky top-0 z-10 bg-white rounded-xl shadow-sm border-b border-gray-200">
        <div class="px-4 py-3 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <!-- ✅ Back button لو جاي من UserList -->
            <button
              v-if="viewingUser"
              @click="router.back()"
              class="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <User class="w-8 h-8 text-pink-600" />
            <h1 class="text-lg font-bold text-gray-900">
              {{ viewingUser ? `${userProfile.name}'s Profile` : 'User Profile & Settings' }}
            </h1>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span class="ml-3 text-gray-500">Loading profile...</span>
      </div>

      <template v-else>
        <!-- Stats -->
        <section class="px-2 py-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <StatsCard title="Your Role"   :value="userStats.role"       icon="Shield"      color="blue" />
            <StatsCard title="Department"  :value="userStats.department"  icon="Building2"   color="green" />
            <StatsCard title="Join Date"   :value="userStats.joinDate"    icon="Calendar"    color="yellow" />
            <StatsCard title="Status"      :value="userStats.status"      icon="CheckCircle" color="emerald" />
          </div>
        </section>

        <!-- Profile & Settings -->
        <section class="flex-1 px-2 pb-2">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Profile Card -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                <!-- Avatar & Name -->
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="userProfile.user_image"
                      :src="userProfile.user_image"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-3xl font-bold text-white">
                      {{ userProfile.name?.charAt(0)?.toUpperCase() || 'U' }}
                    </span>
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900">{{ userProfile.name }}</h2>
                    <p class="text-sm text-gray-600">{{ userProfile.email }}</p>
                    <!-- Roles badges -->
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span
                        v-for="role in userProfile.roles"
                        :key="role"
                        class="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full"
                      >
                        {{ role }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="border border-gray-200 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Department</p>
                    <p class="font-semibold text-gray-900">{{ userProfile.department || 'N/A' }}</p>
                  </div>
                  <div class="border border-gray-200 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Position</p>
                    <p class="font-semibold text-gray-900">{{ userProfile.position || 'N/A' }}</p>
                  </div>
                  <div class="border border-gray-200 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Join Date</p>
                    <p class="font-semibold text-gray-900">{{ userProfile.joinDate || 'N/A' }}</p>
                  </div>
                  <div class="border border-gray-200 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">Status</p>
                    <p :class="userProfile.status === 'Active' ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                      {{ userProfile.status }}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <!-- Quick Settings - بس لو شايف بروفايل نفسه -->
            <!-- Quick Settings column -->
            <div class="space-y-4">

            <!-- ✅ حالة 1: شايف بروفايل نفسه -->
            <template v-if="!viewingUser">
                <DashboardCard
                title="Account Settings"
                description="Manage your account preferences"
                icon="Settings"
                color="blue"
                @click="navigateTo('Settings')"
                />

                <div
                class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                @click="handleChangePassword"
                >
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock class="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Change Password</h3>
                    <p class="text-xs text-gray-600">Update your own password</p>
                    </div>
                </div>
                </div>

                <div
                class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                @click="handleLogout"
                >
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LogOut class="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Logout</h3>
                    <p class="text-xs text-gray-600">Sign out from your account</p>
                    </div>
                </div>
                </div>
            </template>

            <!-- ✅ حالة 2: System Manager بيشوف بروفايل حد تاني -->
          <!-- ✅ زرار Set New Password - System Manager بس -->
<template v-if="viewingUser && isSystemManager">

  <!-- Reset by Email -->
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
    @click="handleResetPassword"
  >
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <KeyRound class="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h3 class="font-semibold text-gray-900 text-sm">Reset Password</h3>
        <p class="text-xs text-gray-600">Send reset email to user</p>
      </div>
    </div>
  </div>

  <!-- ✅ Set New Password directly -->
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
    @click="showPasswordModal = true"
  >
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Lock class="w-5 h-5 text-violet-600" />
      </div>
      <div>
        <h3 class="font-semibold text-gray-900 text-sm">Set New Password</h3>
        <p class="text-xs text-gray-600">Set password directly for this user</p>
      </div>
    </div>
  </div>

  <!-- ✅ Password Modal -->
  <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-lg shadow-xl w-full max-w-md">

      <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Set New Password</h3>
      <button @click="closePasswordModal" class="text-gray-500 hover:text-gray-700 text-2xl font-light">✕</button>
      </div>

      <div class="p-6 space-y-4">
      <p class="text-sm text-gray-600">
          Setting new password for: <span class="font-semibold text-gray-900">{{ userProfile.name }}</span>
      </p>

      <!-- New Password -->
      <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
          <div class="relative">
          <input
              v-model="passwordForm.new_password"
              :type="showNewPass ? 'text' : 'password'"
              placeholder="Enter new password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 pr-10"
          />
          <button
              type="button"
              @click="showNewPass = !showNewPass"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
              <Eye v-if="!showNewPass" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
          </button>
          </div>
      </div>

      <!-- Confirm Password -->
      <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
          <div class="relative">
          <input
              v-model="passwordForm.confirm_password"
              :type="showConfirmPass ? 'text' : 'password'"
              placeholder="Confirm new password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 pr-10"
          />
          <button
              type="button"
              @click="showConfirmPass = !showConfirmPass"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
              <Eye v-if="!showConfirmPass" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
          </button>
          </div>
          <!-- مطابقة الباسورد -->
          <p v-if="passwordForm.confirm_password && !passwordsMatch" class="text-xs text-red-500 mt-1">
          Passwords do not match
          </p>
          <p v-if="passwordForm.confirm_password && passwordsMatch" class="text-xs text-green-600 mt-1">
          ✓ Passwords match
          </p>
      </div>

      <!-- Error -->
      <div v-if="passwordError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">{{ passwordError }}</p>
      </div>

      <!-- Success -->
      <div v-if="passwordSuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-800 text-sm">✅ Password changed successfully!</p>
      </div>
      </div>

      <div class="flex justify-end gap-3 px-6 pb-6">
      <button
          type="button"
          @click="closePasswordModal"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
          Cancel
      </button>
      <button
          @click="handleSetNewPassword"
          :disabled="!passwordsMatch || !passwordForm.new_password || isSavingPassword"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
          {{ isSavingPassword ? 'Saving...' : 'Change Password' }}
      </button>
      </div>

  </div>
  </div>
</template>


<!-- ✅ حالة 3: User عادي بيشوف بروفايل حد تاني → مفيش أي action -->
<template v-if="viewingUser && !isSystemManager">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <p class="text-sm text-gray-500 text-center">No actions available</p>
    </div>
</template>

            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="flex-shrink-0 px-2 pb-2">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Account Activity</h2>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-center justify-between border-b border-gray-100 pb-3"
              >
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-full flex items-center justify-center', activity.bgColor]">
                    <component :is="activity.icon" class="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                    <p class="text-xs text-gray-500">{{ activity.timestamp }}</p>
                  </div>
                </div>
                <span :class="['text-xs font-medium px-2 py-1 rounded', activity.badgeClass]">
                  {{ activity.status }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>

    </main>
  </div>
</MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import StatsCard from '@/layout/StatsCard.vue'
import DashboardCard from '@/components/modals/DashboardCard.vue'
import { useRouter, useRoute } from 'vue-router'
import { KeyRound } from 'lucide-vue-next'
import { getCurrentUserInfo, getAllUsers, changeUserPasswordApi } from '@/services/api'
import { api } from '@/services/auth.js';
import {
  User, UserCircle, ArrowLeft,
  Settings, Lock, LogOut,
  Shield, Building2, Calendar, CheckCircle, Eye, EyeOff
} from 'lucide-vue-next'
const router = useRouter()
const route  = useRoute()
const loading = ref(false)

// ✅ لو في query param userEmail → بنعرض بروفايل مستخدم تاني
const viewingUser = computed(() => route.query.user || null)

const userStats = reactive({
  role:       'N/A',
  department: 'N/A',
  joinDate:   'N/A',
  status:     'N/A'
})

const userProfile = reactive({
  name:       '',
  email:      '',
  department: '',
  position:   '',
  status:     'Active',
  user_image: '',
  roles:      [],
  joinDate:   'N/A'
})

// ─── Load Data ────────────────────────────────────────
const loadProfile = async () => {
  loading.value = true
  try {
    if (viewingUser.value) {
      // ✅ عرض بروفايل مستخدم تاني (من UserList)
      const res = await getAllUsers()
      const found = (res.data || []).find(u => u.name === viewingUser.value)
      if (found) {
        fillProfile(found)
      }
    } else {
      // ✅ عرض بروفايل المستخدم الحالي
      const res = await getCurrentUserInfo()
      if (res.data) fillProfile(res.data)
    }
  } catch (e) {
    console.error('Error loading profile:', e)
  } finally {
    loading.value = false
  }
}

const fillProfile = (data) => {
  userProfile.name       = data.full_name || data.name
  userProfile.email      = data.email
  userProfile.department = data.department || 'N/A'
  userProfile.position   = data.designation || data.position || 'N/A'
  userProfile.status     = data.enabled === undefined
                             ? (data.status || 'Active')
                             : (data.enabled ? 'Active' : 'Inactive')
  userProfile.user_image = data.user_image || ''
  userProfile.roles      = data.roles || []
  userProfile.joinDate   = data.join_date || data.creation?.split(' ')[0] || 'N/A'

  userStats.role       = data.roles?.[0] || 'N/A'
  userStats.department = data.department || 'N/A'
  userStats.joinDate   = userProfile.joinDate
  userStats.status     = userProfile.status
}

// ─── Actions ──────────────────────────────────────────
const navigateTo = (name) => router.push({ name })

const handleChangePassword = () => router.push({ name: 'change-password' })

const handleLogout = async () => {
  try {
    await api.get('/api/method/logout')
  } finally {
    router.push({ name: 'Login' })
  }
}
// ─── Actions ──────────────────────────────────────────
const isSystemManager = computed(() =>
  currentUserRoles.value.includes('System Manager') ||
  currentUserRoles.value.includes('Administrator')
)

// بيانات اليوزر الحالي (مش اللي بنشوف بروفايله)
const currentUserRoles = ref([])

// في loadProfile أضف
const loadCurrentUserRoles = async () => {
  try {
    const res = await getCurrentUserInfo()
    currentUserRoles.value = res.data?.roles || []
  } catch (e) {
    console.error(e)
  }
}

// ✅ Reset Password - System Manager بس
const handleResetPassword = async () => {
  if (!confirm(`Send password reset email to ${userProfile.email}?`)) return
  try {
    await api.post('/api/method/frappe.core.doctype.user.user.reset_password', {
      user: viewingUser.value
    })
    alert('✅ Reset email sent successfully')
  } catch (e) {
    console.log("E",e)
    alert('❌ Error sending reset email')
  }
}

// ─── Password Modal State ──────────────────────────────
const showPasswordModal  = ref(false)
const isSavingPassword   = ref(false)
const passwordError      = ref('')
const passwordSuccess    = ref(false)
const showNewPass        = ref(false)
const showConfirmPass    = ref(false)

const passwordForm = reactive({
  new_password:     '',
  confirm_password: ''
})

// ✅ تحقق من تطابق الباسورد
const passwordsMatch = computed(() =>
  passwordForm.new_password &&
  passwordForm.new_password === passwordForm.confirm_password
)

// ✅ Set New Password
const handleSetNewPassword = async () => {
  passwordError.value   = ''
  passwordSuccess.value = false

  if (!passwordForm.new_password) {
    passwordError.value = 'Password is required'
    return
  }
  if (passwordForm.new_password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }
  if (!passwordsMatch.value) {
    passwordError.value = 'Passwords do not match'
    return
  }

  isSavingPassword.value = true
  try {
    await changeUserPasswordApi({
      user:         viewingUser.value,
      new_password: passwordForm.new_password
    })
    passwordSuccess.value = true
    // أقفل الـ modal بعد ثانيتين
    setTimeout(() => closePasswordModal(), 2000)
  } catch (e) {
    passwordError.value = e?.response?.data?.message || 'Error changing password'
  } finally {
    isSavingPassword.value = false
  }
}

// ✅ Close & Reset
const closePasswordModal = () => {
  showPasswordModal.value  = false
  passwordError.value      = ''
  passwordSuccess.value    = false
  showNewPass.value        = false
  showConfirmPass.value    = false
  passwordForm.new_password     = ''
  passwordForm.confirm_password = ''
}
const recentActivities = ref([
  {
    id: 1, title: 'Profile updated',
    timestamp: '2 hours ago', status: 'Updated',
    bgColor: 'bg-blue-500', icon: User,
    badgeClass: 'bg-blue-100 text-blue-800'
  },
  {
    id: 2, title: 'Password changed',
    timestamp: '1 day ago', status: 'Changed',
    bgColor: 'bg-green-500', icon: Lock,
    badgeClass: 'bg-green-100 text-green-800'
  },
  {
    id: 3, title: 'Login successful',
    timestamp: '2 days ago', status: 'Success',
    bgColor: 'bg-emerald-500', icon: CheckCircle,
    badgeClass: 'bg-emerald-100 text-emerald-800'
  }
])


// في onMounted
onMounted(() => {
  loadProfile()
  loadCurrentUserRoles()  // ✅ جيب رول اليوزر الحالي دايماً
})
</script>
