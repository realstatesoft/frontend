import api from '../services/api';

export const downloadPdf = async (url, filename) => {
  try {
    const response = await api.get(url);

    if (response.data && response.data.data) {
      window.open(response.data.data, '_blank');
      return { success: true };
    }

    return { success: false, message: 'URL no válida.' };
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, status: 404, message: error.response?.data?.message || 'El documento aún no fue generado.' };
    }
    return { success: false, status: error.response?.status || 500, message: 'Error al descargar el archivo' };
  }
};
