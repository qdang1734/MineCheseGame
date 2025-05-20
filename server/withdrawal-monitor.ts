/**
 * Hệ thống theo dõi và xử lý các giao dịch rút tiền tự động
 * Module này sẽ định kỳ kiểm tra các giao dịch đang chờ xử lý và thực hiện rút tiền
 */

import { storage } from "./storage";
import { processWithdrawal } from "./ton-utils";
import { WithdrawalTransaction } from "@shared/schema";
import { logWithdrawalTransaction } from "./withdrawal-logs";

// Thời gian giữa các lần kiểm tra (60 giây)
const CHECK_INTERVAL = 60 * 1000;

/**
 * Xử lý giao dịch rút tiền
 */
async function processWithdrawalTransaction(transaction: WithdrawalTransaction): Promise<void> {
  try {
    console.log(`[WITHDRAWAL] Xử lý giao dịch #${transaction.id} - ${transaction.amount} TON đến ${transaction.toAddress}`);
    
    // Gọi hàm xử lý rút tiền từ ví game
    const result = await processWithdrawal({
      userId: transaction.userId,
      amount: transaction.amount,
      toAddress: transaction.toAddress
    });
    
    if (result.success) {
      // Cập nhật trạng thái giao dịch thành công
      await storage.updateWithdrawalTransactionStatus(
        transaction.id,
        "completed",
        result.txHash,
        "Giao dịch đã được xử lý thành công"
      );
      
      // Tìm thông tin người dùng để ghi log
      const user = await storage.getUser(transaction.userId);
      if (user) {
        // Ghi log giao dịch rút tiền vào file
        logWithdrawalTransaction(transaction, user.id, user.username, transaction.toAddress);
      }
      
      console.log(`[WITHDRAWAL] Giao dịch #${transaction.id} đã được xử lý thành công. TxHash: ${result.txHash}`);
    } else {
      // Cập nhật trạng thái giao dịch thất bại
      await storage.updateWithdrawalTransactionStatus(
        transaction.id,
        "failed",
        undefined,
        result.message || "Không thể xử lý giao dịch"
      );
      console.error(`[WITHDRAWAL] Giao dịch #${transaction.id} thất bại: ${result.message}`);
    }
  } catch (error) {
    console.error(`[WITHDRAWAL] Lỗi khi xử lý giao dịch #${transaction.id}:`, error);
    
    // Cập nhật trạng thái giao dịch thất bại với thông báo lỗi
    await storage.updateWithdrawalTransactionStatus(
      transaction.id,
      "failed",
      undefined,
      `Lỗi: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Xử lý tất cả các giao dịch đang chờ xử lý
 */
async function processPendingWithdrawals(): Promise<void> {
  try {
    // Lấy danh sách các giao dịch đang chờ xử lý
    const pendingTransactions = await storage.getPendingWithdrawalTransactions();
    
    if (pendingTransactions.length === 0) {
      console.log("[WITHDRAWAL] Không có giao dịch đang chờ xử lý");
      return;
    }
    
    console.log(`[WITHDRAWAL] Đang xử lý ${pendingTransactions.length} giao dịch đang chờ`);
    
    // Xử lý từng giao dịch
    for (const transaction of pendingTransactions) {
      await processWithdrawalTransaction(transaction);
    }
  } catch (error) {
    console.error("[WITHDRAWAL] Lỗi khi xử lý các giao dịch đang chờ:", error);
  }
}

/**
 * Khởi động hệ thống theo dõi giao dịch rút tiền
 */
export function startWithdrawalMonitor(): NodeJS.Timeout {
  console.log("[WITHDRAWAL] Khởi động hệ thống theo dõi giao dịch rút tiền");
  
  // Chạy một lần ngay khi khởi động
  processPendingWithdrawals().catch(error => {
    console.error("[WITHDRAWAL] Lỗi khi xử lý giao dịch ban đầu:", error);
  });
  
  // Thiết lập interval để chạy định kỳ
  return setInterval(processPendingWithdrawals, CHECK_INTERVAL);
}