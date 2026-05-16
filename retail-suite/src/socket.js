import { io } from "socket.io-client"

let socket = null


export function initSocket(siteName) {
  if (socket) return socket
  try {
    socket = io("https://192.168.8.5:81",{
      path: `/socket.io`,
      withCredentials: true,
      reconnectionAttempts: 5,
      autoConnect: false,
      transports: ["polling", "websocket"],

    })
    console.log("[socket] connecting via Vite proxy",socket)
    socket.on("connect", () => console.log("[socket] connected"))
    socket.on("connect_error", (err) => console.warn("[socket] error:", err.message))
    socket.on("disconnect", () => console.log("[socket] disconnected"))
    return socket
  } catch (err) {
    console.error("[socket] init failed:", err)
    return { on: () => {}, off: () => {}, emit: () => {}, connect: () => {}, disconnect: () => {} }
  }
}
