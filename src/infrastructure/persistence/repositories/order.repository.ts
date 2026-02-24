import { Order } from "../../../domain/entities/order.entity";
import { EntityId } from "../../../domain/value-objects/entity-id.vo";
import { UserId } from "../../../domain/value-objects/user-id.vo";
import { OrderRepositoryPort } from "../../../domain/ports/order-repository.port";
import { ILogger } from "../../../domain/ports/logger.port";
import { OrderMapper } from "../mappers/order.mapper";
import { OrderModel } from "../models/orders.model";
import { ORDER_STATUS } from "../../../domain/value-objects/order-status.vo";

interface Dependencies {
  logger: ILogger;
}

export class OrderRepository implements OrderRepositoryPort {
  private readonly logger: ILogger;

  constructor({ logger }: Dependencies) {
    this.logger = logger;
  }

  async save(order: Order): Promise<Order> {
    const persistencePayload = OrderMapper.toPersistence(order);
    const createdModel = await OrderModel.create(persistencePayload);
    return OrderMapper.toDomain(createdModel);
  }

  async update(order: Order): Promise<Order> {
    await OrderModel.update(OrderMapper.toPersistence(order), {
      where: { id: order.id!.value },
    });
    const updated = await OrderModel.findByPk(order.id!.value);
    if (!updated) throw new Error(`Order ${order.id!.value} not found after update.`);
    return OrderMapper.toDomain(updated);
  }

  async findById(id: EntityId): Promise<Order | undefined> {
    const model = await OrderModel.findByPk(id.value);
    return model ? OrderMapper.toDomain(model) : undefined;
  }

  async getFilledByUserIdSortedByDate(userId: UserId): Promise<Order[]> {
    const foundOrders = await OrderModel.findAll({
      where: {
        userId: userId.value,
        status: ORDER_STATUS.FILLED,
      },
      order: [
        ["datetime", "ASC"],
        ["id", "ASC"]
      ],
    });
    const orders: Order[] = [];
    for (const model of foundOrders) {
      try {
        orders.push(OrderMapper.toDomain(model));
      } catch (error) {
        this.logger.error(`[OrderRepository] Skipping corrupt order ID ${model.id}:`, (error as Error).message);
      }
    }
    return orders;
  }
}
