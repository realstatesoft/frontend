import axios from 'axios';
import api from '../services/api';

const extractUrlFromApiResponse = async (response) => {
  const contentType = response.headers?.['content-type'] || '';
  if (!contentType.includes('application/json')) return null;

  const text = response.data instanceof Blob ? await response.data.text() : JSON.stringify(response.data);
  const payload = JSON.parse(text);
  return typeof payload?.data === 'string' ? payload.data : null;
};

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);

export const downloadPdf = async (url, filename, visited = new Set()) => {
  if (visited.has(url) || visited.size >= 5) {
    return { success: false, message: 'Se detectó un bucle de redirección al descargar el archivo.' };
  }
  visited.add(url);

  try {
    const client = isAbsoluteUrl(url) ? axios : api;
    const response = await client.get(url, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf, application/json' },
    });

    if (response.status === 202) {
      return { success: false, status: 202, message: 'El PDF aún no fue generado.' };
    }

    const contentType = response.headers?.['content-type'] || '';
    const isPdfResponse = !contentType || contentType.includes('application/pdf') || contentType.includes('application/octet-stream');
    const fileUrl = await extractUrlFromApiResponse(response);
    if (fileUrl) {
      return downloadPdf(fileUrl, filename, visited);
    }

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
