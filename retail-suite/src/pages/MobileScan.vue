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

      <div class="header-right">
        <!-- 🚀 PERF: Fast-mode toggle — switches between high-throughput and legacy mode -->
        <button class="fast-mode-toggle" :class="{ active: fastMode }" @click="fastMode = !fastMode"
          :title="fastMode ? 'Fast Mode ON — continuous scanning' : 'Normal Mode — confirmation screen'">
          ⚡ {{ fastMode ? 'Fast' : 'Normal' }}
        </button>
        <div class="status-pill" :class="statusClass">
          <div class="status-dot" />
          {{ statusText }}
        </div>
      </div>
    </header>

    <!-- ════════════════════════════════════════════════════════ -->
    <!-- LOCK SCREEN — shown after successful scan (legacy mode) -->
    <!-- ════════════════════════════════════════════════════════ -->
    <Transition name="lock-slide">
      <div v-if="isLocked && !fastMode" class="lock-screen">

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
    <!-- 🚀 PERF: In fast mode, scanner screen always visible (no lock screen blocks it) -->
    <template v-if="!isLocked || fastMode">

      <div class="camera-wrapper">
        <div ref="scannerEl" class="scanner-viewport" />
        <div class="corner tl" /><div class="corner tr" />
        <div class="corner bl" /><div class="corner br" />
        <div v-if="isScanning" class="scan-beam" />

        <!-- 🚀 PERF: Queue depth indicator — visible when backlog builds up -->
        <div v-if="apiQueue.length > 1" class="queue-badge">
          <span>⏳ {{ apiQueue.length }} queued</span>
        </div>

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

      <!-- 🚀 PERF: Lightweight scan flash bar — non-blocking, replaces lock screen in fast mode -->
      <Transition name="light-flash">
        <div v-if="lightFlash" class="light-flash-bar" :class="lightFlash.type">
          <span class="light-flash-icon">{{ lightFlash.type === 'success' ? '✓' : '✗' }}</span>
          <span class="light-flash-text">{{ lightFlash.name }}</span>
          <span class="light-flash-count">×{{ successCount }}</span>
        </div>
      </Transition>

      <!-- Legacy flash (kept for normal mode) -->
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
          <li v-for="item in scanHistory" :key="item.id" class="history-item"
            :class="{ 'history-item-pending': item.pending }">
            <div class="history-barcode">{{ item.barcode }}</div>
            <div class="history-meta">
              <span class="history-status" :class="item.found ? 'found' : 'not-found'">
                <!-- 🚀 PERF: Show spinner while API resolves optimistic entry -->
                <span v-if="item.pending" class="pending-dot" />
                {{ item.pending ? 'sending…' : (item.found ? `✓ ${item.productName}` : '✗ Not found') }}
              </span>
              <span class="history-time">{{ item.time }}</span>
            </div>
          </li>
        </TransitionGroup>
      </div>

      <div class="controls-bar">
        <button v-if="isScanning" class="ctrl-btn danger" @click="stopScanner">Stop</button>
        <button v-else class="ctrl-btn primary" @click="startScanner">Start Scanner</button>
        <button class="ctrl-btn secondary" @click="clearHistory">Clear</button>
      </div>

    </template>
  </div>
