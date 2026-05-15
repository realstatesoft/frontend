import api from '../services/api';

export const downloadPdf = async (url, filename) => {
  try {
    const response = await api.get(url);
    
    // Check if 202 Accepted
    if (response.status === 202) {
      return { success: false, status: 202, message: 'El PDF aún no fue generado. Por favor intenta en unos momentos.' };
    }

    if (response.data && response.data.data) {
      window.open(response.data.data, '_blank');
      return { success: true };
    }

    return { success: false, message: 'URL no válida.' };
  } catch (error) {
    return { success: false, status: error.response?.status || 500, message: 'Error al descargar el archivo' };
  }
};
