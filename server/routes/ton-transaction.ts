
/**
 * API endpoints for checking TON transactions
 * File này chứa các API endpoint để kiểm tra giao dịch TON
 */

import { Router, Request, Response } from 'express';
import { verifyDeposit } from '../ton-utils';

const tonTransactionRouter = Router();

// API endpoint để kiểm tra giao dịch TON theo hash
tonTransactionRouter.get('/check/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;
    
    if (!txHash || typeof txHash !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Hash giao dịch không hợp lệ hoặc thiếu"
      });
    }

    // Validate hash format
    if (!/^[a-fA-F0-9]+$/.test(txHash)) {
      return res.status(400).json({
        success: false,
        error: "Hash giao dịch phải là chuỗi hex hợp lệ"
      });
    }
    
    console.log(`[API] Kiểm tra giao dịch TON với hash: ${txHash}`);
    
    // Sử dụng hàm từ ton-utils để kiểm tra giao dịch
    const verifyResult = await verifyDeposit(txHash);
    
    if (!verifyResult.verified) {
      return res.status(404).json({
        success: false,
        error: "Giao dịch không được xác minh hoặc không tìm thấy",
        details: {
          verified: false,
          message: "Transaction not found or not verified",
          timeChecked: new Date().toISOString()
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      transaction: {
        hash: txHash,
        verified: true,
        amount: verifyResult.amount,
        fromAddress: verifyResult.fromAddress,
        toAddress: verifyResult.toAddress,
        verifiedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Lỗi khi kiểm tra giao dịch TON:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi nội bộ khi kiểm tra giao dịch",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default tonTransactionRouter;
