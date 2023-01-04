import { DataSource } from 'typeorm'

import { TBalance } from "./entity/TBalance";
import { TDeposit } from "./entity/TDeposit";
import { TLastUpdateTime } from "./entity/TLastUpdateTime";
import { TPayment } from "./entity/TPayment";
import { TWaterBill } from "./entity/TWaterBill";
import { MScrapLoginInfo } from "./entity/MScrapLoginInfo";

const source = new DataSource({
    logging: false,
    type: "sqlite",
    database: "./main.db",
    entities: [TBalance, TDeposit, TLastUpdateTime, TPayment, TWaterBill, MScrapLoginInfo],
    migrations: ['migration/*.ts'],
});

export default source