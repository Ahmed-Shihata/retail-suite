<!-- AccountPage.vue -->
<template>
  <div :class="isDark ? 'theme-dark' : 'theme-light'"
       class="page-wrapper min-h-screen overflow-hidden transition-colors duration-500">

    <Navbar
      :selected-category="'جميع التصنيفات'"
      :delivery-address="deliveryAddress"
      :categories="[]"
      @show-map-modal="openMapModal"
    />

    <!-- Background blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="blob blob-1 absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse"></div>
      <div class="blob blob-2 absolute bottom-40 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse"
           style="animation-delay:1s"></div>
    </div>

    <!-- Toast -->
    <Transition name="slide-fade">
      <div v-if="toast.show"
           :class="toast.type==='success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
           class="fixed top-6 right-6 px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3">
        <span>{{ toast.type==='success' ? '✓' : '✕' }}</span>
        {{ toast.text }}
      </div>
    </Transition>

    <!-- Page Loading -->
    <div v-if="pageLoading" class="relative z-20 flex items-center justify-center min-h-[70vh]">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        <p class="subtext text-sm">جارٍ تحميل بياناتك…</p>
      </div>
    </div>

    <!-- Page Error -->
    <div v-else-if="pageError" class="relative z-20 flex items-center justify-center min-h-[70vh] px-4">
      <div class="card-panel rounded-2xl p-10 text-center max-w-md">
        <div class="text-5xl mb-4">⚠️</div>
        <p class="heading-text font-bold text-lg mb-2">حدث خطأ أثناء التحميل</p>
        <p class="subtext text-sm mb-6">{{ pageError }}</p>
        <button @click="loadAll" class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition">
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- Main -->
    <div v-else class="relative z-20 max-w-5xl mx-auto px-4 py-12">

      <!-- Breadcrumb -->
      <div class="mb-8 text-sm flex items-center gap-2 breadcrumb-text">
        <a href="#" class="text-emerald-500 hover:text-teal-400 transition">الرئيسية</a>
        <span class="opacity-40">/</span>
        <span>حسابي</span>
      </div>

      <!-- Header -->
      <div class="mb-10 flex items-center gap-5 flex-wrap">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-emerald-500/30 select-none">
          {{ userInitials }}
        </div>
        <div>
          <h1 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            {{ form.fullName || 'مرحباً بك' }}
          </h1>
          <p class="subtext text-sm mt-1">{{ form.email }}</p>
          <span v-if="hasCustomer" class="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-medium">
            عميل مسجل
          </span>
        </div>

        <div class="mr-auto flex items-center gap-3 flex-wrap">
          <button v-if="!isEditing" @click="startEditing"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/30 transition font-medium text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            تعديل الحساب
          </button>

          <!-- Theme toggle -->
          <button @click="toggleTheme" class="theme-toggle relative w-[66px] h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <span class="track absolute inset-0 rounded-full transition-all duration-500"></span>
            <span class="absolute inset-0 flex items-center justify-between px-2 pointer-events-none text-[13px] select-none">
              <span :class="isDark ? 'opacity-100' : 'opacity-25'" class="transition-opacity duration-300">🌙</span>
              <span :class="isDark ? 'opacity-25' : 'opacity-100'" class="transition-opacity duration-300">☀️</span>
            </span>
            <span class="thumb absolute top-[3px] w-[26px] h-[26px] rounded-full flex items-center justify-center text-sm shadow-md transition-all duration-500"
                  :class="isDark ? 'translate-x-[3px]' : 'translate-x-[37px]'">
              <span v-if="isDark">🌙</span><span v-else>☀️</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-8 tab-bar rounded-xl p-1.5 w-fit overflow-x-auto">
        <button v-for="tab in visibleTabs" :key="tab.key" @click="activeTab=tab.key"
                :class="activeTab===tab.key ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'tab-inactive hover:text-emerald-500'"
                class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap">
          <span>{{ tab.icon }}</span>{{ tab.label }}
        </button>
      </div>

      <Transition name="fade" mode="out-in">

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- ── بياناتي ──                                             -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <div v-if="activeTab==='profile'" key="profile">
          <div class="card-panel rounded-2xl p-8 space-y-8">

            <!-- ── قسم: المعلومات الشخصية ── -->
            <div>
              <p class="subtext text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                <span>👤</span> المعلومات الشخصية
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="field-group">
                  <label class="field-label">الاسم الكامل</label>
                  <input v-model="form.fullName" :disabled="!isEditing" type="text" class="field-input" placeholder="أدخل اسمك الكامل"/>
                </div>
                <div class="field-group">
                  <label class="field-label">المدينة</label>
                  <input v-model="form.city" :disabled="!isEditing" type="text" class="field-input" placeholder="القاهرة"/>
                </div>
              </div>
            </div>

            <div class="divider-top pt-2"></div>

            <!-- ── قسم: جهات الاتصال ── -->
            <div>
              <div class="flex items-center justify-between mb-5">
                <p class="subtext text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
                  <span>📞</span> جهات الاتصال
                </p>
                <button v-if="isEditing" @click="openContactModal(null)"
                        class="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/30 transition">
                  + إضافة
                </button>
              </div>

              <div v-if="!contacts.length" class="text-center py-6">
                <p class="subtext text-sm">لا توجد جهات اتصال مسجلة</p>
              </div>

              <div v-else class="space-y-3">
                <div v-for="contact in contacts" :key="contact.name"
                     class="card-panel rounded-xl p-4">

                  <!-- هيدر -->
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <p class="heading-text font-bold text-sm">
                        {{ contact.first_name }} {{ contact.last_name || '' }}
                      </p>
                      <div class="flex gap-1 mt-1 flex-wrap">
                        <span v-if="contact.is_primary_contact"
                              class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">أساسي</span>
                        <span v-if="contact.designation"
                              class="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full">
                          {{ contact.designation }}
                        </span>
                      </div>
                    </div>
                    <!-- أزرار التعديل/الحذف -->
                    <div v-if="isEditing" class="flex gap-2">
                      <button @click="openContactModal(contact)"
                              class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition">
                        تعديل
                      </button>
                      <button @click="deleteContact(contact)"
                              class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition">
                        حذف
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">

                    <!-- الإيميلات -->
                    <div v-if="contact.email_ids?.length">
                      <p class="subtext font-semibold mb-1.5">📧 الإيميلات</p>
                      <div class="space-y-1">
                        <div v-for="e in contact.email_ids" :key="e.email_id" class="flex items-center gap-2">
                          <span class="heading-text" dir="ltr">{{ e.email_id }}</span>
                          <span v-if="e.is_primary" class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">رئيسي</span>
                        </div>
                      </div>
                    </div>
                    <p v-else class="subtext text-xs">لا يوجد إيميل</p>

                    <!-- الأرقام -->
                    <div v-if="contact.phone_nos?.length">
                      <p class="subtext font-semibold mb-1.5">📱 الأرقام</p>
                      <div class="space-y-1">
                        <div v-for="p in contact.phone_nos" :key="p.phone" class="flex items-center gap-2">
                          <span class="heading-text" dir="ltr">{{ p.phone }}</span>
                          <span v-if="p.is_primary_mobile_no" class="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">موبايل</span>
                          <span v-if="p.is_primary_phone"     class="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">هاتف</span>
                        </div>
                      </div>
                    </div>
                    <p v-else class="subtext text-xs">لا يوجد رقم</p>

                    <!-- العنوان المرتبط -->
                    <div v-if="contact.linked_address" class="md:col-span-2 pt-2 divider-top">
                      <p class="subtext font-semibold mb-1.5">📍 العنوان المرتبط</p>
                      <div class="flex items-start justify-between gap-3 p-3 rounded-lg"
                           style="background:var(--input-bg);border:1px solid var(--input-border)">
                        <div>
                          <p class="heading-text font-bold text-xs">{{ contact.linked_address.address_title }}</p>
                          <p class="subtext text-xs mt-0.5">{{ contact.linked_address.condensed }}</p>
                          <div class="flex gap-1 mt-1">
                            <span v-if="contact.linked_address.is_primary_address" class="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">رئيسي</span>
                            <span v-if="contact.linked_address.is_shipping_address" class="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">شحن</span>
                          </div>
                        </div>
                        <!-- ربط عنوان مختلف بالكونتكت -->
                        <button v-if="isEditing" @click="linkAddressToContact(contact)"
                                class="flex-shrink-0 px-2 py-1 text-[11px] rounded-lg bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 transition border border-slate-500/30">
                          تغيير
                        </button>
                      </div>
                    </div>
                    <div v-else-if="isEditing" class="md:col-span-2 pt-2 divider-top">
                      <button @click="linkAddressToContact(contact)"
                              class="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
                        <span>📍</span> ربط عنوان بهذا الكونتكت
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div class="divider-top pt-2"></div>

            <!-- ── قسم: العناوين ── -->
            <div>
              <p class="subtext text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                <span>📍</span> العناوين
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- ─ العنوان الرئيسي ─ -->
                <div class="card-panel rounded-xl p-4 flex items-start justify-between gap-3"
                     :class="!primaryAddress ? 'border-yellow-500/40' : ''">
                  <div class="flex items-start gap-3 flex-1">
                    <span class="text-xl mt-0.5">🏠</span>
                    <div class="flex-1 min-w-0">
                      <p class="subtext text-xs mb-1">العنوان الرئيسي</p>
                      <template v-if="primaryAddress">
                        <div class="flex gap-1 mb-1 flex-wrap">
                          <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">أساسي</span>
                        </div>
                        <p class="heading-text font-bold text-sm">{{ primaryAddress.address_title }}</p>
                        <p class="subtext text-xs mt-1">{{ primaryAddress.address_line1 }}</p>
                        <p class="subtext text-xs" v-if="primaryAddress.address_line2">{{ primaryAddress.address_line2 }}</p>
                        <p class="subtext text-xs">
                          {{ primaryAddress.city }}{{ primaryAddress.state ? '، ' + primaryAddress.state : '' }}{{ primaryAddress.country ? '، ' + primaryAddress.country : '' }}
                        </p>
                      </template>
                      <p v-else class="text-yellow-400 text-xs">لا يوجد عنوان رئيسي</p>
                    </div>
                  </div>
                  <button v-if="isEditing" @click="openAddressModal('primary')"
                          class="flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/30 transition">
                    {{ primaryAddress ? 'تغيير' : 'اختر' }}
                  </button>
                </div>

                <!-- ─ عنوان الشحن ─ -->
                <div class="card-panel rounded-xl p-4 flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3 flex-1">
                    <span class="text-xl mt-0.5">🚚</span>
                    <div class="flex-1 min-w-0">
                      <p class="subtext text-xs mb-1">عنوان الشحن</p>
                      <template v-if="shippingAddress">
                        <div class="flex gap-1 mb-1 flex-wrap">
                          <span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">شحن</span>
                          <span v-if="shippingSameAsPrimary"
                                class="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full">
                            نفس الرئيسي
                          </span>
                        </div>
                        <p class="heading-text font-bold text-sm">{{ shippingAddress.address_title }}</p>
                        <p class="subtext text-xs mt-1">{{ shippingAddress.address_line1 }}</p>
                        <p class="subtext text-xs" v-if="shippingAddress.address_line2">{{ shippingAddress.address_line2 }}</p>
                        <p class="subtext text-xs">
                          {{ shippingAddress.city }}{{ shippingAddress.state ? '، ' + shippingAddress.state : '' }}{{ shippingAddress.country ? '، ' + shippingAddress.country : '' }}
                        </p>
                      </template>
                      <p v-else class="subtext text-xs">سيُستخدم العنوان الرئيسي</p>
                    </div>
                  </div>
                  <button v-if="isEditing" @click="openAddressModal('shipping')"
                          class="flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition">
                    {{ shippingAddress ? 'تغيير' : 'اختر' }}
                  </button>
                </div>

              </div>
            </div>

            <!-- ── ملخص الحساب ── -->
            <div v-if="hasCustomer" class="divider-top pt-6">
              <p class="subtext text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>📊</span> ملخص الحساب
              </p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="card-panel rounded-xl p-4 text-center">
                  <p class="text-xl font-black text-emerald-500">{{ fmt(rawCustomer.financial_data?.total_sales || 0) }}</p>
                  <p class="subtext text-xs mt-1">إجمالي المشتريات</p>
                </div>
                <div class="card-panel rounded-xl p-4 text-center">
                  <p class="text-xl font-black" :class="(rawCustomer.financial_data?.due_amount || 0) > 0 ? 'text-red-500' : 'text-emerald-500'">
                    {{ fmt(rawCustomer.financial_data?.due_amount || 0) }}
                  </p>
                  <p class="subtext text-xs mt-1">المستحق</p>
                </div>
                <div class="card-panel rounded-xl p-4 text-center">
                  <p class="text-xl font-black text-blue-500">{{ rawCustomer.basic_data?.posa_discount || 0 }}%</p>
                  <p class="subtext text-xs mt-1">نسبة الخصم</p>
                </div>
                <div class="card-panel rounded-xl p-4 text-center">
                  <p class="text-xl font-black text-purple-500">{{ rawCustomer.basic_data?.customer_group || '—' }}</p>
                  <p class="subtext text-xs mt-1">المجموعة</p>
                </div>
              </div>
            </div>

            <!-- أزرار الحفظ -->
            <Transition name="slide-down">
              <div v-if="isEditing" class="flex gap-3 pt-4 divider-top">
                <button @click="saveProfile" :disabled="saving"
                        class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg transition disabled:opacity-60">
                  <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات' }}
                </button>
                <button @click="cancelEditing" class="btn-cancel px-6 py-3 rounded-xl transition font-medium">إلغاء</button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- ── طلباتي ──                                              -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <div v-else-if="activeTab==='orders'" key="orders">
          <div class="space-y-4">

            <!-- فلاتر الطلبات -->
            <div class="flex gap-2 flex-wrap mb-2">
              <button v-for="f in orderFilters" :key="f.key" @click="orderFilter = f.key"
                      :class="orderFilter === f.key
                        ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50'
                        : 'tab-inactive border-transparent'"
                      class="px-4 py-1.5 rounded-lg text-xs font-medium border transition">
                {{ f.label }}
                <span class="ml-1 opacity-50">({{ orderCount(f.key) }})</span>
              </button>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-16">
              <div class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p class="subtext text-sm">جارٍ تحميل الطلبات…</p>
            </div>

            <!-- لا يوجد طلبات -->
            <div v-else-if="!filteredOrders.length" class="text-center py-20">
              <div class="text-6xl mb-4">📦</div>
              <p class="heading-text text-xl font-bold mb-2">لا توجد طلبات</p>
              <p class="subtext text-sm">لم يتم العثور على طلبات في هذه الفئة</p>
            </div>

            <!-- قائمة الطلبات -->
            <div v-else v-for="o in filteredOrders" :key="o.name"
                 class="card-panel rounded-xl p-6 hover:border-emerald-500/40 transition">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="heading-text font-bold text-sm">{{ o.name }}</p>
                  <p class="subtext text-xs mt-0.5">{{ o.transaction_date }}</p>
                </div>
                <span :class="orderStatusClass(o.workflow_state)" class="px-3 py-1 rounded-full text-xs font-bold border">
                  {{ orderStatusLabel(o.workflow_state) }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-4 text-center pt-3 divider-top">
                <div>
                  <p class="subtext text-xs">الإجمالي</p>
                  <p class="heading-text font-bold text-sm mt-0.5">{{ fmt(o.net_total || 0) }}</p>
                </div>
                <div>
                  <p class="subtext text-xs">الإجمالي مع الضريبة</p>
                  <p class="text-emerald-500 font-bold text-sm mt-0.5">{{ fmt(o.grand_total || 0) }}</p>
                </div>
                <div>
                  <p class="subtext text-xs">الحالة</p>
                  <p class="heading-text font-bold text-sm mt-0.5">{{ o.status || '—' }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- ── كشف الحساب ──                                          -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <div v-else-if="activeTab==='statement'" key="statement">
          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div class="card-panel rounded-xl p-5 text-center">
                <p class="subtext text-xs mb-1">إجمالي المدين</p>
                <p class="text-xl font-black text-red-500">{{ fmt(totalDebit) }}</p>
              </div>
              <div class="card-panel rounded-xl p-5 text-center">
                <p class="subtext text-xs mb-1">إجمالي الدائن</p>
                <p class="text-xl font-black text-emerald-500">{{ fmt(totalCredit) }}</p>
              </div>
              <div class="card-panel rounded-xl p-5 text-center">
                <p class="subtext text-xs mb-1">الرصيد</p>
                <p class="text-xl font-black" :class="netBalance > 0 ? 'text-red-500' : 'text-emerald-500'">
                  {{ fmt(Math.abs(netBalance)) }}
                  <span class="text-xs font-normal">({{ netBalance > 0 ? 'عليك' : 'لك' }})</span>
                </p>
              </div>
            </div>

            <div class="card-panel rounded-2xl overflow-hidden">
              <div class="px-6 py-4 border-b" style="border-color:var(--divider)">
                <h3 class="heading-text font-bold">كشف الحساب</h3>
              </div>

              <!-- لا توجد حركات -->
              <div v-if="!transactions.length" class="text-center py-16">
                <div class="text-5xl mb-3">📋</div>
                <p class="subtext text-sm">لا توجد حركات مالية مسجلة</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" style="border-color:var(--divider)">
                      <th class="px-5 py-3 text-right subtext font-semibold text-xs">التاريخ</th>
                      <th class="px-5 py-3 text-right subtext font-semibold text-xs">البيان</th>
                      <th class="px-5 py-3 text-right subtext font-semibold text-xs">مدين</th>
                      <th class="px-5 py-3 text-right subtext font-semibold text-xs">دائن</th>
                      <th class="px-5 py-3 text-right subtext font-semibold text-xs">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(t, i) in transactions" :key="i"
                        class="border-b hover:bg-emerald-500/5 transition" style="border-color:var(--divider)">
                      <td class="px-5 py-3 subtext text-xs whitespace-nowrap">{{ t.date }}</td>
                      <td class="px-5 py-3 heading-text text-xs whitespace-pre-line max-w-xs">{{ t.description }}</td>
                      <td class="px-5 py-3 text-red-500 font-bold text-xs">{{ t.debit ? fmt(t.debit) : '—' }}</td>
                      <td class="px-5 py-3 text-emerald-500 font-bold text-xs">{{ t.credit ? fmt(t.credit) : '—' }}</td>
                      <td class="px-5 py-3 font-bold text-xs" :class="t.balance <= 0 ? 'text-red-500' : 'text-emerald-500'">
                        {{ fmt(Math.abs(t.balance)) }}
                        <span class="opacity-60 text-[10px]">({{ t.balance <= 0 ? 'عليك' : 'لك' }})</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- ── نقاط الولاء ──                                         -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <div v-else-if="activeTab==='loyalty'" key="loyalty">
          <div class="space-y-6">
            <div class="relative overflow-hidden bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur border border-emerald-500/30 rounded-2xl p-8">
              <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div class="relative z-10">
                <p class="text-emerald-500 text-sm font-medium mb-2">رصيد نقاط الولاء</p>
                <div class="flex items-end gap-3 mb-4">
                  <span class="text-6xl font-black" :class="isDark ? 'text-white' : 'text-slate-800'">
                    {{ loyalty.points.toLocaleString('ar-SA') }}
                  </span>
                  <span class="text-emerald-500 font-bold mb-2">نقطة</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700"
                         :style="{ width: loyaltyProgress + '%' }"></div>
                  </div>
                  <span class="text-emerald-600 text-xs">{{ loyalty.points }} / {{ loyalty.nextTierAt }}</span>
                </div>
                <p class="subtext text-xs mt-2">
                  تحتاج {{ Math.max(0, loyalty.nextTierAt - loyalty.points) }} نقطة للوصول إلى {{ loyalty.nextTier }}
                </p>
              </div>
            </div>
            <div class="card-panel rounded-xl p-5 flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/30">
                {{ loyalty.tierIcon }}
              </div>
              <div>
                <p class="subtext text-sm">مستواك الحالي</p>
                <p class="heading-text font-black text-xl">{{ loyalty.tier }}</p>
              </div>
              <div class="mr-auto text-right">
                <p class="subtext text-xs">كل 100 ريال = 10 نقاط</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- ── الأمان ──                                              -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <div v-else-if="activeTab==='security'" key="security">
          <div class="card-panel rounded-2xl p-8 space-y-6">
            <h3 class="heading-text font-bold text-lg flex items-center gap-2"><span>🔐</span> تغيير كلمة المرور</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
              <div class="field-group md:col-span-2">
                <label class="field-label">كلمة المرور الحالية</label>
                <div class="relative">
                  <input v-model="pwForm.current" :type="showPw.current ? 'text' : 'password'" class="field-input pr-4 pl-10" placeholder="••••••••" dir="ltr"/>
                  <button @click="showPw.current = !showPw.current" class="absolute left-3 top-3 subtext hover:text-emerald-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">كلمة المرور الجديدة</label>
                <div class="relative">
                  <input v-model="pwForm.new" :type="showPw.new ? 'text' : 'password'" class="field-input pr-4 pl-10" placeholder="••••••••" dir="ltr"/>
                  <button @click="showPw.new = !showPw.new" class="absolute left-3 top-3 subtext hover:text-emerald-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
                <div v-if="pwForm.new" class="mt-2 space-y-1">
                  <div class="flex gap-1">
                    <div v-for="i in 4" :key="i"
                         :class="pwStrength >= i ? pwStrengthColor : 'strength-empty'"
                         class="h-1 flex-1 rounded-full transition-all duration-300"></div>
                  </div>
                  <p class="text-xs" :class="pwStrengthTextColor">{{ pwStrengthLabel }}</p>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">تأكيد كلمة المرور</label>
                <div class="relative">
                  <input v-model="pwForm.confirm"
                         :type="showPw.confirm ? 'text' : 'password'"
                         :class="pwForm.confirm && pwForm.confirm !== pwForm.new ? 'border-red-500/70' : ''"
                         class="field-input pr-4 pl-10" placeholder="••••••••" dir="ltr"/>
                  <button @click="showPw.confirm = !showPw.confirm" class="absolute left-3 top-3 subtext hover:text-emerald-500 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
                <p v-if="pwForm.confirm && pwForm.confirm !== pwForm.new" class="text-red-500 text-xs mt-1">
                  كلمتا المرور غير متطابقتين
                </p>
              </div>
            </div>
            <button @click="changePassword" :disabled="!canChangePw || savingPw"
                    class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="savingPw" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              {{ savingPw ? 'جارٍ التغيير…' : 'تغيير كلمة المرور' }}
            </button>

            <div class="mt-10 pt-8 divider-top">
              <h3 class="text-red-500 font-bold text-lg flex items-center gap-2 mb-3"><span>⚠️</span> منطقة الخطر</h3>
              <p class="subtext text-sm mb-4">حذف الحساب نهائياً — لا يمكن التراجع.</p>
              <button @click="showDeleteModal = true"
                      class="px-5 py-2.5 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500/10 transition font-medium text-sm">
                🗑️ حذف الحساب
              </button>
            </div>
          </div>
        </div>

      </Transition>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- Contact Modal — إضافة / تعديل كونتكت                            -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showContactModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showContactModal = false"></div>
        <div class="relative card-panel rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto">

          <h3 class="text-xl font-bold heading-text mb-5 flex items-center gap-2">
            <span class="text-emerald-400">👤</span>
            {{ editingContact ? 'تعديل جهة الاتصال' : 'إضافة جهة اتصال جديدة' }}
          </h3>

          <div class="space-y-4">

            <!-- الاسم -->
            <div class="grid grid-cols-2 gap-3">
              <div class="field-group">
                <label class="field-label">الاسم الأول *</label>
                <input v-model="contactForm.first_name" type="text" class="field-input" placeholder="محمد"/>
              </div>
              <div class="field-group">
                <label class="field-label">الاسم الأخير</label>
                <input v-model="contactForm.last_name" type="text" class="field-input" placeholder="أحمد"/>
              </div>
            </div>

            <!-- المسمى الوظيفي -->
            <div class="field-group">
              <label class="field-label">المسمى الوظيفي</label>
              <input v-model="contactForm.designation" type="text" class="field-input" placeholder="مدير، مسؤول..."/>
            </div>

            <!-- الإيميلات -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="field-label mb-0">📧 الإيميلات</label>
                <button @click="addEmailRow" class="text-[11px] text-emerald-400 hover:text-emerald-300">+ إضافة</button>
              </div>
              <div class="space-y-2">
                <div v-for="(e, i) in contactForm.email_ids" :key="i" class="flex items-center gap-2">
                  <input v-model="e.email_id" type="email" dir="ltr" class="field-input flex-1" placeholder="example@email.com"/>
                  <button @click="e.is_primary = e.is_primary ? 0 : 1"
                          :class="e.is_primary ? 'bg-emerald-500 text-white' : 'tab-inactive'"
                          class="px-2 py-1 rounded-lg text-[10px] font-medium transition border border-transparent flex-shrink-0">
                    رئيسي
                  </button>
                  <button @click="contactForm.email_ids.splice(i,1)" class="text-red-400 hover:text-red-300 text-xs flex-shrink-0">✕</button>
                </div>
              </div>
            </div>

            <!-- الأرقام -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="field-label mb-0">📱 الأرقام</label>
                <button @click="addPhoneRow" class="text-[11px] text-emerald-400 hover:text-emerald-300">+ إضافة</button>
              </div>
              <div class="space-y-2">
                <div v-for="(p, i) in contactForm.phone_nos" :key="i" class="flex items-center gap-2">
                  <input v-model="p.phone" type="tel" dir="ltr" class="field-input flex-1" placeholder="01xxxxxxxxx"/>
                  <button @click="p.is_primary_mobile_no = p.is_primary_mobile_no ? 0 : 1"
                          :class="p.is_primary_mobile_no ? 'bg-blue-500 text-white' : 'tab-inactive'"
                          class="px-2 py-1 rounded-lg text-[10px] font-medium transition border border-transparent flex-shrink-0">
                    موبايل
                  </button>
                  <button @click="contactForm.phone_nos.splice(i,1)" class="text-red-400 hover:text-red-300 text-xs flex-shrink-0">✕</button>
                </div>
              </div>
            </div>

            <!-- ربط عنوان -->
            <div class="pt-3 divider-top">
              <label class="field-label">📍 العنوان المرتبط</label>
              <div v-if="contactForm.linked_address" class="p-3 rounded-xl mb-2"
                   style="background:var(--input-bg);border:1px solid var(--input-border)">
                <p class="heading-text text-xs font-bold">{{ contactForm.linked_address.address_title }}</p>
                <p class="subtext text-xs">{{ contactForm.linked_address.condensed }}</p>
              </div>
              <button @click="pickAddressForContact"
                      class="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
                {{ contactForm.linked_address ? '🔄 تغيير العنوان' : '🔗 ربط بعنوان' }}
              </button>
            </div>

            <!-- أساسي -->
            <div class="flex items-center gap-3 pt-2">
              <button @click="contactForm.is_primary_contact = contactForm.is_primary_contact ? 0 : 1"
                      :class="contactForm.is_primary_contact ? 'bg-emerald-500 text-white' : 'tab-inactive'"
                      class="px-4 py-2 rounded-full text-sm font-medium transition border border-transparent">
                ⭐ جهة اتصال أساسية
              </button>
            </div>

          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-6">
            <button @click="showContactModal = false" class="btn-cancel flex-1 py-3 rounded-xl text-sm font-medium transition">إلغاء</button>
            <button @click="saveContact" :disabled="isSavingContact"
                    class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition font-bold text-sm disabled:opacity-50">
              <span v-if="isSavingContact" class="flex items-center justify-center gap-2">
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                جارٍ الحفظ…
              </span>
              <span v-else>{{ editingContact ? 'حفظ التعديلات' : 'إضافة الكونتكت' }}</span>
            </button>
          </div>

          <button @click="showContactModal = false" class="absolute top-4 left-4 subtext hover:text-emerald-500 transition text-xl">✕</button>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- Address Modal — نفس أسلوب Cart                                   -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showAddressModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showAddressModal = false"></div>

        <!-- Modal Card -->
        <div class="relative card-panel rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10">

          <!-- Title -->
          <h3 class="text-xl font-bold heading-text mb-6 flex items-center gap-2">
            <span class="text-emerald-400">📍</span>
            {{ isAddingNewAddress
                ? 'إضافة عنوان جديد'
                : addressModalMode === 'primary' ? 'اختر العنوان الرئيسي' : 'اختر عنوان الشحن' }}
          </h3>

          <!-- ═══ قائمة العناوين ═══ -->
          <div v-if="!isAddingNewAddress">

            <!-- Loading -->
            <div v-if="isLoadingAddresses" class="flex justify-center py-8">
              <div class="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>

            <!-- Empty -->
            <div v-else-if="customerAddresses.length === 0" class="text-center py-8">
              <p class="subtext mb-4 text-sm">لا توجد عناوين محفوظة</p>
            </div>

            <!-- Address List -->
            <div v-else class="space-y-3 mb-4 max-h-72 overflow-y-auto">
              <div v-for="addr in (addressModalMode === 'shipping' ? shippingAddressesList : customerAddresses)"
                   :key="addr.name"
                   @click="selectAddressInModal(addr)"
                   class="p-4 rounded-xl cursor-pointer transition-all duration-200 border group"
                   :class="selectedAddressInModal?.name === addr.name
                     ? 'border-emerald-500 bg-emerald-500/10'
                     : 'border-transparent card-panel hover:border-emerald-500/40'">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="heading-text font-bold text-sm group-hover:text-emerald-400 transition">
                      {{ addr.address_title }}
                    </p>
                    <div class="flex gap-1 mt-1 flex-wrap">
                      <span v-if="addr.is_primary_address"
                            class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">أساسي</span>
                      <span v-if="addr.is_shipping_address"
                            class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">شحن</span>
                    </div>
                    <p class="subtext text-xs mt-1">{{ addr.address_line1 }}</p>
                    <p class="subtext text-xs" v-if="addr.address_line2">{{ addr.address_line2 }}</p>
                    <p class="subtext text-xs">
                      {{ addr.city }}{{ addr.state ? '، ' + addr.state : '' }}{{ addr.country ? '، ' + addr.country : '' }}
                    </p>
                  </div>
                  <div v-if="selectedAddressInModal?.name === addr.name" class="text-emerald-400 text-xl mr-2">✓</div>
                </div>
              </div>
            </div>

            <!-- Add New Button -->
            <button @click="isAddingNewAddress = true"
                    class="w-full py-3 rounded-xl border-2 border-dashed transition font-medium text-sm"
                    style="border-color:var(--card-border);color:var(--subtext)"
                    onmouseenter="this.style.borderColor='#10b981';this.style.color='#10b981'"
                    onmouseleave="this.style.borderColor='';this.style.color=''">
              + إضافة عنوان جديد
            </button>

            <!-- Confirm -->
            <button v-if="selectedAddressInModal" @click="confirmAddressModal"
                    class="w-full mt-3 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold">
              تأكيد العنوان
            </button>
          </div>

          <!-- ═══ إضافة عنوان جديد ═══ -->
          <div v-else class="space-y-3">
            <div class="field-group">
              <label class="field-label">اسم العنوان *</label>
              <input v-model="newAddress.title" type="text" class="field-input" placeholder="مثال: المنزل، العمل..."/>
            </div>
            <div class="field-group">
              <label class="field-label">العنوان الأول *</label>
              <input v-model="newAddress.line1" type="text" class="field-input" placeholder="الشارع، رقم العمارة..."/>
            </div>
            <div class="field-group">
              <label class="field-label">العنوان الثاني</label>
              <input v-model="newAddress.line2" type="text" class="field-input" placeholder="الدور، الشقة..."/>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="field-group">
                <label class="field-label">المدينة *</label>
                <input v-model="newAddress.city" type="text" class="field-input" placeholder="القاهرة"/>
              </div>
              <div class="field-group">
                <label class="field-label">المحافظة</label>
                <input v-model="newAddress.state" type="text" class="field-input" placeholder="الجيزة"/>
              </div>
              <div class="field-group">
                <label class="field-label">الدولة</label>
                <input v-model="newAddress.country" type="text" class="field-input" placeholder="مصر"/>
              </div>
              <div class="field-group">
                <label class="field-label">الرمز البريدي</label>
                <input v-model="newAddress.pincode" type="text" class="field-input" dir="ltr" placeholder="11511"/>
              </div>
            </div>

            <!-- نوع العنوان -->
            <div class="pt-3 divider-top">
              <label class="field-label mb-3 block">نوع العنوان</label>
              <div class="flex gap-3">
                <button @click="newAddress.is_primary_address = newAddress.is_primary_address ? 0 : 1"
                        :class="newAddress.is_primary_address
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'tab-inactive border border-transparent hover:border-emerald-500/40'"
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                  أساسي
                </button>
                <button @click="newAddress.is_shipping_address = newAddress.is_shipping_address ? 0 : 1"
                        :class="newAddress.is_shipping_address
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : 'tab-inactive border border-transparent hover:border-blue-500/40'"
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200">
                  شحن
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button @click="isAddingNewAddress = false"
                      class="btn-cancel flex-1 py-3 rounded-xl transition font-medium text-sm">
                رجوع
              </button>
              <button @click="saveNewAddress" :disabled="isSavingAddress"
                      class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition font-bold disabled:opacity-50 text-sm">
                <span v-if="isSavingAddress" class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جارٍ الحفظ…
                </span>
                <span v-else>حفظ العنوان</span>
              </button>
            </div>
          </div>

          <!-- Close -->
          <button @click="showAddressModal = false; isAddingNewAddress = false"
                  class="absolute top-4 left-4 subtext hover:text-emerald-500 transition text-xl">✕</button>
        </div>
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="modal-panel rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-red-500/30">
          <div class="text-center mb-6">
            <div class="text-5xl mb-4">⚠️</div>
            <h2 class="heading-text text-xl font-bold mb-2">هل أنت متأكد؟</h2>
            <p class="subtext text-sm">سيتم حذف حسابك نهائياً ولا يمكن استعادته.</p>
          </div>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-cancel flex-1 px-4 py-3 rounded-xl transition font-medium">إلغاء</button>
            <button @click="deleteAccount" class="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold">نعم، احذف</button>
          </div>
        </div>
      </div>
    </Transition>

    <footer class="relative z-20 footer-bg footer-border border-t mt-20">
      <div class="max-w-7xl mx-auto px-4 py-8 text-center subtext text-sm">All rights reserved © 2024 Hypermarket</div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from '@/pages/website/components/navbar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { getCustomerProfileApi, updateCustomerProfileApi, getCustomerOrders,
         getCustomerAddressesApi, createAddressApi,
         createContactApi, updateContactApi, deleteContactApi,
         linkAddressToContactApi } from '@/services/api'

const router        = useRouter()
const settingsStore = useSettingsStore()

// ─── Theme ────────────────────────────────────────────────────────────────────
const settings    = computed(() => settingsStore.settings)
const isDark      = computed(() => settings.value?.appearance?.theme === 'dark')
const toggleTheme = () =>
  settingsStore.updateSettings({
    appearance: { ...settings.value.appearance, theme: isDark.value ? 'light' : 'dark' }
  })

// ─── State ────────────────────────────────────────────────────────────────────
const pageLoading     = ref(true)
const pageError       = ref(null)
const activeTab       = ref('profile')
const isEditing       = ref(false)
const saving          = ref(false)
const savingPw        = ref(false)
const showDeleteModal = ref(false)
const orderFilter     = ref('all')
const deliveryAddress = ref('')
const isLoading       = ref(false)

// Toast
const toast = ref({ show: false, text: '', type: 'success' })
const showToast = (text, type = 'success') => {
  toast.value = { show: true, text, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ─── Raw API data ─────────────────────────────────────────────────────────────
const rawCustomer        = ref({})
const hasCustomer        = ref(false)
const websiteCustomer    = ref('Guest')
const allOrders          = ref([])
const profileContacts    = ref([])   // الكونتكتات من get_party_profile
const customerAddresses  = ref([])    // كل عناوين العميل من API
const isLoadingAddresses = ref(false)

// ─── Address Modal State ───────────────────────────────────────────────────────
const showAddressModal      = ref(false)
const isAddingNewAddress    = ref(false)
const isSavingAddress       = ref(false)
const addressModalMode      = ref('primary')   // 'primary' | 'shipping' | 'contact'
const selectedAddressInModal = ref(null)
const addressModalForContact = ref(null)       // الكونتكت اللي بنختار عنوانه
const newAddress = ref({
  title: '', line1: '', line2: '',
  city: '', state: '', country: '', pincode: '',
  is_primary_address: 0, is_shipping_address: 0,
})

// ─── Contact Modal State ───────────────────────────────────────────────────────
const showContactModal  = ref(false)
const isSavingContact   = ref(false)
const editingContact    = ref(null)   // null = add, object = edit
const contactForm = ref({
  first_name          : '',
  last_name           : '',
  designation         : '',
  is_primary_contact  : 0,
  email_ids           : [],   // [{ email_id, is_primary }]
  phone_nos           : [],   // [{ phone, is_primary_mobile_no }]
  linked_address      : null, // address dict | null
  linked_address_name : '',   // frappe name of Address
})

// ─── Form ─────────────────────────────────────────────────────────────────────
const form = ref({
  fullName : '',
  phone    : '',
  email    : '',
  city     : '',

  // ── العنوان الرئيسي ──────────────────────────────
  address        : '',   // address_line1
  addressLine2   : '',   // address_line2
  addressCity    : '',   // city
  addressState   : '',   // state
  addressCountry : '',   // country
  addressPincode : '',   // pincode

  // ── عنوان الشحن ──────────────────────────────────
  shippingAddress  : '',   // address_line1
  shippingLine2    : '',   // address_line2
  shippingCity     : '',   // city
  shippingState    : '',   // state
  shippingCountry  : '',   // country
  shippingPincode  : '',   // pincode
})
let snap = {}

// ─── Password ─────────────────────────────────────────────────────────────────
const pwForm = ref({ current: '', new: '', confirm: '' })
const showPw  = ref({ current: false, new: false, confirm: false })

// ─── Loyalty ──────────────────────────────────────────────────────────────────
const loyalty = ref({
  points    : 0,
  tier      : 'برونزي',
  tierIcon  : '🥉',
  nextTier  : 'فضي',
  nextTierAt: 1000
})

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const ALL_TABS = [
  { key: 'profile',   label: 'بياناتي',     icon: '👤', needCustomer: false },
  { key: 'orders',    label: 'طلباتي',      icon: '📦', needCustomer: true  },
  { key: 'statement', label: 'كشف الحساب',  icon: '📊', needCustomer: true  },
  { key: 'loyalty',   label: 'نقاط الولاء', icon: '⭐', needCustomer: false },
  { key: 'security',  label: 'الأمان',       icon: '🔐', needCustomer: false },
]
const visibleTabs = computed(() =>
  ALL_TABS.filter(t => !t.needCustomer || hasCustomer.value)
)

// ─── Orders ───────────────────────────────────────────────────────────────────
const orderFilters = [
  { key: 'all',       label: 'الكل'       },
  { key: 'جزئي',      label: 'جزئي'       },
  { key: 'مكتمل',     label: 'مكتمل'      },
  { key: 'قيد التنفيذ', label: 'قيد التنفيذ' },
]

const loadOrders = async () => {
  if (!websiteCustomer.value || websiteCustomer.value === 'Guest') return
  isLoading.value = true
  try {
    const response = await getCustomerOrders(websiteCustomer.value)
    allOrders.value = Array.isArray(response) ? response : []
    console.log('Orders loaded:', allOrders.value)
  } catch (error) {
    console.error('Error loading orders:', error)
    allOrders.value = []
  } finally {
    isLoading.value = false
  }
}

// ─── Addresses ────────────────────────────────────────────────────────────────
const loadCustomerAddresses = async () => {
  if (!websiteCustomer.value || websiteCustomer.value === 'Guest') return
  isLoadingAddresses.value = true
  try {
    const addresses = await getCustomerAddressesApi(websiteCustomer.value)
    customerAddresses.value = Array.isArray(addresses) ? addresses : []
    console.log('Addresses loaded:', customerAddresses.value)

    // primary = is_primary_address ، fallback أول عنوان
    // shipping = is_shipping_address ، fallback primary
    const primary  = customerAddresses.value.find(a => a.is_primary_address)  || customerAddresses.value[0] || null
    const shipping = customerAddresses.value.find(a => a.is_shipping_address) || primary || null

    if (primary) {
      form.value.address        = primary.address_line1 || ''
      form.value.addressLine2   = primary.address_line2 || ''
      form.value.addressCity    = primary.city          || ''
      form.value.addressState   = primary.state         || ''
      form.value.addressCountry = primary.country       || ''
      form.value.addressPincode = primary.pincode       || ''
    }

    if (shipping) {
      form.value.shippingAddress  = shipping.address_line1 || ''
      form.value.shippingLine2    = shipping.address_line2 || ''
      form.value.shippingCity     = shipping.city          || ''
      form.value.shippingState    = shipping.state         || ''
      form.value.shippingCountry  = shipping.country       || ''
      form.value.shippingPincode  = shipping.pincode       || ''
    }

    deliveryAddress.value = form.value.address || form.value.addressCity || form.value.city || ''

  } catch (error) {
    console.error('Error loading addresses:', error)
    customerAddresses.value = []
  } finally {
    isLoadingAddresses.value = false
  }
}

// ─── Address Modal Functions ──────────────────────────────────────────────────
const openAddressModal = async (mode = 'primary') => {
  addressModalMode.value    = mode
  isAddingNewAddress.value  = false
  selectedAddressInModal.value = mode === 'primary' ? primaryAddress.value : shippingAddress.value
  showAddressModal.value    = true
  // جيب العناوين من API لو ما اتحملتش بعد
  if (customerAddresses.value.length === 0) {
    await loadCustomerAddresses()
  }
}

const selectAddressInModal = (addr) => {
  selectedAddressInModal.value = addr
}

const confirmAddressModal = async() => {
  const addr = selectedAddressInModal.value
  if (!addr) return

  if (addressModalMode.value === 'contact') {
    if (!addressModalForContact.value) {
      // داخل contactForm — بس update locally، الـ save بيتم عند saveContact
      contactForm.value.linked_address      = addr
      contactForm.value.linked_address_name = addr.name
      showAddressModal.value = false
      showToast('تم ربط العنوان ✓')
    } else {
      // كونتكت موجود — كال API مباشرة
      try {
        const res = await linkAddressToContactApi(addressModalForContact.value.name, addr.name)
        const c = profileContacts.value.find(c => c.name === addressModalForContact.value.name)
        if (c) {
          c.linked_address = res?.linked_address || addr
          c.address        = addr.name
        }
        showToast('تم ربط العنوان ✓')
      } catch {
        showToast('فشل ربط العنوان', 'error')
      }
      addressModalForContact.value = null
      showAddressModal.value = false
    }
    return
  }

  if (addressModalMode.value === 'primary') {
    customerAddresses.value.forEach(a => { a.is_primary_address = a.name === addr.name ? 1 : 0 })
    form.value.address        = addr.address_line1 || ''
    form.value.addressLine2   = addr.address_line2 || ''
    form.value.addressCity    = addr.city          || ''
    form.value.addressState   = addr.state         || ''
    form.value.addressCountry = addr.country       || ''
    form.value.addressPincode = addr.pincode       || ''
  } else {
    form.value.shippingAddress  = addr.address_line1 || ''
    form.value.shippingLine2    = addr.address_line2 || ''
    form.value.shippingCity     = addr.city          || ''
    form.value.shippingState    = addr.state         || ''
    form.value.shippingCountry  = addr.country       || ''
    form.value.shippingPincode  = addr.pincode       || ''
    customerAddresses.value.forEach(a => { a.is_shipping_address = a.name === addr.name ? 1 : 0 })
  }

  deliveryAddress.value = form.value.address || form.value.addressCity || form.value.city || ''
  showAddressModal.value = false
  showToast('تم تحديد العنوان ✓')
}

const saveNewAddress = async () => {
  if (!newAddress.value.title || !newAddress.value.line1 || !newAddress.value.city) {
    showToast('يرجى تعبئة الحقول المطلوبة', 'error')
    return
  }
  isSavingAddress.value = true
  try {
    const saved = await createAddressApi({
      customer            : websiteCustomer.value,
      title               : newAddress.value.title,
      line1               : newAddress.value.line1,
      line2               : newAddress.value.line2,
      city                : newAddress.value.city,
      state               : newAddress.value.state,
      country             : newAddress.value.country,
      pincode             : newAddress.value.pincode,
      is_primary_address  : newAddress.value.is_primary_address,
      is_shipping_address : newAddress.value.is_shipping_address,
    })
    if (saved) {
      customerAddresses.value.push(saved)
      selectedAddressInModal.value = saved
      isAddingNewAddress.value = false
      showToast('تم حفظ العنوان بنجاح ✓')
      newAddress.value = { title:'', line1:'', line2:'', city:'', state:'', country:'', pincode:'', is_primary_address:0, is_shipping_address:0 }
    }
  } catch {
    showToast('حدث خطأ أثناء حفظ العنوان', 'error')
  } finally {
    isSavingAddress.value = false
  }
}

// ─── Contact CRUD ─────────────────────────────────────────────────────────────
const openContactModal = (contact) => {
  editingContact.value = contact
  if (contact) {
    contactForm.value = {
      first_name          : contact.first_name         || '',
      last_name           : contact.last_name          || '',
      designation         : contact.designation        || '',
      is_primary_contact  : contact.is_primary_contact || 0,
      email_ids           : (contact.email_ids || []).map(e => ({ ...e })),
      phone_nos           : (contact.phone_nos || []).map(p => ({ ...p })),
      linked_address      : contact.linked_address     || null,
      linked_address_name : contact.address            || '',
    }
  } else {
    contactForm.value = {
      first_name:'', last_name:'', designation:'',
      is_primary_contact: 0,
      email_ids: [], phone_nos: [],
      linked_address: null, linked_address_name: '',
    }
  }
  showContactModal.value = true
}

const addEmailRow = () => {
  contactForm.value.email_ids.push({ email_id: '', is_primary: 0 })
}
const addPhoneRow = () => {
  contactForm.value.phone_nos.push({ phone: '', is_primary_mobile_no: 0, is_primary_phone: 0 })
}

const saveContact = async () => {
  if (!contactForm.value.first_name.trim()) {
    showToast('الاسم الأول مطلوب', 'error')
    return
  }
  isSavingContact.value = true
  try {
    const payload = {
      first_name   : contactForm.value.first_name,
      last_name    : contactForm.value.last_name,
      designation  : contactForm.value.designation,
      is_primary   : contactForm.value.is_primary_contact,
      email_ids    : contactForm.value.email_ids.filter(e => e.email_id),
      phone_nos    : contactForm.value.phone_nos.filter(p => p.phone),
      address_name : contactForm.value.linked_address_name || '',
    }

    if (editingContact.value) {
      // ── تعديل ──
      const updated = await updateContactApi(editingContact.value.name, payload)
      if (updated) {
        const idx = profileContacts.value.findIndex(c => c.name === editingContact.value.name)
        if (idx !== -1) profileContacts.value[idx] = updated
      }
    } else {
      // ── إضافة ──
      const created = await createContactApi({ customer: websiteCustomer.value, ...payload })
      if (created) profileContacts.value.push(created)
    }

    showContactModal.value = false
    showToast(editingContact.value ? 'تم تحديث الكونتكت ✓' : 'تم إضافة الكونتكت ✓')
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error')
  } finally {
    isSavingContact.value = false
  }
}

const deleteContact = async (contact) => {
  if (!confirm(`هل تريد حذف "${contact.first_name}"؟`)) return
  try {
    await deleteContactApi(contact.name)
    profileContacts.value = profileContacts.value.filter(c => c.name !== contact.name)
    showToast('تم حذف الكونتكت ✓')
  } catch {
    showToast('فشل الحذف', 'error')
  }
}

// فتح address modal لاختيار عنوان للكونتكت الحالي في الـ form
const pickAddressForContact = async () => {
  addressModalMode.value    = 'contact'
  isAddingNewAddress.value  = false
  selectedAddressInModal.value = contactForm.value.linked_address
  showAddressModal.value    = true
  if (customerAddresses.value.length === 0) await loadCustomerAddresses()
}

// فتح address modal لتغيير عنوان كونتكت موجود (من قائمة الكونتكتات)
const linkAddressToContact = async (contact) => {
  addressModalForContact.value  = contact
  addressModalMode.value        = 'contact'
  isAddingNewAddress.value      = false
  selectedAddressInModal.value  = contact.linked_address
  showAddressModal.value        = true
  if (customerAddresses.value.length === 0) await loadCustomerAddresses()
}
// أولوية: customerAddresses array (بعد loadCustomerAddresses)
// fallback: primary_address / shipping_addresses من rawCustomer مباشرة
const primaryAddress = computed(() =>
  customerAddresses.value.find(a => a.is_primary_address)
  || customerAddresses.value[0]
  || rawCustomer.value?.primary_address
  || null
)

// كل عناوين الشحن — للاختيار في الكارت والـ modal
const shippingAddressesList = computed(() => {
  const fromArray = customerAddresses.value.filter(a => a.is_shipping_address)
  if (fromArray.length) return fromArray
  const fromProfile = rawCustomer.value?.shipping_addresses
  if (Array.isArray(fromProfile) && fromProfile.length) return fromProfile
  return primaryAddress.value ? [primaryAddress.value] : []
})

// عنوان الشحن المختار حالياً (أول واحد كـ default)
const shippingAddress = computed(() =>
  customerAddresses.value.find(a => a.is_shipping_address)
  || rawCustomer.value?.shipping_addresses?.[0]
  || primaryAddress.value
  || null
)

// الكونتكتات — من profileContacts أو من rawCustomer
const contacts = computed(() =>
  profileContacts.value.length
    ? profileContacts.value
    : rawCustomer.value?.contacts || []
)

const filteredOrders = computed(() =>
  orderFilter.value === 'all'
    ? allOrders.value
    : allOrders.value.filter(o => o.workflow_state === orderFilter.value)
)

const orderCount = (key) =>
  key === 'all'
    ? allOrders.value.length
    : allOrders.value.filter(o => o.workflow_state === key).length

// ─── Transactions ─────────────────────────────────────────────────────────────
const transactions = computed(() => rawCustomer.value?.transactions || [])
const totalDebit   = computed(() => transactions.value.reduce((s, t) => s + (t.debit || 0), 0))
const totalCredit  = computed(() => transactions.value.reduce((s, t) => s + (t.credit || 0), 0))
const netBalance   = computed(() => totalDebit.value - totalCredit.value)

// ─── عنوان الشحن نفس الرئيسي؟ ────────────────────────────────────────────────
const shippingSameAsPrimary = computed(() => {
  if (!primaryAddress.value || !shippingAddress.value) return false
  return primaryAddress.value.name === shippingAddress.value.name
})

// ─── Misc computed ────────────────────────────────────────────────────────────
const userInitials = computed(() => {
  const parts = (form.value.fullName || '').trim().split(' ').filter(Boolean)
  if (!parts.length) return '؟'
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
})

const loyaltyProgress = computed(() =>
  loyalty.value.nextTierAt > 0
    ? Math.min((loyalty.value.points / loyalty.value.nextTierAt) * 100, 100)
    : 0
)

// ─── Password strength ────────────────────────────────────────────────────────
const pwStrength = computed(() => {
  const p = pwForm.value.new
  if (!p) return 0
  let s = 0
  if (p.length >= 8)          s++
  if (/[A-Z]/.test(p))        s++
  if (/[0-9]/.test(p))        s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const pwStrengthLabel     = computed(() => ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية جداً'][pwStrength.value] || '')
const pwStrengthColor     = computed(() => ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'][pwStrength.value] || '')
const pwStrengthTextColor = computed(() => ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-emerald-500'][pwStrength.value] || '')
const canChangePw = computed(() =>
  pwForm.value.current &&
  pwForm.value.new &&
  pwForm.value.confirm === pwForm.value.new &&
  pwStrength.value >= 2
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v || 0)

// ─────────────────────────────────────────────────────────────────────────────
// orderStatusClass & orderStatusLabel:
// يدعم workflow_state القادم من Sales Order (عربي أو إنجليزي)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  // قيم إنجليزية شائعة
  'Completed'      : { cls: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40', label: 'مكتمل'       },
  'To Deliver and Bill': { cls: 'bg-blue-500/20 text-blue-500 border-blue-500/40',    label: 'قيد التنفيذ'  },
  'To Bill'        : { cls: 'bg-blue-500/20 text-blue-500 border-blue-500/40',         label: 'بانتظار الفاتورة' },
  'To Deliver'     : { cls: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40',  label: 'قيد التوصيل'  },
  'Cancelled'      : { cls: 'bg-red-500/20 text-red-500 border-red-500/40',           label: 'ملغي'          },
  'Draft'          : { cls: 'bg-gray-500/20 text-gray-500 border-gray-500/40',        label: 'مسودة'         },
  'On Hold'        : { cls: 'bg-orange-500/20 text-orange-500 border-orange-500/40',  label: 'معلق'          },
  // قيم عربية (workflow_state مخصص)
  'مكتمل'          : { cls: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40', label: 'مكتمل'      },
  'جزئي'           : { cls: 'bg-blue-500/20 text-blue-500 border-blue-500/40',          label: 'جزئي'       },
  'قيد التنفيذ'    : { cls: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40',   label: 'قيد التنفيذ' },
  'ملغي'           : { cls: 'bg-red-500/20 text-red-500 border-red-500/40',            label: 'ملغي'        },
  // legacy (من النسخة القديمة)
  'paid'           : { cls: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40', label: 'مدفوع'      },
  'partial'        : { cls: 'bg-blue-500/20 text-blue-500 border-blue-500/40',          label: 'جزئي'       },
  'pending'        : { cls: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/40',   label: 'قيد الانتظار'},
  'cancelled'      : { cls: 'bg-red-500/20 text-red-500 border-red-500/40',            label: 'ملغي'        },
}

const orderStatusClass = (s) =>
  (STATUS_MAP[s]?.cls) || 'bg-gray-500/20 text-gray-500 border-gray-500/40'

const orderStatusLabel = (s) =>
  (STATUS_MAP[s]?.label) || s || '—'

// ─── Edit ─────────────────────────────────────────────────────────────────────
const startEditing = () => {
  snap = { ...form.value }
  isEditing.value = true
}
const cancelEditing = () => {
  form.value = { ...snap }
  isEditing.value = false
}

const saveProfile = async () => {
  try {
    saving.value = true
    await updateCustomerProfileApi({
      full_name: form.value.fullName,
      email    : form.value.email,
    })
    isEditing.value = false
    showToast('تم حفظ التغييرات بنجاح ✓')
  } catch (e) {
    showToast(e?.message || 'فشل الحفظ، حاول مرة أخرى', 'error')
  } finally {
    saving.value = false
  }
}

// ─── Password ─────────────────────────────────────────────────────────────────
const changePassword = async () => {
  try {
    savingPw.value = true
    // TODO: await changePasswordApi({ old_password: pwForm.value.current, new_password: pwForm.value.new })
    await new Promise(r => setTimeout(r, 800))
    pwForm.value = { current: '', new: '', confirm: '' }
    showToast('تم تغيير كلمة المرور بنجاح ✓')
  } catch (e) {
    showToast('فشل تغيير كلمة المرور', 'error')
  } finally {
    savingPw.value = false
  }
}

const deleteAccount = async () => {
  showDeleteModal.value = false
  showToast('تم حذف الحساب', 'error')
  setTimeout(() => router.push({ name: 'Supermarket' }), 1500)
}

const openMapModal = () => {}

// ─── LOAD ─────────────────────────────────────────────────────────────────────
const loadAll = async () => {
  try {
    pageLoading.value = true
    pageError.value   = null

    const profile = await getCustomerProfileApi()
    console.log('Profile:', profile)

    if (profile?.party_name) {
      websiteCustomer.value = profile.party_name
      hasCustomer.value     = true
      rawCustomer.value     = profile

      const basic    = profile.basic_data || {}
      const contacts = Array.isArray(profile.contacts) ? profile.contacts : []

      // ── الكونتكتات ────────────────────────────────────────────────────────
      profileContacts.value = contacts

      // ── العناوين — مباشرة من الـ response ────────────────────────────────
      const primaryAddr   = profile.primary_address    || {}
      const shippingList  = profile.shipping_addresses || []

      // ── إذا رجع all_addresses — احفظها في customerAddresses ───────────────
      if (Array.isArray(profile.addresses) && profile.addresses.length) {
        customerAddresses.value = profile.addresses
      }

      // جهة الاتصال الأساسية للـ form (الأول في القائمة)
      const primaryContact = contacts.find(c => c.is_primary_contact) || contacts[0] || {}

      form.value = {
        fullName : basic.customer_name                                                    || '',
        phone    : primaryContact.mobile_no || basic.mobile_no || basic.custom_first_mobile || '',
        email    : primaryContact.email_id  || basic.email_id  || '',
        city     : basic.custom_city        || primaryAddr.city || '',

        // ── العنوان الرئيسي ───────────────────────────────────────────────
        address        : primaryAddr.address_line1 || '',
        addressLine2   : primaryAddr.address_line2 || '',
        addressCity    : primaryAddr.city          || '',
        addressState   : primaryAddr.state         || '',
        addressCountry : primaryAddr.country       || '',
        addressPincode : primaryAddr.pincode       || '',

        // ── عنوان الشحن (أول عنوان شحن في القائمة كـ default) ────────────
        shippingAddress  : shippingList[0]?.address_line1 || '',
        shippingLine2    : shippingList[0]?.address_line2 || '',
        shippingCity     : shippingList[0]?.city          || '',
        shippingState    : shippingList[0]?.state         || '',
        shippingCountry  : shippingList[0]?.country       || '',
        shippingPincode  : shippingList[0]?.pincode       || '',
      }

      if (profile.loyalty_points != null)
        loyalty.value.points = profile.loyalty_points

    } else {
      // مفيش Customer — جيب User مباشرة
      hasCustomer.value     = false
      rawCustomer.value     = {}
      websiteCustomer.value = 'Guest'

      try {
        const r1 = await fetch('/api/method/retail.retail.api.auth.get_logged_user')
        const d1 = await r1.json()
        const u  = d1?.message
        if (u) {
          const r2 = await fetch(`/api/resource/User/${u}`)
          const d2 = await r2.json()
          const ud = d2?.data || {}
          form.value = {
            fullName       : ud.full_name || ud.first_name || '',
            phone          : ud.mobile_no || '',
            email          : ud.email     || '',
            city           : '',
            address        : '', addressLine2   : '',
            addressCity    : '', addressState   : '', addressCountry: '', addressPincode: '',
            shippingAddress: '', shippingLine2  : '',
            shippingCity   : '', shippingState  : '', shippingCountry: '', shippingPincode: '',
          }
        }
      } catch { /* silent */ }
    }

    deliveryAddress.value = form.value.address || form.value.addressCity || form.value.city || ''

  } catch (err) {
    console.error('[AccountPage]', err)
    pageError.value = err?.message || 'حدث خطأ غير متوقع'
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  await loadAll()
  await loadOrders()
})
</script>

<style scoped>
.heading-text { color: var(--heading); transition: color .4s }
.subtext { color: var(--subtext); transition: color .4s }
.breadcrumb-text { color: var(--subtext); transition: color .4s }
.card-panel { background: var(--card-bg); border: 1px solid var(--card-border); backdrop-filter: blur(12px); transition: background .4s, border-color .4s }
.modal-panel { background: var(--modal-bg); transition: background .4s }
.tab-bar { background: var(--tab-bar); border: 1px solid var(--tab-bar-border); backdrop-filter: blur(8px); transition: background .4s, border-color .4s }
.tab-inactive { color: var(--tab-inactive); transition: color .2s }
.field-group { display: flex; flex-direction: column; gap: 6px }
.field-label { font-size: .78rem; font-weight: 600; color: var(--subtext); letter-spacing: .03em; transition: color .4s }
.field-input { width: 100%; padding: 10px 14px; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 10px; color: var(--input-color); font-size: .9rem; outline: none; transition: border-color .25s, box-shadow .25s, background .4s, color .4s }
.field-input::placeholder { color: var(--subtext); opacity: .7 }
.field-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.18) }
.field-input:disabled { background: var(--input-disabled); opacity: .65; cursor: not-allowed }
.btn-cancel { border: 1px solid var(--cancel-border); color: var(--cancel-color); transition: background .2s, color .2s, border-color .2s }
.btn-cancel:hover { background: var(--cancel-hover) }
.divider-top { border-top: 1px solid var(--divider); transition: border-color .4s }
.divider-bottom { border-bottom: 1px solid var(--divider); transition: border-color .4s }
.strength-empty { background: var(--strength-empty) }
.footer-bg { background: var(--footer-bg); transition: background .4s }
.footer-border { border-color: var(--footer-border); transition: border-color .4s }
.theme-toggle { cursor: pointer }
.theme-toggle .track { background: var(--track-bg); border: 1px solid var(--track-border); transition: background .5s, border-color .5s }
.theme-toggle .thumb { background: var(--thumb-bg); transition: transform .5s cubic-bezier(.34,1.56,.64,1), background .5s }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s ease }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(30px); opacity: 0 }
.slide-down-enter-active, .slide-down-leave-active { transition: all .35s ease }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-12px); opacity: 0 }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
::-webkit-scrollbar { width: 6px }
::-webkit-scrollbar-track { background: rgba(15,23,42,.5) }
::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px }
</style>
