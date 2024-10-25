import { ApiResponse } from './response.dto';

/**
 * Phản hồi thành công chuẩn cho API.
 * @param statusCode - Mã trạng thái HTTP (mặc định: 200).
 * @param data - Dữ liệu trả về (mặc định: null).
 * @param message - Thông báo thành công.
 */
export const apiSuccess = (
  statusCode: number = 200,
  data: any = null,
  message: string = 'Request successful.',
): ApiResponse => {
  return {
    statusCode,
    data,
    message,
  };
};

/**
 * Phản hồi thất bại chuẩn cho API với thông báo lỗi chi tiết.
 * @param statusCode - Mã trạng thái HTTP (mặc định: 500).
 * @param error - Thông tin lỗi (mặc định: null).
 * @param message - Thông báo lỗi (mặc định: 'Internal server error').
 */
export const apiFailed = (
  statusCode: number = 500,
  error: any = null,
  message: string = 'Internal server error',
): ApiResponse => {
  return {
    statusCode,
    data: { error },
    message,
  };
};

/**
 * Phản hồi khi người dùng không đủ quyền truy cập (Forbidden).
 * @param message - Thông báo lỗi (mặc định: 'Access denied').
 */
export const apiForbidden = (
  message: string = 'Access denied.',
): ApiResponse => {
  return {
    statusCode: 403,
    data: null,
    message,
  };
};

/**
 * Phản hồi khi yêu cầu không có quyền xác thực hợp lệ (Unauthorized).
 * @param message - Thông báo lỗi (mặc định: 'Unauthorized access.').
 */
export const apiUnauthorized = (
  message: string = 'Unauthorized access. Please login.',
): ApiResponse => {
  return {
    statusCode: 401,
    data: null,
    message,
  };
};

/**
 * Phản hồi khi JWT hết hạn.
 * @param message - Thông báo lỗi (mặc định: 'Token has expired. Please login again.').
 */
export const apiTokenExpired = (
  message: string = 'Token has expired. Please login again.',
): ApiResponse => {
  return {
    statusCode: 401,
    data: null,
    message,
  };
};
