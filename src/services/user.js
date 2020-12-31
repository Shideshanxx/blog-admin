import request from '@/utils/request';
import { stringify } from 'querystring';

// 获取用户信息 userId
export async function queryUserInfo() {
  return request(`/admin/getUserInfo`);
}

export async function updateAvatar(params) {
  return request(`/admin/uploadAvatar`, {
    method: 'POST',
    data: params,
  });
}

export async function updatePassword(params) {
  return request(`/admin/updatePassword`, {
    method: 'POST',
    data: params,
  });
}

// 跟新用户信息
export async function updateUserInfo(params) {
  return request(`/admin/updateUserInfo`, {
    method: 'POST',
    data: params,
  });
}

// 获取当前用户所发表的文章
export async function getUserArticleList(params) {
  return request(`/admin/getUserArticleList?${stringify(params)}`);
}

// 获取当前用户所发表的文章 统计
export async function getUserArticleTotal() {
  return request(`/admin/getUserArticleTotal`);
}

// 上传联系方式的二维码
export async function uploadCode(params) {
  return request(`/admin/uploadCode`, {
    method: 'POST',
    data: params,
  });
}

// 新增、编辑联系方式
export async function addEditContact(params) {
  return request(`/admin/addEditContact`,{
    method: 'POST',
    data: params,
  });
}

// 删除联系方式
export async function delContact(params) {
  return request(`/admin/delContact`,{
    method: 'POST',
    data: params,
  });
}

// 上传赞赏码
export async function uploadRewardCode(params) {
  return request(`/admin/uploadRewardCode`, {
    method: 'POST',
    data: params,
  });
}

// 新增、编辑赞赏码
export async function addEditReward(params) {
  return request(`/admin/addEditReward`,{
    method: 'POST',
    data: params,
  });
}
