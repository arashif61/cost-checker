export class SleepUtil {
    /**
     * 待機
     * @param {number} ms ミリ秒
     */
    static _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
}
