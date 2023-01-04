import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TLastUpdateTime{
    @PrimaryColumn()
    id!: number;
    
    @Column()
    last_update_time!: string;
}