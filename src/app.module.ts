import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import appConfig from './config/app.config'
import databaseConfig from './config/database.config'
import { TokenModule } from './token/token.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        timezone: 'utc',
        synchronize: configService.get<boolean>('database.synchronize'),
        bigNumberStrings: false,
        logging: false,
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
      }),
    }),
    TokenModule,
  ],
})
export class AppModule {}
