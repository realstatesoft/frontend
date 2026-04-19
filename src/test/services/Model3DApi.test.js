import { describe, it, expect, vi, beforeEach } from 'vitest';
import model3dApi from '../../services/properties/model3dApi';
import axios from 'axios';

// Mock de la instancia de axios
vi.mock('axios', () => {
    const mockAxios = {
        get: vi.fn(),
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn(), eject: vi.fn() },
            response: { use: vi.fn(), eject: vi.fn() }
        }
    };
    return {
        default: {
            create: vi.fn(() => mockAxios)
        }
    };
});

// Importamos el mock para controlar sus respuestas
import api from '../../services/api';
vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('model3dApi - postMultipart Refactor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly format FormData and headers in postMultipart', async () => {
        const mockFile = new File(['test'], 'test.obj', { type: 'text/plain' });
        const mockResponse = { data: { success: true } };
        api.post.mockResolvedValue(mockResponse);

        // Llamamos a un método que use postMultipart internamente
        await model3dApi.uploadModel(123, mockFile);

        // Verificamos que se llamó a axios.post con los argumentos correctos
        expect(api.post).toHaveBeenCalledWith(
            '/properties/123/model3d',
            expect.any(FormData),
            expect.objectContaining({
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        );

        // Verificamos el contenido del FormData
        const formData = api.post.mock.calls[0][1];
        expect(formData.get('file')).toBeDefined();
    });

    it('should propagate errors from the API', async () => {
        api.post.mockRejectedValue(new Error('Upload failed'));

        await expect(model3dApi.uploadModel(1, null)).rejects.toThrow('Upload failed');
    });
});
