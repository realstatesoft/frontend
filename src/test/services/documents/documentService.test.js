import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../../services/api';
import { 
  getMyDocuments, 
  uploadDocument, 
  replaceDocument, 
  deleteDocument 
} from '../../../services/documents/documentService';

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyDocuments', () => {
    it('returns the data array from the API response', async () => {
      const mockData = [{ id: 1, type: 'ID_FRONT' }];
      api.get.mockResolvedValueOnce({ data: { data: mockData } });

      const result = await getMyDocuments();

      expect(api.get).toHaveBeenCalledWith('/users/me/documents');
      expect(result).toEqual(mockData);
    });
  });

  describe('uploadDocument', () => {
    it('sends file and documentType as multipart/form-data', async () => {
      const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = { id: 2, type: 'PROOF_OF_ADDRESS' };
      api.post.mockResolvedValueOnce({ data: { data: mockResponse } });

      const result = await uploadDocument(mockFile, 'PROOF_OF_ADDRESS');

      expect(api.post).toHaveBeenCalledWith(
        '/users/me/documents',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
      
      const formDataArg = api.post.mock.calls[0][1];
      expect(formDataArg.get('file')).toBe(mockFile);
      expect(formDataArg.get('documentType')).toBe('PROOF_OF_ADDRESS');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('replaceDocument', () => {
    it('sends the new file via PUT request', async () => {
      const mockFile = new File(['new content'], 'new.jpg', { type: 'image/jpeg' });
      const mockResponse = { id: 10, documentStatus: 'PENDING' };
      api.put.mockResolvedValueOnce({ data: { data: mockResponse } });

      const result = await replaceDocument(10, mockFile);

      expect(api.put).toHaveBeenCalledWith(
        '/users/me/documents/10',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
      
      const formDataArg = api.put.mock.calls[0][1];
      expect(formDataArg.get('file')).toBe(mockFile);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteDocument', () => {
    it('calls DELETE on the correct endpoint', async () => {
      api.delete.mockResolvedValueOnce({});

      await deleteDocument(5);

      expect(api.delete).toHaveBeenCalledWith('/users/me/documents/5');
    });
  });
});
