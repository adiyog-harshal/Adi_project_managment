import api from "../api";


export const getRoles = async () => {
    const response = await api.get("/roles/");
    return response.data;
};


export const createRole = async (data) => {
    const response = await api.post("/roles/", data);
    return response.data;
};

export const updateRole = async (id, data) => {
    const response = await api.patch(`/roles/${id}/`, data);
    return response.data;
};

export const deleteRole = async (id) => {
    const response = await api.delete(`/roles/${id}/`);
    return response.data;
};