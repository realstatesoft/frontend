import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cookies from 'js-cookie';
import { 
  getAccessToken, setAccessToken, removeAccessToken,
  getRefreshToken, setRefreshToken, removeRefreshToken,
  getUserInfo, setUserInfo, removeUserInfo,
  clearSession
} from './authToken';

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  }
}));

describe('authToken utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AccessToken', () => {
    it('gets token from cookies', () => {
      Cookies.get.mockReturnValue('fake-token');
      expect(getAccessToken()).toBe('fake-token');
      expect(Cookies.get).toHaveBeenCalledWith('accessToken');
    });

    it('returns null if no token is found', () => {
      Cookies.get.mockReturnValue(undefined);
      expect(getAccessToken()).toBeNull();
    });

    it('sets access token cookie', () => {
      setAccessToken('new-token');
      expect(Cookies.set).toHaveBeenCalledWith('accessToken', 'new-token', expect.any(Object));
    });

    it('removes access token cookie', () => {
      removeAccessToken();
      expect(Cookies.remove).toHaveBeenCalledWith('accessToken');
    });
  });

  describe('RefreshToken', () => {
    it('gets refresh token from cookies', () => {
      Cookies.get.mockReturnValue('refresh-token');
      expect(getRefreshToken()).toBe('refresh-token');
    });

    it('sets refresh token with 7 days expiration', () => {
      setRefreshToken('refresh-token');
      expect(Cookies.set).toHaveBeenCalledWith(
        'refreshToken', 
        'refresh-token', 
        expect.objectContaining({ expires: 7 })
      );
    });

    it('removes refresh token cookie', () => {
      removeRefreshToken();
      expect(Cookies.remove).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('UserInfo (localStorage)', () => {
    it('gets UserInfo from localStorage parsed', () => {
      const user = { id: 1, name: 'Test' };
      localStorage.setItem('userInfo', JSON.stringify(user));
      expect(getUserInfo()).toEqual(user);
    });

    it('returns null if userInfo is not in localStorage', () => {
      expect(getUserInfo()).toBeNull();
    });

    it('returns null if JSON parsing fails', () => {
      localStorage.setItem('userInfo', 'not-json');
      expect(getUserInfo()).toBeNull();
    });

    it('sets userInfo in localStorage as string', () => {
      const user = { id: 2 };
      setUserInfo(user);
      expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(user));
    });

    it('removes userInfo from localStorage', () => {
      localStorage.setItem('userInfo', 'data');
      removeUserInfo();
      expect(localStorage.getItem('userInfo')).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('calls all removal functions', () => {
      clearSession();
      expect(Cookies.remove).toHaveBeenCalledWith('accessToken');
      expect(Cookies.remove).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.getItem('userInfo')).toBeNull();
    });
  });
});
