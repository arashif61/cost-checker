import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class MScrapLoginInfo {
    @PrimaryColumn()
    scrapSite!: string;

    @Column()
    id!: string;

    @Column()
    password!: string;
}