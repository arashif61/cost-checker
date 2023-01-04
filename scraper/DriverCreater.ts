import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

import settings from '../settings.json';
const csvDirPath = settings['csvDirPath'];

export class DriverCreater {
    create = async () => {
        const options = new chrome.Options()
            .windowSize({ width: 1980, height: 1200 })
            .setUserPreferences({ "download.default_directory": csvDirPath })
            .addArguments('--headless');

        return await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    }
}