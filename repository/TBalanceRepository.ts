import { DataSource } from "typeorm";
import { TBalance } from "../entity/TBalance";


export class TBalanceRepository {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource({
            logging: false,
            type: "sqlite",
            database: "./main.db",
            entities: [TBalance],
        });
    }

    /**
     * 残高取得
     * @returns 残高
     */
    getData = (bankId: string): Promise<number> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TBalance);

                    const result = await repo.findOneBy({
                        bank_id: bankId
                    });
                    await this.dataSource.destroy();

                    resolve(result == null ? 0 : result.balance);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    saveData = (balance: TBalance) => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TBalance);
                    await repo.save(balance);
                    await this.dataSource.destroy();
                    resolve(null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }
}