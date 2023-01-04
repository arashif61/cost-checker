import { DataSource } from "typeorm";
import { TLastUpdateTime } from "../entity/TLastUpdateTime";

export class TLastUpdateTimeRepository {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource({
            logging: false,
            type: "sqlite",
            database: "./main.db",
            entities: [TLastUpdateTime],
        });
    }

    /**
     * 最終更新日時取得
     * @returns 最終更新日時
     */
    getData = (id: number): Promise<string> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TLastUpdateTime);

                    const foundById = await repo.findOneBy({
                        id: id,
                    });

                    await this.dataSource.destroy();

                    resolve(foundById == null ? "" : foundById.last_update_time);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    saveData = (lastUpdateTime: TLastUpdateTime) => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(TLastUpdateTime);
                    await repo.save(lastUpdateTime);
                    await this.dataSource.destroy();
                    resolve(null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }
}