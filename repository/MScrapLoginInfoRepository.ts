import { DataSource } from "typeorm";
import { MScrapLoginInfo } from "../entity/MScrapLoginInfo";

export class MScrapLoginInfoRepository {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource({
            logging: false,
            type: "sqlite",
            database: "./main.db",
            entities: [MScrapLoginInfo],
        });
    }

    /**
     * データ取得
     * @returns リスト
     */
    getData = (scrapSite: string): Promise<MScrapLoginInfo | null> => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(MScrapLoginInfo);

                    const result = await repo.find({ where: { scrapSite: scrapSite } });
                    await this.dataSource.destroy();

                    resolve(result.length > 0 ? result[0] : null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }

    saveData = (data: MScrapLoginInfo) => {
        return new Promise(resolve => {
            this.dataSource.initialize()
                .then(async () => {
                    const repo = this.dataSource.getRepository(MScrapLoginInfo);
                    await repo.save(data);
                    await this.dataSource.destroy();
                    resolve(null);
                }).catch((error) => {
                    console.log(error);
                });
        });
    }
}