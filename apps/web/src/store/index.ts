import { configureStore } from '@reduxjs/toolkit';
import placesReducer from './slices/placesSlice';
import locationDetailsReducer from './slices/locationDetailsSlice';

export const store = configureStore({
  reducer: {
    places: placesReducer,
    locationDetails: locationDetailsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
