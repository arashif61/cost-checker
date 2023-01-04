# cost-checker

## 概要
銀行の明細と水道料金を取得し一覧で表示するための、アカウントアグリゲーションアプリです。  
対応ソースは下記に限られています。  
* 住信SBIネット銀行(スクレイピングでCSVファイルをダウンロード)
* 東京都水道局(東京都水道局アプリからスクレイピング)

## 注意点
セキュリティの都合上、ローカル環境での仕様を想定しています。決して公開Webサーバで稼働しないでください。  
パスワード等が平文で保管されます。 **使用者の責任で情報を保護してください。**

## 使い方
### 環境
* Node.js
* selenium
* chromedriver
* sqlite3

### 設定
1. 下記でDB環境(sqlite)のマイグレーションを行います。
```
  npx ts-node ./node_modules/.bin/typeorm migration:generate ./migration/migration -d ./ormconfig.ts
  npx ts-node ./node_modules/.bin/typeorm migration:run -d ./ormconfig.ts
```
2. settings.jsonのcsvDirPathに、CSVファイルを一時的に保管するフォルダのパスを指定します。

## 免責
このソフトウェアの使用で生じたいかなる損害も、作者は責任を負いません。  
ご使用の際はご自身の責任でお願いいたします。  
銀行などのID/PASSWORDを使用するため、処理内容を理解した上でご使用ください。
