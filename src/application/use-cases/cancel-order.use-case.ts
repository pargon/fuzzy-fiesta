import { OrderRepositoryPort } from "../../domain/ports/order-repository.port";
import { EntityId } from "../../domain/value-objects/entity-id.vo";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { OrderNotFoundError } from "../../domain/errors/order-not-found.error";
import { CancelOrderCommand } from "../dtos/cancel-order.command";
import { CancelOrderResult } from "../dtos/cancel-order.result";

interface Dependencies {
  orderRepository: OrderRepositoryPort;
}

export class CancelOrderUseCase {
  private readonly orderRepository: OrderRepositoryPort;

  constructor({ orderRepository }: Dependencies) {
    this.orderRepository = orderRepository;
  }

  async execute(command: Readonly<CancelOrderCommand>): Promise<CancelOrderResult> {
    const orderId = EntityId.create(command.orderId);
    const userId = UserId.create(command.userId);

    const order = await this.orderRepository.findById(orderId);
    if (order === undefined) {
      throw new OrderNotFoundError(`Order ${command.orderId} not found.`);
    }

    const cancelledOrder = order.cancel(userId);
    const persisted = await this.orderRepository.update(cancelledOrder);
    return { order: persisted };
  }
}
