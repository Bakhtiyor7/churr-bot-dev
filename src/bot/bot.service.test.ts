import { Injectable } from '@nestjs/common';
import { Command, Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Update()
@Injectable()
export class BotServiceTest {
    private botUsername = 'churr_referral_bot'; // replace with your actual bot username

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    getData(): { message: string } {
        return { message: 'Welcome to server!' };
    }

    @Start()
    async startCommand(@Ctx() ctx: Context) {
        const startPayload = this.getStartPayload(ctx);
        const firstName = ctx.from.username;

        if (startPayload) {
            // Handle the referral code
            await this.handleReferral(ctx, startPayload);
        }

        const imageUrl = 'https://www.craiyon.com/image/oQafX1bpS6GkpCNRcVEjZw'

        await ctx.replyWithPhoto(imageUrl, {
            caption: `Welcome to SPACE CHURR! 🚀.
            CHURR HUNTERS, Hop On Your Spaceship And Mine CHURR On Mysterious Plantes!
            Your Participation will help maintain and grow SPACE CHURR.
            Start your space adventure and Collect CHURR! 🌌.
            Are you ready? Let's head to space and find some CHURR! ✨`,
            reply_markup: {
                inline_keyboard: [
                    // [{ text: 'Next', callback_data: 'next' }],
                    [{ text: '🎮 Play Game', url: `t.me/spacechurrBot/churrspace` }],
                    [{ text: '👬 Referral', callback_data: 'get-referral-code' }],
                    [{ text: 'X', callback_data: 'btn-1' },
                        { text: 'Telegram', callback_data: 'btn-2' }],
                ],
            },
        })
        };


    getStartPayload(ctx: Context): string | null {
        if (ctx.message && 'text' in ctx.message) {
            const text = ctx.message.text;
            const parts = text.split(' ');
            const payload = parts.length > 1 ? parts[1] : null;
            console.log('Start payload:', payload);
            return payload;
        }
        return null;
    }

    @Command('referral')
    async getReferralCode(@Ctx() ctx: Context) {
        const userId = ctx.from.id;
        let user = await this.usersRepository.findOne({ where: { userId } });

        if (!user) {
            // Create a new user if they don't exist
            user = this.usersRepository.create({
                userId: ctx.from.id,
                referrals: [],
            });
            await this.usersRepository.save(user);
        }

        const referralCode = user.userId.toString();
        const referralLink = `https://t.me/${this.botUsername}?start=${referralCode}`;
        await ctx.reply(`Invite friends to play Space Churr together!
        
        – Your Personal Link: ${referralLink}`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Invite Friends', switch_inline_query: referralLink}]
                ]
            }
        });
    }

    async handleReferral(ctx: Context, referralCode: string) {
        const referrer = await this.usersRepository.findOne({ where: { userId: parseInt(referralCode) } });

        if (!referrer) {
            await ctx.reply(`Invalid referral code.`);
            return;
        }

        let referred = await this.usersRepository.findOne({ where: { userId: ctx.from.id } });

        if (!referred) {
            // Create a new user if they don't exist
            referred = this.usersRepository.create({
                userId: ctx.from.id,
                referredBy: referrer.id,
                referrals: [],
            });
            await this.usersRepository.save(referred);

            // Update referrer's referrals
            referrer.referrals.push(referred.userId);
            await this.usersRepository.save(referrer);

            // Notify referrer
            await ctx.telegram.sendMessage(referrer.userId, `User ${referred.userId} joined using your referral code.`);
        }

        await ctx.reply(`You were referred by ${referrer.userId}`);
    }

    @Help()
    async helpCommand(ctx: Context) {
        await ctx.reply('help reply');
    }

    @On('callback_query')
    async onCallbackQuery(@Ctx() ctx: Context) {
        const query = ctx.callbackQuery;

        if ('data' in query) {
            const data = (query as { data: string }).data;

            if (data === 'get-referral-code') {
                await this.getReferralCode(ctx);
            }
        }
    }
}