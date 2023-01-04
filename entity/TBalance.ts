import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TBalance {
    @PrimaryColumn()
    bank_id!: string;
    
    @Column()
    balance!: number;
}