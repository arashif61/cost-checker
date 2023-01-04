import express from "express";
const app: express.Express = express();
app.set("view engine", "pug");
app.use(express.static("public"));

import bodyParser from "body-parser";

import { TBalanceRepository } from "./repository/TBalanceRepository";
import { TLastUpdateTimeRepository } from "./repository/TLastUpdateTimeRepository";
import { TWaterBillRepository } from "./repository/TWaterBillRepository";
import { TPaymentRepository } from "./repository/TPaymentRepository";
import { TDepositRepository } from "./repository/TDepositRepository";
import { MScrapLoginInfoRepository } from "./repository/MScrapLoginInfoRepository";

import { TBalance } from "./entity/TBalance";
import { TDeposit } from "./entity/TDeposit";
import { TLastUpdateTime } from "./entity/TLastUpdateTime";
import { TPayment } from "./entity/TPayment";

import { DriverCreater } from "./scraper/DriverCreater";
import { TokyoWaterScraper } from "./scraper/TokyoWaterScraper";
import { SBIBankScraper } from "./scraper/SBIBankScraper";

import { SBIBankCsvUtil } from "./util/SBIBankCsvUtil";

import * as Const from "./const/Const";

import settings from "./settings.json";
import { MScrapLoginInfo } from "./entity/MScrapLoginInfo";
import { StringUtil } from "./util/StringUtil";
const portNumber: number = settings["portNumber"];

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.listen(portNumber, function () {
    console.log("cost-checker is listening to PORT:" + portNumber);
});

type TopPageDto = {
    thisMonth: number;
    balance: number;
    thisMonthPaymentSum: number;
    thisMonthDepositSum: number;
    lastUpdateTime: string;
}

/**
 * GET:ルート
 */
app.get("/", async (req, res) => {
    const date = new Date();
    const y = date.getFullYear();
    const month = date.getMonth() + 1;
    const ym = y + "/" + StringUtil.paddingZero(month.toString());

    let paymentSum = await new TPaymentRepository().getPriceSumByYm(ym);

    let depositSum = await new TDepositRepository().getPriceSumByYm(ym);

    const param: TopPageDto = {
        thisMonth: month,
        balance: await new TBalanceRepository().getData("1"),
        thisMonthPaymentSum: paymentSum,
        thisMonthDepositSum: depositSum,
        lastUpdateTime: await new TLastUpdateTimeRepository().getData(1)
    };

    // 遷移
    res.render("index", param);
});

app.get("/deposit-list", async (req, res) => {
    const param = {
        depositList: await new TDepositRepository().getListOrderByDateDesc()
    };

    // 遷移
    res.render("deposit-list", param);
});

app.get("/payment-list", async (req, res) => {
    const param = {
        paymentList: await new TPaymentRepository().getListOrderByDateDesc()
    };

    // 遷移
    res.render("payment-list", param);
});

app.get("/water-list", async (req, res) => {
    const param = {
        waterList: await new TWaterBillRepository().getWater()
    };

    // 遷移
    res.render("water-list", param);
});

type UpdateIdPassErrMsg = {
    sbiUserId: string;
    sbiPassword: string;
    waterUserId: string;
    waterPassword: string;
}

/**
 * GET:設定
 */
app.get("/settings", async (req, res) => {
    // サイトのID/PASS取得
    const sbiLoginInfo = await new MScrapLoginInfoRepository().getData(Const.SCRAP_SITE_SBI);
    const waterLoginInfo = await new MScrapLoginInfoRepository().getData(Const.SCRAP_SITE_TOKYO_WATER);

    const sbiUserId = sbiLoginInfo != null ? sbiLoginInfo.id : "";
    const sbiPassword = sbiLoginInfo != null ? sbiLoginInfo.password : "";
    const waterUserId = waterLoginInfo != null ? waterLoginInfo.id : "";
    const waterPassword = waterLoginInfo != null ? waterLoginInfo.password : "";

    const errMsg: UpdateIdPassErrMsg = {
        sbiUserId: "",
        sbiPassword: "",
        waterUserId: "",
        waterPassword: ""
    };

    // 遷移
    res.render(
        "settings",
        {
            sbiUserId: sbiUserId,
            sbiPassword: sbiPassword,
            waterUserId: waterUserId,
            waterPassword: waterPassword,
            errMsg
        }
    );
});

/**
 * POST:スクレイピング対象サイトのID・パスワード更新
 */
