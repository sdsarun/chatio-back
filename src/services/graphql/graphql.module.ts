import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ConfigurationService } from '../../configuration/configuration.service';
import { ApolloServerPlugin } from '@apollo/server';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        const plugins: ApolloServerPlugin[] = [];

        if (configurationService.isDevelopment) {
          plugins.push(ApolloServerPluginLandingPageLocalDefault());
        }

        return {
          plugins,
          playground: false,
          autoSchemaFile: join(process.cwd(), 'src/services/graphql/schema.gql'),
        }
      }
    }),
  ],
})
export class GraphQLModule { }