</template>
<style scoped>
.mobile-scan-root {
  display: flex; flex-direction: column;
  min-height: 100dvh;
  background: #0f172a; color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* Header */
.mobile-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #1e293b;
  border-bottom: 1px solid #334155;
  position: sticky; top: 0; z-index: 10;
}
.header-icon {
  width: 36px; height: 36px; background: #0891b2;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.header-title { font-size: 14px; font-weight: 700; color: #f1f5f9; }
.header-sub   { font-size: 11px; color: #94a3b8; }
.header-sub code { font-family: monospace; color: #38bdf8; }

/* 🚀 PERF: Header right — contains toggle + status pill */
.header-right {
  display: flex; align-items: center; gap: 8px;
}

/* Status pill */
.status-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 600;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-connected  { background: #14532d; color: #86efac; }
.status-connected .status-dot  { background: #22c55e; animation: blink 1.5s ease-in-out infinite; }
.status-connecting { background: #1c1917; color: #fbbf24; }
.status-connecting .status-dot { background: #f59e0b; }
.status-error      { background: #450a0a; color: #fca5a5; }
.status-error .status-dot      { background: #ef4444; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* ══ LOCK SCREEN ══════════════════════════════════════════════ */
.lock-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 24px; gap: 20px;
  background: #0f172a;
}
.success-ring {
  width: 100px; height: 100px; border-radius: 50%;
  background: rgba(34,197,94,0.1);
  display: flex; align-items: center; justify-content: center;
  animation: ring-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  border: 2px solid rgba(34,197,94,0.3);
}
.success-ring-inner {
  width: 76px; height: 76px; border-radius: 50%;
  background: rgba(34,197,94,0.15);
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(34,197,94,0.5);
}
@keyframes ring-pop {
  0%  { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); }
  100%{ transform: scale(1);   opacity: 1; }
}
.lock-title { font-size: 22px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.5px; }
.lock-product-card {
  width: 100%; padding: 16px 20px;
  background: #1e293b; border: 1px solid #334155;
  border-radius: 16px; text-align: center;
}
.lock-barcode { font-family: monospace; font-size: 20px; font-weight: 700; color: #38bdf8; letter-spacing: 2px; }
.lock-product-name { font-size: 14px; color: #94a3b8; margin-top: 6px; }
.scan-count-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 999px;
  background: #1e293b; border: 1px solid #334155;
  font-size: 12px; color: #64748b;
}
.scan-again-btn {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 16px 24px;
  background: #0891b2; color: #fff;
  border: none; border-radius: 14px;
  font-size: 16px; font-weight: 700;
  cursor: pointer; justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 4px 20px rgba(8,145,178,0.4);
}
.scan-again-btn:active { transform: scale(0.97); }
.lock-history { width: 100%; }
.lock-history-title {
  font-size: 11px; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px;
}
.lock-history-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: #1e293b;
  border: 1px solid #334155; border-radius: 8px; margin-bottom: 6px;
}
.lock-history-name { font-size: 12px; color: #cbd5e1; }
.lock-history-status { font-size: 12px; font-weight: 700; }
.lock-history-status.found     { color: #4ade80; }
.lock-history-status.not-found { color: #f87171; }

.lock-slide-enter-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.lock-slide-leave-active { transition: all 0.2s ease; }
.lock-slide-enter-from   { opacity: 0; transform: translateY(30px); }
.lock-slide-leave-to     { opacity: 0; transform: translateY(-10px); }

/* ══ CAMERA ════════════════════════════════════════════════════ */
.camera-wrapper {
  position: relative; width: 100%;
  background: #000; overflow: hidden;
   flex: 0 0 auto; /* أو نسبة ثابتة */
}
.scanner-viewport { width: 100%; height: 100%; }
:deep(.scanner-viewport video) {
  width: 100% !important; height: 100% !important; object-fit: cover !important;
}
:deep(.scanner-viewport canvas) { display: none !important; }
.corner {
  position: absolute; width: 24px; height: 24px;
  border-color: #06b6d4; border-style: solid; z-index: 2;
}
.tl { top:16px; left:16px;  border-width:3px 0 0 3px; border-radius:4px 0 0 0; }
.tr { top:16px; right:16px; border-width:3px 3px 0 0; border-radius:0 4px 0 0; }
.bl { bottom:16px; left:16px;  border-width:0 0 3px 3px; border-radius:0 0 0 4px; }
.br { bottom:16px; right:16px; border-width:0 3px 3px 0; border-radius:0 0 4px 0; }
.scan-beam {
  position: absolute; left:10%; right:10%; height:2px;
  background: linear-gradient(90deg,transparent,#06b6d4,#38bdf8,#06b6d4,transparent);
  border-radius:1px; z-index:2;
  animation: beam 2.5s ease-in-out infinite;
  box-shadow: 0 0 8px #06b6d4;
}
@keyframes beam {
  0%  { top:15%; opacity:0; }
  5%  { opacity:1; }
  95% { opacity:1; }
  100%{ top:85%; opacity:0; }
}
.error-overlay,.start-overlay {
  position:absolute; inset:0;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:rgba(15,23,42,0.85); color:#f1f5f9;
  z-index:5; padding:24px; text-align:center;
}
.retry-btn,.start-btn {
  padding:8px 20px; border-radius:8px;
  font-size:13px; font-weight:600; border:none; cursor:pointer;
  background:#0891b2; color:#fff;
}
.start-icon { font-size:40px; }

/* 🚀 PERF: Queue depth badge — appears on camera when backlog builds */
.queue-badge {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  background: rgba(251,191,36,0.15); border: 1px solid #f59e0b;
  color: #fbbf24; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 999px; z-index: 3;
  pointer-events: none;
}

/* Flash */
.flash-message {
  position:fixed; top:70px; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:10px;
  padding:10px 16px; border-radius:12px;
  min-width:220px; max-width:calc(100vw - 32px);
  z-index:50; box-shadow:0 8px 24px rgba(0,0,0,0.4);
}
.flash-message.success { background:#052e16; border:1px solid #16a34a; color:#bbf7d0; }
.flash-message.warning { background:#422006; border:1px solid #d97706; color:#fde68a; }
.flash-icon  { font-size:18px; flex-shrink:0; }
.flash-title { font-size:13px; font-weight:600; }
.flash-sub   { font-size:11px; opacity:.8; margin-top:1px; }
.flash-enter-active,.flash-leave-active { transition:all 0.25s ease; }
.flash-enter-from,.flash-leave-to { opacity:0; transform:translateX(-50%) translateY(-10px); }

/* ══ 🚀 PERF: Lightweight scan flash bar (fast mode feedback) ════════════════ */
.light-flash-bar {
  position: fixed; bottom: 80px; left: 12px; right: 12px;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-radius: 12px;
  font-size: 14px; font-weight: 700;
  z-index: 60;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  pointer-events: none;    /* never intercepts screen touches */
}
.light-flash-bar.success {
  background: #052e16; border: 1px solid #22c55e; color: #86efac;
}
.light-flash-bar.error {
  background: #450a0a; border: 1px solid #ef4444; color: #fca5a5;
}
.light-flash-icon  { font-size: 18px; flex-shrink: 0; }
.light-flash-text  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.light-flash-count {
  font-size: 11px; background: rgba(255,255,255,0.1);
  padding: 2px 8px; border-radius: 999px; flex-shrink: 0;
}
/* Snappy sub-200ms transition */
.light-flash-enter-active { transition: all 0.15s ease-out; }
.light-flash-leave-active { transition: all 0.3s ease-in; }
.light-flash-enter-from   { opacity: 0; transform: translateY(8px); }
.light-flash-leave-to     { opacity: 0; transform: translateY(4px); }

/* ══ Fast-mode toggle button ═════════════════════════════════════════════════ */
.fast-mode-toggle {
  padding: 4px 10px; border-radius: 999px; border: 1px solid #334155;
  font-size: 11px; font-weight: 700; cursor: pointer;
  background: #1e293b; color: #64748b;
  transition: all 0.15s;
}
.fast-mode-toggle.active {
  background: #0c4a6e; color: #38bdf8; border-color: #0891b2;
}

/* History */
.history-panel { flex:1; padding:16px; overflow-y:auto;  flex: 1;  }
.history-title { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.05em; margin-bottom:10px; }
.history-empty { text-align:center; padding:32px 0; color:#475569; font-size:13px; }
.history-list  { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; }
.history-item  {
  display:flex; justify-content:space-between; align-items:center;
  padding:10px 12px; background:#1e293b;
  border:1px solid #334155; border-radius:10px;
  transition: border-color 0.3s;
}
/* 🚀 PERF: Pending entry — subtle pulse border while API resolves */
.history-item-pending {
  border-color: #0891b2;
  animation: pending-pulse 1.2s ease-in-out infinite;
}
@keyframes pending-pulse {
  0%,100% { border-color: #0891b2; }
  50%      { border-color: #334155; }
}
.history-barcode { font-family:monospace; font-size:14px; font-weight:700; color:#e2e8f0; }
.history-meta    { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
.history-status  { font-size:11px; font-weight:600; }
.history-status.found     { color:#4ade80; }
.history-status.not-found { color:#f87171; }
.history-time { font-size:10px; color:#64748b; }

/* 🚀 PERF: Spinner dot for pending optimistic entries */
.pending-dot {
  display: inline-block; width: 6px; height: 6px;
  background: #38bdf8; border-radius: 50%;
  margin-right: 4px; vertical-align: middle;
  animation: blink 0.8s ease-in-out infinite;
}

.list-enter-active { transition:all 0.25s ease; }
.list-enter-from   { opacity:0; transform:translateY(-8px); }

/* Controls */
.controls-bar { display:flex; gap:10px; padding:12px 16px; background:#1e293b; border-top:1px solid #334155; flex: 0 0 auto; }
.ctrl-btn { flex:1; padding:12px; border-radius:12px; border:none; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.15s; }
.ctrl-btn:active    { transform:scale(0.97); }
.ctrl-btn.primary   { background:#0891b2; color:#fff; }
.ctrl-btn.danger    { background:#dc2626; color:#fff; }
.ctrl-btn.secondary { background:#334155; color:#94a3b8; }
.ctrl-btn:disabled  { opacity:.5; cursor:not-allowed; }
</style>

<script setup>
import { ScanBarcodeApi } from '@/composables/barcode'
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import config from '@/config/frappe'
const route = useRoute()

// ── Session ───────────────────────────────────────────────────────────────────
const sessionId    = computed(() => route.query.session || '')
const shortSession = computed(() => sessionId.value.slice(-8) || '—')

// ── Refs ──────────────────────────────────────────────────────────────────────
const scannerEl          = ref(null)
const isScanning         = ref(false)
const cameraError        = ref('')
const scanHistory        = ref([])
const flashMessage       = ref('')
const flashSub           = ref('')
const flashType          = ref('success')
const isLocked           = ref(false)
const lastSuccessBarcode = ref('')
const lastSuccessName    = ref('')
const socketStatus       = ref('connecting')

// ── 🚀 PERF: Fast-mode flag (toggle for high-throughput scanning) ─────────────
// When true: no lock screen, continuous scanning, lightweight feedback only
const fastMode = ref(true)

// ── 🚀 PERF: Lightweight flash state (replaces lock screen in fast mode) ──────
const lightFlash = ref(null)   // { type: 'success'|'error', name: string }
let lightFlashTimer = null

// ── 🚀 PERF: API queue — processes requests sequentially, no server floods ────
const apiQueue  = ref([])    // pending barcode payloads
let   queueBusy = false

// ── 🚀 PERF: Optimistic scan map — tracks pending scans for rollback ──────────
// key: timestamp id, value: reactive history entry object
const pendingScans = new Map()

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

// ── Lock / unlock (legacy mode only) ─────────────────────────────────────────
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

// ── 🚀 PERF: Debounce — tightened to 600ms for fast continuous scanning ───────
// Reduced from 1500ms; prevents re-scanning the same label twice per hand swipe
let lastBarcode     = ''
let lastBarcodeTime = 0
const DEBOUNCE_MS   = 600   // was 1500 — reduced for high-throughput

// ── 🚀 PERF: Audio beep on successful scan (Web Audio API, zero dependencies) ──
const beepOnSuccess = () => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 1046   // C6 — short, crisp beep
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  } catch { /* ignore — AudioContext blocked in some browsers */ }
}

// ── 🚀 PERF: Haptic feedback — non-blocking, uses native mobile vibration ─────
const vibrateSuccess = () => navigator.vibrate?.([60])
const vibrateError   = () => navigator.vibrate?.([80, 40, 80])

// ── 🚀 PERF: Lightweight flash — 1.2s non-intrusive overlay, pointer-events none
const showLightFlash = (type, name = '') => {
  lightFlash.value = { type, name }
  if (lightFlashTimer) clearTimeout(lightFlashTimer)
  lightFlashTimer = setTimeout(() => { lightFlash.value = null }, 1200)
}

// ── 🚀 PERF: Queue processor — sequential, non-blocking, safe under heavy load ─
// Processes one API call at a time; scanner never waits for this
const processQueue = async () => {
  if (queueBusy || apiQueue.value.length === 0) return
  queueBusy = true

  while (apiQueue.value.length > 0) {
    const { barcode, entryId } = apiQueue.value.shift()

    try {
      const res  = await ScanBarcodeApi(sessionId.value, barcode)
      socketStatus.value = 'connected'

      // Normalize response — same logic as original sendBarcode
      const data =
        res?.data?.message ||
        res?.message       ||
        res?.data          ||
        res                || {}

      // ── 🚀 PERF: Patch the optimistic history entry with real server result ──
      const entry = pendingScans.get(entryId)
      if (entry) {
        entry.found       = data?.found ?? false
        entry.productName = data?.item_name || entry.productName
        entry.pending     = false   // remove spinner
        if (!entry.found) vibrateError()
        pendingScans.delete(entryId)
      }

    } catch (err) {
      console.error('Queue API error:', err)
      socketStatus.value = 'error'

      // ── 🚀 PERF: Rollback — mark optimistic entry as failed ─────────────────
      const entry = pendingScans.get(entryId)
      if (entry) {
        entry.found       = false
        entry.productName = '[API Error]'
        entry.pending     = false
        vibrateError()
        pendingScans.delete(entryId)
      }
    }
  }

  queueBusy = false
}

// ── 🚀 PERF: Enqueue — fire-and-forget, NEVER blocks the scanner thread ───────
const enqueueBarcode = (barcode, entryId) => {
  apiQueue.value.push({ barcode, entryId })
  processQueue()   // kick off processor — intentionally no await
}

// ── sendBarcode kept for legacy (normal) mode compatibility ───────────────────
const sendBarcode = async (barcode) => {
  try {
    const res = await ScanBarcodeApi(sessionId.value, barcode)
    socketStatus.value = 'connected'
    const data =
      res?.data?.message ||
      res?.message       ||
      res?.data          ||
      res
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

// ── 🚀 PERF: startScanner — tuned Quagga config for mobile performance ────────
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
            // 🚀 PERF: Lower resolution in fast mode — faster decode, less GPU load
            width:      fastMode.value ? { ideal: 640 }  : { ideal: 1280 },
            height:     fastMode.value ? { ideal: 480 }  : { ideal: 720 },
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: [
            'ean_reader', 'ean_8_reader',
            'code_128_reader', 'code_39_reader',
            'upc_reader', 'upc_e_reader',
          ],
          multiple: false,
        },
        locate: true,
        // 🚀 PERF: Use all available CPU cores for decode workers
        numOfWorkers: navigator.hardwareConcurrency || 4,
        // 🚀 PERF: 15 fps decode attempts in fast mode vs 10 default
        frequency:    fastMode.value ? 15 : 10,
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

    console.log('Quagga initialized, setting up event listener...')
    // eslint-disable-next-line no-undef
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

// ── 🚀 PERF: Barcode detected — fast mode path is fully non-blocking ──────────
const onBarcodeDetected = async (result) => {
  const barcode = result?.codeResult?.code
  if (!barcode) return

  // ── 🚀 PERF: Debounce — drop repeated reads within cooldown window ───────────
  const now = Date.now()
  if (barcode === lastBarcode && now - lastBarcodeTime < DEBOUNCE_MS) return
  lastBarcode     = barcode
  lastBarcodeTime = now

  // ══════════════════════════════════════════════════════════════════════════
  // 🚀 FAST MODE — optimistic UI + background queue, scanner NEVER stops
  // ══════════════════════════════════════════════════════════════════════════
  if (fastMode.value) {
    const entryId = now

    // 1️⃣ Optimistic history entry — appears instantly, server patches it later
    const entry = reactive({
      id:          entryId,
      barcode,
      found:       true,       // assume success; rollback if API fails
      productName: '…',        // placeholder until API resolves
      pending:     true,       // drives spinner in template
      time:        new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
    })
    scanHistory.value.unshift(entry)
    if (scanHistory.value.length > 20) scanHistory.value.pop()

    // Store reactive ref so queue processor can mutate it after API returns
    pendingScans.set(entryId, entry)

    // 2️⃣ Immediate sensory feedback — executes synchronously, zero blocking
    vibrateSuccess()
    beepOnSuccess()
    showLightFlash('success', barcode)

    // 3️⃣ Enqueue API call — processed in background, scanner keeps running
    enqueueBarcode(barcode, entryId)

    // ✅ Return immediately — scanner continues, NO lock screen, NO stopScanner()
    return
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LEGACY MODE — original blocking behavior preserved (fastMode = false)
  // ══════════════════════════════════════════════════════════════════════════
  showFlash(`Sending: ${barcode}`, '', 'success')

  const response = await sendBarcode(barcode)

  const entry = {
    id:          now,
    barcode,
    found:       response?.found ?? false,
    productName: response?.item_name || '',
    pending:     false,
    time:        new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  }
  scanHistory.value.unshift(entry)
  if (scanHistory.value.length > 20) scanHistory.value.pop()

  if (response?.found) {
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
  if (val) startScanner()
}, { immediate: true })

onUnmounted(() => {
  stopScanner()
  if (flashTimer)      clearTimeout(flashTimer)
  if (lightFlashTimer) clearTimeout(lightFlashTimer)  // 🚀 PERF: cleanup light flash timer
  pendingScans.clear()                                 // 🚀 PERF: cleanup pending map
  apiQueue.value = []                                  // 🚀 PERF: drain queue on exit
})

// 🚀 PERF: reactive() needed for mutable optimistic entries in fast mode
import { reactive } from 'vue'
</script>

