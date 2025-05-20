/**
 * API endpoints để quản lý và truy cập nhật ký rút tiền
 */

import { Router, Request, Response } from "express";
import { readWithdrawalLogs } from "../withdrawal-logs";

const router = Router();

/**
 * Endpoint lấy nhật ký rút tiền
 * Chỉ admin mới có quyền truy cập
 */
router.get("/withdrawal-logs", async (req: Request, res: Response) => {
  // Kiểm tra quyền admin (có thể cần thêm logic xác thực)
  // TODO: Thêm xác thực admin ở đây
  
  try {
    const logs = readWithdrawalLogs();
    res.status(200).send(logs);
  } catch (error) {
    console.error("Error reading withdrawal logs:", error);
    res.status(500).json({ 
      success: false, 
      error: "Không thể đọc nhật ký rút tiền" 
    });
  }
});

export default router;