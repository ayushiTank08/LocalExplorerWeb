import { store } from '@/store';
import { setToken } from '@/store/slices/placesSlice';

interface TokenResponse {
  Status: number;
  Message: string;
  Data: string;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const shouldRefreshToken = (): boolean => {
  const token = store.getState().places.token;
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 300;
    
    return !payload.exp || payload.exp < (now + bufferTime);
  } catch (e) {
    console.error('Error checking token expiration:', e);
    return true;
  }
};

const hasValidToken = (): boolean => {
  const token = store.getState().places.token;
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const bufferTime = 300;
    
    return payload.exp && payload.exp > (now + bufferTime);
  } catch (e) {
    console.error('Error validating token:', e);
    return false;
  }
};

const refreshToken = async (force: boolean = false): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  
  try {
    const currentToken = store.getState().places.token;
    
    if (currentToken && !force && hasValidToken()) {
      return currentToken;
    }
    
    refreshPromise = (async () => {
      const response = await fetch('https://tsunamistagingv2api.azurewebsites.net/api/common/regeneratetoken', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CustomerId: 5588,
          Email: '9s45MVLyw74ptQfsS1NA+B/Igel3mQKjGs+6X8brwoQ=',
          Password: 'j2IoBSUlGS4iEDVcqBhauA==',
          ExternalLoginType: null,
          ExternalLoginId: null
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }
      const data: TokenResponse = await response.json();
      if (data.Status === 200 && data.Data) { 
        store.dispatch(setToken(data.Data));
        return data.Data;
      } else {
        console.error('Token refresh failed:', data.Message);
        throw new Error(data.Message || 'Failed to get token');
      }
    })();

    const result = await refreshPromise;
    return result;
    
  } catch (error) {
    console.error('Error refreshing token:', error);
    const currentToken = store.getState().places.token;
    
    isRefreshing = false;
    refreshPromise = null;
    
    if (currentToken) {
      return currentToken;
    }
    console.error('No token available and could not refresh');
    throw new Error('Authentication required. Please login again.');
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const REFRESH_INTERVAL = (23 * 60 + 55) * 60 * 1000;

const ensureToken = async (): Promise<string> => {
  try {
    return await refreshToken();
  } catch (error) {
    console.error('Failed to ensure token:', error);
    throw error;
  }
};

const initTokenRefresh = (): (() => void) => {
  let intervalId: NodeJS.Timeout | null = null;
  
  const checkAndRefreshToken = async () => {
    if (!hasValidToken()) {
      return;
    }
    
    try {
      await refreshToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  };
  
  checkAndRefreshToken();
  
  intervalId = setInterval(checkAndRefreshToken, 5 * 60 * 1000);
  
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

export { initTokenRefresh, refreshToken, ensureToken };
