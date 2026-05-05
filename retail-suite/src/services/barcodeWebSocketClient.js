/**
 * ==========================================
 * 🎯 droidClient.js - DroidCam Integration
 * ==========================================
 *
 * المسار:
 * Vue (droidClient.js)
 *    ↓ (api.get / api.post)
 * Frappe Backend (Python)
 *    ↓ (TCP Socket)
 * DroidCam (الهاتف)
 *    ↓ (MJPEG Frames)
 * Vue (عرض الفيديو)
 *
 * ==========================================
 */

import { ref, computed } from 'vue'
import { api } from './auth'

/**
 * ==========================================
 * 1️⃣ المتغيرات الأساسية
 * ==========================================
 */

// الاتصال والحالة
const isConnected = ref(false)
const connectionStatus = ref('disconnected') // 'connected', 'disconnected', 'error', 'connecting'
let reconnectTimeout = null

// معلومات الاتصال
const droidcamIP = ref('192.168.8.15')
const droidcamPort = ref(4747)

// الفيديو والـ Frames
const latestFrame = ref(null) // آخر صورة (base64)
const frameCount = ref(0) // عدد الـ frames المستقبلة
const lastFrameTime = ref(null) // وقت آخر frame

// الباركود والبيانات المستقبلة
const scannedBarcode = ref('') // الباركود المسح ضوئي
const barcodeList = ref([]) // قائمة الباركودات المسحوضة
const lastScannedTime = ref(null) // وقت آخر مسح

// Polling للحصول على البيانات
let framePollingInterval = null
let statusPollingInterval = null
let barcodePollingInterval = null  // ✅ جديد: polling للباركود

/**
 * ==========================================
 * 2️⃣ دالة الاتصال بـ DroidCam
 * ==========================================
 */

export const connectToDroidCam = async (ip = '192.168.8.15', port = 4747) => {
  console.log(`\n🔗 محاولة الاتصال بـ DroidCam على ${ip}:${port}...\n`)

  connectionStatus.value = 'connecting'

  try {
    // استدعاء Frappe API مع credentials
    const result = await api.post('/api/method/retail.retail.api.droidcam.connect_to_droidcam', {
      ip: ip,
      port: port
    }, {
      credentials: 'include' // أرسل الـ cookies
    })

    console.log('📥 رد من Frappe:', result.data.message)

    if (result.data.message && result.data.message.status === 'connected') {
      console.log(`✅ اتصال ناجح!`)
      isConnected.value = true
      connectionStatus.value = 'connected'

      droidcamIP.value = ip
      droidcamPort.value = port

      // بدء استقبال البيانات
      startReceivingFrames()
      startReceivingStatus()
      startReceivingBarcodes()  // ✅ جديد: استقبال الباركودات

      // إذاعة حدث
      window.dispatchEvent(new CustomEvent('droidcam-connected', {
        detail: { ip, port }
      }))
    } else {
      console.error(`❌ فشل الاتصال: ${result.data.message?.message}`)
      connectionStatus.value = 'error'

      // إعادة محاولة
      reconnectTimeout = setTimeout(() => {
        console.log('🔁 إعادة محاولة...')
        connectToDroidCam(ip, port)
      }, 2000)
    }
  } catch (error) {
    console.error(`❌ خطأ في استدعاء API: `, error)
    connectionStatus.value = 'error'

    // إعادة محاولة
    reconnectTimeout = setTimeout(() => {
      console.log('🔁 إعادة محاولة...')
      connectToDroidCam(ip, port)
    }, 2000)
  }
}

/**
 * ==========================================
 * 3️⃣ دالة استقبال الـ Frames (الفيديو)
 * ==========================================
 */

