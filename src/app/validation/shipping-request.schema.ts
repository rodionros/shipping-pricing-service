import { z } from "zod";

export const cartSchema = z.object({
    weight_kg: z.number().positive(),
    width_cm: z.number().positive(),
    height_cm: z.number().positive(),
    length_cm: z.number().positive(),
    amount: z.number().min(0)
});

export const addressSchema = z.object({
    city: z.string().min(1),
    postal_code: z.string().min(1),
    street: z.string().min(1),
    country: z.string().min(1)
});

export const shippingRequestSchema = z.object({
    cart: cartSchema,
    address: addressSchema
});

export type ShippingRequestInput = z.infer<typeof shippingRequestSchema>;