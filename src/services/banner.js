import request from '@/utils/request';
import { stringify } from 'querystring';

// 获取banner列表
export async function getBannerList(params) {
    return request(`/admin/getBannerList?${stringify(params)}`);
}

// 获取PreviewBanner
export async function getPreviewBanner() {
    return request(`/admin/getPreviewBanner`);
}

// 删除
export async function delBanner(params) {
    return request(`/admin/delBanner`, {
        method: 'POST',
        data: params,
    });
}

// 添加或修改banner
export async function addEditBanner(params) {
    return request(`/admin/addEditBanner`, {
        method: 'POST',
        data: params,
    });
}

// 上传
export async function upload(params) {
    return request(`/admin/uploadBanner`, {
        method: 'POST',
        data: params,
    });
}
