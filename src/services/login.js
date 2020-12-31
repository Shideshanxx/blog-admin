import request from '@/utils/request';
import { stringify } from 'querystring';

// 登录
export async function login(params) {
    return request('/admin/login', {
        method: 'POST',
        data: params,
    });
}

// 退出登录
export async function logout(params) {
    return request(`/admin/logout?${stringify(params)}`);
}