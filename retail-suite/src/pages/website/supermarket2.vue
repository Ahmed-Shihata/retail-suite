<!-- Supermarket.vue -->
<template>
  <div
    :class="isDark ? 'theme-dark' : 'theme-light'"
    class="page-wrapper min-h-screen transition-colors duration-500"
  >

    <!-- ════════════════════════════════════════════════════════
         Navbar (unchanged)
    ════════════════════════════════════════════════════════ -->
    <Navbar
      :selected-category="selectedCategory"
      :delivery-address="deliveryAddress"
      :categories="categories"
      @category-changed="handleCategoryChange"
      @location-changed="handleLocationChange"
      @product-selected="handleProductSelected"
      @show-map-modal="openMapModal"
    />

    <!-- ════════════════════════════════════════════════════════
         Floating Background Blobs (unchanged)
    ════════════════════════════════════════════════════════ -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="blob blob-1 absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse"></div>
      <div class="blob blob-2 absolute bottom-40 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style="animation-delay:1s"></div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         Toast Notification (upgraded)
    ════════════════════════════════════════════════════════ -->
    <Transition name="slide-fade">
      <div
        v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/95 shadow-emerald-500/40' : 'bg-red-500/95 shadow-red-500/40'"
        class="fixed top-6 right-6 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-xl backdrop-blur-md z-[60] flex items-center gap-3"
      >
        <span class="text-base">{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- ════════════════════════════════════════════════════════
         Success Banner (unchanged)
    ════════════════════════════════════════════════════════ -->
    <Transition name="slide-down">
      <div
        v-if="showSuccessBanner && cartStore.subtotal >= minOrderValue"
        class="relative z-30 mx-4 mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 backdrop-blur-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-bounce">🎉</span>
            <p class="heading-text font-medium">تم تحقيق الحد الأدنى! يمكنك الذهاب للدفع الآن</p>
          </div>
          <button @click="showSuccessBanner = false" class="text-slate-400 hover:heading-text transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ════════════════════════════════════════════════════════
         ✨ NEW — Hero Banner
    ════════════════════════════════════════════════════════ -->
    <section class="relative z-10 overflow-hidden rounded-3xl mx-4 mt-6 mb-2 hero-section min-h-[260px] sm:min-h-[320px] flex items-center">
      <!-- Decorative emojis -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <span class="absolute right-8 top-6 text-8xl opacity-10 rotate-12">🥦</span>
        <span class="absolute right-44 bottom-4 text-6xl opacity-10 -rotate-6">🍋</span>
        <span class="absolute right-16 top-1/2 -translate-y-1/2 text-7xl opacity-[0.08]">🧺</span>
        <span class="absolute right-72 top-6 text-5xl opacity-10 rotate-12">🍎</span>
        <span class="absolute right-28 bottom-8 text-5xl opacity-[0.07] rotate-6">🥕</span>
      </div>

      <div class="relative z-10 px-8 sm:px-14 py-12 sm:py-16 flex-1">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase backdrop-blur-sm">
          🔥 عروض الأسبوع — خصومات تصل لـ 40%
        </div>

        <h1 class="text-white font-black text-3xl sm:text-5xl leading-tight mb-4 max-w-md">
          أطعم المنتجات<br>
          <span class="text-emerald-400">توصلك بسرعة</span>
        </h1>

        <p class="text-slate-300 text-sm sm:text-base mb-8 max-w-sm leading-relaxed">
          أكثر من 1500 منتج مختار بعناية — توصيل مجاني على الطلبات فوق
          <strong class="text-emerald-300">{{ formatCurrency(minOrderValue) }}</strong>
        </p>

        <div class="flex flex-wrap gap-3">
          <button
            @click="scrollToProducts"
            class="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold px-7 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 text-sm"
          >
            تسوق الآن →
          </button>
          <button
            @click="cartDrawerOpen = true"
            class="border border-white/30 text-white font-semibold px-7 py-3 rounded-2xl hover:bg-white/10 transition-colors text-sm"
          >
            سلتي ({{ cartStore.totalItems || 0 }})
          </button>
        </div>

        <!-- Stats row -->
        <div class="flex flex-wrap gap-8 mt-10">
          <div v-for="stat in heroStats" :key="stat.label" class="text-center">
            <p class="text-white font-black text-xl leading-none">{{ stat.val }}</p>
            <p class="text-emerald-400 text-xs mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         ✨ NEW — Feature Badges
    ════════════════════════════════════════════════════════ -->
    <div class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mx-4 mt-6 mb-2">
      <div
        v-for="(f, i) in featureBadges"
        :key="f.title"
        :style="{ animationDelay: `${i * 80}ms` }"
        class="feature-badge panel-bg backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-slate-700/50 hover:border-emerald-500/40 transition-all cursor-default group"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
          :style="{ background: f.bg }"
        >
          {{ f.icon }}
        </div>
        <div>
          <p class="font-bold heading-text text-sm">{{ f.title }}</p>
          <p class="subtext text-xs mt-0.5">{{ f.sub }}</p>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         Main Content (unchanged structure)
    ════════════════════════════════════════════════════════ -->
    <div id="products-section" class="relative z-20 max-w-7xl mx-auto px-4 py-12">

      <!-- Breadcrumb -->
      <div class="mb-8 text-sm text-slate-400 flex items-center gap-2">
        <router-link :to="{ name: 'Supermarket' }" class="text-emerald-400 hover:text-teal-400 transition">
          الرئيسية
        </router-link>
        <span class="text-slate-600">/</span>
        <span class="text-slate-300">{{ selectedCategory }}</span>
      </div>

      <!-- Page Title -->
      <div class="mb-12">
        <h1 class="text-2xl md:text-xl font-black heading-text mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          {{ selectedCategory }}
        </h1>
        <p class="subtext font-light">Discover the best products carefully selected for you</p>
      </div>

      <div class="flex gap-8">

        <!-- ── Desktop Filters Sidebar (unchanged) ── -->
        <aside class="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div class="panel-bg backdrop-blur rounded-xl p-6">
            <h3 class="font-bold text-lg heading-text mb-4">Categories</h3>
            <div class="space-y-2">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="handleCategoryChange(cat)"
                :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
                class="w-full text-right px-4 py-2.5 rounded-lg border transition cat-btn"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <div class="panel-bg backdrop-blur rounded-xl p-6">
            <h3 class="font-bold text-lg heading-text mb-4">Price Range</h3>
            <p class="text-emerald-400 font-bold mb-4">
              {{ formatCurrency(priceRange.min) }} - {{ formatCurrency(priceRange.max) }}
            </p>
            <div class="space-y-3">
              <input
                v-model.number="priceRange.min"
                type="number" min="0" max="35000"
                @change="filterAndLoadProducts"
                class="field-input w-full px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="الحد الأدنى"
              />
              <input
                v-model.number="priceRange.max"
                type="number" min="0" max="35000"
                @change="filterAndLoadProducts"
                class="field-input w-full px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                placeholder="الحد الأقصى"
              />
            </div>
            <div class="price-track relative h-1 rounded-full mt-6">
              <div
                class="absolute h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                :style="{
                  left:  (priceRange.min / 35000 * 100) + '%',
                  right: (100 - priceRange.max / 35000 * 100) + '%'
                }"
              ></div>
            </div>
          </div>
        </aside>

        <!-- ── Products Section ── -->
        <main class="flex-1">

          <!-- Loading State (unchanged) -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin opacity-20"></div>
              <div
                class="absolute inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin opacity-40"
                style="animation-direction: reverse"
              ></div>
            </div>
            <p class="subtext mt-4 font-medium">Loading...</p>
          </div>

          <!-- Products Grid (unchanged) -->
          <div v-if="paginatedProducts.length > 0" class="container">
            <div
              v-for="(product, idx) in paginatedProducts"
              :key="product.item_code"
              class="card card-panel"
              :style="{ 'animation-delay': `${idx * 50}ms` }"
            >
              <span class="discount-badge" v-if="product.discount_percentage > 0">
                {{ product.discount_percentage }}% خصم
              </span>

              <div class="image-container">
                <img
                  :src="product.image ? config.FRAPPE_URL + product.image : defaultImageSrc"
                  :alt="product.item_name"
                />
                <button class="add-to-cart" @click="addToCart(product)">
                  <svg viewBox="-1 -1 26 26">
                    <polygon
                      points="12.5,2 11.5,2 11.5,11.5 2,11.5 2,12.5 11.5,12.5 11.5,22 12.5,22 12.5,12.5 22,12.5 22,11.5 12.5,11.5"
                      stroke="#fff" stroke-width="2"
                    ></polygon>
                  </svg>
                </button>
              </div>

              <div class="product-info">
                <div class="discount-price">
                  <div class="dot-price-currency">
                    <div class="dot-price" dir="ltr">
                      .{{ (product.rate % 1).toFixed(2).split('.')[1] }}
                    </div>
                    <div class="currency-in-dot">
                      <span>{{ product.currency }}</span>
                    </div>
                  </div>
                  <div class="not-dotprice">{{ Math.floor(product.rate) }}</div>
                </div>
                <div class="original-price" v-if="product.discount_percentage > 0">
                  <div class="price">
                    {{ product.original_rate }}
                    <span class="currency">{{ product.currency }}</span>
                  </div>
                  <div class="original-price-discount">
                    <div class="discount-label">
                      {{ product.discount_amount }} {{ product.currency }} خصم
                    </div>
                  </div>
                </div>
              </div>

              <a class="product-name" href="#">{{ product.item_name }}</a>
            </div>
          </div>

          <!-- Empty State (unchanged) -->
          <div v-if="!loading && paginatedProducts.length === 0" class="text-center py-20">
            <div class="text-6xl mb-4">📭</div>
            <p class="heading-text text-xl font-bold mb-2">No products available</p>
            <p class="subtext">Try changing the filters or searching</p>
          </div>

          <!-- Pagination (unchanged) -->
          <Transition name="fade">
            <div v-if="paginatedProducts.length > 0 && totalPages > 1"
              class="flex flex-wrap justify-center items-center gap-3 mt-12 pb-8"
            >
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:heading-text hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >Previous</button>

              <div class="flex gap-2">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="currentPage = page"
                  :class="currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 heading-text shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500'"
                  class="px-4 py-2 rounded-lg transition font-medium"
                >{{ page }}</button>
              </div>

              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:heading-text hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >Next</button>
            </div>
          </Transition>
        </main>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         ✨ NEW — Promo Banners (after products)
    ════════════════════════════════════════════════════════ -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 mb-14 grid sm:grid-cols-3 gap-5">
      <div class="sm:col-span-2 promo-red rounded-3xl overflow-hidden relative p-8 flex items-center min-h-[160px]">
        <div class="absolute right-6 top-0 bottom-0 flex items-center text-9xl opacity-20 select-none pointer-events-none">🥩</div>
        <div class="relative z-10">
          <p class="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">عرض الأسبوع</p>
          <h3 class="text-white font-black text-2xl mb-3">اللحوم والدواجن<br><span class="text-yellow-300">خصم يصل لـ 30%</span></h3>
          <button
            @click="handleCategoryChange('لحوم')"
            class="bg-white text-red-600 font-bold px-5 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors"
          >تسوق الآن →</button>
        </div>
      </div>
      <div class="promo-green rounded-3xl overflow-hidden relative p-8 flex flex-col justify-between min-h-[160px]">
        <div class="absolute right-4 bottom-4 text-7xl opacity-20 select-none pointer-events-none">🥛</div>
        <div>
          <p class="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-2">عرض يومي</p>
          <h3 class="text-white font-black text-2xl mb-1">منتجات الألبان</h3>
          <p class="text-emerald-200 text-sm">اشترِ 2 واحصل على 1 مجاناً</p>
        </div>
        <button
          @click="handleCategoryChange('ألبان')"
          class="mt-5 bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors border border-white/30 self-start"
        >تسوق الآن →</button>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         Location/Map Modal (unchanged)
    ════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="showMapModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-700/50">
          <h2 class="text-2xl font-bold heading-text mb-6">Choose Delivery Location</h2>
          <div class="space-y-4 mb-6">
            <input
              v-model="locationSearch"
              type="text"
              placeholder="Search for your Location..."
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg heading-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <div v-if="filteredLocations.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
              <button
                v-for="loc in filteredLocations"
                :key="loc"
                @click="selectLocation(loc)"
                class="w-full text-right px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500 transition"
              >📍 {{ loc }}</button>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="showMapModal = false" class="flex-1 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition font-medium">Cancel</button>
            <button @click="closeMapModal" class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 heading-text rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold">Confirm</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ════════════════════════════════════════════════════════
         Footer (unchanged)
    ════════════════════════════════════════════════════════ -->
    <footer class="relative z-20 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-800 mt-20">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          <div>
            <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">Hypermarket</h3>
            <p class="subtext text-sm leading-relaxed">Your trusted online shopping platform, offering top-quality products at competitive prices.</p>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4">Quick Links</h3>
            <ul class="space-y-2 subtext text-sm">
              <li><router-link :to="{ name: 'Supermarket' }" class="hover:text-emerald-400 transition">Supermarket</router-link></li>
              <li><a href="#" class="hover:text-emerald-400 transition">Contact us</a></li>
              <li><a href="#" class="hover:text-emerald-400 transition">Loyalty Points</a></li>
            </ul>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4">Contact Us</h3>
            <div class="flex gap-3">
              <a href="#" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition">📱</a>
              <a href="#" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition">📧</a>
              <a href="#" class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition">📍</a>
            </div>
          </div>
          <div class="text-right text-slate-400 text-sm">
            <p class="font-bold heading-text mb-2">© 2024 Hypermarket</p>
          </div>
        </div>
        <div class="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">All rights reserved © 2024</div>
      </div>
    </footer>

    <!-- ════════════════════════════════════════════════════════
         ✨ NEW — Cart Drawer Overlay
    ════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div
        v-if="cartDrawerOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        @click="cartDrawerOpen = false"
      ></div>
    </Transition>

    <!-- ✨ NEW — Cart Drawer Panel -->
    <Transition name="drawer-slide">
      <aside
        v-if="cartDrawerOpen"
        class="cart-drawer fixed top-0 right-0 h-full w-full max-w-[420px] z-50 flex flex-col shadow-2xl"
        dir="rtl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-700/60">
          <div>
            <h2 class="text-2xl font-black heading-text">سلة التسوق</h2>
            <p class="subtext text-sm mt-0.5">{{ cartStore.totalItems || 0 }} منتج</p>
          </div>
          <button
            @click="cartDrawerOpen = false"
            class="w-10 h-10 rounded-2xl bg-slate-700/60 hover:bg-slate-600 flex items-center justify-center transition-colors subtext hover:heading-text"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Free Delivery Progress -->
        <div class="mx-5 mt-4 mb-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <div class="flex justify-between text-xs font-semibold mb-2">
            <span class="subtext">
              {{
                (cartStore.subtotal || 0) >= minOrderValue
                  ? '🎉 وصلت للتوصيل المجاني!'
                  : `أضف ${formatCurrency(minOrderValue - (cartStore.subtotal || 0))} للتوصيل المجاني`
              }}
            </span>
            <span class="text-emerald-400">{{ formatCurrency(minOrderValue) }}</span>
          </div>
          <div class="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
              :style="{ width: Math.min(100, ((cartStore.subtotal || 0) / minOrderValue) * 100) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto px-5 py-3 space-y-3 drawer-scroll">

          <!-- Empty state -->
          <div v-if="!cartStore.items || cartStore.items.length === 0"
            class="flex flex-col items-center justify-center h-full gap-4 text-center pb-20">
            <div class="text-7xl animate-bounce">🧺</div>
            <p class="font-black heading-text text-2xl">السلة فاضية</p>
            <p class="subtext text-sm">أضف منتجات عشان تبدأ تتسوق</p>
            <button
              @click="cartDrawerOpen = false"
              class="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-6 py-3 rounded-2xl text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
            >ابدأ التسوق</button>
          </div>

          <!-- Items -->
          <TransitionGroup name="cart-list" tag="div" class="space-y-3">
            <div
              v-for="item in cartStore.items"
              :key="item.item_code"
              class="flex items-center gap-3 cart-item-card rounded-2xl p-3"
            >
              <!-- Image -->
              <div class="w-14 h-14 rounded-xl bg-slate-700/40 flex-shrink-0 overflow-hidden">
                <img
                  :src="item.image ? config.FRAPPE_URL + item.image : defaultImageSrc"
                  :alt="item.item_name"
                  class="w-full h-full object-cover"
                  @error="e => e.target.src = defaultImageSrc"
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-bold heading-text text-sm truncate">{{ item.item_name }}</p>
                <p class="subtext text-xs mt-0.5">{{ item.uom || 'وحدة' }}</p>
                <p class="text-emerald-400 font-black text-sm mt-1">
                  {{ formatCurrency(item.rate * item.qty) }}
                </p>
              </div>

              <!-- Qty controls -->
              <!--
                NOTE: cartStore.addToCart / removeFromCart are used here.
                increaseQty = addToCart again (store should handle duplicates by increasing qty)
                decreaseQty = custom logic below since store only has removeFromCart
              -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <button
                  @click="drawerDecreaseQty(item)"
                  class="drawer-qty-btn w-8 h-8 rounded-xl bg-slate-700 hover:bg-red-500/30 hover:text-red-400 flex items-center justify-center subtext text-xl font-black transition-all"
                >−</button>
                <span class="w-6 text-center font-black heading-text text-sm">{{ item.qty }}</span>
                <button
                  @click="cartStore.addToCart(item)"
                  class="drawer-qty-btn w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white flex items-center justify-center text-xl font-black transition-all"
                >+</button>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Footer -->
        <div
          v-if="cartStore.items && cartStore.items.length > 0"
          class="cart-drawer-footer px-5 pt-4 pb-8 border-t border-slate-700/60 space-y-4"
        >
          <!-- Promo code -->
          <div class="flex gap-2">
            <input
              v-model="promoInput"
              @keydown.enter="applyPromo"
              placeholder="كود الخصم..."
              class="flex-1 promo-input border rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all heading-text"
            />
            <button
              @click="applyPromo"
              class="bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold px-4 py-2.5 rounded-2xl transition-colors"
            >تطبيق</button>
          </div>

          <!-- Applied promo chip -->
          <div v-if="appliedPromo" class="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
            <span class="text-emerald-400 text-sm font-bold">✓ كود {{ appliedPromo }} مفعّل</span>
            <button @click="appliedPromo = ''; promoDiscount = 0" class="subtext hover:text-red-400 transition-colors text-sm">✕</button>
          </div>

          <!-- Summary -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between subtext">
              <span>المجموع الفرعي</span>
              <span>{{ formatCurrency(cartStore.subtotal || 0) }}</span>
            </div>
            <div class="flex justify-between subtext">
              <span>التوصيل</span>
              <span :class="drawerDeliveryFee === 0 ? 'text-emerald-400 font-bold' : ''">
                {{ drawerDeliveryFee === 0 ? 'مجاناً 🎉' : formatCurrency(drawerDeliveryFee) }}
              </span>
            </div>
            <div v-if="promoDiscount > 0" class="flex justify-between text-red-400 font-semibold">
              <span>خصم الكود</span>
              <span>- {{ formatCurrency(promoDiscount) }}</span>
            </div>
            <div class="flex justify-between font-black heading-text text-base border-t border-slate-700/60 pt-2 mt-1">
              <span>الإجمالي</span>
              <span class="text-emerald-400">{{ formatCurrency(drawerFinalTotal) }}</span>
            </div>
          </div>

          <!-- Checkout button -->
          <button
            @click="goToCheckout"
            class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 text-base flex items-center justify-center gap-2 active:scale-[.98]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            إتمام الشراء — {{ formatCurrency(drawerFinalTotal) }}
          </button>

          <p class="text-center text-xs subtext">🔒 دفع آمن · إرجاع مجاني خلال 24 ساعة</p>
        </div>
      </aside>
    </Transition>

    <!-- ════════════════════════════════════════════════════════
         ✨ NEW — Mobile Bottom Navigation Bar
    ════════════════════════════════════════════════════════ -->
    <div class="fixed bottom-0 left-0 right-0 sm:hidden z-30 mobile-bottom-bar border-t border-slate-700/60 shadow-2xl">
      <div class="flex justify-around items-center py-2 px-2">

        <!-- Home -->
        <router-link :to="{ name: 'Supermarket' }" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V10"/>
          </svg>
          <span class="text-[10px] font-bold">الرئيسية</span>
        </router-link>

        <!-- Categories -->
        <button @click="mobileCatsOpen = true" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <span class="text-[10px] font-semibold">التصنيفات</span>
        </button>

        <!-- Cart FAB -->
        <button @click="cartDrawerOpen = true" class="flex flex-col items-center gap-0.5 relative -mt-5">
          <div class="w-14 h-14 cart-fab rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1-5M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
          </div>
          <span class="text-[10px] font-semibold subtext mt-0.5">سلتي</span>
          <!-- Badge -->
          <Transition name="badge-pop">
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center"
            >
              {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
            </span>
          </Transition>
        </button>

        <!-- Search -->
        <button @click="focusMobileSearch" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
          </svg>
          <span class="text-[10px] font-semibold">بحث</span>
        </button>

        <!-- Profile -->
        <button class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="text-[10px] font-semibold">حسابي</span>
        </button>
      </div>
    </div>

    <!-- Spacer for mobile bottom bar -->
    <div class="h-20 sm:hidden"></div>

    <!-- ════════════════════════════════════════════════════════
         ✨ NEW — Mobile Categories Bottom Sheet
    ════════════════════════════════════════════════════════ -->
    <Transition name="fade">
      <div
        v-if="mobileCatsOpen"
        class="fixed inset-0 bg-black/50 z-40 sm:hidden"
        @click="mobileCatsOpen = false"
      ></div>
    </Transition>
    <Transition name="sheet-up">
      <div
        v-if="mobileCatsOpen"
        class="fixed bottom-0 left-0 right-0 z-50 sm:hidden panel-bg rounded-t-3xl border-t border-slate-700/60 shadow-2xl"
      >
        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <div class="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-6"></div>
          <h3 class="font-black heading-text text-lg mb-4 text-center">التصنيفات</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="handleCategoryChange(cat); mobileCatsOpen = false"
              :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
              class="px-4 py-3 rounded-xl border transition text-sm font-semibold cat-btn text-right"
            >{{ cat }}</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import Navbar from "@/pages/website/components/navbar.vue"
import config from '@/config/frappe'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { formatCurrency } from '@/utils/formatters'
import { getItemGroup, getCustomerProfileApi } from "@/services/api"
import { useSettingsStore } from '@/stores/settings'

// ─── Theme ─────────────────────────────────────────────────────
const settingsStore = useSettingsStore()
const settings      = computed(() => settingsStore.settings)
const isDark        = computed(() => settings.value?.appearance?.theme === 'dark')

// ─── Stores ────────────────────────────────────────────────────
const router        = useRouter()
const cartStore     = useCartStore()
const productsStore = useProductsStore()

// ─── Constants ─────────────────────────────────────────────────
const defaultImageSrc = `${config.VUE_URL}/src/assets/img/default-product.jpg`
const itemsPerPage    = 12
const minOrderValue   = 1000

// ─── Hero data ─────────────────────────────────────────────────
const heroStats = [
  { val: '+1500', label: 'منتج'   },
  { val: '+50K',  label: 'عميل'   },
  { val: '4.9★',  label: 'تقييم'  },
  { val: '1hr',   label: 'توصيل'  },
]

const featureBadges = [
  { icon: '🚚', title: 'توصيل سريع',  sub: 'خلال ساعة لبابك',        bg: 'rgba(16,185,129,0.12)' },
  { icon: '🌿', title: 'طازج دائماً', sub: 'من المزرعة مباشرة',      bg: 'rgba(245,158,11,0.12)' },
  { icon: '💳', title: 'دفع سهل',     sub: 'كاش أو كارت أو محفظة',   bg: 'rgba(99,102,241,0.12)' },
  { icon: '↩️', title: 'إرجاع مجاني',sub: 'سياسة 24 ساعة',           bg: 'rgba(239,68,68,0.12)'  },
]

// ─── State (original) ──────────────────────────────────────────
const selectedCategory  = ref('جميع التصنيفات')
const categories        = ref(['جميع التصنيفات'])
const loading           = ref(false)
const currentPage       = ref(1)
const deliveryAddress   = ref('اختر موقعك')
const showSuccessBanner = ref(false)
const priceRange        = ref({ min: 0, max: 35000 })
const message           = ref({ show: false, text: '', type: 'success' })
const showMapModal      = ref(false)
const locationSearch    = ref('')
const websiteProducts   = ref([])

// ─── State (NEW) ───────────────────────────────────────────────
const cartDrawerOpen = ref(false)
const mobileCatsOpen = ref(false)
const promoInput     = ref('')
const appliedPromo   = ref('')
const promoDiscount  = ref(0)

const PROMOS = {
  'SAVE10':  { type: 'percent', value: 10 },
  'FRESH20': { type: 'percent', value: 20 },
  'SAVE50':  { type: 'fixed',   value: 50 },
}

const allLocations = [
  'المعادي - القاهرة',
  'حلوان - القاهرة',
  'مدينة نصر - القاهرة',
  'القاهرة الجديدة',
  'الجيزة',
]

// ─── Computed (original) ───────────────────────────────────────
const filteredProducts = computed(() =>
  websiteProducts.value.filter(p => {
    const catOk   = selectedCategory.value === 'جميع التصنيفات' || p.item_group === selectedCategory.value
    const priceOk = p.rate >= priceRange.value.min && p.rate <= priceRange.value.max
    return catOk && priceOk
  })
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / itemsPerPage)
)

const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) return allLocations
  const kw = locationSearch.value.toLowerCase()
  return allLocations.filter(l => l.toLowerCase().includes(kw))
})

