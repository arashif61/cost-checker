import { FindManyOptions, IsNull, Like } from "typeorm";
import { DataSource } from "typeorm";
import { TPayment } from "../entity/TPayment";
import { InOutDtlDto } from "../dto/InOutDtlDto";

export class TPaymentRepository {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource({
            logging: false,
            type: "sqlite",
            database: "./main.db",
            entities: [TPayment],
        });
    }

    /**
     * 出金取得
     * @returns 出金リスト
     */
    getListOrderByDateDesc = (): Promise<TPayment[]> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TPayment);

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
     * 年月から出金額合計取得
     * @param ym 年月
     * @returns 出金額
     */
    getPriceSumByYm = (ym: string): Promise<number> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TPayment);
                    const list = await repo.find({ where: { date: Like(ym + "%") } });
                    const paymentSum = list.reduce(function (sum, element) {
                        return sum + element.price;
                    }, 0);
                    await this.dataSource.destroy();
                    resolve(paymentSum);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    /**
     * 重複した出金取得
     * @param {InOutDtlDto} dto
     * @returns 出金リスト
     */
    getListByInOutDtlDto = (dto: InOutDtlDto): Promise<TPayment[]> => {

        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TPayment);
                    let condition: FindManyOptions<TPayment> = {};
                    if (dto.outAmount == null) {
                        condition = {
                            where: {
                                date: dto.date,
                                price: IsNull(),
                                title: dto.content
                            }
                        };
                    } else {
                        condition = {
                            where: {
                                date: dto.date,
                                price: dto.outAmount,
                                title: dto.content
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

    /**
     * 保存
     */
    saveData = (data: TPayment) => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TPayment);
                    await repo.save(data);
                    await this.dataSource.destroy();
                    resolve(null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }
}