app.post("/update-idpass", async (req, res) => {
    const sbiUserId: string = req.body.sbiUserId;
    const sbiPassword: string = req.body.sbiPassword;
    const waterUserId = req.body.waterUserId;
    const waterPassword = req.body.waterPassword;

    const errMsg: UpdateIdPassErrMsg = {
        sbiUserId: "",
        sbiPassword: "",
        waterUserId: "",
        waterPassword: ""
    };

    let isErr = false;
    if (sbiUserId == "") {
        errMsg.sbiUserId = Const.getErrMsgRequired("ユーザーID");
        isErr = true;
    }

    if (sbiPassword == "") {
        errMsg.sbiPassword = Const.getErrMsgRequired("パスワード");
        isErr = true;
    }

    if (waterUserId == "") {
        errMsg.waterUserId = Const.getErrMsgRequired("ユーザーID");
        isErr = true;
    }

    if (waterPassword == "") {
        errMsg.waterPassword = Const.getErrMsgRequired("パスワード");
        isErr = true;
    }

    if (isErr) {
        res.render("settings", { sbiUserId: sbiUserId, sbiPassword: sbiPassword, waterUserId: waterUserId, waterPassword: waterPassword, errMsg });
        return;
    }

    // SBIのID・パスワード更新
    const scrapLoginInfoSbi = new MScrapLoginInfo();
    scrapLoginInfoSbi.scrapSite = Const.SCRAP_SITE_SBI;
    scrapLoginInfoSbi.id = sbiUserId;
    scrapLoginInfoSbi.password = sbiPassword;
    await new MScrapLoginInfoRepository().saveData(scrapLoginInfoSbi);

    // 東京都水道局のID・パスワード更新
    const scrapLoginInfoWater = new MScrapLoginInfo();
    scrapLoginInfoWater.scrapSite = Const.SCRAP_SITE_TOKYO_WATER;
    scrapLoginInfoWater.id = waterUserId;
    scrapLoginInfoWater.password = waterPassword;
    await new MScrapLoginInfoRepository().saveData(scrapLoginInfoWater);

    // 遷移
    res.render("settings", { sbiUserId: sbiUserId, sbiPassword: sbiPassword, waterUserId: waterUserId, waterPassword: waterPassword, errMsg });
});

/**
 * POST:情報更新
 */
app.post("/updatedata", async (req, res) => {
    const sbiBankCsvUtil = new SBIBankCsvUtil();

    // CSVファイルを削除
    sbiBankCsvUtil.deleteTempFiles();

    // スクレイピングのドライバ生成
    const driver = await new DriverCreater().create();

    // 水道料金取得
    const waterBillList = await new TokyoWaterScraper().getWaterCharge(driver);

    // NEOBANK明細ダウンロード
    const successDownload = await new SBIBankScraper().downloadNeobankCsv(driver)
    if (!successDownload) {
        driver.quit();
        res.send("POST is sended.");
        return;
    }

    // ドライバを閉じる
    driver.quit()

    // 水道料金DB更新
    for (let waterBill of waterBillList) {
        await new TWaterBillRepository().saveData(waterBill);
    }

    // 入出金明細読み込み
    const inOutList = sbiBankCsvUtil.readCsv();

    let index = 0;
    for (let item of inOutList) {
        if (index == 0 && item.balance != null) {
            // 先頭行の残高で更新
            const balance = new TBalance();
            balance.bank_id = "1";
            balance.balance = item.balance;
            await new TBalanceRepository().saveData(balance);
        }

        if (item.outAmount != undefined && !isNaN(item.outAmount)) {
            // 支出の場合
            // 重複した支出情報を取得
            const paymentDublicateList = await new TPaymentRepository().getListByInOutDtlDto(item)

            if (paymentDublicateList.length == 0) {
                // 重複した支出情報がない場合、登録
                const payment = new TPayment();
                payment.date = item.date;
                payment.price = item.outAmount;
                payment.title = item.content;
                await new TPaymentRepository().saveData(payment);
            }

        } else {
            // 入金の場合
            // 重複した入金情報を取得
            const depositDublicateList = await new TDepositRepository().getListByInOutDtlDto(item);

            if (item.inAmount != null && depositDublicateList.length == 0) {
                // 重複した入金情報がない場合、登録      
                const deposit = new TDeposit();
                deposit.date = item.date;
                deposit.price = item.inAmount;
                deposit.transferer = item.content;
                await new TDepositRepository().saveData(deposit);
            }
        }

        index++;
    }

    // 最終更新日時を更新
    const lastUpdateTime = new TLastUpdateTime();
    lastUpdateTime.id = 1;
    lastUpdateTime.last_update_time = new Date().toLocaleString();
    await new TLastUpdateTimeRepository().saveData(lastUpdateTime);

    res.send("POST is sended.");
});
