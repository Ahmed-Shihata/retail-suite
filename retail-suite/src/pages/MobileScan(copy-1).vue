<!-- pages/MobileScan.vue -->
<!-- Route: /mobile-scan?session=SESSION_ID  (requiresAuth: false) -->

<template>
  <div class="mobile-scan-root">

    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="mobile-header">
      <div class="flex items-center gap-2">
        <div class="header-icon">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 5h2M7 5h1M3 5v2M21 5h-2M17 5h-1M21 5v2M3 19h2M7 19h1M3 19v-2M21 19h-2M17 19h-1M21 19v-2"/>
            <rect x="7" y="7" width="4" height="4" rx="0.5"/>
            <rect x="13" y="7" width="4" height="4" rx="0.5"/>
            <rect x="7" y="13" width="4" height="4" rx="0.5"/>
            <path d="M13 13h1M16 13h1M13 16h4"/>
          </svg>
        </div>
        <div>
          <h1 class="header-title">Product Scanner</h1>
          <p class="header-sub">Session: <code>{{ shortSession }}</code></p>
        </div>
      </div>
      <div class="status-pill" :class="statusClass">
        <div class="status-dot" />
        {{ statusText }}
      </div>
    </header>

    <!-- ════════════════════════════════════════════════════════ -->
    <!-- LOCK SCREEN — shown after successful scan               -->
    <!-- ════════════════════════════════════════════════════════ -->
    <Transition name="lock-slide">
      <div v-if="isLocked" class="lock-screen">

        <div class="success-ring">
          <div class="success-ring-inner">
            <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none"
              stroke="#4ade80" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
        </div>

        <h2 class="lock-title">Added to Cart</h2>

        <div class="lock-product-card">
          <div class="lock-barcode">{{ lastSuccessBarcode }}</div>
          <div class="lock-product-name">{{ lastSuccessName || 'Product found' }}</div>
        </div>

        <div class="scan-count-badge">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ successCount }} item{{ successCount !== 1 ? 's' : '' }} scanned this session
        </div>

        <button class="scan-again-btn" @click="unlock">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 5h2M7 5h1M3 5v2M21 5h-2M17 5h-1M21 5v2M3 19h2M7 19h1M3 19v-2M21 19h-2M17 19h-1M21 19v-2"/>
          </svg>
          Scan Another Product
        </button>

        <div v-if="scanHistory.length > 1" class="lock-history">
          <p class="lock-history-title">Recent</p>
          <div v-for="item in scanHistory.slice(0, 4)" :key="item.id" class="lock-history-item">
            <span class="lock-history-name">{{ item.productName || item.barcode }}</span>
            <span class="lock-history-status" :class="item.found ? 'found' : 'not-found'">
              {{ item.found ? '✓' : '✗' }}
            </span>
          </div>
        </div>

      </div>
    </Transition>

    <!-- ════════════════════════════════════════════════════════ -->
    <!-- SCANNER SCREEN                                          -->
    <!-- ════════════════════════════════════════════════════════ -->
    <template v-if="!isLocked">
      <div class="scanner-col">
        <div class="camera-wrapper">
          <div ref="scannerEl" class="scanner-viewport" />
          <div class="corner tl" /><div class="corner tr" />
          <div class="corner bl" /><div class="corner br" />
          <div v-if="isScanning" class="scan-beam" />

          <div v-if="cameraError" class="error-overlay">
            <svg class="w-10 h-10 mb-2 opacity-60" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.5">
              <path d="M12 9v4M12 17h.01"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <p class="text-sm font-medium">{{ cameraError }}</p>
            <button class="retry-btn mt-3" @click="startScanner">Retry</button>
          </div>

          <div v-if="!isScanning && !cameraError" class="start-overlay">
            <div class="start-icon">📷</div>
            <p class="text-sm font-medium mt-2">Tap to start scanner</p>
            <button class="start-btn mt-3" @click="startScanner">Start Scanner</button>
          </div>
        </div>

        <div class="controls-bar">
          <button v-if="isScanning" class="ctrl-btn danger" @click="stopScanner">Stop</button>
          <button v-else class="ctrl-btn primary" @click="startScanner">Start Scanner</button>
          <button class="ctrl-btn secondary" @click="clearHistory">Clear</button>
        </div>
      </div>
      <div class="history-col">
        <Transition name="flash">
          <div v-if="flashMessage" class="flash-message" :class="flashType">
            <div class="flash-icon">{{ flashType === 'success' ? '✓' : '⚠' }}</div>
            <div>
              <p class="flash-title">{{ flashMessage }}</p>
              <p v-if="flashSub" class="flash-sub">{{ flashSub }}</p>
            </div>
          </div>
        </Transition>

        <div class="history-panel">
          <h2 class="history-title">Scanned Items</h2>
          <div v-if="!scanHistory.length" class="history-empty">
            <p>No barcodes scanned yet</p>
            <p class="text-xs mt-1 opacity-60">Point camera at a product barcode</p>
          </div>
          <TransitionGroup name="list" tag="ul" class="history-list">
            <li v-for="item in scanHistory" :key="item.id" class="history-item">
              <div class="history-barcode">{{ item.barcode }}</div>
              <div class="history-meta">
                <span class="history-status" :class="item.found ? 'found' : 'not-found'">
                  {{ item.found ? `✓ ${item.productName}` : '✗ Not found' }}
                </span>
                <span class="history-time">{{ item.time }}</span>
              </div>
            </li>
          </TransitionGroup>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
