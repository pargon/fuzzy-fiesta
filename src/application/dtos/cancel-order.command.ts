import { z } from "zod";

export const cancelOrderCommandSchema = z.object({
  orderId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export type CancelOrderCommand = z.infer<typeof cancelOrderCommandSchema>;
