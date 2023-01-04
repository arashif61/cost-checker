import { SleepUtil } from '../util/SleepUtil';
import { MScrapLoginInfoRepository } from '../repository/MScrapLoginInfoRepository';

import { WebDriver, By, until } from 'selenium-webdriver';

import * as Const from "../const/Const";

import settings from '../settings.json';
const neobankDepositUrl = settings['neobankDepositUrl'];
const neobankDebitUrl = settings['neobankDebitUrl'];
const timeoutMs = settings['timeoutMs'];

export class SBIBankScraper {

    /**
     * NEOBANK明細ダウンロード
     * @param {WebDriver} driver 
     */
    downloadNeobankCsv = async (driver: WebDriver): Promise<boolean> => {
        const loginInfo = await new MScrapLoginInfoRepository().getData(Const.SCRAP_SITE_SBI);
        if (loginInfo == null) {
            return false;
        }
        const neobankId = loginInfo.id;
        const neobankPass = loginInfo.password;

        await driver.get(neobankDepositUrl);
        // ログイン
        await driver.wait(until.elementsLocated(By.css('#userNameNewLogin')), timeoutMs);
        let selectBackRadio = await driver.findElements(By.css('.neo-sbiLogin > label'));
        if (selectBackRadio.length > 0) {
            await selectBackRadio[0].click();
        }

        await driver.wait(until.elementsLocated(By.css('.m-btnEm-l > span')), timeoutMs);
        let userName = await driver.findElement(By.css('#userNameNewLogin'));
        await userName.sendKeys(neobankId);
        let password = await driver.findElement(By.css('#loginPwdSet'));
        await password.sendKeys(neobankPass);
        let loginButton = await driver.findElement(By.css('.m-btnEm-l > span'));
        await loginButton.click();

        // 入出金明細ダウンロード
        await driver.wait(until.elementsLocated(By.css('[name="term"]#term02')), timeoutMs);
        let thisMonthRadio = await driver.findElement(By.css('[for="term02"]'));
        thisMonthRadio.click();
        let showButton = await driver.findElement(By.xpath("/html/body/app/div[1]/ng-component/div/main/ng-component/section/div/div[2]/div[3]/div[3]/div/a"));
        showButton.click();
        await driver.wait(until.elementsLocated(By.css('.details-iconExcel')), timeoutMs);
        let csvDownloadLink = await driver.findElement(By.css('.details-iconExcel'));
        await csvDownloadLink.click();
        await SleepUtil._sleep(500);

        // デビット明細ダウンロード
        await driver.get(neobankDebitUrl);
        try {
            await driver.wait(until.elementsLocated(By.css('.m-debitcard-meisaiHeader-download')), timeoutMs);
            let debitCsvDownloadLink = await driver.findElement(By.css('.m-debitcard-meisaiHeader-download a:first-child'));
            await debitCsvDownloadLink.click();
            await SleepUtil._sleep(1000);
        } catch (error) {
            return false;
        }
        return true;
    }
}