/**
 * Module ghi nhật ký rút tiền
 * File này chịu trách nhiệm lưu trữ nhật ký các giao dịch rút tiền vào một file
 */

import fs from "fs";
import path from "path";
import { WithdrawalTransaction } from "@shared/schema";

const LOG_FILE_PATH = path.join(process.cwd(), "withdrawal-transactions.txt");

/**
 * Ghi thông tin giao dịch rút tiền vào file nhật ký
 */
export function logWithdrawalTransaction(transaction: WithdrawalTransaction, userId: number, username: string, walletAddress: string): void {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ID: ${transaction.id} | User: ${username} (ID: ${userId}) | Amount: ${transaction.amount} TON | To: ${walletAddress} | Status: ${transaction.status} | TxHash: ${transaction.txHash || "N/A"}\n`;
    
    fs.appendFileSync(LOG_FILE_PATH, logEntry);
    console.log(`[WITHDRAWAL_LOG] Transaction recorded: ID #${transaction.id}`);
  } catch (error) {
    console.error("[WITHDRAWAL_LOG] Error recording transaction:", error);
  }
}

/**
 * Đọc tất cả các giao dịch rút tiền từ file nhật ký
 */
export function readWithdrawalLogs(): string {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return "No withdrawal transactions have been recorded yet.";
    }
    
    return fs.readFileSync(LOG_FILE_PATH, "utf8");
  } catch (error) {
    console.error("[WITHDRAWAL_LOG] Error reading transaction logs:", error);
    return "Error reading withdrawal transaction logs.";
  }
}

/**
 * Tạo file nhật ký nếu chưa tồn tại
 */
export function initializeWithdrawalLogs(): void {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) {
      fs.writeFileSync(LOG_FILE_PATH, "# TON Withdrawal Transaction Logs\n\n");
      console.log("[WITHDRAWAL_LOG] Withdrawal log file created at", LOG_FILE_PATH);
    }
  } catch (error) {
    console.error("[WITHDRAWAL_LOG] Error initializing withdrawal logs:", error);
  }
}

// Tạo file nhật ký khi khởi động
initializeWithdrawalLogs();