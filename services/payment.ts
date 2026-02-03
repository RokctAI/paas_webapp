import { Paginate, Payment } from "interfaces";
import request from "./request";

const paymentService = {
  createTransaction: (id: number, data: any) =>
    request.post(`/payments/order/${id}/transactions`, data),
  getAll: (params?: any): Promise<Paginate<Payment>> =>
    request.get(`/rest/payments`, { params }),
  payExternal: (type: string, params: any) =>
    request.get(`/dashboard/user/order-${type}-process`, { params }),
  parcelTransaction: (id: number, data: any) =>
    request.post(`/payments/parcel-order/${id}/transactions`, data),
};

export default paymentService;
