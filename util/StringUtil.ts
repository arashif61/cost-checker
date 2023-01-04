export class StringUtil {
    /**
     * 2桁でゼロ埋め
     * @param {string} str 
     * @returns ゼロ埋め後の文字列
     */
    static paddingZero = (str: string) => {
        return ('00' + str).slice(-2);
    }
}
