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

    <!-- Custom Message Toast -->
    <Transition name="slide-fade">
      <div
        v-if="message.show"
        :class="message.type === 'success'
          ? 'bg-emerald-500/90 shadow-emerald-500/50'
          : 'bg-red-500/90 shadow-red-500/50'"
        class="fixed top-6 right-6 px-6 py-3 rounded-xl heading-text text-sm font-medium shadow-lg backdrop-blur-sm z-50 flex items-center gap-3"
      >
        <span>{{ message.type === 'success' ? '✓' : '✕' }}</span>
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
          <button
            @click="showSuccessBanner = false"
            class="text-slate-400 hover:heading-text transition flex-shrink-0 ml-2"
          >
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
      <div class="mb-4 sm:mb-6 text-xs sm:text-sm text-slate-400 flex items-center gap-2">
        <router-link
          :to="{ name: 'Supermarket' }"
          class="text-emerald-400 hover:text-teal-400 transition"
        >
          الرئيسية
        </router-link>
        <span class="text-slate-600">/</span>
        <span class="text-slate-300 truncate max-w-[200px]">{{ selectedCategory }}</span>
      </div>

      <!-- Page Title -->
      <div class="mb-6 sm:mb-10">
        <h1 class="text-xl sm:text-2xl font-black heading-text mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          {{ selectedCategory }}
        </h1>
        <p class="subtext font-light text-xs sm:text-sm">Discover the best products carefully selected for you</p>
      </div>

      <!-- Mobile Filter Toggle Button -->
       <div class="mb-30px --spacing-x: 10px  flex cols-3 row-flex
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	column-gap: var(--spacing-x);
	row-gap: var(--spacing-y);
  align-item center
  justify-content space-between
