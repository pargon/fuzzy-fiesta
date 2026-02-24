import { CancelOrderResult } from "../../application/dtos/cancel-order.result";
import { OrderResponseDto, toOrderResponseDto } from "./create-order.response";

export interface CancelOrderResponseDto {
  order: OrderResponseDto;
}

export function toCancelOrderResponseDto(result: CancelOrderResult): CancelOrderResponseDto {
  return { order: toOrderResponseDto(result.order) };
}
