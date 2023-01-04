import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TDeposit {
    @PrimaryGeneratedColumn()
    seq?: number;

    @Column()
    date!: string;

    @Column()
    price!: number;

    @Column({ nullable: true })
    transferer?: string;
}