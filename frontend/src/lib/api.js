import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData)
    return response.data;
}

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData)
    return response.data;
}

export const forgotPassword = async (forgotPasswordData) => {
    const response = await axiosInstance.post("/auth/forgot-password", forgotPasswordData)
    return response.data;
}

export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout")
    return response.data;
}

export const getAuthUser = async () => { 
    try {

        const res = await axiosInstance.get("/auth/me");
        return res.data; 
    }catch (error) {
        console.log("Error fetching auth user:", error);
        return null;
    }  
}

export const completeOnboarding = async (userData) => {
    const reponse = await axiosInstance.post("/auth/onboarding", userData);
    return reponse.data;
}

export async function getUserFriends(){
    const response = await axiosInstance.get("/user/friends");
    return response.data;
}

export async function getRecommendedUsers(search = ""){
    const response = await axiosInstance.get("/user", {
        params: search ? { search } : undefined,
    });
    return response.data;
}

export async function getOutgoingFriendReqs(){
    const response = await axiosInstance.get("/user/outgoing-friend-requests");
    return response.data;
}

export async function sendFriendRequest(userId){
    const response = await axiosInstance.post(`/user/friend-request/${userId}`);
    return response.data;
}

export async function blockUser(userId){
    const response = await axiosInstance.post(`/user/block/${userId}`);
    return response.data;
}

export async function unblockUser(userId){
    const response = await axiosInstance.post(`/user/unblock/${userId}`);
    return response.data;
}

export async function reportUser(userId, reportData){
    const response = await axiosInstance.post(`/user/report/${userId}`, reportData);
    return response.data;
}

export async function getFriendRequests(){
    const response = await axiosInstance.get("/user/friend-requests");
    return response.data;
} 

export async function acceptFriendRequest(requestId){
    const response = await axiosInstance.put(`/user/accept-friend-request/${requestId}`);
    return response.data;
}

export async function rejectFriendRequest(requestId){
    const response = await axiosInstance.put(`/user/reject-friend-request/${requestId}`);
    return response.data;
}

export async function getBlockedUsers(){
    const response = await axiosInstance.get("/user/blocked-users");
    return response.data;
}

export async function getStreamToken(){
    const response = await axiosInstance.get("/chat/token");
    return response.data;
}
