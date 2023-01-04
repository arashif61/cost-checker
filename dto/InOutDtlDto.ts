/**
 * 入出金明細DTO
 */
export class InOutDtlDto {
  constructor(date: string, content: string, outAmount: number | null, inAmount: number | null, balance: number | null, debitFlg: boolean) {
    this.date = date
    this.content = content
    this.outAmount = outAmount
    this.inAmount = inAmount
    this.balance = balance
    this.debitFlg = debitFlg
  };

  date: string;
  content: string;
  outAmount: number | null;
  inAmount: number | null;
  balance: number | null;
  debitFlg: boolean;
}