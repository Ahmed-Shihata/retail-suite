<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden flex items-center justify-center p-4">
    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-40 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <!-- Toast Message -->
    <Transition name="slide-fade">
      <div v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- Auth Container -->
    <div class="relative z-20 w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-2">
          Hypermarket
        </h1>
        <p class="text-slate-400 text-sm">منصتك الموثوقة للتسوق الإلكتروني</p>
      </div>

      <!-- Main Auth Card -->
      <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <!-- User Type Tabs -->
        <div class="flex gap-2 mb-8 bg-slate-900/50 p-1 rounded-xl">
          <button
            @click="userType = 'customer'"
            :class="userType === 'customer'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
              : 'text-slate-400 hover:text-white'"
            class="flex-1 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
          >
            👤 عميل
          </button>
          <button
            @click="userType = 'employee'"
            :class="userType === 'employee'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
              : 'text-slate-400 hover:text-white'"
            class="flex-1 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
          >
            💼 موظف
          </button>
        </div>

        <!-- Customer Auth Flow -->
        <div v-if="userType === 'customer'">
          <!-- Step 1: Phone Number -->
          <div v-if="authStep === 'phone'" class="space-y-6">
            <div class="text-center mb-6">
              <div class="text-5xl mb-4 animate-bounce">📱</div>
              <h2 class="text-2xl font-bold text-white mb-2">أهلاً بك!</h2>
              <p class="text-slate-400 text-sm">أدخل رقم موبايلك للمتابعة</p>
            </div>

            <div>
              <label class="block text-white font-medium mb-2">رقم الموبايل</label>
              <div class="relative">
                <input
                  v-model="phone"
                  @keyup.enter="checkPhone"
                  type="tel"
                  dir="ltr"
                  placeholder="01XXXXXXXXX"
                  maxlength="11"
                  class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none text-center text-lg font-mono"
                >
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  🇪🇬
                </div>
              </div>
              <p class="text-slate-500 text-xs mt-2 text-center">مثال: 01012345678</p>
            </div>

            <button
              @click="checkPhone"
              :disabled="isLoading || !isPhoneValid"
              class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري التحقق...
              </span>
              <span v-else>متابعة</span>
            </button>
          </div>

          <!-- Step 2: Login (Existing User) -->
          <div v-if="authStep === 'login'" class="space-y-6">
            <div class="text-center mb-6">
              <div class="text-5xl mb-4">👋</div>
              <h2 class="text-2xl font-bold text-white mb-2">أهلاً بعودتك!</h2>
              <p class="text-slate-400 text-sm">{{ phone }}</p>
              <button @click="authStep = 'phone'" class="text-emerald-400 text-sm mt-2 hover:underline">
                تغيير الرقم
              </button>
            </div>

            <div>
              <label class="block text-white font-medium mb-2">كلمة المرور</label>
              <div class="relative">
                <input
                  v-model="password"
                  @keyup.enter="handleLogin"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="أدخل كلمة المرور"
                  class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
                >
                <button
                  @click="showPassword = !showPassword"
                  type="button"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <button
              @click="handleLogin"
              :disabled="isLoading || !password"
              class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري تسجيل الدخول...
              </span>
              <span v-else>تسجيل الدخول</span>
            </button>

            <div class="text-center">
              <button class="text-slate-400 text-sm hover:text-emerald-400 transition">
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          <!-- Step 3: Register (New User) -->
          <div v-if="authStep === 'register'" class="space-y-6">
            <div class="text-center mb-6">
              <div class="text-5xl mb-4">🎉</div>
              <h2 class="text-2xl font-bold text-white mb-2">حساب جديد</h2>
              <p class="text-slate-400 text-sm">{{ phone }}</p>
              <button @click="authStep = 'phone'" class="text-emerald-400 text-sm mt-2 hover:underline">
                تغيير الرقم
              </button>
            </div>

            <div>
              <label class="block text-white font-medium mb-2">الاسم الكامل</label>
              <input
                v-model="fullName"
                type="text"
                placeholder="أدخل اسمك"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
              >
            </div>

            <div>
              <label class="block text-white font-medium mb-2">كلمة المرور</label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="اختر كلمة مرور قوية"
                  class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
                >
                <button
                  @click="showPassword = !showPassword"
                  type="button"
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="mt-2 space-y-1">
                <div class="flex items-center gap-2 text-xs" :class="password.length >= 6 ? 'text-emerald-400' : 'text-slate-500'">
                  <span>{{ password.length >= 6 ? '✓' : '○' }}</span>
                  <span>6 أحرف على الأقل</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-white font-medium mb-2">تأكيد كلمة المرور</label>
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  @keyup.enter="handleRegister"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="أعد إدخال كلمة المرور"
                  class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
                >
              </div>
            </div>

            <div class="flex items-start gap-3">
              <input
                v-model="acceptTerms"
                type="checkbox"
                id="terms"
                class="w-5 h-5 accent-emerald-500 cursor-pointer rounded mt-1"
              >
              <label for="terms" class="text-slate-400 text-sm cursor-pointer">
                أوافق على
                <a href="#" class="text-emerald-400 hover:underline">الشروط والأحكام</a>
                و
                <a href="#" class="text-emerald-400 hover:underline">سياسة الخصوصية</a>
              </label>
            </div>

            <button
              @click="handleRegister"
              :disabled="isLoading || !isRegisterValid"
              class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري إنشاء الحساب...
              </span>
              <span v-else>إنشاء حساب</span>
            </button>
          </div>
        </div>

        <!-- Employee Login -->
        <div v-if="userType === 'employee'" class="space-y-6">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">💼</div>
            <h2 class="text-2xl font-bold text-white mb-2">تسجيل دخول الموظفين</h2>
            <p class="text-slate-400 text-sm">استخدم بيانات حسابك في النظام</p>
          </div>

          <div>
            <label class="block text-white font-medium mb-2">اسم المستخدم</label>
            <input
              v-model="employeeUsername"
              type="text"
              placeholder="username"
              class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
            >
          </div>

          <div>
            <label class="block text-white font-medium mb-2">كلمة المرور</label>
            <div class="relative">
              <input
                v-model="employeePassword"
                @keyup.enter="handleEmployeeLogin"
                :type="showPassword ? 'text' : 'password'"
                placeholder="أدخل كلمة المرور"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
              >
              <button
                @click="showPassword = !showPassword"
                type="button"
                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button
            @click="handleEmployeeLogin"
            :disabled="isLoading || !employeeUsername || !employeePassword"
            class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري تسجيل الدخول...
            </span>
            <span v-else>تسجيل الدخول</span>
          </button>
        </div>
      </div>

      <!-- Back to Store -->
      <div class="text-center mt-6">
        <router-link :to="{ name: 'Supermarket' }" class="text-slate-400 hover:text-emerald-400 transition text-sm inline-flex items-center gap-2">
          ← العودة للمتجر
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { checkCustomerExists, registerCustomer } from '@/services/api'
import { authAPI } from '@/services/auth'

