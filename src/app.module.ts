import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
// import { BotService } from './bot/bot.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import { ormConfig } from "./config/typeorm.config";
import * as process from 'node:process';
import {TelegrafModule} from "nestjs-telegraf";
import {BotServiceTest} from "./bot/bot.service.test";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync(ormConfig),
    TypeOrmModule.forFeature([User]),
      TelegrafModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          token: configService.get<string>('TELEGRAM_BOT_TOKEN')
        })
      })
  ],
  controllers: [AppController],
  providers: [AppService, BotServiceTest],
})
export class AppModule {}
