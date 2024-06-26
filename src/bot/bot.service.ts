// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../entities/user.entity';
// import { Context, Markup, NarrowedContext } from 'telegraf';
// import { Start, Help, Update, On } from 'nestjs-telegraf';
// import { CallbackQuery, Message } from 'typegram';
//
// @Injectable()
// @Update()
// export class BotService {
//   constructor(
//       @InjectRepository(User)
//       private userRepository: Repository<User>,
//   ) {}
//
//   @Start()
//   async startCommand(ctx: Context) {
//     const userId = ctx.from.id;
//     const username = ctx.from.username;
//     const chatId = ctx.chat.id;
//
//     let user = await this.userRepository.findOne({ where: { userId } });
//
//     if (!user) {
//       user = this.userRepository.create({ userId, referredBy: null, referrals: [] });
//       await this.userRepository.save(user);
//       await ctx.reply(`Welcome, ${username}!`, Markup.inlineKeyboard([
//         Markup.button.callback('Get your referral link', 'get_referral')
//       ]));
//     } else {
//       await ctx.reply(`Welcome again, ${username}!`);
//     }
//   }
//
//   @Help()
//   async helpCommand(ctx: Context) {
//     await ctx.reply('This bot helps you with referrals. Use /start to get started.');
//   }
//
//   @On('callback_query')
//   async onCallbackQuery(ctx: NarrowedContext<Context, { callback_query: CallbackQuery.DataQuery }>) {
//     const callbackQuery = ctx.callbackQuery;
//     const data = callbackQuery.data;
//     const userId = ctx.from.id;
//
//     if (data === 'get_referral') {
//       const user = await this.userRepository.findOne({ where: { userId } });
//       if (user) {
//         await ctx.reply(`Your referral link: https://t.me/${botUsername}?start=${userId}`);
//       } else {
//         await ctx.reply('You need to start the bot first using /start.');
//       }
//     }
//   }
// }