">
         <div class= "filter" style="
           flex: 0 0 auto;
           max-width: 100%;
           width: calc(100% / var(--cols) - (var(--spacing-x, 0px) * calc(var(--cols) - 1) / var(--cols)));">
           <button
             @click="mobileFiltersOpen = !mobileFiltersOpen"
             class="flex items-center gap-2 px-4 py-2 panel-bg rounded-xl border border-slate-700 text-sm heading-text transition hover:border-emerald-500"
           >
               <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M0 1C0 0.734784 0.105357 0.48043 0.292893 0.292893C0.48043 0.105357 0.734784 0 1 0H19C19.2652 0 19.5196 0.105357 19.7071 0.292893C19.8946 0.48043 20 0.734784 20 1C20 1.26522 19.8946 1.51957 19.7071 1.70711C19.5196 1.89464 19.2652 2 19 2H1C0.734784 2 0.48043 1.89464 0.292893 1.70711C0.105357 1.51957 0 1.26522 0 1ZM3 6C3 5.73478 3.10536 5.48043 3.29289 5.29289C3.48043 5.10536 3.73478 5 4 5H16C16.2652 5 16.5196 5.10536 16.7071 5.29289C16.8946 5.48043 17 5.73478 17 6C17 6.26522 16.8946 6.51957 16.7071 6.70711C16.5196 6.89464 16.2652 7 16 7H4C3.73478 7 3.48043 6.89464 3.29289 6.70711C3.10536 6.51957 3 6.26522 3 6ZM8 10C7.73478 10 7.48043 10.1054 7.29289 10.2929C7.10536 10.4804 7 10.7348 7 11C7 11.2652 7.10536 11.5196 7.29289 11.7071C7.48043 11.8946 7.73478 12 8 12H12C12.2652 12 12.5196 11.8946 12.7071 11.7071C12.8946 11.5196 13 11.2652 13 11C13 10.7348 12.8946 10.4804 12.7071 10.2929C12.5196 10.1054 12.2652 10 12 10H8Z" fill="currentColor"></path>
               </svg>
             <span>Filters</span>
             <span v-if="activeFiltersCount > 0" class="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
               {{ activeFiltersCount }}
             </span>
           </button>

           <!-- Mobile Category Quick Scroll -->
           <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-[calc(100%-120px)]">
             <button
               v-for="cat in categories.slice(0, 5)"
               :key="cat"
               @click="handleCategoryChange(cat)"
               :class="selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-700 text-slate-400'"
               class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition whitespace-nowrap"
             >
               {{ cat }}
             </button>
           </div>
         </div>
          <div class="layout"></div>
          <div class="sorting"></div>
       </div>

      <!-- Mobile Filters Drawer -->
      <Transition name="slide-down">
        <div v-if="mobileFiltersOpen" class="lg:hidden mb-4 panel-bg rounded-xl border border-slate-700 p-4">
          <!-- Categories -->
          <h3 class="font-bold text-sm heading-text mb-3">التصنيفات</h3>
          <div class="flex flex-wrap gap-2 mb-5">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="handleCategoryChange(cat); mobileFiltersOpen = false"
              :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
              class="text-xs px-3 py-1.5 rounded-lg border transition cat-btn"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Price -->
          <h3 class="font-bold text-sm heading-text mb-3">Price Range</h3>
          <p class="text-emerald-400 font-bold text-sm mb-3">
            {{ formatCurrency(priceRange.min) }} - {{ formatCurrency(priceRange.max) }}
          </p>
          <div class="flex gap-3">
            <input
              v-model.number="priceRange.min"
              type="number" min="0" max="35000"
              @change="filterAndLoadProducts"
              class="field-input flex-1 px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Min"
            />
            <input
              v-model.number="priceRange.max"
              type="number" min="0" max="35000"
              @change="filterAndLoadProducts"
              class="field-input flex-1 px-3 py-2 rounded-lg heading-text text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Max"
            />
          </div>
        </div>
      </Transition>

      <div class="flex gap-6 lg:gap-8">
        <!-- Desktop Filters Sidebar -->
        <aside class="hidden lg:block w-56 xl:w-64 flex-shrink-0 space-y-6">
          <!-- Category Filter -->
          <div class="panel-bg backdrop-blur rounded-xl p-5">
            <h3 class="font-bold text-base heading-text mb-4">Categories</h3>
            <div class="space-y-1.5">
              <button
                v-for="cat in categories"
                :key="cat"
                @click="handleCategoryChange(cat)"
                :class="selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'"
                class="w-full text-right px-3 py-2 rounded-lg border transition cat-btn text-sm"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Price Filter -->
          <div class="panel-bg backdrop-blur rounded-xl p-5">
            <h3 class="font-bold text-base heading-text mb-3">Price Range</h3>
            <p class="text-emerald-400 font-bold mb-3 text-sm">
              {{ formatCurrency(priceRange.min) }} - {{ formatCurrency(priceRange.max) }}
            </p>
            <div class="space-y-2">
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
            <div class="price-track relative h-1 rounded-full mt-5">
              <div
                class="absolute h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                :style="{
                  left: (priceRange.min / 35000 * 100) + '%',
                  right: (100 - priceRange.max / 35000 * 100) + '%'
                }"
              ></div>
            </div>
          </div>
        </aside>

        <!-- Products Section -->
        <main class="flex-1 min-w-0">
          <!-- Loading State -->
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

          <!-- Products Grid -->
          <div v-if="!loading && paginatedProducts.length > 0" class="products-grid">
            <div
              v-for="(product, idx) in paginatedProducts"
              :key="product.item_code"
              class="card card-panel"
              :style="{ 'animation-delay': `${idx * 50}ms` }"
            >
              <span v-if="product.discount_percentage > 0" class="discount-badge">
                {{ product.discount_percentage }}% خصم
              </span>

              <div class="image-container">
                <img
                  :src="product.image ? config.FRAPPE_URL + product.image : defaultImageSrc"
                  :alt="product.item_name"
                  loading="lazy"
                />
                <button class="add-to-cart" @click="addToCart(product)" :aria-label="`Add ${product.item_name} to cart`">
                  <svg viewBox="-1 -1 26 26">
                    <polygon points="12.5,2 11.5,2 11.5,11.5 2,11.5 2,12.5 11.5,12.5 11.5,22 12.5,22 12.5,12.5 22,12.5 22,11.5 12.5,11.5" stroke="#fff" stroke-width="2"></polygon>
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

          <!-- Empty State -->
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
                class="px-3 sm:px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:heading-text hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Previous
              </button>

              <div class="flex gap-1 sm:gap-2 flex-wrap justify-center">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="currentPage = page"
                  :class="currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 heading-text shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500'"
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition font-medium text-sm flex items-center justify-center"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 sm:px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:heading-text hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Next
              </button>
            </div>
          </Transition>
        </main>
      </div>
    </div>

    <!-- Location/Map Modal -->
    <Transition name="fade">
      <div v-if="showMapModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 sm:p-8 border border-slate-700/50">
          <h2 class="text-xl sm:text-2xl font-bold heading-text mb-5 sm:mb-6">Choose Delivery Location</h2>
          <div class="space-y-4 mb-6">
            <input
              v-model="locationSearch"
              type="text"
              placeholder="Search for your Location..."
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg heading-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
            />

            <div v-if="filteredLocations.length > 0" class="space-y-2 max-h-52 overflow-y-auto">
              <button
                v-for="loc in filteredLocations"
                :key="loc"
                @click="selectLocation(loc)"
                class="w-full text-right px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-emerald-500/20 hover:border-emerald-500 transition text-sm"
              >
                📍 {{ loc }}
              </button>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showMapModal = false"
              class="flex-1 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              @click="closeMapModal"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 heading-text rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="relative z-20 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-800 mt-16 sm:mt-20">
      <div class="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8">
          <div class="col-span-2 sm:col-span-1">
            <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
              Hypermarket
            </h3>
            <p class="subtext text-xs sm:text-sm leading-relaxed">
              Your trusted online shopping platform, offering top-quality products at competitive prices.
            </p>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul class="space-y-2 subtext text-xs sm:text-sm">
              <li>
                <router-link :to="{ name: 'Supermarket' }" class="hover:text-emerald-400 transition">Supermarket</router-link>
              </li>
              <li><a href="#" class="hover:text-emerald-400 transition">Contact us</a></li>
              <li><a href="#" class="hover:text-emerald-400 transition">Loyalty Points</a></li>
            </ul>
          </div>
          <div>
            <h3 class="heading-text font-bold mb-4 text-sm sm:text-base">Contact Us</h3>
            <div class="flex gap-3">
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition text-sm">
<ion-icon name="logo-youtube"></ion-icon>
              </a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition text-sm">📧</a>
              <a href="#" class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center subtext hover:bg-emerald-500/20 hover:text-emerald-400 transition text-sm">📍</a>
            </div>
          </div>
          <div class="text-right text-slate-400 text-xs sm:text-sm">
            <p class="font-bold heading-text mb-2">© 2024 Hypermarket</p>
          </div>
        </div>
        <div class="border-t border-slate-800 pt-6 sm:pt-8 text-center text-slate-500 text-xs sm:text-sm">
          All rights reserved © 2024
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Navigation Bar -->
    <div class="fixed bottom-0 left-0 right-0 sm:hidden z-30 mobile-bottom-bar border-t border-slate-700/60 shadow-2xl">
      <div class="flex justify-around items-center py-2 px-1">

        <!-- Home -->
        <router-link :to="{ name: 'Supermarket' }" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V10"/>
          </svg>
          <span class="text-[10px] font-bold">الرئيسية</span>
        </router-link>

        <!-- Categories -->
        <button @click="mobileCatsOpen = true" class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <Shop />
          <span class="text-[10px] font-semibold">Shop</span>
        </button>

        <!-- Cart FAB -->
        <button @click="cartDrawerOpen = true" class="flex flex-col items-center gap-0.5 relative -mt-5">
          <div class="w-14 h-14 cart-fab rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1-5M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
          </div>
          <span class="text-[10px] font-semibold subtext mt-0.5">سلتي</span>
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
         <router-link :to="{ name: 'CustomerOrders' }">
           <button  class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4"/>
             </svg>
             <span class="text-[10px] font-semibold">طلباتي</span>
           </button>
         </router-link>

        <!-- Profile -->
        <button class="mobile-tab-btn flex flex-col items-center gap-0.5 py-2 px-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="text-[10px] font-semibold">
             <router-link :to="{ name: 'MyAccount' }" class="sidebar-link">
                حسابي
             </router-link>
            </span>
        </button>
      </div>
    </div>

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
import Shop from '@/components/icons/regular/Shop.svg'

