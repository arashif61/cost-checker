import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TWaterBill {
    @PrimaryColumn()
    ym_from!: string;

    @Column()
    ym_to!: string;

    @Column()
    usage!: number;

    @Column()
    price!: number;
}
