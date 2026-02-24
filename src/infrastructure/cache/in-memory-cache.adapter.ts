import NodeCache from "node-cache";
import { CachePort } from "../../domain/ports/cache.port";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Dependencies { }

export class InMemoryCacheAdapter<T> implements CachePort<T> {
  private readonly store: NodeCache;

  constructor({ }: Dependencies) {
    this.store = new NodeCache({ stdTTL: 300, checkperiod: 60 });
  }

  async get(key: string): Promise<T | undefined> {
    return this.store.get<T>(key);
  }

  async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      this.store.set(key, value, ttlSeconds);
    } else {
      this.store.set(key, value);
    }
  }

  async delete(key: string): Promise<void> {
    this.store.del(key);
  }
}