// ─── Theme ────────────────────────────────────────────────────────────────────
const settingsStore = useSettingsStore()
const settings    = computed(() => settingsStore.settings)
const isDark      = computed(() => settings.value?.appearance?.theme === 'dark')

// ================= STORES =================
const router = useRouter()
const cartStore = useCartStore()
const productsStore = useProductsStore()

// ================= CONSTANTS =================
const defaultImage = '/src/assets/img/default-product.jpg'
const defaultImageSrc = `${config.VUE_URL}${defaultImage}`
const itemsPerPage = 12
const minOrderValue = 1000

// ================= STATE =================
const selectedCategory = ref('جميع التصنيفات')
const categories = ref(['جميع التصنيفات'])

const loading = ref(false)
const currentPage = ref(1)

const deliveryAddress = ref('اختر موقعك')
const showSuccessBanner = ref(false)

const priceRange = ref({ min: 0, max: 35000 })
const mobileFiltersOpen = ref(false)
const mobileCatsOpen = ref(false)
const cartDrawerOpen = ref(false)

const message = ref({
  show: false,
  text: '',
  type: 'success',
})

const showMapModal = ref(false)
const locationSearch = ref('')
const allLocations = [
  'المعادي - القاهرة',
  'حلوان - القاهرة',
  'مدينة نصر - القاهرة',
  'القاهرة الجديدة',
  'الجيزة',
]

