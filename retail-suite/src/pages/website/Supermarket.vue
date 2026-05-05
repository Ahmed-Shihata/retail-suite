<!-- Supermarket.vue -->
<template>
  <div
    :class="isDark ? 'theme-dark' : 'theme-light'"
    class="page-wrapper min-h-screen transition-colors duration-500"
  >
    <!-- Navbar Component -->
    <Navbar
      :selected-category="selectedCategory"
      :delivery-address="deliveryAddress"
      :categories="categories"
      @category-changed="handleCategoryChange"
      @location-changed="handleLocationChange"
      @product-selected="handleProductSelected"
      @show-map-modal="openMapModal"
    />

    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="blob blob-1 absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse"></div>
      <div class="blob blob-2 absolute bottom-40 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style="animation-delay:1s"></div>
    </div>

    <!-- Toast -->
    <Transition name="slide-fade">
      <div
        v-if="message.show"
        :class="message.type === 'success' ? 'bg-emerald-500/90 shadow-emerald-500/50' : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl heading-text text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3"
      >
        <span class= "">{{ message.type === 'success' ? '✓' : '✕' }}</span>
        {{ message.text }}
      </div>
    </Transition>

    <!-- Success Banner -->
    <Transition name="slide-down">
      <div
        v-if="showSuccessBanner && cartStore.subtotal >= minOrderValue"
        class="relative z-30 mx-4 mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 backdrop-blur-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl animate-bounce">🎉</span>
            <p class="heading-text font-medium text-sm sm:text-base">تم تحقيق الحد الأدنى! يمكنك الذهاب للدفع الآن</p>
          </div>
          <button @click="showSuccessBanner = false" class="text-slate-400 hover:heading-text transition flex-shrink-0 ml-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <div class="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 lg:py-12 pb-24 sm:pb-12">

      <!-- Breadcrumb -->
      <div class="mb-4 sm:mb-6 text-xs sm:text-sm flex items-center gap-2" style="color:var(--subtext)">
        <router-link :to="{ name: 'Supermarket' }" class="transition" style="color:#0d9488">الرئيسية</router-link>
        <span>/</span>
        <span class="text-sm truncate max-w-[200px] " style="color:var(--heading)">{{ selectedCategory }}</span>
      </div>

      <!-- Page Title -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-xl sm:text-2xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          {{ selectedCategory }}
        </h1>
        <p class="font-light text-xs sm:text-sm" style="color:var(--subtext)">Discover the best products carefully selected for you</p>
      </div>

      <!-- ══════════════════════════════════════════════════════
           SHOP CONTROL BAR  (Filter · Layout · Sort)
      ═══════════════════════════════════════════════════════ -->
      <div class="shop-control">

        <!-- COL 1 — Filter + category pills -->
        <div class="shop-col shop-col--filter">

          <button
            @click="mobileFiltersOpen = !mobileFiltersOpen"
            class="ctrl-btn"
            :class="{ 'ctrl-btn--active': mobileFiltersOpen }"
          >
            <svg width="18" height="11" viewBox="0 0 20 12" fill="none">
              <path d="M0 1C0 .735.105.48.293.293.48.105.735 0 1 0h18c.265 0 .52.105.707.293.188.187.293.442.293.707 0 .265-.105.52-.293.707C19.52 1.895 19.265 2 19 2H1C.735 2 .48 1.895.293 1.707.105 1.52 0 1.265 0 1zm3 5c0-.265.105-.52.293-.707C3.48 5.105 3.735 5 4 5h12c.265 0 .52.105.707.293.188.187.293.442.293.707 0 .265-.105.52-.293.707C16.52 6.895 16.265 7 16 7H4c-.265 0-.52-.105-.707-.293C3.105 6.52 3 6.265 3 6zm5 4c-.265 0-.52.105-.707.293C7.105 10.48 7 10.735 7 11s.105.52.293.707C7.48 11.895 7.735 12 8 12h4c.265 0 .52-.105.707-.293.188-.187.293-.442.293-.707s-.105-.52-.293-.707C12.52 10.105 12.265 10 12 10H8z" fill="currentColor"/>
            </svg>
            <span>Filters</span>
            <Transition name="badge-pop">
              <span v-if="activeFiltersCount > 0" class="ctrl-badge">{{ activeFiltersCount }}</span>
            </Transition>
          </button>

          <!-- Category pills horizontal scroll -->
          <div class="cat-pills-wrap">
            <div class="cat-pills">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="handleCategoryChange(cat)"
                :class="selectedCategory === cat ? 'pill--active' : 'pill--idle'"
                class="pill"
              >{{ cat }}</button>
            </div>
          </div>
        </div>

        <!-- COL 2 — Layout switcher -->
        <div class="shop-col shop-col--layout">
          <div class="layout-switch">
            <!-- List -->
            <button @click="currentLayout = 'list'" :class="{ 'layout-btn--active': currentLayout === 'list' }" class="layout-btn" title="List">
              <svg width="19" height="13" viewBox="0 0 19 13" fill="none">
                <circle cx="2.44" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="2.44" cy="10.56" r="2.44" fill="currentColor"/>
                <rect x="7" y="2" width="12" height="1" fill="currentColor"/>
                <rect x="7" y="10" width="12" height="1" fill="currentColor"/>
              </svg>
            </button>
            <!-- 2 col -->
            <button @click="currentLayout = 2" :class="{ 'layout-btn--active': currentLayout === 2 }" class="layout-btn" title="2 cols">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="2.44" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="10.56" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="2.44" cy="10.56" r="2.44" fill="currentColor"/>
                <circle cx="10.56" cy="10.56" r="2.44" fill="currentColor"/>
              </svg>
            </button>
            <!-- 3 col -->
            <button @click="currentLayout = 3" :class="{ 'layout-btn--active': currentLayout === 3 }" class="layout-btn layout-btn--hide-xs" title="3 cols">
              <svg width="22" height="13" viewBox="0 0 22 13" fill="none">
                <circle cx="2.44" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="10.56" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="18.69" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="2.44" cy="10.56" r="2.44" fill="currentColor"/>
                <circle cx="10.56" cy="10.56" r="2.44" fill="currentColor"/>
                <circle cx="18.69" cy="10.56" r="2.44" fill="currentColor"/>
              </svg>
            </button>
            <!-- 4 col -->
            <button @click="currentLayout = 4" :class="{ 'layout-btn--active': currentLayout === 4 }" class="layout-btn layout-btn--hide-md" title="4 cols">
              <svg width="30" height="13" viewBox="0 0 30 13" fill="none">
                <circle cx="2.44" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="10.56" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="18.69" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="26.81" cy="2.44" r="2.44" fill="currentColor"/>
                <circle cx="2.44" cy="10.56" r="2.44" fill="currentColor"/>
                <circle cx="10.56" cy="10.56" r="2.44" fill="currentColor"/>
                <circle cx="18.69" cy="10.56" r="2.44" fill="currentColor"/>
                <circle cx="26.81" cy="10.56" r="2.44" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- COL 3 — Sort -->
        <div class="shop-col shop-col--sort">
          <div class="sort-wrap">
            <button
              @click="sortOpen = !sortOpen"
              class="ctrl-btn ctrl-btn--sort"
              :class="{ 'ctrl-btn--active': sortOpen }"
            >
              <span class="sort-label-mobile">Sort</span>
              <span class="sort-label-desktop">{{ currentSortLabel }}</span>
              <svg class="sort-chevron" :class="{ 'sort-chevron--up': sortOpen }" width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M.738 1.238L6.238 6.738l5.5-5.5-.976-.976L6.238 4.786 1.714.262.738 1.238z" fill="currentColor"/>
              </svg>
            </button>

            <Transition name="sort-drop">
              <div v-if="sortOpen" class="sort-dropdown">
                <p class="sort-dropdown__label">Sort by:</p>
                <button
                  v-for="opt in sortOptions" :key="opt.value"
                  @click="selectSort(opt)"
                  :class="{ 'sort-opt--active': currentSort === opt.value }"
                  class="sort-opt"
                >
                  <span class="sort-opt__check">
                    <svg v-if="currentSort === opt.value" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 20l-7-7 3-3 4 4L19 4l3 3z" fill="currentColor"/>
                    </svg>
                  </span>
                  {{ opt.label }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

      </div>
      <!-- sort click-outside overlay -->
      <div v-if="sortOpen" class="sort-overlay" @click="sortOpen = false"></div>

      <!-- ══════════════════════════════════════════════════════
           FILTERS PANEL (collapsible)
      ═══════════════════════════════════════════════════════ -->
      <Transition name="slide-down">
        <div v-if="mobileFiltersOpen" class="filters-drawer lg:hidden">
          <h3 class="font-bold text-sm heading-text mb-3">التصنيفات</h3>
          <div class="flex flex-wrap gap-2 mb-5">
            <button
              v-for="cat in categories" :key="cat"
              @click="handleCategoryChange(cat); mobileFiltersOpen = false"
              :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
              class="text-xs px-3 py-1.5 rounded-lg border transition cat-btn"
            >{{ cat }}</button>
          </div>

          <h3 class="font-bold text-sm heading-text mb-3">Price Range</h3>
          <p class="font-bold text-sm mb-3" style="color:#0d9488">
            {{ formatCurrency(priceRange.min) }} — {{ formatCurrency(priceRange.max) }}
          </p>
          <div class="flex gap-3">
            <input v-model.number="priceRange.min" type="number" min="0" max="35000" @change="filterAndLoadProducts"
              class="field-input flex-1 px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Min" />
            <input v-model.number="priceRange.max" type="number" min="0" max="35000" @change="filterAndLoadProducts"
              class="field-input flex-1 px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Max" />
          </div>
        </div>
      </Transition>

      <!-- ══════════════════════════════════════════════════════
           MAIN LAYOUT (Sidebar + Products)
      ═══════════════════════════════════════════════════════ -->
      <div class="flex gap-6 lg:gap-8">

        <!-- Desktop Sidebar -->
        <aside class="hidden lg:block w-56 xl:w-64 flex-shrink-0 space-y-6">
          <div class="panel-bg backdrop-blur rounded-xl p-5">
            <h3 class="font-bold text-base heading-text mb-4">Categories</h3>
            <div class="space-y-1.5">
              <button
                v-for="cat in categories" :key="cat"
                @click="handleCategoryChange(cat)"
                :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
                class="w-full text-right px-3 py-2 rounded-lg border transition cat-btn text-sm"
              >{{ cat }}</button>
            </div>
          </div>

          <div class="panel-bg backdrop-blur rounded-xl p-5">
            <h3 class="font-bold text-base heading-text mb-3">Price Range</h3>
            <p class="font-bold mb-3 text-sm" style="color:#0d9488">
              {{ formatCurrency(priceRange.min) }} — {{ formatCurrency(priceRange.max) }}
            </p>
            <div class="space-y-2">
              <input v-model.number="priceRange.min" type="number" min="0" max="35000" @change="filterAndLoadProducts"
                class="field-input w-full px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" placeholder="الحد الأدنى" />
              <input v-model.number="priceRange.max" type="number" min="0" max="35000" @change="filterAndLoadProducts"
                class="field-input w-full px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" placeholder="الحد الأقصى" />
            </div>
            <div class="price-track relative h-1 rounded-full mt-5">
              <div
                class="absolute h-1 rounded-full"
                style="background:linear-gradient(to right,#0d9488,#10b981)"
                :style="{ left: (priceRange.min/35000*100)+'%', right: (100-priceRange.max/35000*100)+'%' }"
              ></div>
            </div>
          </div>
        </aside>

        <!-- Products -->
        <main class="flex-1 min-w-0">

          <!-- Loading -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin opacity-20"></div>
              <div class="absolute inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-spin opacity-40" style="animation-direction:reverse"></div>
            </div>
            <p class="subtext mt-4 font-medium">Loading...</p>
          </div>

          <!-- Products Grid -->
          <div
            v-if="!loading && paginatedProducts.length > 0"
            class="products-grid"
            :class="`layout-${currentLayout}`"
          >

        <!-- ① TEMPLATE — replace the entire v-for card div with this -->
        <div
          v-for="(product, idx) in paginatedProducts"
          :key="product.item_code"
          @click="goToProduct(product)"
          class="card"
          :style="{ 'animation-delay': `${idx * 50}ms` }"
        >
          <!-- Discount badge -->
          <span v-if="product.discount_percentage > 0" class="discount-badge">
            {{ product.discount_percentage }}% خصم
          </span>

          <!-- Product image -->
          <div class="image-container">
            <img
              :src="product.image ? config.FRAPPE_URL + product.image : defaultImageSrc"
              :alt="product.item_name"
              loading="lazy"
            />
          </div>

          <!-- Price block -->
          <div class="product-info">
            <div class="discount-price">
              <div class="dot-price-currency">
                <div class="dot-price">
                  .{{ (product.rate % 1).toFixed(2).split('.')[1] }}
                </div>
                <div class="currency-in-dot"><span>{{ product.currency }}</span></div>
              </div>
              <div class="not-dotprice">{{ Math.floor(product.rate) }}</div>
            </div>
            <div class="original-price" v-if="product.discount_percentage > 0">
              <div class="price">
                <span class="currency">{{ product.currency }}</span>
                <span class="amount">{{ product.original_rate }}</span>
              </div>
              <div class="original-price-discount">
                <div class="discount-label">
                  {{ product.discount_amount }} {{ product.currency }} خصم
                </div>
              </div>
            </div>
          </div>

          <!-- Product name -->
          <a class="product-name" href="#">{{ product.item_name }}</a>

          <!-- ── Quantity control ── -->
          <div class="qty-row">
            <template v-if="cartQuantity(product) === 0">
              <!-- Zero state: single "Add" button -->
              <button class="qty-add-btn" @click.stop="addToCart(product)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Add</span>
              </button>
            </template>

            <template v-else>
              <!-- Non-zero state: − count + -->
              <div class="qty-stepper">
                <button
                  class="qty-btn qty-btn--minus"
                  @click.stop="removeOneFromCart(product)"
                  aria-label="Decrease quantity"
                >
                  <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                    <rect width="12" height="2" rx="1" fill="currentColor"/>
                  </svg>
                </button>

                <span class="qty-count">{{ cartQuantity(product) }}</span>

                <button
                  class="qty-btn qty-btn--plus"
                  @click.stop="addOneToCart(product)"
                  aria-label="Increase quantity"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="5" width="2" height="12" rx="1" fill="currentColor"/>
                    <rect y="5" width="12" height="2" rx="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </template>
          </div>
        </div>

          </div>

          <!-- Empty -->
          <div v-if="!loading && paginatedProducts.length === 0" class="text-center py-20">
            <div class="text-5xl sm:text-6xl mb-4">📭</div>
            <p class="heading-text text-lg sm:text-xl font-bold mb-2">No products available</p>
            <p class="subtext text-sm">Try changing the filters or searching</p>
          </div>

          <!-- Pagination -->
          <Transition name="fade">
            <div v-if="paginatedProducts.length > 0 && totalPages > 1" class="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-8 sm:mt-12 pb-4">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="pag-btn px-3 sm:px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
              >Previous</button>

              <div class="flex gap-1 sm:gap-2 flex-wrap justify-center">
                <button
                  v-for="page in totalPages" :key="page"
                  @click="currentPage = page"
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition font-medium text-sm flex items-center justify-center"
                  :class="currentPage === page ? 'pag-btn--active' : 'pag-btn'"
                >{{ page }}</button>
              </div>

              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pag-btn px-3 sm:px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
              >Next</button>
            </div>
          </Transition>

        </main>
      </div>
    </div>

    <!-- Map Modal -->
    <Transition name="fade">
      <div v-if="showMapModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 sm:p-8" style="background:var(--modal-bg); border:1px solid var(--input-border)">
          <h2 class="text-xl sm:text-2xl font-bold heading-text mb-5 sm:mb-6">Choose Delivery Location</h2>
          <div class="space-y-4 mb-6">
            <input v-model="locationSearch" type="text" placeholder="Search for your Location..."
              class="w-full px-4 py-3 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition field-input" />
            <div v-if="filteredLocations.length > 0" class="space-y-2 max-h-52 overflow-y-auto">
              <button v-for="loc in filteredLocations" :key="loc" @click="selectLocation(loc)"
                class="w-full text-right px-4 py-3 rounded-lg text-sm transition heading-text hover:text-emerald-400"
                style="border:1px solid var(--input-border)"
              >📍 {{ loc }}</button>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="showMapModal = false"
              class="flex-1 px-4 py-3 rounded-lg font-medium text-sm transition"
              style="border:1px solid var(--cancel-border); color:var(--cancel-color)">Cancel</button>
            <button @click="closeMapModal"
              class="flex-1 px-4 py-3 rounded-lg font-bold text-sm text-white transition"
              style="background:linear-gradient(135deg,#0d9488,#10b981)">Confirm</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="relative z-20 mt-16 sm:mt-20" style="background:var(--footer-bg); border-top:1px solid var(--footer-border)">
      <div class="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8">
          <div class="col-span-2 sm:col-span-1">
            <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">Hypermarket</h3>
            <p class="subtext text-xs sm:text-sm leading-relaxed">Your trusted online shopping platform, offering top-quality products at competitive prices.</p>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul class="space-y-2 subtext text-xs sm:text-sm">
              <li><router-link :to="{ name: 'Supermarket' }" class="hover:text-emerald-400 transition">Supermarket</router-link></li>
              <li><a href="#" class="hover:text-emerald-400 transition">Contact us</a></li>
              <li><a href="#" class="hover:text-emerald-400 transition">Loyalty Points</a></li>
            </ul>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4 text-sm sm:text-base">Contact Us</h3>
            <div class="flex flex-wrap gap-3 social-icons">
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center subtext transition text-sm" style="background:var(--card-bg); border:1px solid var(--card-border)"><ion-icon name="logo-youtube"></ion-icon></a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center subtext  transition text-sm" style="background:var(--card-bg); border:1px solid var(--card-border)"><ion-icon name="logo-snapchat"></ion-icon></a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center subtext  transition text-sm" style="background:var(--card-bg); border:1px solid var(--card-border)"> <ion-icon name="logo-tiktok"></ion-icon></a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center subtext  transition text-sm" style="background:var(--card-bg); border:1px solid var(--card-border)"><ion-icon name="logo-instagram"></ion-icon></a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center subtext transition text-sm" style="background:var(--card-bg); border:1px solid var(--card-border)"><ion-icon name="logo-facebook"></ion-icon></a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center subtext transition text-sm" style="background:var(--card-bg); border:1px solid var(--card-border)"><ion-icon name="logo-whatsapp"></ion-icon></a>
            </div>
          </div>
          <div class="text-right text-xs sm:text-sm subtext">
            <p class="font-bold heading-text mb-2">© 2024 Hypermarket</p>
          </div>
        </div>
        <div class="pt-6 sm:pt-8 text-center text-xs sm:text-sm subtext" style="border-top:1px solid var(--divider)">
          All rights reserved © 2024
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Nav -->
    <div class="fixed bottom-0 left-0 right-0 sm:hidden z-30 mobile-bottom-bar" style="border-top:1px solid var(--tab-bar-border)">
      <div class="flex justify-around items-center py-2 px-1">
        <router-link :to="{ name: 'Supermarket' }" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V10"/>
          </svg>
          <span class="text-[10px] font-bold">الرئيسية</span>
        </router-link>

        <button @click="mobileCatsOpen = true" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <Shop />
          <router-link :to="{ name: 'Supermarket' }" >
            <span class="text-[10px] font-semibold">التصنيفات</span>
          </router-link>
        </button>

        <router-link :to="{ name: 'Cart' }">
        <button @click="cartDrawerOpen = true" class="flex flex-col items-center gap-0.5 relative -mt-5">
          <div class="w-14 h-14 cart-fab rounded-2xl flex items-center justify-center active:scale-95 transition-transform" style="box-shadow:0 6px 20px rgba(13,148,136,.4)">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1-5M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
          </div>
            <span class="text-[10px] font-semibold subtext mt-0.5">سلتي</span>
            <Transition name="badge-pop">
              <span v-if="cartStore.cart.length > 0" class="absolute -top-1 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {{ cartStore.cart.length > 99 ? '99+' : cartStore.cart.length }}
              </span>
            </Transition>
          </button>

        </router-link>
       <!-- Search → طلباتي -->
      <router-link :to="{ name:'CustomerOrders'}">
        <button @click="focusMobileSearch" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
          </svg>
          <span class="text-[10px] font-semibold">طلباتي</span>
        </button>
      </router-link>
        <button class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <router-link :to="{ name: 'MyAccount' }">
               <span class="text-[10px] font-semibold">
                حسابي
              </span>
          </router-link>
        </button>
      </div>
    </div>
    <div ref="scrollBtn" class="hdt-circle-css !hidden md:!flex" @click="scrollToTop">
      <div class="hdt-circle--inner">
        ↑
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from "@/pages/website/components/navbar.vue"
import config from '@/config/frappe'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { formatCurrency } from '@/utils/formatters'
import { getItemGroup, getCustomerProfileApi } from "@/services/api"
import { useSettingsStore } from '@/stores/settings'
import Shop from '@/components/icons/regular/Shop.svg'

// ─── Theme ────────────────────────────────────────────────────────────────────
const settingsStore = useSettingsStore()
const settings      = computed(() => settingsStore.settings)
const isDark        = computed(() => settings.value?.appearance?.theme === 'dark')

// ─── Stores ────────────────────────────────────────────────────────────────────
const router        = useRouter()
const cartStore     = useCartStore()
const productsStore = useProductsStore()

// ─── Constants ────────────────────────────────────────────────────────────────────
const defaultImage    = '/src/assets/img/default-product.jpg'
const defaultImageSrc = `${config.VUE_URL}${defaultImage}`
const itemsPerPage    = 12
const minOrderValue   = 1000

// ─── State
const selectedCategory  = ref('جميع التصنيفات')
const categories        = ref(['جميع التصنيفات'])

const loading           = ref(false)
const currentPage       = ref(1)
const deliveryAddress   = ref('اختر موقعك')
const showSuccessBanner = ref(false)
const priceRange        = ref({ min: 0, max: 35000 })
const mobileFiltersOpen = ref(false)
const mobileCatsOpen    = ref(false)
const cartDrawerOpen    = ref(false)
const showMapModal      = ref(false)
const locationSearch    = ref('')
const websiteProducts   = ref([])
const currentLayout     = ref(4)
const sortOpen          = ref(false)
const currentSort       = ref('best-selling')
const message           = ref({ show: false, text: '', type: 'success' })

const allLocations = ['المعادي - القاهرة','حلوان - القاهرة','مدينة نصر - القاهرة','القاهرة الجديدة','الجيزة']

const sortOptions = [
  { value: 'manual',             label: 'Featured' },
  { value: 'best-selling',       label: 'Best selling' },
  { value: 'title-ascending',    label: 'Alphabetically, A–Z' },
  { value: 'title-descending',   label: 'Alphabetically, Z–A' },
  { value: 'price-ascending',    label: 'Price, low to high' },
  { value: 'price-descending',   label: 'Price, high to low' },
  { value: 'created-ascending',  label: 'Date, old to new' },
  { value: 'created-descending', label: 'Date, new to old' },
]

// ─── Computed
const currentSortLabel = computed(
  () => sortOptions.find(o => o.value === currentSort.value)?.label ?? 'Sort'
)
const activeFiltersCount = computed(() => {
  let c = 0
  if (selectedCategory.value !== 'جميع التصنيفات') c++
  if (priceRange.value.min > 0 || priceRange.value.max < 35000) c++
  return c
})
const filteredProducts = computed(() =>
  websiteProducts.value.filter(p => {
    const catOk   = selectedCategory.value === 'جميع التصنيفات' || p.item_group === selectedCategory.value
    const priceOk = p.rate >= priceRange.value.min && p.rate <= priceRange.value.max
    return catOk && priceOk
  })
)
const paginatedProducts = computed(() => {
  const s = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(s, s + itemsPerPage)
})
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) return allLocations
  const kw = locationSearch.value.toLowerCase()
  return allLocations.filter(l => l.toLowerCase().includes(kw))
})

