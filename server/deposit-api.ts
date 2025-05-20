/*
 * API xử lý nạp tiền
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { registerDepositTransaction, verifyTransaction, processDeposit } from './transaction-monitor';
import { isValidTonAddress } from './ton-utils';

// Schema kiểm tra dữ liệu yêu cầu đăng ký giao dịch nạp
const registerDepositSchema = z.object({
  userId: z.number().int().positive(),
  txHash: z.string().min(5),
  amount: z.number().positive().min(0.01),
  fromAddress: z.string().refine(isValidTonAddress, {
    message: "Invalid TON wallet address format"
  })
});

// Schema kiểm tra yêu cầu xác minh giao dịch
const verifyDepositSchema = z.object({
  txHash: z.string().min(5)
});

/**
 * Đăng ký một giao dịch nạp tiền mới để theo dõi
 */
export async function registerDeposit(req: Request, res: Response) {
  try {
    // Xác thực dữ liệu đầu vào
    const validationResult = registerDepositSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false, 
        error: validationResult.error.issues.map(issue => issue.message).join(', ')
      });
    }
    
    const { userId, txHash, amount, fromAddress } = validationResult.data;
    
    // Đăng ký giao dịch để theo dõi
    registerDepositTransaction(txHash, userId, amount);
    
    return res.status(200).json({
      success: true,
      message: "Deposit transaction registered for monitoring",
      txHash,
      amount,
      status: "pending"
    });
    
  } catch (error) {
    console.error("Error registering deposit:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

/**
 * Xác minh một giao dịch nạp tiền
 */
export async function verifyDeposit(req: Request, res: Response) {
  try {
    // Xác thực dữ liệu đầu vào
    const validationResult = verifyDepositSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false, 
        error: validationResult.error.issues.map(issue => issue.message).join(', ')
      });
    }
    
    const { txHash } = validationResult.data;
    
    // Xác minh giao dịch
    const transaction = await verifyTransaction(txHash);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found or not verified"
      });
    }
    
    return res.status(200).json({
      success: true,
      transaction,
      status: transaction.confirmed ? "confirmed" : "pending"
    });
    
  } catch (error) {
    console.error("Error verifying deposit:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}



/**
 * API xử lý yêu cầu nạp tiền trực tiếp (không thông qua theo dõi)
 */
export async function handleDirectDeposit(req: Request, res: Response) {
  try {
    const { userId, amount, txHash } = req.body;
    
    if (!userId || !amount || !txHash) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin: userId, amount, txHash"
      });
    }

    // Xác minh giao dịch trên blockchain trước khi xử lý
    console.log(`[DEPOSIT] Đang xác minh giao dịch ${txHash} trước khi xử lý trực tiếp`);
    const transaction = await verifyTransaction(txHash);
    
    if (!transaction) {
      console.log(`[DEPOSIT] Giao dịch ${txHash} không tìm thấy trên blockchain hoặc chưa được xác nhận`);
      
      // Nếu không xác minh được trên blockchain, vẫn xử lý nhưng ghi log cảnh báo
      console.log(`[DEPOSIT] Đang xử lý giao dịch ${txHash} mà không có xác minh blockchain`);
    } else if (!transaction.confirmed) {
      console.log(`[DEPOSIT] Giao dịch ${txHash} tìm thấy nhưng chưa được xác nhận trên blockchain`);
    } else {
      // Giao dịch tìm thấy và đã xác nhận
      console.log(`[DEPOSIT] Giao dịch ${txHash} đã được xác minh trên blockchain với số tiền ${transaction.amount} TON`);
      
      // Nếu amount không khớp với blockchain, sử dụng giá trị từ blockchain
      if (transaction.amount !== amount) {
        console.log(`[DEPOSIT] Giá trị amount không khớp: yêu cầu=${amount}, blockchain=${transaction.amount}`);
        // Ghi đè số tiền từ blockchain
        const actualAmount = transaction.amount;
        
        // Xử lý nạp tiền với số tiền thực từ blockchain
        const success = await processDeposit(userId, actualAmount, txHash);
        
        if (!success) {
          return res.status(400).json({
            success: false,
            error: "Xử lý nạp tiền thất bại"
          });
        }
        
        return res.status(200).json({
          success: true,
          message: "Nạp tiền thành công (số tiền được điều chỉnh theo blockchain)",
          amount: actualAmount,
          txHash
        });
      }
    }
    
    // Xử lý nạp tiền trực tiếp
    const success = await processDeposit(userId, amount, txHash);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        error: "Xử lý nạp tiền thất bại"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Nạp tiền thành công",
      amount,
      txHash
    });
    
  } catch (error) {
    console.error("Error processing direct deposit:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi máy chủ khi xử lý nạp tiền"
    });
  }
}

// Export các hàm API
export default {
  registerDeposit,
  verifyDeposit,
  handleDirectDeposit
};