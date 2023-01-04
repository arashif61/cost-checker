import settings from '../settings.json';
const csvDirPath: string = settings['csvDirPath'];
import { InOutDtlDto } from '../dto/InOutDtlDto';

import fs from 'fs';
import path from 'path';
import encodingJp from 'encoding-japanese';

export class SBIBankCsvUtil {
    /**
     * 一時ファイルの削除
     */
    deleteTempFiles = () => {
        const fileList = fs.readdirSync(csvDirPath);
        fileList.forEach((filePath: string) => {
            fs.unlinkSync(csvDirPath + filePath);
        });
    }

    /**
     * CSV読み込み
     * @returns {InOutDtlDto[]} 読み込み結果のリスト
     */
    readCsv = (): InOutDtlDto[] => {
        const debitCsvList = this.readDebitCsv();
        return this.readInOutCsv(debitCsvList);
    }

    /**
     * CSVファイルパス取得
     * @param {string} nameStartsWith ファイル名（前方一致）
     * @returns 一致するファイルパス
     */
    private getCsvFilePath = (nameStartsWith: string): string => {
        const files: string[] = fs.readdirSync(csvDirPath);
        // 降順でソート
        files.sort().reverse();
        let mtimeMax: Date = new Date('1900/01/01');
        let filePath: string = "";
        for (const file of files) {
            const fp = path.join(csvDirPath, file);
            const stats = fs.statSync(fp);
            // フォルダでない ファイル名が前方一致する場合
            if (stats.isFile() && file.startsWith(nameStartsWith)) {
                if (mtimeMax < stats.mtime) {
                    mtimeMax = stats.mtime;
                    filePath = csvDirPath + file;
                }
            }
        }

        // ファイルパス返却
        return filePath
    }

    /**
     * 入出金明細CSV読み込み
     * @param {InOutDtlDto[]} debitList デビット明細リスト
     * @returns {InOutDtlDto[]} 読み込み結果のリスト
     */
    private readInOutCsv = (debitList: InOutDtlDto[]): InOutDtlDto[] => {
        const list: InOutDtlDto[] = [];
        const fp: string = this.getCsvFilePath("nyushukinmeisai_");
        if (fp == "") return list;
        const file: Buffer = fs.readFileSync(fp);
        const text: string = encodingJp.convert(file, { from: "SJIS", to: "UNICODE", type: "string" });
        const lines: string[] = text.split("\r\n");
        lines.splice(lines.findIndex((x) => x = ""), 1);
        for (const line of lines) {
            if (lines.indexOf(line) == 0) continue;
            const temp: string = line.slice(1, line.length - 1).replace(",,", ",\"\",");
            const row: string[] = temp.split("\",\"");
            const dto = new InOutDtlDto(row[0], row[1], parseInt(row[2].replace(/,/g, "")), parseInt(row[3].replace(/,/g, "")), parseInt(row[4].replace(/,/g, "")), false);
            dto.debitFlg = dto.content.startsWith("デビット　");
            if (dto.debitFlg) {
                const matchDto = debitList.find((x) => {
                    return x.date == dto.date && x.outAmount == dto.outAmount;
                });
                dto.content = matchDto !== undefined && matchDto.content != "" ? matchDto.content : "内容未確定";
            }
            list.push(dto);
        }
        return list;
    }

    /**
     * デビット明細取得
     * @returns {InOutDtlDto[]} デビット明細のリスト
     */
    private readDebitCsv = (): InOutDtlDto[] => {
        const list: InOutDtlDto[] = [];
        const fp = this.getCsvFilePath("meisai_");
        if (fp == "") return list;
        const file = fs.readFileSync(fp);
        const text = encodingJp.convert(file, { from: "SJIS", to: "UNICODE", type: "string" });
        const lines = text.split("\r\n");
        for (const line of lines) {
            // 1行目をスキップ
            if (lines.indexOf(line) == 0) continue;
            // 空の列にダブルクオーテーション追加
            const temp = line.slice(1, line.length - 1).replace(",,", ",\"\",");
            // 配列化
            const row = temp.split("\",\"");
            const dto = new InOutDtlDto(row[1], row[2], parseInt(row[4]), null, null, false);
            list.push(dto);
        }
        return list;
    }
}