const startReceivingFrames = () => {
  console.log(`📹 بدء استقبال الـ Frames...`)

  // استدعاء API كل 500ms للحصول على آخر frame (بدل 100ms)
  framePollingInterval = setInterval(async () => {
    try {
      const result = await api.get('/api/method/retail.retail.api.droidcam.get_latest_frame', {
        credentials: 'include' // أرسل الـ cookies
      })

      if (result.data.message && result.data.message.frame) {
        // حفظ الـ frame
        latestFrame.value = result.data.message.frame // base64
        frameCount.value = result.data.message.frame_number
        lastFrameTime.value = result.data.message.timestamp

        // طباعة إحصائيات كل 5 frames
        if (frameCount.value % 5 === 0) {
          console.log(`📹 Frame #${frameCount.value}: ${result.data.message.size} bytes`)
        }

        // إذاعة حدث (اختياري)
        window.dispatchEvent(new CustomEvent('frame-received', {
          detail: {
            frame: result.data.message.frame,
            frameNumber: frameCount.value,
            timestamp: result.data.message.timestamp
          }
        }))
      }
    } catch (error) {
      // لا تطبع error في كل مرة لأنها تكرار هائل
      // console.error('❌ خطأ في استقبال Frame:', error)
    }
  }, 500) // تحديث كل 500ms (بدل 100ms) = 2 مرات في الثانية
}

/**
 * ==========================================
 * ✅ دالة استقبال الباركود من Backend
 * ==========================================
 */

const startReceivingBarcodes = () => {
  console.log(`📦 بدء استقبال الباركودات...`)

  // استدعاء API كل 500ms للحصول على آخر باركود
  barcodePollingInterval = setInterval(async () => {
    try {
      const result = await api.get('/api/method/retail.retail.api.droidcam.get_latest_barcode', {
        credentials: 'include'
      })

      if (result.data.message && result.data.message.barcode) {
        const newBarcode = result.data.message.barcode

        // تحقق إذا كان باركود جديد (لم نرسله من قبل)
        if (scannedBarcode.value !== newBarcode) {
          console.log(`📦 استقبال باركود جديد: ${newBarcode}`)
          processBarcode(newBarcode)
        }
      }
    } catch (error) {
      // تجاهل الأخطاء في polling
    }
  }, 500) // تحديث كل 500ms
}

const startReceivingStatus = () => {
  console.log(`📡 بدء استقبال حالة الاتصال...`)

  statusPollingInterval = setInterval(async () => {
    try {
      const result = await api.get('/api/method/retail.retail.api.droidcam.get_droidcam_status', {
        credentials: 'include' // أرسل الـ cookies
      })

      if (result.data.message) {
        // لا تطبع الحالة في كل مرة (هائل جداً)
        // console.log(`📊 الحالة:`, result.data.message)

        // التحقق من الاتصال فقط عند تغييره
        if (!result.data.message.is_connected && isConnected.value) {
          console.error(`❌ فقد الاتصال بـ DroidCam!`)
          isConnected.value = false
          connectionStatus.value = 'disconnected'
        }
      }
    } catch (error) {
      // تجاهل الأخطاء في polling
    }
  }, 10000) // تحديث كل 10 ثوانِ (بدل 5 ثوانِ)
}

/**
 * ==========================================
 * 5️⃣ دالة قطع الاتصال
 * ==========================================
 */

export const disconnectDroidCam = async () => {
  console.log(`\n🔌 قطع الاتصال بـ DroidCam...\n`)

  // إيقاف الـ polling
  if (framePollingInterval) clearInterval(framePollingInterval)
  if (statusPollingInterval) clearInterval(statusPollingInterval)
  if (barcodePollingInterval) clearInterval(barcodePollingInterval)  // ✅ جديد
  if (reconnectTimeout) clearTimeout(reconnectTimeout)

  try {
    // استدعاء API
    const result = await api.post('/api/method/retail.retail.api.droidcam.disconnect_droidcam', {}, {
      credentials: 'include' // أرسل الـ cookies
    })

    console.log(`✅ تم قطع الاتصال`)
    isConnected.value = false
    connectionStatus.value = 'disconnected'
    latestFrame.value = null
    frameCount.value = 0

    window.dispatchEvent(new CustomEvent('droidcam-disconnected'))
  } catch (error) {
    console.error('❌ خطأ في قطع الاتصال:', error)
  }
}

/**
 * ==========================================
 * 6️⃣ دالة معالجة الباركود المستقبل
 * ==========================================
 *
 * هنا تحدث المعالجة الفعلية للبيانات المستقبلة
 * هل الباركود من الهاتف؟ أم من الفيديو (OCR)؟
 */