console.log("📱 MobileScan")
import { ScanBarcodeApi } from '@/services/api'
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import config from '@/config/frappe'
const route = useRoute()

const sessionId    = computed(() => route.query.session || '')
const shortSession = computed(() => sessionId.value.slice(-8) || '—')

const scannerEl        = ref(null)
const isScanning       = ref(false)
const cameraError      = ref('')
const scanHistory      = ref([])
const flashMessage     = ref('')
const flashSub         = ref('')
const flashType        = ref('success')
const isLocked         = ref(false)
const lastSuccessBarcode = ref('')
const lastSuccessName    = ref('')
const socketStatus     = ref('connecting')

const successCount = computed(() => scanHistory.value.filter(i => i.found).length)

const statusText = computed(() => {
  if (socketStatus.value === 'connected') return 'Connected to POS'
  if (socketStatus.value === 'error')     return 'Connection Error'
  return 'Connecting…'
})
const statusClass = computed(() => ({
  'status-connected':  socketStatus.value === 'connected',
  'status-connecting': socketStatus.value === 'connecting',
  'status-error':      socketStatus.value === 'error',
}))

// ── Lock / unlock ─────────────────────────────────────────────────────────────
const lockScreen = (barcode, productName) => {
  lastSuccessBarcode.value = barcode
  lastSuccessName.value    = productName || ''
  isLocked.value = true
  stopScanner() // stop camera to save battery while locked
}

const unlock = () => {
  isLocked.value = false
  nextTick(() => startScanner())
}

// ── Debounce ──────────────────────────────────────────────────────────────────
let lastBarcode     = ''
let lastBarcodeTime = 0
const DEBOUNCE_MS   = 1500

// ── Send barcode → Frappe backend → realtime → POS cart ───────────────────────
const sendBarcode = async (barcode) => {
  try {
    const res = await ScanBarcodeApi(sessionId.value,barcode)
    socketStatus.value = 'connected'

    // normalize response
    const data =
      res?.data?.message ||
      res?.message ||
      res?.data ||
      res
      // alert("Received response: " + JSON.stringify(data))
    return data || {}

  } catch (err) {
    console.error('Send barcode error:', err)
    socketStatus.value = 'error'
    return { success: false, found: false }
  }
}
// ── QuaggaJS loader ───────────────────────────────────────────────────────────
const loadQuagga = () =>
  new Promise((resolve, reject) => {
    if (window.Quagga) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js'
    s.onload  = resolve
    s.onerror = () => reject(new Error('Failed to load QuaggaJS'))
    document.head.appendChild(s)
  })

const startScanner = async () => {
  console.log('Starting scanner...')
  cameraError.value = ''
  try {
    await loadQuagga()
    await nextTick()

    // eslint-disable-next-line no-undef
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerEl.value,
          constraints: {
            width:  { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: [
            'ean_reader', 'ean_8_reader',
            'code_128_reader', 'code_39_reader',
            'upc_reader', 'upc_e_reader',
          ],
        },
        locate: true,
        numOfWorkers: navigator.hardwareConcurrency || 2,
        frequency: 10,
      },
      (err) => {
        if (err) {
          cameraError.value = err.message || 'Camera access denied'
          isScanning.value  = false
          return
        }
        // eslint-disable-next-line no-undef
        Quagga.start()
        isScanning.value = true
      }
    )

    // eslint-disable-next-line no-undef
    console.log('Quagga initialized, setting up event listener...')
    Quagga.onDetected(onBarcodeDetected)
  } catch (err) {
    cameraError.value = err.message
  }
}

