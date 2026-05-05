"""
==========================================
🎯 WebSocket Real-time Barcode Broadcasting
==========================================

المسار:
Keyboard Input (الهاتف يكتب الباركود)
         ↓
Vue sends to Frappe
         ↓
Frappe adds to Queue
         ↓
WebSocket broadcasts to all connected clients
         ↓
Vue receives and displays instantly (0 latency)

بدل polling كل 500ms ✅
"""

import asyncio
import json
import queue
import threading
from datetime import datetime
import frappe
from frappe import _


# ==========================================
# 1️⃣ Queue للباركودات
# ==========================================

barcode_queue = queue.Queue()  # FIFO Queue
connected_clients = set()  # مجموعة العملاء المتصلين


# ==========================================
# 2️⃣ DroidCam Manager (محدّث)
# ==========================================

class DroidCamManager:
    """مدير اتصال DroidCam مع WebSocket Broadcasting"""

    def __init__(self):
        self.socket = None
        self.is_connected = False
        self.droidcam_ip = None
        self.droidcam_port = 4747
        self.frame_count = 0
        self.thread = None
        self.running = False
        self.frame_buffer = []
        self.barcode_buffer = []
        self.last_detected_barcode = None
        self.detection_interval = 5

    def connect(self, ip, port=4747):
        """الاتصال بـ DroidCam"""
        try:
            frappe.logger().info(f"🔗 محاولة الاتصال بـ DroidCam على {ip}:{port}...")

            import socket
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.settimeout(5)
            self.socket.connect((ip, port))

            self.is_connected = True
            self.droidcam_ip = ip
            self.droidcam_port = port
            self.frame_count = 0

            frappe.logger().info(f"✅ اتصال TCP نجح مع {ip}:{port}")

            # إرسال الـ Handshake
            self._send_handshake()

            # بدء استقبال البيانات
            self.running = True
            self.thread = threading.Thread(target=self._receive_frames, daemon=True)
            self.thread.start()

            return {
                'status': 'connected',
                'ip': ip,
                'port': port,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            frappe.logger().error(f"❌ خطأ في الاتصال: {str(e)}")
            self.is_connected = False
            return {'status': 'error', 'message': str(e)}

    def _send_handshake(self):
        """إرسال الـ Handshake"""
        try:
            import time
            handshake_cmd = b'CMD /v3/video/MJPEG/1280x720\n'
            self.socket.sendall(handshake_cmd)
            frappe.logger().info(f"📤 تم إرسال Handshake")
            time.sleep(0.5)
        except Exception as e:
            frappe.logger().error(f"❌ خطأ في إرسال Handshake: {str(e)}")
            self.is_connected = False

    def _receive_frames(self):
        """استقبال بيانات الفيديو"""
        buffer = b''
        frame_counter = 0

        try:
            while self.running and self.is_connected:
                try:
                    data = self.socket.recv(65536)

                    if not data:
                        frappe.logger().warning("❌ DroidCam أغلق الاتصال")
                        self.is_connected = False
                        break

                    buffer += data

                    # البحث عن MJPEG frames
                    while True:
                        start_idx = buffer.find(b'\xff\xd8')
                        end_idx = buffer.find(b'\xff\xd9', start_idx)

                        if start_idx != -1 and end_idx != -1:
                            frame = buffer[start_idx:end_idx + 2]

                            import base64
                            frame_base64 = base64.b64encode(frame).decode('utf-8')

                            self.frame_buffer.append({
                                'frame': frame_base64,
                                'size': len(frame),
                                'timestamp': datetime.now().isoformat(),
                                'frame_number': self.frame_count
                            })

                            self.frame_count += 1
                            frame_counter += 1

                            if len(self.frame_buffer) > 30:
                                self.frame_buffer.pop(0)

                            buffer = buffer[end_idx + 2:]
                        else:
                            break

                    if len(buffer) > 1000000:
                        buffer = buffer[-65536:]

                except Exception as e:
                    frappe.logger().error(f"❌ خطأ في استقبال البيانات: {str(e)}")
                    break

        except Exception as e:
            frappe.logger().error(f"❌ خطأ في thread الاستقبال: {str(e)}")
        finally:
            self.is_connected = False

    def disconnect(self):
        """قطع الاتصال"""
        self.running = False

        if self.socket:
            try:
                self.socket.close()
            except:
                pass

        self.is_connected = False
        frappe.logger().info("❌ تم قطع الاتصال بـ DroidCam")

        return {'status': 'disconnected'}

    def get_latest_frame(self):
        """الحصول على آخر frame"""
        if self.frame_buffer:
            return self.frame_buffer[-1]
        return None

    def get_status(self):
        """الحصول على حالة الاتصال"""
        return {
            'is_connected': self.is_connected,
            'ip': self.droidcam_ip,
            'port': self.droidcam_port,
            'frame_count': self.frame_count,
            'buffered_frames': len(self.frame_buffer),
            'scanned_barcodes': len(self.barcode_buffer),
            'queue_size': barcode_queue.qsize()  # ✅ جديد
        }

    # ==========================================
    # ✅ معالجة الباركود
    # ==========================================

    def add_scanned_barcode(self, barcode):
        """
        إضافة باركود إلى Queue
        يتم معالجته بشكل غير متزامن
        """
        if not barcode or barcode.strip() == '':
            return {'status': 'error', 'message': 'Barcode is empty'}

        barcode_data = {
            'barcode': barcode.strip(),
            'timestamp': datetime.now().isoformat(),
            'id': len(self.barcode_buffer) + 1
        }

        # أضف للـ buffer
        self.barcode_buffer.append(barcode_data)
        if len(self.barcode_buffer) > 50:
            self.barcode_buffer.pop(0)

        # ✅ أضف للـ Queue للبث الفوري
        barcode_queue.put(barcode_data)

        frappe.logger().info(f"✅ تم إضافة باركود للـ Queue: {barcode}")

        return {
            'status': 'success',
            'barcode': barcode_data,
            'total_scanned': len(self.barcode_buffer),
            'queue_size': barcode_queue.qsize()
        }

    def get_latest_barcode(self):
        """الحصول على آخر باركود"""
        if self.barcode_buffer:
            return self.barcode_buffer[-1]
        return None

    def get_all_barcodes(self):
        """الحصول على جميع الباركودات"""
        return self.barcode_buffer

    def clear_barcodes(self):
        """مسح قائمة الباركودات"""
        count = len(self.barcode_buffer)
        self.barcode_buffer = []
        frappe.logger().info(f"🗑️ تم حذف {count} باركود")
        return {'status': 'success', 'cleared': count}


# إنشاء instance عام
droidcam_manager = DroidCamManager()


# ==========================================
# 3️⃣ WebSocket Async Tasks
# ==========================================

async def process_barcodes():
    """
    ✅ اقرأ من Queue وأرسل الباركود عبر WebSocket
    يعمل في حلقة غير متزامنة
    """
    frappe.logger().info("🚀 بدء معالج الباركودات (WebSocket)")

    while True:
        try:
            # افحص Queue كل 100ms
            if not barcode_queue.empty():
                barcode_data = barcode_queue.get_nowait()
                await send_barcode(barcode_data)
                frappe.logger().debug(f"📤 تم إرسال باركود عبر WebSocket: {barcode_data['barcode']}")

            await asyncio.sleep(0.1)

        except queue.Empty:
            await asyncio.sleep(0.1)
        except Exception as e:
            frappe.logger().error(f"❌ خطأ في معالجة الباركود: {e}")
            await asyncio.sleep(0.1)


async def send_barcode(barcode_data):
    """
    ✅ أرسل الباركود لجميع العملاء المتصلين عبر WebSocket
    """
    if connected_clients:
        message = json.dumps({
            "type": "barcode-scanned",
            "data": barcode_data
        })

        # أرسل للجميع بشكل متزامن
        tasks = [client.send(message) for client in connected_clients]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        frappe.logger().info(f"📡 تم بث الباركود لـ {len(connected_clients)} عملاء")


# ==========================================
# 4️⃣ Frappe API Endpoints
# ==========================================

@frappe.whitelist()
def connect_to_droidcam(ip, port=4747):
    """الاتصال بـ DroidCam"""
    result = droidcam_manager.connect(ip, int(port))
    return result


@frappe.whitelist()
def disconnect_droidcam():
    """قطع الاتصال"""
    result = droidcam_manager.disconnect()
    return result


@frappe.whitelist()
def get_droidcam_status():
    """الحصول على حالة الاتصال"""
    return droidcam_manager.get_status()


@frappe.whitelist()
def get_latest_frame():
    """الحصول على آخر frame"""
    frame = droidcam_manager.get_latest_frame()
    if frame:
        return frame
    return {'error': 'No frames available'}


@frappe.whitelist()
def scan_barcode(barcode):
    """
    ✅ استقبال باركود من Vue
    يتم إضافته للـ Queue للبث الفوري
    """
    result = droidcam_manager.add_scanned_barcode(barcode)
    return result


@frappe.whitelist()
def get_latest_barcode():
    """الحصول على آخر باركود"""
    barcode = droidcam_manager.get_latest_barcode()
    if barcode:
        return barcode
    return {'error': 'No barcodes available'}


@frappe.whitelist()
def get_all_scanned_barcodes():
    """الحصول على جميع الباركودات"""
    barcodes = droidcam_manager.get_all_barcodes()
    return {
        'barcodes': barcodes,
        'total': len(barcodes),
        'queue_size': barcode_queue.qsize()  # ✅ معلومة Queue
    }


@frappe.whitelist()
def clear_scanned_barcodes():
    """مسح قائمة الباركودات"""
    result = droidcam_manager.clear_barcodes()
    return result


# ==========================================
# 5️⃣ WebSocket Handler (في app.py أو routes)
# ==========================================

"""
أضف هذا في Frappe app initialization:

في ~/frappe-bench/apps/your_app/your_app/app.py

from aiohttp import web
import asyncio

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    # أضف العميل للـ set
    connected_clients.add(ws)
    frappe.logger().info(f"✅ عميل جديد متصل. الإجمالي: {len(connected_clients)}")

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                # معالجة الرسائل الواردة من العميل
                pass
            elif msg.type == web.WSMsgType.ERROR:
                frappe.logger().error(f"❌ WebSocket error: {ws.exception()}")
    finally:
        # أزل العميل من الـ set
        connected_clients.discard(ws)
        frappe.logger().info(f"❌ عميل قطع الاتصال. الإجمالي: {len(connected_clients)}")

    return ws

# ضيف الـ route
app.router.add_get('/ws/barcodes', websocket_handler)

# بدء معالج الباركودات
asyncio.create_task(process_barcodes())
"""
