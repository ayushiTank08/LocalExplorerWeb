export const LOCATION_CONFIG = {
  DEFAULT_LOCATION_ID: '5112d4b1-419c-4ed0-bd58-9a6ba3f4e363',
  CUSTOMER_ID: 5588,
  APP_TYPE: 1,
  APP_NAME: 'Marion County',
  DEVICE_TYPE: 'WEB'
} as const;

export type LocationConfig = typeof LOCATION_CONFIG;

// export const LOCATION_CONFIG = {
//   DEFAULT_LOCATION_ID: 'a05e889e-6dd5-4d1f-9000-ff8fcecf169e',
//   CUSTOMER_ID: 2677,
//   APP_TYPE: 1,
//   APP_NAME: 'Ohio on Tap',
//   DEVICE_TYPE: 'WEB'
// } as const;

// export type LocationConfig = typeof LOCATION_CONFIG;