// ========== COMPUTED ==========
const websiteProducts = ref([])

const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedCategory.value !== 'جميع التصنيفات') count++
  if (priceRange.value.min > 0 || priceRange.value.max < 35000) count++
  return count
})

const filteredProducts = computed(() => {
  return websiteProducts.value.filter(p => {
    const categoryMatch =
      selectedCategory.value === 'جميع التصنيفات' ||
      p.item_group === selectedCategory.value
    const priceMatch =
      p.rate >= priceRange.value.min &&
      p.rate <= priceRange.value.max
    return categoryMatch && priceMatch
  })
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) return allLocations
  const keyword = locationSearch.value.toLowerCase()
  return allLocations.filter(loc => loc.toLowerCase().includes(keyword))
})

// ========== METHODS ==========
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  currentPage.value = 1
}

const loadCategories = async () => {
  try {
    const response = await getItemGroup()
    const groups = response?.data
    categories.value = [
      'جميع التصنيفات',
      ...groups.map(g => g.name || g.item_group).filter(Boolean)
    ]
  } catch (err) {
    console.error('Failed to load categories', err)
  }
}

const handleLocationChange = (location) => {
  deliveryAddress.value = location
}

const handleProductSelected = (product) => {
  addToCart(product)
}

const addToCart = (product) => {
  cartStore.addToCart(product)
  if (cartStore.subtotal >= minOrderValue) {
    showSuccessBanner.value = true
  }
  showMessage('تم إضافة المنتج إلى السلة!', 'success')
}

const openMapModal = () => {
  showMapModal.value = true
  locationSearch.value = ''
}

const selectLocation = (location) => {
  deliveryAddress.value = location
  locationSearch.value = ''
  showMapModal.value = false
}

const closeMapModal = () => {
  showMapModal.value = false
}

