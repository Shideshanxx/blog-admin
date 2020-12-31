import request from '@/utils/request';
import { stringify } from 'querystring';
// 反馈列表
export async function getFeedbackList(params) {
  return request(`/admin/getFeedbackList?${stringify(params)}`);
}