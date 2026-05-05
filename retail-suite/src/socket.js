import { io } from "socket.io-client"

let socket = null

export function initSocket(siteName) {
  if (socket) return socket

  try {

//    const url = import.meta.env.VITE_FRAPPE_URL_LOCAL
// const url = `/${siteName}`
    const url = `https://192.168.8.5:81/dms.com`  // namespace صح
    console.log("[socket] connecting via proxy to site:", siteName, "at URL:", url)

    socket = io(url, {
      path: `/socket.io`,  // Vite هيعمل proxy لده لـ Frappe
      withCredentials: true,
      reconnectionAttempts: 5,
      autoConnect: false,
      transports: ["websocket", "polling"],
      query: { site: siteName },
    })

    socket.on("connect", () => console.log("[socket] connected"))
    socket.on("connect_error", (err) => console.warn("[socket] error:", err.message))
    socket.on("disconnect", () => console.log("[socket] disconnected"))

    return socket
  } catch (err) {
    console.error("[socket] init failed:", err)
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connect: () => {},
      disconnect: () => {},
    }
  }
}
