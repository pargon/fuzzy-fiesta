import { Order } from "../entities/order.entity";
import { EntityId } from "../value-objects/entity-id.vo";
import { UserId } from "../value-objects/user-id.vo";

export interface OrderRepositoryPort {
  save(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  findById(id: EntityId): Promise<Order | undefined>;
  getFilledByUserIdSortedByDate(userId: UserId): Promise<Order[]>;
}
