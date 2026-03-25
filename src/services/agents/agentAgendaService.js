import api from "../api";

const BASE_PATH = "/agent-agenda";

export const getAgendaForMonth = async (yearMonth) => {
    // yearMonth pattern: yyyy-MM
    const response = await api.get(`${BASE_PATH}?month=${yearMonth}`);
    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await api.post(BASE_PATH, eventData);
    return response.data;
};

export const updateEvent = async (id, eventData) => {
    const response = await api.put(`${BASE_PATH}/${id}`, eventData);
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await api.delete(`${BASE_PATH}/${id}`);
    return response.data;
};

export const getEventById = async (id) => {
    const response = await api.get(`${BASE_PATH}/${id}`);
    return response.data;
};
