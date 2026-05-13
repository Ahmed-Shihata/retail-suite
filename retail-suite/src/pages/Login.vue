<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Frappe</h1>
        <p class="text-blue-100">أهلاً بعودتك</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-lg shadow-2xl p-8">
        <div class="space-y-6">
          <!-- Username Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="أدخل اسم المستخدم"
              :disabled="loading"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="أدخل كلمة المرور"
                :disabled="loading"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :disabled="loading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-700 text-sm">{{ success }}</p>
          </div>

          <!-- Login Button -->
          <button
            @click="handleLogin"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            {{ loading ? 'جاري تسجيل الدخول...' : 'دخول' }}
          </button>
        </div>

        <!-- Footer Links -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-sm text-gray-600">
            هل نسيت كلمة المرور؟
            <a href="#" class="text-blue-600 hover:underline">
              إعادة تعيين
            </a>
          </p>
        </div>
      </div>

      <!-- Debug Info -->
      <div class="mt-4 text-center text-blue-100 text-xs">
        <p>جرب: Administrator</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/auth'

// Router
const router = useRouter()

// State
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

// Methods
const handleLogin = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    // تحقق من الحقول
    if (!username.value.trim() || !password.value.trim()) {
      error.value = 'يرجى إدخال اسم المستخدم وكلمة المرور'
      return
    }

    // Login
    const loginSuccess = await authAPI.login(
      username.value,
      password.value
    )

    if (loginSuccess) {
      success.value = '✅ تم تسجيل الدخول بنجاح! جاري التحويل...'

      setTimeout(() => {
        router.push('/POS')
      }, 1500)
    } else {
      error.value = 'فشل تسجيل الدخول. تحقق من بيانات المستخدم.'
    }
  } catch (err) {
    error.value = 'خطأ في الاتصال. حاول مرة أخرى.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Tailwind CSS سيتعامل مع الستايل */
</style>
