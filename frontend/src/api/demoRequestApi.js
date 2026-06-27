import axios from "axios";
import { baseURL } from "./axiosInstance";
import instance from "./axiosInstance";

export const submitDemoRequest = (data) =>
  axios.post(`${baseURL}/api/demo-requests`, data);

export const getDemoRequests = (params) =>
  instance.get("/demo-requests", { params });

export const getDemoRequest = (id) =>
  instance.get(`/demo-requests/${id}`);

export const updateDemoRequest = (id, data) =>
  instance.patch(`/demo-requests/${id}`, data);

export const getDemoDashboardStats = () =>
  instance.get("/demo-requests/stats/dashboard");

export const STATUS_LABELS = {
  pending: "Pending",
  reviewed: "Reviewed",
  discovery_call_done: "Discovery Call Done",
  deal_closed: "Deal Closed",
  deal_rejected: "Deal Rejected",
};

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  discovery_call_done: "bg-purple-100 text-purple-800",
  deal_closed: "bg-green-100 text-green-800",
  deal_rejected: "bg-red-100 text-red-800",
};
