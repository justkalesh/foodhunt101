import { onRequestOptions as __api_chat_js_onRequestOptions } from "C:\\Important\\Code\\Food-hunt-master\\functions\\api\\chat.js"
import { onRequestPost as __api_chat_js_onRequestPost } from "C:\\Important\\Code\\Food-hunt-master\\functions\\api\\chat.js"
import { onRequestOptions as __api_scan_menu_js_onRequestOptions } from "C:\\Important\\Code\\Food-hunt-master\\functions\\api\\scan-menu.js"
import { onRequestPost as __api_scan_menu_js_onRequestPost } from "C:\\Important\\Code\\Food-hunt-master\\functions\\api\\scan-menu.js"
import { onRequestOptions as __api_send_push_js_onRequestOptions } from "C:\\Important\\Code\\Food-hunt-master\\functions\\api\\send-push.js"
import { onRequestPost as __api_send_push_js_onRequestPost } from "C:\\Important\\Code\\Food-hunt-master\\functions\\api\\send-push.js"

export const routes = [
    {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_chat_js_onRequestOptions],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/scan-menu",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_scan_menu_js_onRequestOptions],
    },
  {
      routePath: "/api/scan-menu",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_scan_menu_js_onRequestPost],
    },
  {
      routePath: "/api/send-push",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_send_push_js_onRequestOptions],
    },
  {
      routePath: "/api/send-push",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_push_js_onRequestPost],
    },
  ]