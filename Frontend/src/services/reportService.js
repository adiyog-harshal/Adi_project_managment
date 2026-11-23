import api from "./api";


export const getReports = async () => {
    const response = await api.get("report/");
    return response.data;
};


export const createReport = async (data) => {
    const response = await api.post("report/", data);
    return response.data;
};

export const updateReport = async (id, data) => {
    const response = await api.put(`report/${id}/`, data);
    return response.data;
};


export const deleteReport = async (id) => {
    const response = await api.delete(`report/${id}/`);
    return response.data;
};

export const getAnalytics = async () => {
    const response = await api.get("analytics/");
    return response.data;
};