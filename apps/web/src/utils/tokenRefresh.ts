import { store } from '@/store';
import { setToken } from '@/store/slices/placesSlice';

interface TokenResponse {
  Status: number;
  Message: string;
  Data: string;
}

const refreshToken = async (): Promise<void> => {
  try {
    const response = await fetch('https://tsunamiapiv4.localexplorers.com/api/common/regeneratetoken', {
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
    } else {
      console.error('Token refresh failed:', data.Message);
      throw new Error(data.Message || 'Failed to get token');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
};

const REFRESH_INTERVAL = (23 * 60 + 55) * 60 * 1000;

const initTokenRefresh = (): (() => void) => {
  
  refreshToken().catch(console.error);
  
  const intervalId = setInterval(() => {
    refreshToken().catch(console.error);
  }, REFRESH_INTERVAL);
  
  return () => {
    clearInterval(intervalId);
  };
};

export { initTokenRefresh, refreshToken };