const showMessage = (text, type = 'success') => {
  message.value = { show: true, text, type }
  setTimeout(() => {
    message.value.show = false
  }, 3000)
}

const filterAndLoadProducts = () => {
  currentPage.value = 1
}

const loadProducts = async () => {
  loading.value = true
  try {
    const websitePriceList = "Standard Selling"
    let websiteCustomer = "Guest"

    try {
      const profile = await getCustomerProfileApi()
      if (profile?.party_type === "Customer" && profile?.party_name) {
        websiteCustomer = profile.party_name
      }
    } catch (e) {
      console.log("User not logged in → Guest mode", e)
    }

    websiteProducts.value = await productsStore.loadWebsiteProducts(
      websitePriceList,
      websiteCustomer
    )
  } catch (error) {
    console.error('Error loading products:', error)
    showMessage('خطأ في تحميل المنتجات', 'error')
  } finally {
    loading.value = false
  }
}

const focusMobileSearch = () => {
  const input = document.querySelector('input[type="search"], input[placeholder*="بحث"], input[placeholder*="Search"]')
  if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
}

// ========== LIFECYCLE ==========
onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts()])
})
</script>


<style scoped>
/* ═══════════════════════ TRANSITIONS ═══════════════════════ */
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from,   .slide-fade-leave-to     { transform: translateX(30px);  opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from,   .slide-down-leave-to     { transform: translateY(-20px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.drawer-slide-enter-active,
.drawer-slide-leave-active { transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-slide-enter-from,
.drawer-slide-leave-to     { transform: translateX(100%); }

.sheet-up-enter-active, .sheet-up-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-up-enter-from,   .sheet-up-leave-to     { transform: translateY(100%); }

.cart-list-enter-active { transition: all 0.28s ease; }
.cart-list-leave-active { transition: all 0.2s ease; }
.cart-list-enter-from   { opacity: 0; transform: translateX(20px); }
.cart-list-leave-to     { opacity: 0; transform: translateX(-20px); }

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

/* ═══════════════════════ PRODUCT GRID — RESPONSIVE ═══════════════════════ */
/*
  xs  (<480px) : 2 columns
  sm  (480px+) : 2 columns
  md  (640px+) : 3 columns  (no sidebar present)
  lg  (1024px+): sidebar shows → 3 columns inside main
  xl  (1280px+): sidebar shows → 4 columns inside main
*/
.products-grid {
  display: grid;
  gap: 12px;
  width: 100%;
  /* Default: 2 columns for mobile */
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 480px) {
  .products-grid { gap: 14px; }
}

@media (min-width: 640px) {
  /* No sidebar → 3 cols */
  .products-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

@media (min-width: 768px) {
  .products-grid { gap: 20px; }
}

@media (min-width: 1024px) {
  /* Sidebar present → 3 cols in main */
  .products-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}

@media (min-width: 1280px) {
  /* Wider sidebar → 4 cols */
  .products-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; }
}

/* ═══════════════════════ CARD ═══════════════════════ */
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 10px;
  width: 100%;           /* fill grid cell */
  max-width: none;       /* remove old fixed max-width */
  margin: 0;
  position: relative;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  box-sizing: border-box;
}

@media (min-width: 480px) { .card { padding: 12px; } }
@media (min-width: 768px) { .card { padding: 15px; } }

.card:hover { transform: scale(1.03); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
/* Disable scale on touch to avoid layout shift */
@media (hover: none) { .card:hover { transform: none; } }

/* ═══════════════════════ IMAGE CONTAINER ═══════════════════════ */
.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 6px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ═══════════════════════ DISCOUNT BADGE ═══════════════════════ */
.discount-badge {
  z-index: 10;
  position: absolute; top: 0; left: 0;
  background-color: #bc1e20; color: #fff;
  font-size: 9px; padding: 2px 5px; font-weight: bold;
  border-bottom-right-radius: 0.6rem;
  border-top-left-radius: 0.6rem;
}

@media (min-width: 640px) {
  .discount-badge { font-size: 10px; padding: 2px 6px; }
}
@media (min-width: 768px) {
  .discount-badge { font-size: 11px; }
}

/* ═══════════════════════ ADD TO CART BUTTON ═══════════════════════ */
.add-to-cart {
  background: var(--btn-add-cart-bg, #10b981);
  transition: background .3s, transform .2s;
  border: none; color: white;
  padding: 8px; border-radius: 50%; cursor: pointer;
  width: 36px; height: 36px;
  position: absolute; bottom: 0; right: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
}

@media (min-width: 480px) { .add-to-cart { width: 40px; height: 40px; } }
@media (min-width: 768px) { .add-to-cart { width: 44px; height: 44px; } }
@media (min-width: 1024px) { .add-to-cart { width: 50px; height: 50px; } }

.add-to-cart:hover { background: var(--btn-add-cart-hover, #059669); transform: scale(1.05); }
.add-to-cart svg   { width: 16px; height: 20px; fill: white; }

@media (min-width: 480px) { .add-to-cart svg { width: 18px; height: 22px; } }
@media (min-width: 768px)  { .add-to-cart svg { width: 20px; height: 25px; } }

/* ═══════════════════════ PRODUCT INFO ═══════════════════════ */
.product-info     { width:100%; height:50px; position:relative; direction:rtl; display:inline-block; margin-top: 6px; }
.discount-price   { position:relative; right:0; display:flex; align-items:center; height:35px; }
.dot-price-currency {
  box-sizing:border-box; margin:5px 4px 0 0;
  display:inline-block; vertical-align:top;
  position:absolute; top:0; right:0;
}
.dot-price        { font-size:9px; line-height:10px; font-weight:700; color:var(--price-color); }
.not-dotprice     { font-size:18px; line-height:28px; display:inline-block; font-weight:700; position:absolute; right:18px; bottom:0; color:var(--price-color); }

@media (min-width: 480px) {
  .dot-price { font-size:10px; }
  .not-dotprice { font-size:20px; right:20px; }
}

.original-price   { font-size:11px; position:absolute; bottom:0; right:0; display:flex; align-items:center; flex-wrap: wrap; }
.original-price .price { text-decoration: line-through; }
.currency-in-dot  { font-size:7px; line-height:7px; font-weight:400; color:var(--heading); }
.currency         { font-size:11px; color:var(--subtext); }
.product-name     {
  color: var(--heading); transition: color .3s;
  text-decoration: none; font-size: 12px; font-weight: bold;
  display: block; text-align: center; margin-top: 4px;
  /* Clamp to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

@media (min-width: 480px) { .product-name { font-size: 13px; } }
@media (min-width: 640px) { .product-name { font-size: 14px; } }
@media (min-width: 768px) { .product-name { font-size: 15px; } }
@media (min-width: 1024px) { .product-name { font-size: 16px; } }

.original-price .original-price-discount .discount-label {
  color: red; font-size: 10px; font-weight: bold;
  margin-bottom: 5px; margin-right: 6px;
}

@media (min-width: 640px) {
  .original-price { font-size: 13px; }
  .original-price .original-price-discount .discount-label { font-size: 11px; margin-right: 10px; }
  .currency { font-size: 13px; }
}

/* ═══════════════════════ FILTER STYLES ═══════════════════════ */
.cat-btn          { color:var(--heading); border-color:var(--card-border); }
.cat-btn-active   { background:rgba(16,185,129,0.15); color:#10b981; border-color:rgba(16,185,129,0.45); }
.cat-btn-inactive { color:var(--subtext); border-color:var(--card-border); }
.cat-btn-inactive:hover { border-color:var(--input-border); color:var(--heading); }
.price-track      { background:var(--track-bg); border:1px solid var(--track-border); }
.field-input      { background:var(--input-bg); border:1px solid var(--input-border); color:var(--input-color); }
.field-input::placeholder { color:var(--subtext); opacity:0.7; }

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
</style>
