import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ConfigurationService } from "../configuration/configuration.service";
import { Logger } from "../logger/logger.service";
import { Sequelize } from "sequelize-typescript";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigurationService],
      useFactory(configurationService: ConfigurationService) {
        return configurationService.databaseConfig;
      }
    }),
  ]
})
export class DatabaseModule {
  constructor(
    private readonly logger: Logger,
    private readonly sqz: Sequelize,
  ) {
    this.logger.setContext(DatabaseModule.name)
    this.testConnection();
  }

  private async testConnection() {
    try {
      await this.sqz.authenticate();
      this.logger.log(`Database connection successfully.`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}