// ─── Methods
const handleCategoryChange  = (cat) => { selectedCategory.value = cat; currentPage.value = 1 }
const selectSort            = (opt) => { currentSort.value = opt.value; sortOpen.value = false }
const handleLocationChange  = (loc) => { deliveryAddress.value = loc }
const handleProductSelected = (p)   => addToCart(p)
const openMapModal          = ()    => { showMapModal.value = true; locationSearch.value = '' }
const closeMapModal         = ()    => { showMapModal.value = false }
const filterAndLoadProducts = ()    => { currentPage.value = 1 }

const selectLocation = (loc) => {
  deliveryAddress.value = loc; locationSearch.value = ''; showMapModal.value = false
}

const increaseQuantity = (index) => {
  const item = cartStore.cart[index]
  if (item) {
    if (item.isReturn) {
      cartStore.updateQuantity(item.item_code, item.qty - 1, 'return')
    } else {
      item.qty += 1
      cartStore.updateChange()
    }
  }
}

const decreaseQuantity = (index) => {
  const item = cartStore.cart[index]
  if (item) {
    if (item.isReturn) {
      if (Math.abs(item.qty) > 0) {
        cartStore.updateQuantity(item.item_code, item.qty + 1, 'return')
      }
    } else {
      if (item.qty > 1) {
        item.qty -= 1
        cartStore.updateChange()
      } else {
        removeItem(index)
      }
    }
  }
}

