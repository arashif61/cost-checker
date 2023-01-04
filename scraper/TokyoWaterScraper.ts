import { StringUtil } from '../util/StringUtil';
import { TWaterBill } from "../entity/TWaterBill";
import { MScrapLoginInfoRepository } from '../repository/MScrapLoginInfoRepository';

import * as Const from "../const/Const";

import { WebDriver, By, until } from 'selenium-webdriver';

import settings from '../settings.json';
const timeoutMs = settings['timeoutMs'];
const waterUrl = settings['waterUrl'];

export class TokyoWaterScraper {
    /**
     * 水道料金取得
     * @param {WebDriver} driver 
     */
    getWaterCharge = async (driver: WebDriver): Promise<TWaterBill[]> => {
        const loginInfo = await new MScrapLoginInfoRepository().getData(Const.SCRAP_SITE_TOKYO_WATER);
        if (loginInfo == null) {
            return [];
        }
        const waterId = loginInfo.id;
        const waterPass = loginInfo.password;

        await driver.get(waterUrl);

        // ログイン
        await driver.wait(until.elementsLocated(By.id('login-mail')), timeoutMs);
        let userName = await driver.findElement(By.id('login-mail'));
        await userName.sendKeys(waterId);
        let password = await driver.findElement(By.id('login-pass'));
        await password.sendKeys(waterPass);
        let loginButton = await driver.findElement(By.css("button.loginBtn"));
        await loginButton.click();

        await driver.wait(until.elementsLocated(By.className("CusNumTit")), timeoutMs);

        await driver.executeScript('document.evaluate("//li[4]/div/span", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).click();');

        // 使用量・料金取得
        await driver.wait(until.elementsLocated(By.className('UsageHistory_ItemList')), timeoutMs);
        const usageHistoryList = await driver.findElements(By.className('UsageHistoryItem'));

        const waterBillList: TWaterBill[] = [];

        for (let i = 1; i <= usageHistoryList.length; i++) {
            await driver.executeScript(`document.evaluate("//*[@id='Content']/div/div/div/div[4]/div/div/div[${i}]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotItem(0).click();`);

            let yearMonth = await driver.findElement(By.xpath(`//*[@id='Content']/div/div/div/div[4]/div/div/div[${i}]/div/p[@class='lineItemLabel']`)).getText();
            let waterChargePreDiv = await driver.findElement(By.xpath(`//*[@id='Content']/div/div/div/div[4]/div/div/div[${i}]/div[1]/p[2]/span[1]`)).getText();
            let waterCharge = waterChargePreDiv.replace(",", "");
            let waterUsage = await driver.findElement(By.xpath(`//*[@id='Content']/div/div/div/div[4]/div/div/div[${i}]/div[2]/div[1]/p[2]/span[1]`)).getText();

            let yearMonthSplitList = yearMonth.split(new RegExp("年|月|分|\\～"));
            let yearMonthExcludeEmptyList = yearMonthSplitList.filter((item) => { return item.length > 0 });

            let yearFrom = (parseInt(yearMonthExcludeEmptyList[0]) + 2018).toString();
            let monthFrom = StringUtil.paddingZero(yearMonthExcludeEmptyList[1]);
            let yearTo = (parseInt(yearMonthExcludeEmptyList[2]) + 2018).toString();
            let monthTo = StringUtil.paddingZero(yearMonthExcludeEmptyList[3]).split("分")[0];

            const waterBill = new TWaterBill();

            waterBill.ym_from = yearFrom + "/" + monthFrom;
            waterBill.ym_to = yearTo + "/" + monthTo;
            waterBill.usage = Number(waterUsage);
            waterBill.price = Number(waterCharge);

            waterBillList.push(waterBill);
        }

        return waterBillList;
    }
}