const router = useRouter()

// State
const userType = ref('customer') // 'customer' or 'employee'
const authStep = ref('phone') // 'phone', 'login', 'register'
const isLoading = ref(false)
const showPassword = ref(false)

// Customer Auth
const phone = ref('')
const password = ref('')
const user = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const acceptTerms = ref(false)

// Employee Auth
const employeeUsername = ref('')
const employeePassword = ref('')

const message = ref({
  show: false,
  text: '',
  type: 'success'
})

// Computed
const isPhoneValid = computed(() => {
  const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/
  return phoneRegex.test(phone.value)
})

const isRegisterValid = computed(() => {
  return fullName.value.trim() &&
         password.value.length >= 6 &&
         password.value === confirmPassword.value &&
         acceptTerms.value
})

// Methods
const checkPhone = async () => {
  if (!isPhoneValid.value) {
    showMessage('رقم الموبايل غير صحيح', 'error')
    return
  }

  isLoading.value = true

  try {
    const result = await checkCustomerExists(phone.value)
    console.log("result:",result)
      if (result.data.exists) {
        authStep.value = 'login'
      } else {
        authStep.value = 'register'
      }
  } catch (error) {
    console.error('Error checking phone:', error)
    showMessage('حدث خطأ. حاول مرة أخرى', 'error')
  } finally {
    isLoading.value = false
  }
}


const handleLogin = async () => {
  if (!password.value) {
    showMessage('من فضلك أدخل كلمة المرور', 'error')
    return
  }

  isLoading.value = true

  try {
      const response = await authAPI.login(
          user.value,
          password.value
        )
    // const response = await fetch('/api/method/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     usr: phone.value,
    //     pwd: password.value
    //   })
    // })
    console.log('***** Login response *****:', response)


    if (response === true) {
      showMessage('تم تسجيل الدخول بنجاح!', 'success')
      setTimeout(() => {
        router.push({ name: 'Supermarket' })
      }, 1000)
    } else {
      showMessage('كلمة المرور غير صحيحة', 'error')
    }
  } catch (error) {
    console.error('Login error:', error)
    showMessage('حدث خطأ أثناء تسجيل الدخول', 'error')
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!isRegisterValid.value) {
    showMessage('من فضلك أكمل جميع البيانات', 'error')
    return
  }

  if (password.value !== confirmPassword.value) {
    showMessage('كلمتا المرور غير متطابقتين', 'error')
    return
  }

  isLoading.value = true

  try {
    const result = await registerCustomer({
      phone: phone.value,
      full_name: fullName.value,
      password: password.value
    })
    console.log("ressss",result)
    if (result.success === true) {
      user.value = result.user
      showMessage('تم إنشاء الحساب بنجاح!', 'success')

      // Auto login after registration
      setTimeout(async () => {
        await handleLogin()
      }, 1000)
    } else {
      showMessage(result.error || 'حدث خطأ أثناء التسجيل', 'error')
    }
  } catch (error) {
    console.error('Registration error:', error)
    showMessage('حدث خطأ أثناء إنشاء الحساب', 'error')
  } finally {
    isLoading.value = false
  }
}


const handleEmployeeLogin = async () => {
  isLoading.value = true

  try {

    const response = await authAPI.login(
      employeeUsername.value,
      employeePassword.value
    )

    // const response = await fetch('/api/method/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     usr: employeeUsername.value,
    //     pwd: employeePassword.value
    //   })
    // })

    console.log('***** Employee Login response *****:', response)
    const data = await response.json()

    if (data.message === 'Logged In') {
      showMessage('تم تسجيل الدخول بنجاح!', 'success')
      setTimeout(() => {
        // Redirect to admin/employee dashboard
        window.location.href = '/app'
      }, 1000)
    } else {
      showMessage('بيانات الدخول غير صحيحة', 'error')
    }
  } catch (error) {
    console.error('Employee login error:', error)
    showMessage('حدث خطأ أثناء تسجيل الدخول', 'error')
  } finally {
    isLoading.value = false
  }
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* Phone input styling */
input[type="tel"]::-webkit-inner-spin-button,
input[type="tel"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="tel"] {
  -moz-appearance: textfield;
}
</style>
