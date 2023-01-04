import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TPayment {
    @PrimaryGeneratedColumn()
    seq?: number;

    @Column()
    date!: string;

    @Column()
    price!: number;

    @Column()
    title!: string;
}