import { z } from "zod";
import { ORDER_SIDE_VALUES } from "../../domain/value-objects/order-side.vo";
import { ORDER_TYPE_VALUES } from "../../domain/value-objects/order-type.vo";

export const createOrderCommandSchema = z
  .object({
    userId: z.number().int().positive(),
    instrumentId: z.number().int().positive(),
    side: z.enum(ORDER_SIDE_VALUES),
    type: z.enum(ORDER_TYPE_VALUES),
    size: z.number().int().positive().optional(),
    amount: z.number().positive().optional(),
    price: z.number().positive().optional(),
    datetime: z
      .preprocess((val) => {
        if (val === undefined || val === null) return undefined;
        if (val instanceof Date) return val;
        if (typeof val === "number") return new Date(val);
        if (typeof val === "string") {
          let normalized = val.trim().replace(" ", "T");
          if (!/Z|[+-]\d{2}:?\d{2}$/.test(normalized)) {
            normalized = `${normalized}Z`;
          }
          const date = new Date(normalized);
          return isNaN(date.getTime()) ? val : date;
        }
        return val;
      }, z.date({ invalid_type_error: "Invalid date format. Expected ISO 8601." }))
      .optional(),
  })
  .refine(
    (data) => !(data.size !== undefined && data.amount !== undefined),
    { message: "Provide 'size' OR 'amount', but not both." }
  );

export type CreateOrderCommand = z.infer<typeof createOrderCommandSchema>;
