// src/bot/bot.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as TelegramBot from 'node-telegram-bot-api';
// import { Agent } from 'socks5-https-client/lib/Agent';

const TOKEN = "YOUR_BOT_TOKEN";
const botUsername = "churr_referral_bot";

@Injectable()
export class BotService {
  private bot: TelegramBot;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.bot = new TelegramBot(TOKEN, {
      polling: true,

    });

    this.bot.onText(/\/start (.+)/, this.handleStartWithReferral.bind(this));
    this.bot.onText(/\/start/, this.handleStart.bind(this));
  }

  async handleStartWithReferral(msg, match) {
    const userId = msg.from.id;
    const referrerId = parseInt(match[1], 10);
    const chatId = msg.chat.id;

    let user = await this.userRepository.findOne({ where: {  userId } });

    if (user) {
      this.bot.sendMessage(chatId, "This user already exists");
      return;
    }

    user = this.userRepository.create({ userId, referredBy: referrerId, referrals: [] });
    await this.userRepository.save(user);

    const referrer = await this.userRepository.findOne({ where: {userId: referrerId} });
    if (referrer) {
      referrer.referrals.push(userId);
      await this.userRepository.save(referrer);
      this.bot.sendMessage(userId, `Thanks for joining via referral! You were referred by ${referrerId}.`);
    } else {
      this.bot.sendMessage(userId, "Welcome!");
    }

    this.bot.sendMessage(userId, `Your referral link: https://t.me/${botUsername}?start=${userId}`);
  }

  async handleStart(msg) {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    let user = await this.userRepository.findOne({ where: {userId: userId} });

    if (!user) {
      user = this.userRepository.create({ userId, referredBy: null, referrals: [] });
      await this.userRepository.save(user);
      this.bot.sendMessage(userId, "Welcome!");
      this.bot.sendMessage(userId, `Your referral link: https://t.me/${botUsername}?start=${userId}`);
    }
  }
}