const stopScanner = () => {
  if (!window.Quagga) return
  try { window.Quagga.stop() } catch { /* already stopped */ }
  isScanning.value = false
}

// ── Barcode detected ──────────────────────────────────────────────────────────
const onBarcodeDetected = async (result) => {
  console.log("onBarcodeDetected Step 2")
  const barcode = result?.codeResult?.code
  if (!barcode) return

  const now = Date.now()
  if (barcode === lastBarcode && now - lastBarcodeTime < DEBOUNCE_MS) return
  lastBarcode     = barcode
  lastBarcodeTime = now

  showFlash(`Sending: ${barcode}`, '', 'success')

  const response = await sendBarcode(barcode)

  const entry = {
    id:          now,
    barcode,
    found:       response?.found ?? false,
    productName: response?.item_name || '',
    time:        new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  }
  // alert("Scan result: " + JSON.stringify(entry))
  scanHistory.value.unshift(entry)
  if (scanHistory.value.length > 20) scanHistory.value.pop()

  if (response?.found) {
    // ✅ Product found → lock screen with success confirmation
    lockScreen(barcode, response.item_name)
  } else {
    showFlash(`Not found: ${barcode}`, 'Product not in POS catalog', 'warning')
  }
}

let flashTimer = null
const showFlash = (msg, sub = '', type = 'success') => {
  flashMessage.value = msg
  flashSub.value     = sub
  flashType.value    = type
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flashMessage.value = '' }, 2500)
}

const clearHistory = () => { scanHistory.value = [] }


watch(sessionId, (val) => {
  console.log("👀 SESSION CHANGED:", val)
  if (val) {
    startScanner()
  }
}, { immediate: true })

