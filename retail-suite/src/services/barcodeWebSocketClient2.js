// services/barcodeWebSocketClient.js
import { ref } from 'vue'
// import net from "net";
const barcodeSocket = ref(null)
const isConnected = ref(false)
const connectionStatus = ref('disconnected')
let reconnectTimeout = null
//
export const useBarcodeWebSocket = () => {
    const connect = (serverIP, serverPort) => {
        try {
            const wsUrl = `ws://${serverIP}:${serverPort}`
            console.log('🔗 Connecting to WebSocket:', wsUrl)

            barcodeSocket.value = new WebSocket(wsUrl)

            barcodeSocket.value.onopen = () => {
                console.log('✅ WebSocket connected!')
                isConnected.value = true
                connectionStatus.value = 'connected'

                // أرسل hello handshake
                const helloMsg = {
                    action: 'helo',
                    version: '1.0.0',
                    deviceName: 'POS-Device',
                    deviceId: generateDeviceId()
                }
                barcodeSocket.value.send(JSON.stringify(helloMsg))
                console.log('📤 Sent hello handshake')

                // if reconnectTimeout != null
                if (reconnectTimeout) {
                    clearTimeout(reconnectTimeout)
                    reconnectTimeout = null
                }
            }

            barcodeSocket.value.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('📥 Received from server:', data)
                    console.log('📥 Full data:', JSON.stringify(data))

                    // أرسل كل الرسائل من الـ WebSocket
                    window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }))
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error)
                }
            }

            barcodeSocket.value.onerror = (error) => {
                console.error('❌ WebSocket error:', error)
                connectionStatus.value = 'error'
            }

            barcodeSocket.value.onclose = () => {
                console.log('❌ WebSocket disconnected')
                isConnected.value = false
                connectionStatus.value = 'disconnected'
                reconnectTimeout = setTimeout(() => {
                    console.log('🔁 Attempting to reconnect...')
                    connect(serverIP, serverPort)
                }, 2000)
            }
        } catch (error) {
            console.error('❌ Connection error:', error)
            connectionStatus.value = 'error'
        }
    }

    const disconnect = () => {
        if (barcodeSocket.value) {
            barcodeSocket.value.close()
            isConnected.value = false
            connectionStatus.value = 'disconnected'
            console.log('🔌 WebSocket disconnected')
        }
    }

    const sendMessage = (action, data) => {
        if (isConnected.value && barcodeSocket.value) {
            const message = { action, ...data }
            barcodeSocket.value.send(JSON.stringify(message))
            console.log('📤 Sent:', message)
        } else {
            console.warn('⚠️ WebSocket not connected')
        }
    }

    const generateDeviceId = () => {
        return 'POS-' + Math.random().toString(36).substr(2, 9)
    }

    return {
        connect,
        disconnect,
        sendMessage,
        isConnected,
        connectionStatus,
        barcodeSocket
    }
}


