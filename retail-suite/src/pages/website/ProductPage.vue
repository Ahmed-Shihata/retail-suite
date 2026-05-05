<!-- ProductPage.vue -->
<template>
  <div :class="isDark ? 'theme-dark' : 'theme-light'" class="product-page min-h-screen transition-colors duration-500">

    <!-- Floating bg blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="blob blob-1 absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div class="blob blob-2 absolute bottom-40 right-10 w-64 h-64 rounded-full blur-3xl animate-pulse opacity-40" style="animation-delay:1.2s"></div>
    </div>

    <!-- Breadcrumb -->
    <div class="relative z-10 max-w-6xl mx-auto px-4 pt-4 pb-2">
      <nav class="flex items-center gap-1.5 text-xs" style="color:var(--subtext)">
        <router-link to="/" class="hover:text-emerald-500 transition">Home</router-link>
        <span>/</span>
        <router-link :to="{ name: 'Supermarket' }" class="hover:text-emerald-500 transition">Supermarket</router-link>
        <span>/</span>
        <span style="color:var(--heading)" class="truncate max-w-[160px]">{{ product.name }}</span>
      </nav>
    </div>

    <!-- ══════════ MAIN PRODUCT SECTION ══════════ -->
    <div class="relative z-10 max-w-6xl mx-auto px-4 py-4 md:py-8">
      <div class="product-main-grid">

        <!-- LEFT: Image gallery -->
        <div class="gallery-col">
          <!-- Main image -->
          <div class="main-image-wrap">
            <!-- Discount badge -->
            <div v-if="product.discount > 0" class="img-discount-badge">
              {{ product.discount }}% OFF
              <span v-if="product.dealEnds" class="badge-sub">Ends in {{ product.dealEnds }}</span>
            </div>
            <!-- Share button -->
            <button class="share-btn" @click="shareProduct" title="Share">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" stroke="currentColor">
                <path d="M14 23C15.66 23 17 21.66 17 20C17 18.34 15.66 17 14 17C12.34 17 11 18.34 11 20C11 21.66 12.34 23 14 23Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                <path d="M24.5 29.75C26.16 29.75 27.5 28.41 27.5 26.75C27.5 25.09 26.16 23.75 24.5 23.75C22.84 23.75 21.5 25.09 21.5 26.75C21.5 28.41 22.84 29.75 24.5 29.75Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                <path d="M24.5 16.25C26.16 16.25 27.5 14.91 27.5 13.25C27.5 11.59 26.16 10.25 24.5 10.25C22.84 10.25 21.5 11.59 21.5 13.25C21.5 14.91 22.84 16.25 24.5 16.25Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                <path d="M21.98 14.87L16.52 18.38" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                <path d="M16.52 21.62L21.98 25.13" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
              </svg>
            </button>

            <transition name="img-fade" mode="out-in">
              <img
                :key="activeImage"
                :src="activeImage"
                :alt="product.name"
                class="main-product-img"
              />
            </transition>
          </div>

          <!-- Thumbnails -->
          <div class="thumbs-row">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              @click="activeImage = img"
              :class="['thumb-btn', activeImage === img ? 'thumb-btn--active' : '']"
            >
              <img :src="img" :alt="`view ${i+1}`" />
              <div v-if="i === product.images.length - 1 && product.extraImages > 0" class="thumb-overlay">
                +{{ product.extraImages }}
              </div>
            </button>
          </div>
        </div>

        <!-- RIGHT: Product info -->
        <div class="info-col">

          <!-- Seller tag -->
          <p class="seller-tag">
            More from <a href="#" class="seller-link">{{ product.seller }}</a>
          </p>

          <!-- Product name -->
          <h1 class="product-title">{{ product.name }}</h1>

          <!-- Price block -->
          <div class="price-block">
            <div class="price-main">
              <span class="price-currency">{{ product.currency }}</span>
              <span class="price-integer">{{ priceInt }}</span>
              <span class="price-decimal">.{{ priceDecimal }}</span>
            </div>
            <div v-if="product.originalPrice" class="price-original">
              {{ product.currency }} {{ product.originalPrice }}
            </div>
            <div v-if="product.discount > 0" class="price-off">{{ product.discount }}% off</div>
          </div>
          <p class="vat-note">Including VAT</p>

          <!-- Sold by -->
          <div class="sold-by-box">
            <p class="sold-by-label">Sold &amp; Shipped</p>
            <p class="sold-by-value">{{ product.seller }}</p>
          </div>

          <!-- Qty + Add to cart -->
          <div class="cart-action-row">
            <div class="qty-stepper">
              <button @click="decreaseQty" class="qty-btn qty-btn--minus" :disabled="qty <= 1">
                <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
                  <rect width="14" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <span class="qty-number">{{ qty }}</span>
              <button @click="qty++" class="qty-btn qty-btn--plus">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="6" width="2" height="14" rx="1" fill="currentColor"/>
                  <rect y="6" width="14" height="2" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>

            <button @click="addToCart" class="add-to-cart-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 6M7 13l-1-5M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              Add to Cart
            </button>
          </div>

          <!-- Highlights -->
          <div class="highlights-box">
            <h3 class="highlights-title">Highlights</h3>
            <ul class="highlights-list">
              <li v-for="(h, i) in product.highlights" :key="i">{{ h }}</li>
            </ul>
          </div>

          <!-- Accordion sections -->
          <div class="accordion-list">
            <div
              v-for="section in accordionSections"
              :key="section.key"
              class="accordion-item"
            >
              <button @click="toggleAccordion(section.key)" class="accordion-trigger">
                <span>{{ section.label }}</span>
                <svg
                  :class="['accordion-icon', openAccordion === section.key ? 'accordion-icon--open' : '']"
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
              <Transition name="acc-slide">
                <div v-if="openAccordion === section.key" class="accordion-body">
                  {{ section.content }}
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ FREQUENTLY BOUGHT TOGETHER ══════════ -->
    <section class="relative z-10 max-w-6xl mx-auto px-4 py-6">
      <div class="section-card">
        <h2 class="section-title">Frequently Bought Together</h2>
        <div class="fbt-list">
          <div v-for="(item, i) in fbtItems" :key="i" class="fbt-item">
            <div class="fbt-check-wrap">
              <button
                @click="item.checked = !item.checked"
                :class="['fbt-check', item.checked ? 'fbt-check--on' : '']"
              >
                <svg v-if="item.checked" width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="white" stroke-width="2">
                  <path d="M1 5l3.5 3.5L11 1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <img :src="item.image" :alt="item.name" class="fbt-img" />
            <div class="fbt-info">
              <p class="fbt-name">{{ item.name }}</p>
              <div class="fbt-price-row">
                <span class="fbt-price">{{ item.currency }} {{ item.price }}</span>
                <span v-if="item.originalPrice" class="fbt-original">{{ item.currency }} {{ item.originalPrice }}</span>
                <span v-if="item.discount" class="fbt-discount">{{ item.discount }}% off</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="addAllFbt" class="fbt-add-all-btn">
          Add All to Cart ({{ fbtTotalLabel }})
        </button>
      </div>
    </section>

    <!-- ══════════ RELATED PRODUCTS CAROUSEL ══════════ -->
    <section class="relative z-10 max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="section-title" style="margin:0">Most Popular</h2>
        <a href="#" class="see-all-link">See All</a>
      </div>

      <div class="carousel-wrap">
        <button @click="scrollCarousel(-1)" class="carousel-arrow carousel-arrow--left">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 1L1 9l8 8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="carousel-track" ref="carouselRef">
          <div
            v-for="(p, i) in relatedProducts"
            :key="i"
            class="related-card"
          >
            <div class="related-card__inner">
              <div v-if="p.discount" class="related-badge">{{ p.discount }}% off</div>
              <div class="related-img-wrap">
                <img :src="p.image" :alt="p.name" />
              </div>
              <button @click="addRelatedToCart(p)" class="related-add-btn" :title="'Add ' + p.name">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="6" width="2" height="14" rx="1" fill="white"/>
                  <rect y="6" width="14" height="2" rx="1" fill="white"/>
                </svg>
              </button>
            </div>
            <p class="related-name">{{ p.name }}</p>
            <div class="related-price-row">
              <span class="related-price-int">{{ p.priceInt }}</span>
              <span class="related-price-frac">.{{ p.priceFrac }}<br><small>{{ p.currency }}</small></span>
            </div>
            <div v-if="p.originalPrice" class="related-original">{{ p.currency }} {{ p.originalPrice }}</div>
          </div>
        </div>
        <button @click="scrollCarousel(1)" class="carousel-arrow carousel-arrow--right">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 1l8 8-8 8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </section>

    <!-- Toast -->
    <Transition name="slide-fade">
      <div v-if="toast.show" class="toast" :class="toast.type === 'success' ? 'toast--success' : 'toast--error'">
        {{ toast.text }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import config from '@/config/frappe'

const props = defineProps({ id: String })

const productsStore = useProductsStore()
// ─── Theme
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
const isDark = computed(() => settings.value?.appearance?.theme === 'dark')

const cartStore = useCartStore()
const carouselRef = ref(null)
const qty = ref(1)
const openAccordion = ref(null)
const toast = ref({ show: false, text: '', type: 'success' })

// ─── Product data (replace with props / API in production)
const product = ref({
  id: '643679',
  name: 'Ahl Alqema White Rice - 1 Kg',
  seller: 'Carrefour',
  currency: 'EGP',
  price: 19.99,
  originalPrice: '25.95',
  discount: 23,
  dealEnds: '2 days',
  extraImages: 3,
  highlights: [
    'Renders a delicious taste to rice-based recipes',
    'Presents carefully picked grains for maintaining fine-quality standards',
    'Smooth texture prevents it from becoming sticky after cooking',
  ],
  images: [
    'https://cdn.mafrservices.com/pim-content/EGY/media/product/643679/1734340204/643679_main.jpg?im=Resize=400',
    'https://cdn.mafrservices.com/pim-content/EGY/media/product/643679/1747729803/643679_1.jpg?im=Resize=400',
    'https://cdn.mafrservices.com/pim-content/EGY/media/product/643679/1747729803/643679_2.jpg?im=Resize=400',
    'https://cdn.mafrservices.com/pim-content/EGY/media/product/643679/1747729803/643679_3.jpg?im=Resize=400',
    'https://cdn.mafrservices.com/pim-content/EGY/media/product/643679/1747729803/643679_4.jpg?im=Resize=400',
  ],
})

const activeImage = ref(product.value.images[0])
const priceInt = computed(() => Math.floor(product.value.price))
const priceDecimal = computed(() => (product.value.price % 1).toFixed(2).split('.')[1])

// ─── Accordion
const accordionSections = [
  { key: 'ingredients', label: 'Ingredients', content: 'White Rice (100%). May contain traces of gluten.' },
  { key: 'nutrition', label: 'Nutrition Facts', content: 'Per 100g: Energy 365kcal, Carbohydrates 80g, Protein 7g, Fat 0.6g, Fibre 1.4g.' },
  { key: 'description', label: 'Description', content: 'Ahl Alqema White Rice is a premium Egyptian rice variety known for its long, slender grains and exceptional cooking quality.' },
  { key: 'information', label: 'Information', content: 'Store in a cool, dry place. Best before: see packaging. Country of origin: Egypt.' },
]
const toggleAccordion = (key) => {
  openAccordion.value = openAccordion.value === key ? null : key
}

// ─── FBT
const fbtItems = ref([
  { name: 'Akwam White Sugar - 1 kg', price: '24.99', originalPrice: '28.95', discount: 14, currency: 'EGP', checked: true, image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/667625/1765702582/667625_main.jpg?im=Resize=200' },
  { name: 'El Mazag All Purpose White Flour - 1 kg', price: '18.95', originalPrice: null, discount: 0, currency: 'EGP', checked: true, image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/635392/1767622630/635392_main.jpg?im=Resize=200' },
  { name: 'Ahla Mazaq White Flour - 1 kg', price: '18.33', originalPrice: '19.95', discount: 8, currency: 'EGP', checked: true, image: 'https://cdn.mafrservices.com/sys-master-root/hb2/hc8/47672346574878/575810_main.jpg?im=Resize=200' },
])

const fbtTotalLabel = computed(() => {
  const total = fbtItems.value
    .filter(i => i.checked)
    .reduce((s, i) => s + parseFloat(i.price), product.value.price)
  return `EGP ${total.toFixed(2)}`
})

const addAllFbt = () => showToast('All items added to cart!', 'success')

// ─── Related
const relatedProducts = ref([
  { name: 'Zaza Mixed Oil - 700 ml', priceInt: '559', priceFrac: '99', currency: 'EGP', discount: 7, originalPrice: '599.95', image: 'https://cdn.mafrservices.com/sys-master-root/hf9/hf3/48028775841822/604571_main.jpg?im=Resize=200' },
  { name: 'Akwam White Sugar - 1 kg', priceInt: '24', priceFrac: '99', currency: 'EGP', discount: 14, originalPrice: '28.95', image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/667625/1765702582/667625_main.jpg?im=Resize=200' },
  { name: 'El Mazag White Sugar - 1 kg', priceInt: '28', priceFrac: '95', currency: 'EGP', discount: 0, originalPrice: null, image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/604274/1767622588/604274_main.jpg?im=Resize=200' },
  { name: 'Ahla Mazaq White Sugar - 1 kg', priceInt: '28', priceFrac: '95', currency: 'EGP', discount: 0, originalPrice: null, image: 'https://cdn.mafrservices.com/sys-master-root/h82/hcf/47672346378270/575809_main.jpg?im=Resize=200' },
  { name: 'Zaza Vegetable Ghee - 350 Gm', priceInt: '29', priceFrac: '99', currency: 'EGP', discount: 33, originalPrice: '44.95', image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/643116/1731236403/643116_main.jpg?im=Resize=200' },
  { name: 'Ahla Mazaq White Flour - 1 kg', priceInt: '18', priceFrac: '33', currency: 'EGP', discount: 8, originalPrice: '19.95', image: 'https://cdn.mafrservices.com/sys-master-root/hb2/hc8/47672346574878/575810_main.jpg?im=Resize=200' },
  { name: 'Healthy Choice Brown Eggs - 30', priceInt: '149', priceFrac: '95', currency: 'EGP', discount: 0, originalPrice: null, image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/644115/1734516005/644115_main.jpg?im=Resize=200' },
  { name: 'El Mazag Egyptian Flour - 1 kg', priceInt: '18', priceFrac: '95', currency: 'EGP', discount: 0, originalPrice: null, image: 'https://cdn.mafrservices.com/pim-content/EGY/media/product/635392/1767622630/635392_main.jpg?im=Resize=200' },
])

// ─── Methods
const decreaseQty = () => { if (qty.value > 1) qty.value-- }
const addToCart = () => {
  cartStore.addToCart?.({ ...product.value, qty: qty.value })
  showToast('Added to cart!', 'success')
}
const addRelatedToCart = (p) => showToast(`${p.name} added!`, 'success')
const shareProduct = () => {
  if (navigator.share) navigator.share({ title: product.value.name, url: window.location.href })
  else showToast('Link copied!', 'success')
}
const showToast = (text, type) => {
  toast.value = { show: true, text, type }
  setTimeout(() => { toast.value.show = false }, 2800)
}
const scrollCarousel = (dir) => {
  const el = carouselRef.value
  if (el) el.scrollBy({ left: dir * 180, behavior: 'smooth' })
}
onMounted(async () => {
  // لو المنتجات موجودة في الـ store، ابحث فيها
  let found = productsStore.products.find(p => p.item_code === props.id)

  // لو مش موجودة (مثلاً عمل refresh)، حملها الأول
  if (!found) {
    console.log("Products not in store, loading...")

    let customer = 'Guest'
    try {
      const profile = await getCustomerProfileApi()
      if (profile?.party_type === 'Customer' && profile?.party_name) {
        customer = profile.party_name
      }
    } catch {}

    await productsStore.loadWebsiteProducts('Standard Selling', customer)
    found = productsStore.products.find(p => p.item_code === props.id)
  }

  if (found) {
    product.value = {
      ...product.value,       // keep defaults (images, highlights, etc.)
      name: found.item_name,
      price: found.rate,
      currency: found.currency || 'EGP',
      discount: found.discount_percentage || 0,
      originalPrice: found.original_rate || null,
      images: found.image
        ? [config.FRAPPE_URL + found.image]
        : product.value.images,
    }
  }
})
</script>

<style scoped>
/* ════════════════════════════════════════
   BASE
════════════════════════════════════════ */
.product-page {
  background: var(--bg);
  color: var(--heading);
  font-family: 'Segoe UI', 'Cairo', sans-serif;
  min-height: 100vh;
}

/* blobs */
.blob-1 { background: var(--blob1); }
.blob-2 { background: var(--blob2); }

/* ════════════════════════════════════════
   MAIN GRID
════════════════════════════════════════ */
.product-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .product-main-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
}
@media (min-width: 1024px) {
  .product-main-grid {
    grid-template-columns: 480px 1fr;
  }
}

/* ════════════════════════════════════════
   GALLERY
════════════════════════════════════════ */
.gallery-col { display: flex; flex-direction: column; gap: 12px; }

.main-image-wrap {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-product-img {
  width: 85%;
  height: 85%;
  object-fit: contain;
  display: block;
}

/* discount badge on image */
.img-discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #bc1e20;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-bottom-right-radius: 14px;
  border-top-left-radius: 14px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.badge-sub { font-size: 9px; font-weight: 500; opacity: .85; }

/* share button */
.share-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--input-bg);
  color: var(--subtext);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .2s, color .2s, transform .15s;
  box-shadow: 0 2px 8px rgba(0,0,0,.18);
}
.share-btn:hover { background: rgba(13,148,136,.15); color: #0d9488; transform: scale(1.08); }

/* thumbnails */
.thumbs-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.thumbs-row::-webkit-scrollbar { display: none; }

.thumb-btn {
  position: relative;
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: var(--card-bg);
  overflow: hidden;
  cursor: pointer;
  transition: border-color .2s, transform .15s;
}
@media (min-width:640px) { .thumb-btn { width: 72px; height: 72px; } }
.thumb-btn img { width: 100%; height: 100%; object-fit: cover; }
.thumb-btn:hover { border-color: rgba(13,148,136,.5); transform: scale(1.05); }
.thumb-btn--active { border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13,148,136,.25); }

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.65);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  border-radius: 8px;
}

/* img transition */
.img-fade-enter-active, .img-fade-leave-active { transition: opacity .2s ease; }
.img-fade-enter-from, .img-fade-leave-to { opacity: 0; }

/* ════════════════════════════════════════
   INFO COL
════════════════════════════════════════ */
.info-col { display: flex; flex-direction: column; gap: 14px; }

.seller-tag { font-size: 13px; color: var(--subtext); }
.seller-link { color: #0d9488; font-weight: 700; text-decoration: none; }
.seller-link:hover { text-decoration: underline; }

.product-title {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.3;
  color: var(--heading);
  margin: 0;
}
@media (min-width:768px) { .product-title { font-size: 26px; } }

/* price */
.price-block { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.price-main { display: flex; align-items: baseline; gap: 2px; }
.price-currency { font-size: 14px; font-weight: 800; color: var(--price-color); }
.price-integer  { font-size: 32px; font-weight: 900; color: var(--price-color); line-height: 1; }
.price-decimal  { font-size: 14px; font-weight: 800; color: var(--price-color); align-self: flex-start; margin-top: 4px; }
.price-original { font-size: 14px; color: var(--subtext); text-decoration: line-through; }
.price-off      { font-size: 14px; font-weight: 800; color: #bc1e20; }
.vat-note       { font-size: 12px; color: var(--subtext); margin: 0; }

/* sold by */
.sold-by-box {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 10px;
  padding: 10px 14px;
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  width: fit-content;
}
.sold-by-label { font-size: 12px; color: var(--subtext); }
.sold-by-value { font-size: 14px; font-weight: 700; color: var(--heading); }

/* cart action row */
.cart-action-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* qty stepper */
.qty-stepper {
  display: inline-flex;
  align-items: center;
  border-radius: 12px;
  border: 1.5px solid var(--input-border);
  background: var(--input-bg);
  overflow: hidden;
  flex-shrink: 0;
}
.qty-btn {
  width: 40px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #0d9488;
  transition: background .15s, color .15s;
}
.qty-btn:hover:not(:disabled) { background: rgba(13,148,136,.15); }
.qty-btn:disabled { opacity: .35; cursor: not-allowed; }
.qty-btn--minus { border-right: 1.5px solid var(--input-border); }
.qty-btn--plus  { border-left: 1.5px solid var(--input-border); }
.qty-number { width: 44px; text-align: center; font-size: 16px; font-weight: 800; color: var(--heading); }

/* add to cart btn */
.add-to-cart-btn {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 12px;
  border: none;
  background: var(--btn-add-cart-bg, linear-gradient(135deg,#0d9488,#10b981));
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: filter .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 16px rgba(13,148,136,.3);
  white-space: nowrap;
}
.add-to-cart-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,.4); }
.add-to-cart-btn:active { transform: scale(.97); }

/* highlights */
.highlights-box {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 16px;
}
.highlights-title { font-size: 15px; font-weight: 800; margin: 0 0 10px; }
.highlights-list {
  margin: 0; padding: 0 0 0 18px;
  list-style: disc;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.highlights-list li { font-size: 13px; color: var(--subtext); line-height: 1.5; }

/* accordion */
.accordion-list { display: flex; flex-direction: column; gap: 6px; }
.accordion-item {
  border-radius: 12px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  overflow: hidden;
}
.accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border: none;
  background: transparent;
  color: var(--heading);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}
.accordion-trigger:hover { background: rgba(13,148,136,.06); }
.accordion-icon { color: var(--subtext); transition: transform .25s; flex-shrink: 0; }
.accordion-icon--open { transform: rotate(45deg); color: #0d9488; }
.accordion-body {
  padding: 0 16px 14px;
  font-size: 13px;
  color: var(--subtext);
  line-height: 1.6;
}
.acc-slide-enter-active, .acc-slide-leave-active { transition: all .22s ease; max-height: 200px; overflow: hidden; }
.acc-slide-enter-from, .acc-slide-leave-to { max-height: 0; opacity: 0; }

/* ════════════════════════════════════════
   SECTION CARD (FBT)
════════════════════════════════════════ */
.section-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  padding: 20px;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--heading);
  margin: 0 0 16px;
}
@media (min-width:768px) { .section-title { font-size: 22px; } }

/* FBT */
.fbt-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.fbt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--input-bg);
  transition: border-color .2s;
}
.fbt-item:hover { border-color: rgba(13,148,136,.3); }

.fbt-check-wrap { flex-shrink: 0; }
.fbt-check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--input-border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s, border-color .15s;
}
.fbt-check--on { background: #0d9488; border-color: #0d9488; }

.fbt-img { width: 52px; height: 52px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
.fbt-info { flex: 1; min-width: 0; }
.fbt-name { font-size: 13px; color: var(--heading); margin-bottom: 4px; line-height: 1.3; }
.fbt-price-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.fbt-price { font-size: 14px; font-weight: 800; color: var(--price-color); }
.fbt-original { font-size: 12px; color: var(--subtext); text-decoration: line-through; }
.fbt-discount { font-size: 12px; font-weight: 700; color: #bc1e20; }

.fbt-add-all-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: var(--input-bg);
  border: 1.5px solid #0d9488;
  color: #0d9488;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.fbt-add-all-btn:hover { background: #0d9488; color: #fff; }

/* ════════════════════════════════════════
   CAROUSEL
════════════════════════════════════════ */
.see-all-link { font-size: 14px; font-weight: 700; color: #0d9488; text-decoration: none; }
.see-all-link:hover { text-decoration: underline; }

.carousel-wrap { position: relative; display: flex; align-items: center; gap: 8px; }
.carousel-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 4px 2px 8px;
  flex: 1;
}
.carousel-track::-webkit-scrollbar { display: none; }

.carousel-arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  color: var(--subtext);
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
}
@media (min-width:640px) { .carousel-arrow { display: flex; } }
.carousel-arrow:hover { background: rgba(13,148,136,.12); color: #0d9488; border-color: #0d9488; }

/* related card */
.related-card {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 148px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
@media (min-width:480px) { .related-card { width: 160px; } }

.related-card__inner {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color .2s;
}
.related-card__inner:hover { border-color: rgba(13,148,136,.4); }

.related-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #bc1e20;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-bottom-right-radius: 10px;
  border-top-left-radius: 10px;
  z-index: 2;
}
.related-img-wrap { width: 80%; height: 80%; display: flex; align-items: center; justify-content: center; }
.related-img-wrap img { width: 100%; height: 100%; object-fit: contain; }

.related-add-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  z-index: 2;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--btn-add-cart-bg, linear-gradient(135deg,#0d9488,#10b981));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
  transition: transform .15s, filter .15s;
}
.related-add-btn:hover { transform: scale(1.12); filter: brightness(1.1); }

.related-name {
  font-size: 12px;
  color: var(--subtext);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.related-price-row { display: flex; align-items: flex-start; gap: 2px; }
.related-price-int { font-size: 20px; font-weight: 900; color: var(--price-color); line-height: 1; }
.related-price-frac {
  font-size: 10px;
  font-weight: 700;
  color: var(--price-color);
  line-height: 1.1;
  margin-top: 2px;
}
.related-price-frac small { font-weight: 500; }
.related-original { font-size: 11px; color: var(--subtext); text-decoration: line-through; }

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  backdrop-filter: blur(8px);
}
.toast--success { background: rgba(13,148,136,.92); }
.toast--error   { background: rgba(185,28,28,.92); }

.slide-fade-enter-active, .slide-fade-leave-active { transition: all .3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(30px); opacity: 0; }
</style>
