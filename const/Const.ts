export const SCRAP_SITE_SBI: string = "sbi";
export const SCRAP_SITE_TOKYO_WATER: string = "tokyowater";
const ERRMSG_REQUIRED: string = "は必ず入力してください。";

export function getErrMsgRequired(param: string) {
    return param + ERRMSG_REQUIRED;
}