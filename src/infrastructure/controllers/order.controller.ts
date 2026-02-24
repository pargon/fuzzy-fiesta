import { Request, Response } from "express";
import { CreateOrderUseCase } from "../../application/use-cases/create-order.use-case";
import { CancelOrderUseCase } from "../../application/use-cases/cancel-order.use-case";
import { createOrderCommandSchema } from "../../application/dtos/create-order.command";
import { cancelOrderCommandSchema } from "../../application/dtos/cancel-order.command";
import { toCreateOrderResponseDto } from "../http/create-order.response";
import { toCancelOrderResponseDto } from "../http/cancel-order.response";

interface Dependencies {
  createOrderUseCase: CreateOrderUseCase;
  cancelOrderUseCase: CancelOrderUseCase;
}

export class OrderController {
  private readonly createOrderUseCase: CreateOrderUseCase;
  private readonly cancelOrderUseCase: CancelOrderUseCase;

  constructor({ createOrderUseCase, cancelOrderUseCase }: Dependencies) {
    this.createOrderUseCase = createOrderUseCase;
    this.cancelOrderUseCase = cancelOrderUseCase;
  }

  async create(req: Request, res: Response): Promise<void> {
    const command = createOrderCommandSchema.parse(req.body);
    const result = await this.createOrderUseCase.execute(command);
    res.status(201).json(toCreateOrderResponseDto(result));
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const command = cancelOrderCommandSchema.parse({
      orderId: Number(req.params.orderId),
      userId: req.body.userId,
    });
    const result = await this.cancelOrderUseCase.execute(command);
    res.status(200).json(toCancelOrderResponseDto(result));
  }
}