const removeItem = (index) => {
  const item = cartStore.cart[index]
  if (item) {
    cartStore.removeFromCart(item.item_code)
    showMessage('تم حذف المنتج من السلة', 'success')
  }
}


// ════════════════════════════════════════════════════════════
//      ② SCRIPT — add these three helpers inside <script setup>
//      (they work alongside the existing addToCart / cartStore)
// ════════════════════════════════════════════════════════════

const cartQuantity = (product) => {
  const item = cartStore.cart.find(i => i.item_code === product.item_code)
  return item ? Math.abs(item.qty) : 0
}

const addOneToCart = (product) => {
  const item = cartStore.cart.find(i => i.item_code === product.item_code)
  if (item) {
    item.qty += 1
    cartStore.updateChange?.()
    if (cartStore.subtotal >= minOrderValue) showSuccessBanner.value = true
  } else {
    addToCart(product)
  }
}

const removeOneFromCart = (product) => {
  const item = cartStore.cart.find(i => i.item_code === product.item_code)
  if (!item) return
  if (item.qty > 1) {
    item.qty -= 1
    cartStore.updateChange?.()
  } else {
    cartStore.removeFromCart(item.item_code)
    showMessage('تم حذف المنتج من السلة', 'success')
  }
}
// ------------------------------------------------------
const addToCart = (product) => {
  cartStore.addToCart(product)
  if (cartStore.subtotal >= minOrderValue) showSuccessBanner.value = true
  showMessage('تم إضافة المنتج إلى السلة!', 'success')
}
const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => { message.value.show = false }, 3000)
}
const loadCategories = async () => {
  try {
    const res = await getItemGroup()
    categories.value = ['جميع التصنيفات', ...res?.data.map(g => g.name || g.item_group).filter(Boolean)]
  } catch (e) { console.error(e) }
}
const loadProducts = async () => {
  loading.value = true
  try {
    let customer = 'Guest'
    try {
      const p = await getCustomerProfileApi()
      if (p?.party_type === 'Customer' && p?.party_name) customer = p.party_name
    } catch {}
    websiteProducts.value = await productsStore.loadWebsiteProducts('Standard Selling', customer)
  } catch (e) {
    console.error(e); showMessage('خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}
const focusMobileSearch = () => {
  const el = document.querySelector('input[type="search"], input[placeholder*="بحث"], input[placeholder*="Search"]')
  if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
}
const goToProduct = (product) => {
  router.push({ name: 'ProductPage', params: { id: product.item_code } })
}
onMounted(() => Promise.all([loadCategories(), loadProducts()]))
// ===================================================
// Scroll To Top
// ==================================================
const scrollBtn = ref(null)

const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight

  if (docHeight <= 0) return

  const percent = scrollTop / docHeight
  const degrees = percent * 360

  if (scrollBtn.value) {
    scrollBtn.value.style.setProperty('--circle-degrees', degrees + 'deg')
    scrollBtn.value.style.opacity = scrollTop > 200 ? '1' : '0'
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ═══════════════════════ TRANSITIONS ═══════════════════════ */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter-from,   .slide-fade-leave-to     { transform: translateX(30px); opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all .3s ease; }
.slide-down-enter-from,   .slide-down-leave-to     { transform: translateY(-12px); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.badge-pop-enter-active { animation: badgePop .3s cubic-bezier(.68,-.55,.265,1.55); }
.badge-pop-leave-active { transition: all .15s ease; }
.badge-pop-leave-to     { opacity: 0; transform: scale(0); }
@keyframes badgePop { from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1} }

.sort-drop-enter-active { animation: dropIn .2s cubic-bezier(.4,0,.2,1); }
.sort-drop-leave-active { animation: dropIn .15s cubic-bezier(.4,0,.2,1) reverse; }
@keyframes dropIn { from{opacity:0;transform:translateY(-8px)scale(.97)}to{opacity:1;transform:translateY(0)scale(1)} }

/* ═══════════════════════ SCROLLBAR ═══════════════════════ */
::-webkit-scrollbar        { width:6px; height:6px; }
::-webkit-scrollbar-track  { background: rgba(0,0,0,.15); }
::-webkit-scrollbar-thumb  { background: #0d9488; border-radius:4px; }
.scrollbar-hide            { -ms-overflow-style:none; scrollbar-width:none; }
.scrollbar-hide::-webkit-scrollbar { display:none; }

/* ═══════════════════════════════════════════════════════════
   SHOP CONTROL BAR
═══════════════════════════════════════════════════════════ */
.shop-control {
  --spacing-x: 10px;
  --spacing-y: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  column-gap: var(--spacing-x);
  row-gap: var(--spacing-y);
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  z-index: 20;
}

/* Columns */
.shop-col { flex: 0 0 auto; max-width: 100%; }

.shop-col--filter {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}
.shop-col--layout { flex: 0 0 auto; }
.shop-col--sort   { flex: 0 0 auto; position: relative; }

@media (max-width: 479px) {
  .shop-col--filter { flex-basis: 100%; order: 1; }
  .shop-col--layout { order: 2; }
  .shop-col--sort   { order: 3; }
}

@media (max-width: 360px) {
  .shop-col--filter { flex-basis: 100%; order: 1; }
  .shop-col--layout { order: 2; }
  .shop-col--sort   { order: 3; }
}

/* ─── Control button ─── */
.ctrl-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 13px; border-radius: 9px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--heading);
  font-size: 13px; font-weight: 500;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: border-color .2s, background .2s, color .2s;
}
.ctrl-btn:hover,
.ctrl-btn--active {
  border-color: #0d9488;
  color: #0d9488;
  background: rgba(13,148,136,.08);
}

.ctrl-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width:17px; height:17px; border-radius:50%;
  background:#0d9488; color:#fff;
  font-size:10px; font-weight:700;
}

/* ─── Category pills ─── */
.cat-pills-wrap { flex:1 1 0; min-width:0; overflow:hidden; }
.cat-pills {
  display:flex; align-items:center; gap:6px;
  overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none;
  padding-bottom:2px;
}
.cat-pills::-webkit-scrollbar { display:none; }

.pill {
  flex-shrink:0;
  padding:5px 12px; border-radius:999px;
  border:1px solid var(--input-border);
  background:transparent; color:var(--subtext);
  font-size:12px; font-weight:500; white-space:nowrap; cursor:pointer;
  transition: all .2s;
}
.pill:hover   { border-color:#0d9488; color:#0d9488; }
.pill--active { background:#0d9488; border-color:#0d9488; color:#fff; }

/* ─── Layout switcher ─── */
.layout-switch {
  display:flex; align-items:center; gap:2px;
  padding:4px; border-radius:10px;
  border:1px solid var(--input-border);
  background:var(--input-bg);
}
.layout-btn {
  display:inline-flex; align-items:center; justify-content:center;
  width:33px; height:29px; border-radius:7px; border:none;
  background:transparent; color:var(--subtext);
  cursor:pointer; transition:background .15s, color .15s;
}
.layout-btn:hover     { background:rgba(13,148,136,.1); color:#0d9488; }
.layout-btn--active   { background:rgba(13,148,136,.15); color:#0d9488; }
@media (max-width:479px) { .layout-btn--hide-xs { display:none; } }
@media (max-width:767px) { .layout-btn--hide-md { display:none; } }

/* ─── Sort button ─── */
.ctrl-btn--sort { min-width:110px; justify-content:space-between; }
.sort-label-mobile  { display:block; }
.sort-label-desktop { display:none; }
@media (min-width:640px) {
  .sort-label-mobile  { display:none; }
  .sort-label-desktop { display:block; }
}
.sort-chevron { transition:transform .22s ease; flex-shrink:0; }
.sort-chevron--up { transform:rotate(180deg); }

/* ─── Sort dropdown ─── */
.sort-wrap { position:relative; }
.sort-dropdown {
  position:absolute; top:calc(100% + 6px); right:0;
  min-width:195px; border-radius:12px;
  border:1px solid var(--input-border);
  background:var(--modal-bg, var(--card-bg));
  box-shadow:0 16px 40px rgba(0,0,0,.28);
  z-index:100; overflow:hidden; padding:5px;
}
.sort-dropdown__label {
  font-size:11px; font-weight:600; text-transform:uppercase;
  letter-spacing:.06em; color:var(--subtext); padding:6px 10px 4px;
}
.sort-opt {
  display:flex; align-items:center; gap:8px;
  width:100%; padding:7px 10px;
  border:none; background:transparent;
  color:var(--heading); font-size:13px; text-align:left;
  cursor:pointer; border-radius:8px; transition:background .15s;
}
.sort-opt:hover   { background:rgba(13,148,136,.10); }
.sort-opt--active { color:#0d9488; font-weight:600; }
.sort-opt__check  { width:16px; height:16px; flex-shrink:0; color:#0d9488; }
.sort-overlay     { position:fixed; inset:0; z-index:99; }

/* ─── Filters panel ─── */
.filters-drawer {
  margin-bottom:16px; padding:16px;
  border-radius:12px; border:1px solid var(--card-border);
  background:var(--panel-bg); backdrop-filter:blur(12px);
}

/* ═══════════════════════════════════════════════════════════
   PRODUCTS GRID  (layout driven by currentLayout)
═══════════════════════════════════════════════════════════ */
.products-grid {
  display:grid;
  gap:12px; width:100%;
  grid-template-columns:repeat(2, 1fr);   /* mobile default */
}
/* Layout modifier classes set the column count */
.products-grid.layout-list { grid-template-columns:1fr; }
.products-grid.layout-2    { grid-template-columns:repeat(2,1fr); }
.products-grid.layout-3    { grid-template-columns:repeat(3,1fr); }
.products-grid.layout-4    { grid-template-columns:repeat(4,1fr); }

/* Clamp on small screens regardless of layout chosen */
@media (max-width:479px) {
  .products-grid.layout-3,
  .products-grid.layout-4 { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:767px) {
  .products-grid.layout-4 { grid-template-columns:repeat(2,1fr); }
}

/* Gap scaling */
@media (min-width:480px)  { .products-grid { gap:14px; } }
@media (min-width:640px)  { .products-grid { gap:16px; } }
@media (min-width:768px)  { .products-grid { gap:20px; } }
@media (min-width:1280px) { .products-grid { gap:24px; } }

/* ═══════════════════════ CARD ═══════════════════════ */
.card {
  background:var(--card-bg); border:1px solid var(--card-border);
  border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,.1);
  padding:10px; width:100%; max-width:none; margin:0;
  position:relative; text-align:center;
  transition:transform .3s ease, box-shadow .3s ease, border-color .2s;
  box-sizing:border-box;
}
@media (min-width:480px) { .card { padding:12px; } }
@media (min-width:768px) { .card { padding:15px; } }
.card:hover { transform:scale(1.02); box-shadow:0 8px 24px rgba(13,148,136,.15); border-color:rgba(13,148,136,.28); }
@media (hover:none) { .card:hover { transform:none; } }

/* ─── Image ─── */
.image-container { position:relative; width:100%; aspect-ratio:1/1; overflow:hidden; border-radius:6px; }
.image-container img { width:100%; height:100%; object-fit:cover; display:block; }

/* ─── Discount badge ─── */
.discount-badge {
  z-index:10; position:absolute; top:0; left:0;
  background:#bc1e20; color:#fff;
  font-size:9px; padding:2px 5px; font-weight:bold;
  border-bottom-right-radius:.6rem; border-top-left-radius:.6rem;
}
@media (min-width:640px) { .discount-badge { font-size:10px; padding:2px 6px; } }
@media (min-width:768px) { .discount-badge { font-size:11px; } }

/* ─── Add to cart ─── */
.add-to-cart {
  background:var(--btn-add-cart-bg, #10b981);
  transition:background .3s, transform .2s;
  border:none; color:white; padding:8px; border-radius:50%; cursor:pointer;
  width:36px; height:36px; position:absolute; bottom:0; right:0;
  box-shadow:0 2px 5px rgba(0,0,0,.2);
  display:flex; align-items:center; justify-content:center;
}
@media (min-width:480px)  { .add-to-cart { width:40px; height:40px; } }
@media (min-width:768px)  { .add-to-cart { width:44px; height:44px; } }
@media (min-width:1024px) { .add-to-cart { width:50px; height:50px; } }
.add-to-cart:hover { background:var(--btn-add-cart-hover,#059669); transform:scale(1.05); }
.add-to-cart svg { width:16px; height:20px; fill:white; }
@media (min-width:480px) { .add-to-cart svg { width:18px; height:22px; } }
@media (min-width:768px)  { .add-to-cart svg { width:20px; height:25px; } }

/* ─── Product info ─── */
.product-info { width:100%; height:50px; position:relative; direction:rtl; display:inline-block; margin-top:6px; }
.discount-price { position:relative; right:0; display:flex; align-items:center; height:35px; }
.dot-price-currency { box-sizing:border-box; margin:5px 4px 0 0; display:inline-block; vertical-align:top; position:absolute; top:0; right:0; }
.dot-price    { font-size:9px; line-height:10px; font-weight:700; color:var(--price-color); }
.not-dotprice { font-size:18px; line-height:28px; display:inline-block; font-weight:700; position:absolute; right:18px; bottom:0; color:var(--price-color); }
@media (min-width:480px) { .dot-price { font-size:10px; } .not-dotprice { font-size:20px; right:20px; } }
.original-price { font-size:11px; position:absolute; bottom:0; right:0; display:flex; align-items:center; flex-wrap:wrap; }
.original-price .price { text-decoration:line-through;color:var(--subtext); }
.currency-in-dot { font-size:7px; line-height:7px; font-weight:400; color:var(--heading); }
.currency        { font-size:11px; color:var(--subtext); }
.product-name {
  color:var(--heading); transition:color .3s;
  text-decoration:none; font-size:12px; font-weight:bold;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  overflow:hidden; line-height:1.4; margin-top:4px;
}
@media (min-width:480px)  { .product-name { font-size:13px; } }
@media (min-width:640px)  { .product-name { font-size:14px; } }
@media (min-width:768px)  { .product-name { font-size:15px; } }
@media (min-width:1024px) { .product-name { font-size:16px; } }

.original-price .original-price-discount .discount-label {
  color:var(--discount-label-color, red); font-size:10px; font-weight:bold;
  margin-bottom:5px; margin-right:6px;
}
@media (min-width:640px) {
  .original-price { font-size:13px; }
  .original-price .original-price-discount .discount-label { font-size:11px; margin-right:10px; }
  .currency { font-size:13px; }
}

/* ─── Filter buttons ─── */
.cat-btn          { color:var(--heading); border-color:var(--card-border); }
.cat-btn-active   { background:rgba(13,148,136,.15); color:#0d9488; border-color:rgba(13,148,136,.4); }
.cat-btn-inactive { color:var(--subtext); border-color:var(--card-border); }
.cat-btn-inactive:hover { border-color:var(--input-border); color:var(--heading); }
.price-track { background:var(--track-bg); border:1px solid var(--track-border); }
.field-input { background:var(--input-bg); border:1px solid var(--input-border); color:var(--input-color); }
.field-input::placeholder { color:var(--subtext); opacity:.7; }

/* ─── Pagination ─── */
.pag-btn {
  background:var(--card-bg); border:1px solid var(--card-border);
  color:var(--subtext); cursor:pointer;
}
.pag-btn:hover:not(:disabled) { border-color:#0d9488; color:#0d9488; }
.pag-btn--active {
  background:linear-gradient(135deg,#0d9488,#10b981);
  color:#fff; border:none;
  box-shadow:0 4px 14px rgba(13,148,136,.35);
}

/* ─── Mobile bottom bar ─── */
.mobile-bottom-bar {
  background:var(--tab-bar);
  backdrop-filter:blur(16px);
}
.mobile-tab-btn { color:var(--tab-inactive); transition:color .2s; }
.mobile-tab-btn:hover { color:#0d9488; }
.cart-fab { background:var(--btn-add-cart-bg, linear-gradient(135deg,#10b981,#0d9488)); transition:transform .15s; }


/* <!-- ════════════════════════════════════════════════════════════
     ③ CSS — add inside <style scoped> (replaces old qty-control)
════════════════════════════════════════════════════════════ --> */

/* ─── Quantity row sits below the product name ─── */
.qty-row {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

/* ── Zero-state: single pill "Add" button ── */
.qty-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 7px 0;
  border-radius: 10px;
  border: none;
  background: var(--btn-add-cart-bg, linear-gradient(135deg,#0d9488,#10b981));
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .02em;
  cursor: pointer;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1),
              box-shadow .18s ease,
              filter .18s ease;
  box-shadow: 0 3px 10px rgba(13,148,136,.28);
}
.qty-add-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(13,148,136,.40);
}
.qty-add-btn:active {
  transform: scale(.96);
}
@media (min-width:480px) {
  .qty-add-btn { font-size: 13px; padding: 8px 0; border-radius: 11px; }
}

/* ── Non-zero: stepper − n + ── */
.qty-stepper {
  display: inline-flex;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid rgba(13,148,136,.45);
  background: var(--input-bg);
}

.qty-btn {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background .15s, color .15s, transform .12s;
  background: transparent;
  color: #0d9488;
}
.qty-btn--minus { border-right: 1.5px solid rgba(13,148,136,.25); }
.qty-btn--plus  { border-left:  1.5px solid rgba(13,148,136,.25); }

.qty-btn:hover  { background: rgba(13,148,136,.14); }
.qty-btn:active { transform: scale(.88); }

.qty-btn--plus:hover  { color: #10b981; }
.qty-btn--minus:hover { color: #f43f5e; }

.qty-count {
  flex: 1 1 auto;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--heading);
  line-height: 1;
  min-width: 0;
  user-select: none;
}

@media (min-width:480px) {
  .qty-btn   { width: 36px; height: 36px; }
  .qty-count { font-size: 15px; }
}
@media (min-width:768px) {
  .qty-btn   { width: 38px; height: 38px; }
}

/* Stepper pop-in animation when it first appears */
.qty-stepper {
  animation: stepperIn .22s cubic-bezier(.34,1.56,.64,1);
}
@keyframes stepperIn {
  from { opacity:0; transform:scale(.85); }
  to   { opacity:1; transform:scale(1); }
}
.social-icons ion-icon[name="logo-youtube"]:hover {
  transform: scale(1.2);
  color: #cc0000;
}
/* Snapchat */
.social-icons ion-icon[name="logo-snapchat"]:hover{
  color: yellow;
}
.social-icons ion-icon[name="logo-twitter"]:hover {
  transform: scale(1.2);
  color: #0d8ddb;
}
.social-icons ion-icon[name="logo-tiktok"]:hover {
  transform: scale(1.2);
   color: #010101;
}
.social-icons ion-icon[name="logo-facebook"]:hover {
  transform: scale(1.2);
  color: #3b5998;
}
.social-icons ion-icon[name="logo-instagram"]:hover {
  transform: scale(1.2);
  color: #C13584;
}


.hdt-circle-css {
  --border-w: 4px;
  --circle-degrees: 0deg;

  position: fixed;
  bottom: 30px;
  right: 30px;

  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #111;
  color: white;
  z-index: 999;
}

.hdt-circle-css::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: var(--border-w);

  background: conic-gradient(
    #00ffff var(--circle-degrees),
    rgba(255,255,255,0.15) 0deg
  );

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}

.hdt-circle--inner {
  position: relative;
  z-index: 2;
  font-size: 20px;
}
</style>
