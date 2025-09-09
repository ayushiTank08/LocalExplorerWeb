import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/api';

export interface LocationDetails {
  Id: number;
  Title: string;
  Description: string;
  Address: string;
  City: string;
  State: string;
  ZipCode: string;
  Phone: string;
  WebSite: string;
  Logo: string;
  Images: string[];
  Amenities: Array<{
    Id: number;
    AmenitieName: string;
    AmenitieIcon: string | null;
    AmenitieSVGIcon: string | null;
  }>;
  [key: string]: any;
}

interface LocationDetailsState {
  data: LocationDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: LocationDetailsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchLocationDetails = createAsyncThunk<
  LocationDetails,
  { locationId: number; customerId: number }
>(
  'locationDetails/fetchLocationDetails',
  async ({ locationId, customerId }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<{ Data: LocationDetails }>({
        url: 'https://tsunamiapiv4.localexplorers.com/api/Content/v4/getlocationdata',
        method: 'PUT',
        body: {
          locationid: locationId,
          customerId: customerId,
          languageId: 0,
          sectionId: 0,
          userUniqueId: 0,
        },
      });
      return response.Data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch location details'
      );
    }
  }
);

const locationDetailsSlice = createSlice({
  name: 'locationDetails',
  initialState,
  reducers: {
    clearLocationDetails: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchLocationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLocationDetails } = locationDetailsSlice.actions;

export const selectLocationDetails = (state: { locationDetails: LocationDetailsState }) =>
  state.locationDetails.data;

export const selectLocationDetailsLoading = (state: {
  locationDetails: LocationDetailsState;
}) => state.locationDetails.loading;

export const selectLocationDetailsError = (state: {
  locationDetails: LocationDetailsState;
}) => state.locationDetails.error;

export default locationDetailsSlice.reducer;
