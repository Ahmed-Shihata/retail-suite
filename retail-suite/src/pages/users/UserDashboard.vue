<template>
  <MainLayout>
    <div>
      <main class="flex flex-col flex-1 min-h-screen">

        <!-- Header -->
        <header
          class="mx-3 mt-1 sticky top-0 z-10 rounded-xl shadow-sm"
          :style="{
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)'
          }"
        >
          <div class="px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <Users class="w-8 h-8 text-violet-600" :style="{ color: 'var(--focus-ring)' }" />
              <h1 class="text-lg font-bold" :style="{ color: 'var(--text-main)' }">User Management</h1>
            </div>
            <button
              @click="showAddModal = true"
              class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus class="w-4 h-4" />
              New User
            </button>
          </div>
        </header>

        <!-- Filters -->
        <section class="px-6 py-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by name or email..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  v-model="roleFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All Roles</option>
                  <option v-for="role in availableRoles" :key="role" :value="role">{{ role }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="statusFilter"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Summary Cards -->
        <section class="px-6 pb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-violet-600">{{ users.length }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Active</p>
              <p class="text-2xl font-bold text-green-600">{{ users.filter(u => u.enabled).length }}</p>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <p class="text-sm text-gray-600">Inactive</p>
              <p class="text-2xl font-bold text-red-600">{{ users.filter(u => !u.enabled).length }}</p>
            </div>
          </div>
        </section>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <span class="ml-3 text-gray-500">Loading users...</span>
        </div>

        <!-- Table -->
        <section v-else class="flex-1 px-6 pb-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="user in filteredUsers" :key="user.name" class="hover:bg-gray-50">

                    <!-- User -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                          <img v-if="user.user_image" :src="user.user_image" class="w-9 h-9 rounded-full object-cover" />
                          <span v-else class="text-violet-700 font-semibold text-sm">
                            {{ user.full_name?.charAt(0)?.toUpperCase() || 'U' }}
                          </span>
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ user.full_name || user.name }}</span>
                      </div>
                    </td>

                    <!-- Email -->
                    <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>

                    <!-- Roles -->
                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="role in (user.roles || []).slice(0, 2)"
                          :key="role"
                          class="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full"
                        >
                          {{ role }}
                        </span>
                        <span
                          v-if="(user.roles || []).length > 2"
                          class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          +{{ user.roles.length - 2 }}
                        </span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4">
                      <span
                        :class="user.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'"
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {{ user.enabled ? 'Active' : 'Inactive' }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <!-- ✅ View Profile -->
                        <button
                          @click="viewUserProfile(user)"
                          class="text-violet-600 hover:text-violet-900"
                          title="View Profile"
                        >
                          <Eye class="w-4 h-4" />
                        </button>
                        <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit2 class="w-4 h-4" />
                        </button>
                        <button
                          @click="toggleUserStatus(user)"
                          :class="user.enabled ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'"
                          :title="user.enabled ? 'Disable' : 'Enable'"
                        >
                          <UserX v-if="user.enabled" class="w-4 h-4" />
                          <UserCheck v-else class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredUsers.length === 0">
                    <td colspan="5" class="px-6 py-12 text-center text-gray-500">No users found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Add/Edit Modal -->
        <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">

            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ showEditModal ? 'Edit User' : 'Create New User' }}
              </h3>
              <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl font-light">✕</button>
            </div>

            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    v-model="form.first_name"
                    type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    v-model="form.last_name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  v-model="form.email"
                  type="email" required
                  :readonly="showEditModal"
                  :class="{ 'bg-gray-100': showEditModal }"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div v-if="!showEditModal">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  v-model="form.password"
                  type="password" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <!-- Roles -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Roles *</label>
                <div class="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  <label
                    v-for="role in availableRoles"
                    :key="role"
                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      :value="role"
                      v-model="form.roles"
                      class="rounded border-gray-300 text-violet-600"
                    />
                    <span class="text-sm text-gray-700">{{ role }}</span>
                  </label>
                </div>
                <p v-if="form.roles.length === 0" class="text-xs text-red-500 mt-1">Select at least one role</p>
              </div>

              <!-- Error -->
              <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-800 text-sm">{{ errorMessage }}</p>
              </div>

              <div class="flex justify-end gap-3 pt-2 border-t border-gray-200">
                <button type="button" @click="closeModal"
                  class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" :disabled="isSaving || form.roles.length === 0"
                  class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-50">
                  {{ isSaving ? 'Saving...' : (showEditModal ? 'Update' : 'Create') }} User
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MainLayout from '@/layout/MainLayout.vue'
import { useRouter, useRoute } from 'vue-router'
import { Users, Plus, Edit2, UserX, UserCheck, Eye } from 'lucide-vue-next'
import { getAllUsers, createUser, updateUser, deleteUser, getAvailableRoles } from '@/services/api'

