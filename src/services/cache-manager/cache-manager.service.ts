import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheManagerService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  get manager(): Cache {
    return this.cacheManager;
  } 
}