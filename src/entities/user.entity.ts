// src/entities/user.entity.ts

import {Entity, PrimaryGeneratedColumn, Column, Timestamp, CreateDateColumn} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  userId: number;

  @Column({ nullable: true } )
  referredBy: number;

  @Column('simple-array')
  referrals: number[];

  @CreateDateColumn()
  createdAt: Date;
}