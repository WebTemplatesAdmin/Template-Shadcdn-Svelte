import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(2, "Email no debe quedar vacío")
    .email("Ingresa un email válido (ej: usuario@dominio.com)")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password es obligatoria")
    .min(8, "Password debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Password Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Password Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Password Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Password Debe contener al menos un carácter especial")
    .refine(
      (val) => !/[<>]/.test(val),
      { message: "Password No se permiten los caracteres < >" }
    )
    .refine(
      (val) => !/['"]/.test(val),
      { message: "Password No se permiten comillas simples o dobles" }
    )
    .refine(
      (val) => !/\\/.test(val),
      { message: "Password No se permiten barras invertidas \\" }
    )
    .refine(
      (val) => !/[;]/.test(val),
      { message: "Password No se permiten punto y coma ;" }
    )
    .refine(
      (val) => !/\s/.test(val),
      { message: "Password No se permiten espacios en blanco" }
    ),
    aceptaTerminos: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos para continuar'
  })
});
