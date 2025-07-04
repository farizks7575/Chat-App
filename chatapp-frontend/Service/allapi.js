import { commonAPI } from "./commonapi";
import { server_url } from "./server_url";

export const userregisterAPI = async (formData) =>
  await commonAPI("POST", `${server_url}/register`, formData, "multipart/form-data");

export const userloginAPI = async (data) =>
  await commonAPI("POST", `${server_url}/login`, data);

export const getallusersAPI = async (reqHeader) => {
  return await commonAPI("GET", `${server_url}/getallusers`, "", reqHeader); // Get all users
};

export const edituserAPI = async (pid, reqBody, reqHeader) => {
  return await commonAPI("PUT", `${server_url}/edituser/${pid}`, reqBody, reqHeader);
};

// request APIs
export const sendRequestAPI = async (receiverId, reqHeader) => {
  return await commonAPI('POST', `${server_url}/request`, { receiverId }, reqHeader);
};

export const getRequestAPI = async (reqHeader) => {
  return await commonAPI('GET', `${server_url}/requests`, null, reqHeader);
};

export const updateRequestStatusAPI = async (id, status, headers) => {
  return await commonAPI('PUT', `${server_url}/request/${id}`, { status }, headers);
};

export const getAcceptedRequestsAPI = async (reqHeader) => {
  return await commonAPI('GET', `${server_url}/requests/accepted`, null, reqHeader);
};

//messageApi

export const sendmessageAPI = async (body, headers) => {
  return await commonAPI('POST', `${server_url}/messages`, body, headers);
};

export const getMessagesAPI = async (user1, user2, headers) => {
  return await commonAPI('GET', `${server_url}/messages/${user1}/${user2}`, {}, headers);
};

export const deleteMessageAPI = async (messageId, headers) => {
  return await commonAPI('DELETE', `${server_url}/messages/${messageId}`, {}, headers);
};