import api from '../services/api';

export const downloadPdf = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });

    if (response.status === 202) {
      return { success: false, status: 202, message: 'El PDF aún no fue generado.' };
    }

    const contentType = response.headers?.['content-type'] || '';
    const isPdfResponse = !contentType || contentType.includes('application/pdf') || contentType.includes('application/octet-stream');
    if (!response.data || !isPdfResponse) {
      return { success: false, message: 'El archivo recibido no es un PDF válido.' };
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  } catch (error) {
    if (error.response?.status === 202) {
      return { success: false, status: 202, message: 'El PDF aún no fue generado.' };
    }
    return { success: false, status: error.response?.status || 500, message: 'Error al descargar el archivo.' };
  }
};
