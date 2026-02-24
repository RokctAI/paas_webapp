import request from "./request";
import { Langauge, Paginate } from "../interfaces";

const languageService = {
  getAllActive: (params?: any): Promise<Paginate<Langauge>> =>
    request.get(`/rest/languages/active`, { params }),
};

export default languageService;
