import api from '../services/api';

export const downloadPdf = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    
    // Check if 202 Accepted
    if (response.status === 202) {
      return { success: false, status: 202, message: 'El PDF aún no fue generado. Por favor intenta en unos momentos.' };
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (error) {
    return { success: false, status: error.response?.status || 500, message: 'Error al descargar el archivo' };
  }
};
