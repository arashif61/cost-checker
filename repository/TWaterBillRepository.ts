import { DataSource } from "typeorm";
import { TWaterBill } from "../entity/TWaterBill";

export class TWaterBillRepository {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource({
            logging: false,
            type: "sqlite",
            database: "./main.db",
            entities: [TWaterBill],
        });
    }

    /**
     * 水道代取得
     * @returns 水道代リスト
     */
    getWater = async (): Promise<TWaterBill[]> => {
        return new Promise(resolve => {

            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TWaterBill);

                    const result = await repo.find();
                    await this.dataSource.destroy();

                    resolve(result);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    saveData = (data: TWaterBill) => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TWaterBill);
                    await repo.save(data);
                    await this.dataSource.destroy();
                    resolve(null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }
}