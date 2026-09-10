import { z } from "zod";

export const loginSchema = z.object({
  email: z.string()
    .min(2, "Correo electrónico no debe quedar vacío")
    .email("Ingresa un correo electrónico válido (ej: usuario@dominio.com)"),
  password:z
    .string()
    .min(1, "Contraseña es obligatoria")
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Contraseña Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Contraseña Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Contraseña Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Contraseña Debe contener al menos un carácter especial")
    .refine(
      (val) => !/[<>]/.test(val),
      { message: "Contraseña No se permiten los caracteres < >" }
    )
    .refine(
      (val) => !/['"]/.test(val),
      { message: "Contraseña No se permiten comillas simples o dobles" }
    )
    .refine(
      (val) => !/\\/.test(val),
      { message: "Contraseña No se permiten barras invertidas \\" }
    )
    .refine(
      (val) => !/[;]/.test(val),
      { message: "Contraseña No se permiten punto y coma ;" }
    )
    .refine(
      (val) => !/\s/.test(val),
      { message: "Contraseña No se permiten espacios en blanco" }
    )
});

export type LoginSchema = typeof loginSchema;