// ─── Computed (NEW — drawer totals) ────────────────────────────
const drawerDeliveryFee = computed(() =>
  (cartStore.subtotal || 0) >= minOrderValue ? 0 : 25
)
const drawerFinalTotal = computed(() =>
  Math.max(0, (cartStore.subtotal || 0) + drawerDeliveryFee.value - promoDiscount.value)
)

// ─── Methods (original — unchanged) ────────────────────────────
const handleCategoryChange  = (cat) => { selectedCategory.value = cat; currentPage.value = 1 }
const handleLocationChange  = (loc) => { deliveryAddress.value = loc }
const handleProductSelected = (product) => { addToCart(product) }
const openMapModal  = () => { showMapModal.value = true; locationSearch.value = '' }
const selectLocation= (loc) => { deliveryAddress.value = loc; locationSearch.value = ''; showMapModal.value = false }
const closeMapModal = () => { showMapModal.value = false }
const filterAndLoadProducts = () => { currentPage.value = 1 }

const addToCart = (product) => {
  cartStore.addToCart(product)
  if (cartStore.subtotal >= minOrderValue) showSuccessBanner.value = true
  showMessage('تم إضافة المنتج إلى السلة! 🛒', 'success')
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => { message.value.show = false }, 3000)
}

const loadCategories = async () => {
  try {
    const response = await getItemGroup()
    const groups   = response?.data
    categories.value = [
      'جميع التصنيفات',
      ...groups.map(g => g.name || g.item_group).filter(Boolean)
    ]
  } catch (err) {
    console.error('Failed to load categories', err)
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const websitePriceList = 'Standard Selling'
    let websiteCustomer = 'Guest'
    try {
      const profile = await getCustomerProfileApi()
      if (profile?.party_type === 'Customer' && profile?.party_name) {
        websiteCustomer = profile.party_name
      }
    } catch (e) {
      console.log('User not logged in → Guest mode', e)
    }
    websiteProducts.value = await productsStore.loadWebsiteProducts(websitePriceList, websiteCustomer)
  } catch (error) {
    console.error('Error loading products:', error)
    showMessage('خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}

// ─── Methods (NEW) ─────────────────────────────────────────────

/**
 * Decrease qty in drawer.
 * Uses cartStore.removeFromCart if qty reaches 0.
 * If your store already handles qty internally in addToCart,
 * you may need to adjust this to match your store's API.
 */
const drawerDecreaseQty = (item) => {
  if (item.qty > 1) {
    // Most Pinia cart stores expose the items array directly —
    // we mutate qty here. If your store is strict, replace with
    // a store action.
    item.qty -= 1
  } else {
    cartStore.removeFromCart(item.item_code)
  }
}

const applyPromo = () => {
  const code  = promoInput.value.trim().toUpperCase()
  const promo = PROMOS[code]
  if (promo) {
    appliedPromo.value  = code
    promoDiscount.value = promo.type === 'percent'
      ? (cartStore.subtotal || 0) * (promo.value / 100)
      : promo.value
    showMessage(`🎉 كود ${code} تم تطبيقه بنجاح!`, 'success')
  } else {
    showMessage('كود الخصم غير صحيح ❌', 'error')
  }
  promoInput.value = ''
}

const goToCheckout = () => {
  cartDrawerOpen.value = false
  router.push({ name: 'Checkout' })   // ← عدّل اسم الـ route حسب مشروعك
}

const scrollToProducts = () => {
  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
}

const focusMobileSearch = () => {
  // يحاول يفوكس أي input بحث في الـ Navbar
  const input = document.querySelector('input[type="search"], input[placeholder*="بحث"], input[placeholder*="Search"]')
  if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
}

// ─── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts()])
})
</script>

<style scoped>
/* ═══════════════════════ ORIGINAL ANIMATIONS ═══════════════════════ */
@keyframes slide-fade { 0% { transform:translateX(30px);  opacity:0 } 100% { transform:translateX(0);   opacity:1 } }
@keyframes slide-down { 0% { transform:translateY(-20px); opacity:0 } 100% { transform:translateY(0);   opacity:1 } }

.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from,   .slide-fade-leave-to     { transform: translateX(30px);  opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from,   .slide-down-leave-to     { transform: translateY(-20px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

/* ═══════════════════════ NEW TRANSITIONS ═══════════════════════ */
/* Cart Drawer */
.drawer-slide-enter-active,
.drawer-slide-leave-active { transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-slide-enter-from,
.drawer-slide-leave-to     { transform: translateX(100%); }

/* Mobile sheet */
.sheet-up-enter-active, .sheet-up-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-up-enter-from,   .sheet-up-leave-to     { transform: translateY(100%); }

/* Cart list items */
.cart-list-enter-active { transition: all 0.28s ease; }
.cart-list-leave-active { transition: all 0.2s ease; }
.cart-list-enter-from   { opacity: 0; transform: translateX(20px); }
.cart-list-leave-to     { opacity: 0; transform: translateX(-20px); }

/* Badge pop */
.badge-pop-enter-active { animation: badgePop 0.35s cubic-bezier(.68,-.55,.265,1.55); }
.badge-pop-leave-active { transition: all 0.2s ease; }
.badge-pop-leave-to     { opacity: 0; transform: scale(0); }
@keyframes badgePop { from { transform:scale(0); opacity:0 } to { transform:scale(1); opacity:1 } }

/* ═══════════════════════ UTILITIES ═══════════════════════ */
.line-clamp-2     { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.scrollbar-hide   { -ms-overflow-style:none; scrollbar-width:none; }
.scrollbar-hide::-webkit-scrollbar { display:none; }
::-webkit-scrollbar       { width:8px; height:8px; }
::-webkit-scrollbar-track { background: rgba(15,23,42,0.5); }
::-webkit-scrollbar-thumb { background: #10b981; border-radius:4px; }
::-webkit-scrollbar-thumb:hover { background: #059669; }

/* ═══════════════════════ HERO BANNER ═══════════════════════ */
.hero-section {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #059669 100%);
}

/* ═══════════════════════ FEATURE BADGES ═══════════════════════ */
.feature-badge {
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }

/* ═══════════════════════ PROMO BANNERS ═══════════════════════ */
.promo-red   { background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%); }
.promo-green { background: linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%); }

/* ═══════════════════════ CART DRAWER ═══════════════════════ */
.cart-drawer {
  background: var(--card-bg, #0f172a);
  border-left: 1px solid rgba(71,85,105,0.4);
}
.cart-item-card {
  background: var(--panel-bg, rgba(30,41,59,0.8));
  border: 1px solid rgba(71,85,105,0.3);
  transition: border-color 0.2s;
}
.cart-item-card:hover { border-color: rgba(16,185,129,0.3); }
.cart-drawer-footer   { background: var(--card-bg, #0f172a); }

.drawer-qty-btn { transition: all 0.14s; }
.drawer-qty-btn:active { transform: scale(0.88); }

.promo-input {
  background:   var(--input-bg, rgba(30,41,59,0.8));
  border-color: var(--input-border, rgba(71,85,105,0.5));
}
.drawer-scroll::-webkit-scrollbar       { width: 4px; }
.drawer-scroll::-webkit-scrollbar-track { background: transparent; }
.drawer-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 99px; }

/* ═══════════════════════ MOBILE BOTTOM BAR ═══════════════════════ */
.mobile-bottom-bar {
  background: var(--card-bg, rgba(15,23,42,0.97));
  backdrop-filter: blur(16px);
}
.mobile-tab-btn {
  color: var(--subtext, #94a3b8);
  transition: color 0.2s;
}
.mobile-tab-btn:hover { color: #10b981; }
.cart-fab {
  background: linear-gradient(135deg, #10b981, #0d9488);
  transition: transform 0.15s;
}

/* ═══════════════════════ ORIGINAL PRODUCT GRID ═══════════════════════ */
.container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  width: 100%;
  margin: auto;
  margin-top: 25px;
}
@media (max-width: 1200px) { .container { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px)  { .container { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .container { grid-template-columns: repeat(1, 1fr); } }

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 15px;
  max-width: 300px;
  margin: auto;
  position: relative;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.card:hover { transform: scale(1.05); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }

.image-container       { position: relative; }
.image-container img   { width: 100%; border-radius: 10px; }

.discount-badge {
  z-index: 1000;
  position: absolute; top:0; left:0;
  background-color: #bc1e20; color: #fff;
  font-size: 11px; padding: 2px 6px; font-weight: bold;
  border-bottom-right-radius: 0.75rem;
  border-top-left-radius: 0.75rem;
}

.add-to-cart {
  background: var(--btn-add-cart-bg);
  transition: background .3s, transform .2s;
  border: none; color: white;
  padding: 10px; border-radius: 50%; cursor: pointer;
  font-size: 22px; width: 50px; height: 50px;
  position: absolute; bottom: 0; right: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
}
.add-to-cart:hover { background: var(--btn-add-cart-hover); transform: scale(1.05); }
.add-to-cart svg   { width: 25px; height: 25px; fill: white; }

.product-info     { width:100%; height:50px; position:relative; direction:rtl; display:inline-block; }
.discount-price   { position:relative; right:0; display:flex; align-items:center; height:35px; }
.dot-price-currency { box-sizing:border-box; margin:5px 4px 0 0; display:inline-block; vertical-align:top; position:absolute; top:0; right:0; }
.dot-price        { font-size:10px; line-height:10px; font-weight:700; color:var(--price-color); }
.not-dotprice     { font-size:20px; line-height:28px; display:inline-block; font-weight:700; position:absolute; right:20px; bottom:0; color:var(--price-color); }
.original-price   { font-size:14px; position:absolute; bottom:0; right:0; display:flex; align-items:center; }
.original-price .price { text-decoration: line-through; }
.currency-in-dot  { font-size:7px; line-height:7px; font-weight:400; color:var(--heading); }
.currency         { font-size:14px; color:var(--subtext); }
.product-name     { color:var(--heading); transition:color .3s; text-decoration:none; font-size:16px; font-weight:bold; display:block; text-align:center; margin-top:5px; }
.original-price .original-price-discount .discount-label { color:red; font-size:12px; font-weight:bold; margin-bottom:5px; margin-right:10px; }

/* ═══════════════════════ FILTER STYLES ═══════════════════════ */
.cat-btn          { color:var(--heading); border-color:var(--card-border); }
.cat-btn-active   { background:rgba(16,185,129,0.15); color:#10b981; border-color:rgba(16,185,129,0.45); }
.cat-btn-inactive { color:var(--subtext); border-color:var(--card-border); }
.cat-btn-inactive:hover { border-color:var(--input-border); color:var(--heading); }
.price-track      { background:var(--track-bg); border:1px solid var(--track-border); }
.field-input      { background:var(--input-bg); border:1px solid var(--input-border); color:var(--input-color); }
.field-input::placeholder { color:var(--subtext); opacity:0.7; }
</style>
