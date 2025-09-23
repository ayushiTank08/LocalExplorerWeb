type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const API_BASE_URL = 'https://tsunamistagingv2api.azurewebsites.net/api';

export const API_ENDPOINTS = {
  LOCATION_DATA: `${API_BASE_URL}/content/v4/getlocations`,
  LOCATION_DETAILS: `${API_BASE_URL}/content/v4/getlocationdata`,
  DEFAULT_LOCATION: `${API_BASE_URL}/content/v4/getDefaultLocation`,
  REGIONS: `${API_BASE_URL}/content/v4/getcustomerregions`,
  CATEGORIES: `${API_BASE_URL}/content/v4/getmastercategorygrouplocationsummary`,
  DEALS_AND_COUPONS: `${API_BASE_URL}/Content/v4/getdealsandcouponlist`,
  PASSES: `${API_BASE_URL}/passes/GetPassList`,
  PASS_DETAILS: `${API_BASE_URL}/passes/GetPassDetails`,
  USER_PASSES: `${API_BASE_URL}/passes/GetUserPassPurchaseInfo`,
  LOGIN: `${API_BASE_URL}/Common/Login`,
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

export const DEFAULT_REQUEST_OPTIONS = {
  method: 'PUT' as const,
  headers: DEFAULT_HEADERS,
};