onUnmounted(() => {
  stopScanner()
  if (flashTimer) clearTimeout(flashTimer)
})
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────── */
.mobile-scan-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #0f172a;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ── Header ───────────────────────────────────────────────── */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  position: sticky;
  top: 0;
  z-index: 10;
  gap: 8px;
  flex-wrap: wrap;
}
.header-icon {
  width: 34px;
  height: 34px;
  background: #0891b2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.header-title { font-size: 13px; font-weight: 700; color: #f1f5f9; }
.header-sub   { font-size: 10px; color: #94a3b8; }
.header-sub code { font-family: monospace; color: #38bdf8; }

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
}

/* Status pill */
.status-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.status-dot { width: 5px; height: 5px; border-radius: 50%; }
.status-connected  { background: #14532d; color: #86efac; }
.status-connected .status-dot  { background: #22c55e; animation: blink 1.5s ease-in-out infinite; }
.status-connecting { background: #1c1917; color: #fbbf24; }
.status-connecting .status-dot { background: #f59e0b; }
.status-error      { background: #450a0a; color: #fca5a5; }
.status-error .status-dot      { background: #ef4444; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* Fast-mode toggle */
.fast-mode-toggle {
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #334155;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  background: #1e293b;
  color: #64748b;
  transition: all 0.15s;
  white-space: nowrap;
}
.fast-mode-toggle.active {
  background: #0c4a6e;
  color: #38bdf8;
  border-color: #0891b2;
}

/* ── LOCK SCREEN ─────────────────────────────────────────── */
.lock-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 20px;
  background: #0f172a;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}
.success-ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(34,197,94,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ring-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  border: 2px solid rgba(34,197,94,0.3);
}
.success-ring-inner {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(34,197,94,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(34,197,94,0.5);
}
@keyframes ring-pop {
  0%  { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); }
  100%{ transform: scale(1);   opacity: 1; }
}
.lock-title { font-size: 20px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.5px; }
.lock-product-card {
  width: 100%;
  padding: 14px 18px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  text-align: center;
}
.lock-barcode { font-family: monospace; font-size: 18px; font-weight: 700; color: #38bdf8; letter-spacing: 2px; }
.lock-product-name { font-size: 13px; color: #94a3b8; margin-top: 5px; }
.scan-count-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: #1e293b;
  border: 1px solid #334155;
  font-size: 11px;
  color: #64748b;
}
.scan-again-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  background: #0891b2;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 4px 16px rgba(8,145,178,0.35);
}
.scan-again-btn:active { transform: scale(0.97); }
.lock-history { width: 100%; }
.lock-history-title {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 7px;
}
.lock-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 7px;
  margin-bottom: 5px;
}
.lock-history-name { font-size: 11px; color: #cbd5e1; }
.lock-history-status { font-size: 11px; font-weight: 700; }
.lock-history-status.found     { color: #4ade80; }
.lock-history-status.not-found { color: #f87171; }

.lock-slide-enter-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.lock-slide-leave-active { transition: all 0.2s ease; }
.lock-slide-enter-from   { opacity: 0; transform: translateY(30px); }
.lock-slide-leave-to     { opacity: 0; transform: translateY(-10px); }

/* ── CAMERA ───────────────────────────────────────────────── */
.camera-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  /* Mobile: fixed fraction of viewport */
  height: 42dvh;
  min-height: 220px;
  max-height: 380px;
  flex-shrink: 0;
}
.scanner-viewport { width: 100%; height: 100%; }
:deep(.scanner-viewport video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
:deep(.scanner-viewport canvas) { display: none !important; }

.corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: #06b6d4;
  border-style: solid;
  z-index: 2;
}
.tl { top:14px; left:14px;  border-width:3px 0 0 3px; border-radius:4px 0 0 0; }
.tr { top:14px; right:14px; border-width:3px 3px 0 0; border-radius:0 4px 0 0; }
.bl { bottom:14px; left:14px;  border-width:0 0 3px 3px; border-radius:0 0 0 4px; }
.br { bottom:14px; right:14px; border-width:0 3px 3px 0; border-radius:0 0 4px 0; }

.scan-beam {
  position: absolute;
  left:10%; right:10%;
  height: 2px;
  background: linear-gradient(90deg,transparent,#06b6d4,#38bdf8,#06b6d4,transparent);
  border-radius: 1px;
  z-index: 2;
  animation: beam 2.5s ease-in-out infinite;
  box-shadow: 0 0 8px #06b6d4;
}
@keyframes beam {
  0%  { top:15%; opacity:0; }
  5%  { opacity:1; }
  95% { opacity:1; }
  100%{ top:85%; opacity:0; }
}
.error-overlay, .start-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15,23,42,0.85);
  color: #f1f5f9;
  z-index: 5;
  padding: 20px;
  text-align: center;
}
.retry-btn, .start-btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #0891b2;
  color: #fff;
}
.start-icon { font-size: 36px; }

.queue-badge {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(251,191,36,0.15);
  border: 1px solid #f59e0b;
  color: #fbbf24;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  z-index: 3;
  pointer-events: none;
  white-space: nowrap;
}

/* ── Flash messages ───────────────────────────────────────── */
.flash-message {
  position: fixed;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  min-width: 200px;
  max-width: calc(100vw - 28px);
  z-index: 50;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.flash-message.success { background:#052e16; border:1px solid #16a34a; color:#bbf7d0; }
.flash-message.warning { background:#422006; border:1px solid #d97706; color:#fde68a; }
.flash-icon  { font-size:16px; flex-shrink:0; }
.flash-title { font-size:12px; font-weight:600; }
.flash-sub   { font-size:10px; opacity:.8; margin-top:1px; }
.flash-enter-active,.flash-leave-active { transition:all 0.25s ease; }
.flash-enter-from,.flash-leave-to { opacity:0; transform:translateX(-50%) translateY(-10px); }

/* Light flash bar */
.light-flash-bar {
  position: fixed;
  bottom: 72px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  z-index: 60;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  pointer-events: none;
}
.light-flash-bar.success { background:#052e16; border:1px solid #22c55e; color:#86efac; }
.light-flash-bar.error   { background:#450a0a; border:1px solid #ef4444; color:#fca5a5; }
.light-flash-icon  { font-size:16px; flex-shrink:0; }
.light-flash-text  { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.light-flash-count {
  font-size: 10px;
  background: rgba(255,255,255,0.1);
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.light-flash-enter-active { transition: all 0.15s ease-out; }
.light-flash-leave-active { transition: all 0.3s ease-in; }
.light-flash-enter-from   { opacity:0; transform:translateY(8px); }
.light-flash-leave-to     { opacity:0; transform:translateY(4px); }

/* ── History ──────────────────────────────────────────────── */
.history-panel {
  flex: 1;
  padding: 12px 14px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.history-title {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: 9px;
}
.history-empty { text-align:center; padding:28px 0; color:#475569; font-size:12px; }
.history-list  { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:5px; }
.history-item  {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 10px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 9px;
  transition: border-color 0.3s;
}
.history-item-pending {
  border-color: #0891b2;
  animation: pending-pulse 1.2s ease-in-out infinite;
}
@keyframes pending-pulse {
  0%,100% { border-color: #0891b2; }
  50%      { border-color: #334155; }
}
.history-barcode { font-family:monospace; font-size:13px; font-weight:700; color:#e2e8f0; }
.history-meta    { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
.history-status  { font-size:10px; font-weight:600; }
.history-status.found     { color:#4ade80; }
.history-status.not-found { color:#f87171; }
.history-time { font-size:9px; color:#64748b; }

.pending-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #38bdf8;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
  animation: blink 0.8s ease-in-out infinite;
}
.list-enter-active { transition:all 0.25s ease; }
.list-enter-from   { opacity:0; transform:translateY(-8px); }

/* ── Controls bar ─────────────────────────────────────────── */
.controls-bar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: #1e293b;
  border-top: 1px solid #334155;
  flex-shrink: 0;
}
.ctrl-btn {
  flex: 1;
  padding: 11px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.ctrl-btn:active    { transform: scale(0.97); }
.ctrl-btn.primary   { background:#0891b2; color:#fff; }
.ctrl-btn.danger    { background:#dc2626; color:#fff; }
.ctrl-btn.secondary { background:#334155; color:#94a3b8; }
.ctrl-btn:disabled  { opacity:.5; cursor:not-allowed; }

/* ══════════════════════════════════════════════════════════ */
/* DESKTOP / TABLET RESPONSIVE (≥ 768px)                     */
/* ══════════════════════════════════════════════════════════ */
@media (min-width: 768px) {
  .scanner-col {
    width: clamp(280px, 40%, 480px);
    display: flex;
    flex-direction: column;
    border-right: 1px solid #334155;
    height: 100%;
    flex-shrink: 0;
    position: relative;
  }
  .history-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }
  /* Root switches to a two-column layout */
  .mobile-scan-root {
    flex-direction: row;
    flex-wrap: nowrap;
    height: 100dvh;
    overflow: hidden;
  }

  /* Left column: camera + controls, fixed width */
  .camera-wrapper {
    /* Fill the full left column height */
    height: auto;
    max-height: none;
    min-height: 0;
    flex: 1;             /* grows to fill left column */
    width: 100%;
  }

  /* Wrap camera + controls in a column */
  /* We inject a wrapper in the template — handled via layout below */

  /* Lock screen gets a max-width and centers */
  .lock-screen {
    max-width: 420px;
    padding: 28px 20px;
  }

  /* Light flash bar — anchor to bottom of the left column instead of viewport */
  .light-flash-bar {
    position: absolute;  /* relative to camera-wrapper's parent */
    bottom: 68px;
    left: 10px;
    right: 10px;
  }

  /* Flash message anchors to header height */
  .flash-message {
    top: 60px;
    max-width: 380px;
  }

  /* History panel fills right column and scrolls */
  .history-panel {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .history-title { font-size: 11px; }
  .history-barcode { font-size: 14px; }
  .history-status  { font-size: 11px; }
  .history-time    { font-size: 10px; }
  .history-item    { padding: 10px 12px; border-radius: 10px; }

  /* Controls bar full width inside left column */
  .controls-bar { padding: 12px 14px; }
  .ctrl-btn { font-size: 14px; padding: 12px; }
}

/* ══════════════════════════════════════════════════════════ */
/* WIDE DESKTOP (≥ 1024px)                                    */
/* ══════════════════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .history-barcode { font-size: 15px; }
  .history-item    { padding: 11px 14px; }
  .history-title   { font-size: 12px; margin-bottom: 12px; }
  .lock-screen { padding: 36px 28px; gap: 24px; }
  .lock-title  { font-size: 22px; }
}
</style>
