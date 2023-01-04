import { FindManyOptions, IsNull, Like } from "typeorm";
import { DataSource } from "typeorm";
import { TDeposit } from "../entity/TDeposit";
import { InOutDtlDto } from "../dto/InOutDtlDto";


export class TDepositRepository {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource({
            logging: false,
            type: "sqlite",
            database: "./main.db",
            entities: [TDeposit],
        });
    }

    /**
     * 入金全件取得
     * @returns 入金リスト
     */
    getListOrderByDateDesc = (): Promise<TDeposit[]> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TDeposit);

                    const result = await repo.find({
                        order: { date: "DESC" }
                    });
                    await this.dataSource.destroy();

                    resolve(result);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    /**
     * 年月から入金額合計取得
     * @param ym 年月
     * @returns 入金額
     */
    getPriceSumByYm = (ym: string): Promise<number> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TDeposit);
                    const list = await repo.find({ where: { date: Like(ym + "%") } });
                    const depositSum = list.reduce(function (sum, element) {
                        return sum + element.price;
                    }, 0);
                    await this.dataSource.destroy();
                    resolve(depositSum);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    /**
     * 入出金明細DTOから入金取得
     * @param {InOutDtlDto} dto 入出金明細DTO
     * @returns リスト
     */
    getListByInOutDtlDto = (dto: InOutDtlDto): Promise<TDeposit[]> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TDeposit);
                    let condition: FindManyOptions<TDeposit> = {};
                    if (dto.inAmount == null) {
                        condition = {
                            where: {
                                date: dto.date,
                                price: IsNull(),
                                transferer: dto.content
                            }
                        };
                    } else {
                        condition = {
                            where: {
                                date: dto.date,
                                price: dto.inAmount,
                                transferer: dto.content
                            }
                        };
                    }
                    const result = await repo.find(condition);
                    await this.dataSource.destroy();

                    resolve(result);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    saveData = (deposit: TDeposit) => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TDeposit);
                    await repo.save(deposit);
                    await this.dataSource.destroy();
                    resolve(null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }
}