// ─── State ────────────────────────────────────────────
const users          = ref([])
const availableRoles = ref([])
const loading        = ref(false)
const isSaving       = ref(false)
const errorMessage   = ref('')

const searchQuery  = ref('')
const roleFilter   = ref('')
const statusFilter = ref('')

const showAddModal  = ref(false)
const showEditModal = ref(false)
const editingUser   = ref(null)

const router = useRouter()
const route  = useRoute()

const getDefaultForm = () => ({
  first_name: '',
  last_name:  '',
  email:      '',
  password:   '',
  roles:      []
})

const form = reactive(getDefaultForm())

// ─── Computed ─────────────────────────────────────────
const filteredUsers = computed(() => {
  let data = [...users.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  }

  if (roleFilter.value) {
    data = data.filter(u => u.roles?.includes(roleFilter.value))
  }

  if (statusFilter.value) {
    data = data.filter(u =>
      statusFilter.value === 'Active' ? u.enabled : !u.enabled
    )
  }

  return data
})

// ─── Load ─────────────────────────────────────────────
const loadUsers = async () => {
  loading.value = true
  try {
    const [usersRes, rolesRes] = await Promise.all([
      getAllUsers(),
      getAvailableRoles()
    ])
    users.value          = usersRes.data || []
    availableRoles.value = rolesRes.data || []
  } catch (e) {
    console.error('Error loading users:', e)
  } finally {
    loading.value = false
  }
}

// ─── Actions ──────────────────────────────────────────
const editUser = (user) => {
  editingUser.value = user
  Object.assign(form, {
    first_name: user.full_name?.split(' ')[0] || '',
    last_name:  user.full_name?.split(' ').slice(1).join(' ') || '',
    email:      user.email,
    password:   '',
    roles:      [...(user.roles || [])]
  })
  showEditModal.value = true
}


//  View Profile - user Profile
const viewUserProfile = (user) => {
  router.push({
    name: 'user-profile',
    query: { user: user.name }
  })
}
const toggleUserStatus = async (user) => {
  const action = user.enabled ? 'disable' : 'enable'
  if (!confirm(`Are you sure you want to ${action} ${user.full_name}?`)) return
  try {
    await updateUser(user.name, { ...user, enabled: user.enabled ? 0 : 1 })
    await loadUsers()
  } catch (e) {
    console.error('Error toggling user status:', e)
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  if (form.roles.length === 0) {
    errorMessage.value = 'Please select at least one role'
    return
  }

  isSaving.value = true
  try {
    if (showEditModal.value && editingUser.value) {
      await updateUser(editingUser.value.name, form)
    } else {
      await createUser(form)
    }
    await loadUsers()
    closeModal()
  } catch (e) {
    errorMessage.value = e?.response?.data?.message || 'Error saving user'
  } finally {
    isSaving.value = false
  }
}

const closeModal = () => {
  showAddModal.value  = false
  showEditModal.value = false
  editingUser.value   = null
  errorMessage.value  = ''
  Object.assign(form, getDefaultForm())
}

onMounted(() => loadUsers())
</script>