export const processBarcode = (barcode) => {
  console.log(`\n📦 تم استقبال باركود: ${barcode}\n`)

  if (!barcode || barcode.trim() === '') {
    console.warn('⚠️ باركود فارغ')
    return
  }

  // حفظ الباركود
  scannedBarcode.value = barcode
  lastScannedTime.value = new Date().toLocaleTimeString('ar-EG')

  // إضافة للقائمة
  barcodeList.value.push({
    barcode: barcode,
    timestamp: new Date().toISOString(),
    id: Date.now()
  })

  // احتفظ بآخر 50 باركود فقط
  if (barcodeList.value.length > 50) {
    barcodeList.value.shift()
  }

  console.log(`✅ تم حفظ الباركود: ${barcode}`)
  console.log(`📊 إجمالي الباركودات: ${barcodeList.value.length}`)

  // إذاعة حدث (للـ components الأخرى)
  window.dispatchEvent(new CustomEvent('barcode-scanned', {
    detail: {
      barcode: barcode,
      timestamp: lastScannedTime.value,
      totalScanned: barcodeList.value.length
    }
  }))

  // إرسال للـ Backend تلقائياً
  sendBarcodeToBackend(barcode)
}

/**
 * ==========================================
 * 7️⃣ دالة إرسال الباركود للـ Backend
 * ==========================================
 *
 * لو كنت تريد إرسال الباركود إلى Frappe
 * (مثلاً لحفظه في قاعدة البيانات)
 */

export const sendBarcodeToBackend = async (barcode) => {
  console.log(`📤 إرسال الباركود للـ Backend: ${barcode}`)

  try {
    const result = await api.post('/api/method/retail.retail.api.barcode.save_scanned_barcode', {
      barcode: barcode,
      timestamp: new Date().toISOString(),
      source: 'droidcam' // مصدر المسح (من الهاتف/الفيديو)
    }, {
      credentials: 'include' // أرسل الـ cookies
    })

    if (result.data.message && result.data.message.status === 'success') {
      console.log(`✅ تم حفظ الباركود في DB`)
      return result.data.message
    } else {
      console.warn(`⚠️ فشل حفظ الباركود`)
    }
  } catch (error) {
    console.error(`❌ خطأ في إرسال الباركود:`, error)
  }
}

/**
 * ==========================================
 * 8️⃣ دالة تنظيف البيانات
 * ==========================================
 */

export const clearBarcodeList = () => {
  console.log(`🗑️ حذف قائمة الباركودات`)
  barcodeList.value = []
  scannedBarcode.value = ''
  lastScannedTime.value = null
}

/**
 * ==========================================
 * 9️⃣ الـ Computed Properties
 * ==========================================
 */

const isConnectedComputed = computed(() => isConnected.value)

const statusClass = computed(() => ({
  'status-connected': connectionStatus.value === 'connected',
  'status-disconnected': connectionStatus.value === 'disconnected',
  'status-error': connectionStatus.value === 'error',
  'status-connecting': connectionStatus.value === 'connecting'
}))

const frameDataURL = computed(() => {
  if (latestFrame.value) {
    return `data:image/jpeg;base64,${latestFrame.value}`
  }
  return null
})

const totalScannedBarcodes = computed(() => barcodeList.value.length)

/**
 * ==========================================
 * 🔟 Export الـ Composable
 * ==========================================
 */

export const useDroidCamClient = () => {
  return {
    // المتغيرات (Refs)
    isConnected,
    connectionStatus,
    droidcamIP,
    droidcamPort,
    latestFrame,
    frameCount,
    lastFrameTime,
    scannedBarcode,
    barcodeList,
    lastScannedTime,

    // الدوال (Functions)
    connectToDroidCam,
    disconnectDroidCam,
    processBarcode,
    sendBarcodeToBackend,
    clearBarcodeList,
    startReceivingFrames,
    startReceivingStatus,

    // Computed Properties
    isConnectedComputed,
    statusClass,
    frameDataURL,
    totalScannedBarcodes
  }
}
