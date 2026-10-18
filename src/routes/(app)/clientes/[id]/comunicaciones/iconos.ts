// src/routes/(app)/clientes/[id]/comunicaciones/iconos.ts
import Phone from "@lucide/svelte/icons/phone";
import MessageCircle from "@lucide/svelte/icons/message-circle";
import MessagesSquare from "@lucide/svelte/icons/messages-square";
import Mail from "@lucide/svelte/icons/mail";
import MessageSquare from "@lucide/svelte/icons/message-square";
import Users from "@lucide/svelte/icons/users";
import Globe from "@lucide/svelte/icons/globe";
import type { CanalComunicacion } from "$lib/types/cliente";

export const ICONOS_CANAL = {
  llamada: Phone,
  whatsapp: MessageCircle,
  chat: MessagesSquare,
  email: Mail,
  sms: MessageSquare,
  presencial: Users,
  otro: Globe,
} as const;

export const COLORES_CANAL: Record<CanalComunicacion, string> = {
  llamada: "text-muted-foreground",
  whatsapp: "text-emerald-600",
  chat: "text-sky-600",
  email: "text-amber-600",
  sms: "text-teal-600",
  presencial: "text-violet-600",
  otro: "text-muted-foreground",
};
