import { createKeyv as createRedisKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { CacheableMemory } from "cacheable";
import { Keyv } from "keyv";
import { ConfigurationService } from "../../configuration/configuration.service";
import { CacheManagerService } from "./cache-manager.service";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ lruSize: 5000 }),
              namespace: "chatio",
            }),
            createRedisKeyv(configurationService.cacheConfig.redisURI, {
              namespace: "chatio",
            }),
          ],
          refreshAllStores: true,
        }
      }
    })
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerService]
})
export class CacheManagerModule { }