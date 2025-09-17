import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/api';

export interface Pass {
  Id: number;
  Title: string;
  Description: string;
  Price: number;
  DiscountedPrice: number;
  ValidityInDays: number;
  IsActive: boolean;
  ImageUrl: string;
  Locations: Array<{
    Id: number;
    Name: string;
    City: string;
    State: string;
  }>;
  [key: string]: any;
}

export interface DealOrCoupon {
  Id: number;
  Title: string;
  Description: string;
  StartDate: string | null;
  EndDate: string | null;
  Logo?: string;
  LocationName?: string;
  LocationTitle?: string;
  City?: string;
  Zip?: string;
  IsRedeemed?: boolean;
  IsFavorite?: boolean;
  CouponProgramId?: number;
  CouponProgramDescription?: string;
  NextCouponRedeemDate?: string | null;
  Type?: 'Deal' | 'Coupon';
  Code?: string;
  Discount?: string;
  [key: string]: any;
}

export interface Activity {
  Id: number;
  FirstName: string;
  LastName: string;
  Profile: string;
  Comment: string;
  CreatedDate: number;
  PhotoURL: string;
  LikeCount: number;
  CommentCount: number;
  LoyaltyEventId: number;
  [key: string]: any;
}

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
  Deals: DealOrCoupon[];
  Coupons: DealOrCoupon[];
  Activities?: Activity[];
  [key: string]: any;
}

interface LocationDetailsState {
  data: LocationDetails | null;
  loading: boolean;
  error: string | null;
  deals: DealOrCoupon[];
  coupons: DealOrCoupon[];
  passes: Pass[];
  currentPass: Pass | null;
  userPasses: any[];
  passesLoading: boolean;
  passesError: string | null;
  userPassesLoading: boolean;
  userPassesError: string | null;
  dealsAndCouponsLoading: boolean;
  dealsAndCouponsError: string | null;
}

const initialState: LocationDetailsState = {
  data: null,
  loading: false,
  error: null,
  deals: [],
  coupons: [],
  passes: [],
  currentPass: null,
  userPasses: [],
  passesLoading: false,
  passesError: null,
  userPassesLoading: false,
  userPassesError: null,
  dealsAndCouponsLoading: false,
  dealsAndCouponsError: null,
};

export const fetchLocationDetails = createAsyncThunk<
  LocationDetails,
  { locationId: number; customerId: number }
>(
  'locationDetails/fetchLocationDetails',
  async ({ locationId, customerId }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<{ Data: LocationDetails }>({
        url: 'http://tsunamistagingv2api.azurewebsites.net/api/Content/v4/getlocationdata',
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

export const fetchPasses = createAsyncThunk<
  { passes: Pass[] },
  { 
    locationId: number;
    customerId: number;
    contactId?: number;
    searchText?: string;
    pageNumber?: number;
    pageSize?: number;
    languageId?: number;
    languageCode?: string;
  }
>(
  'locationDetails/fetchPasses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiRequest<{ Data: Pass[] }>({
        url: 'http://tsunamistagingv2api.azurewebsites.net/api/passes/GetPassList',
        method: 'PUT',
        body: {
          LocationId: params.locationId,
          CustomerId: params.customerId,
          ContactId: params.contactId || 0,
          SearchText: params.searchText || '',
          PageNumber: params.pageNumber || 1,
          PageSize: params.pageSize || 10,
          LanguageId: params.languageId || 0,
          LanguageCode: params.languageCode || 'en',
          SortBy: '',
          SortDir: 'asc',
        },
      });
      return { passes: response.Data || [] };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch passes'
      );
    }
  }
);

export const fetchPassDetails = createAsyncThunk<
  { pass: Pass },
  { 
    passId: number;
    customerId: number;
    paymentCheckOutMappingId?: string;
    languageId?: number;
    languageCode?: string;
  }
>(
  'locationDetails/fetchPassDetails',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiRequest<{ Data: Pass }>({
        url: 'http://tsunamistagingv2api.azurewebsites.net/api/passes/GetPassDetails',
        method: 'PUT',
        body: {
          PassId: params.passId,
          CustomerId: params.customerId,
          PaymentCheckOutMappingId: params.paymentCheckOutMappingId || '',
          LanguageId: params.languageId || 0,
          LanguageCode: params.languageCode || 'en',
        },
      });
      return { pass: response.Data };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch pass details'
      );
    }
  }
);

export const fetchUserPasses = createAsyncThunk<
  { userPasses: any[] },
  { 
    customerId: number;
    contactId: number;
    languageId?: number;
    languageCode?: string;
  }
>(
  'locationDetails/fetchUserPasses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiRequest<{ Data: any[] }>({
        url: 'http://tsunamistagingv2api.azurewebsites.net/api/passes/GetUserPassPurchaseInfo',
        method: 'PUT',
        body: {
          CustomerId: params.customerId,
          ContactId: params.contactId,
          LanguageId: params.languageId || 0,
          LanguageCode: params.languageCode || 'en',
        },
      });
      return { userPasses: response.Data || [] };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch user passes'
      );
    }
  }
);

interface ApiResponse<T> {
  Status: number;
  Message: string;
  Data: T;
}

interface DealsAndCouponsResponseData {
  CouponResponse: {
    List: any[];
    TotalRecords: number;
  };
  DealResponse: {
    DealList: any[];
    TotalRecords: number;
  };
}

type DealsAndCouponsResponse = ApiResponse<DealsAndCouponsResponseData>;

export const fetchDealsAndCoupons = createAsyncThunk<
  { deals: DealOrCoupon[]; coupons: DealOrCoupon[] },
  { locationId: number; customerId: number }
>(
  'locationDetails/fetchDealsAndCoupons',
  async ({ locationId, customerId }, { rejectWithValue }) => {
    try {
      const url = 'http://tsunamistagingv2api.azurewebsites.net/api/Content/v4/getdealsandcouponlist';
      const requestBody = {
        customerId,
        contactId: 0,
        pageNumber: 0,
        searchText: null,
        languageCode: null,
        sortBy: null,
        sortDir: null,
        isTourDePearl: false,
        categoryId: 0,
        userUniqueId: 0,
        locationId,
      };

      const response = await apiRequest<DealsAndCouponsResponse>({
        url,
        method: 'PUT',
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mapCouponToDealOrCoupon = (coupon: any): DealOrCoupon => ({
        Id: coupon.Id,
        Title: coupon.Title,
        Description: coupon.Description,
        StartDate: coupon.StartDate,
        EndDate: coupon.EndDate,
        Logo: coupon.Logo,
        LocationName: coupon.LocationTitle,
        City: coupon.City,
        Zip: coupon.Zip,
        IsRedeemed: coupon.IsRedeemed,
        IsFavorite: coupon.IsFavorite,
        CouponProgramId: coupon.CouponProgramId,
        CouponProgramDescription: coupon.CouponProgramDescription,
        NextCouponRedeemDate: coupon.NextCouponRedeemDate,
        Type: 'Coupon',
      });

      const coupons = response.Data.CouponResponse?.List?.map(mapCouponToDealOrCoupon) || [];
      const deals = response.Data.DealResponse?.DealList || [];

      return { deals, coupons };
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch deals and coupons';

      if (error instanceof Error) {
        console.error('Error in fetchDealsAndCoupons:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as { response?: any; status?: number; config?: any };
        console.error('API Error Details:', {
          status: err.status,
          response: err.response,
          config: err.config
        });
        errorMessage = err.response?.data?.message || 'API request failed';
      } else {
        console.error('Unexpected error:', error);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const locationDetailsSlice = createSlice({
  name: 'locationDetails',
  initialState,
  reducers: {
    clearLocationDetails(state) {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.deals = [];
      state.coupons = [];
      state.passes = [];
      state.currentPass = null;
      state.userPasses = [];
      state.passesLoading = false;
      state.passesError = null;
      state.userPassesLoading = false;
      state.userPassesError = null;
      state.dealsAndCouponsLoading = false;
      state.dealsAndCouponsError = null;
    },
    clearCurrentPass(state) {
      state.currentPass = null;
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
      })
      .addCase(fetchDealsAndCoupons.pending, (state) => {
        state.dealsAndCouponsLoading = true;
        state.dealsAndCouponsError = null;
      })
      .addCase(fetchDealsAndCoupons.fulfilled, (state, action) => {
        state.dealsAndCouponsLoading = false;
        state.deals = action.payload.deals;
        state.coupons = action.payload.coupons;
      })
      .addCase(fetchDealsAndCoupons.rejected, (state, action) => {
        console.error('fetchDealsAndCoupons rejected:', action.payload);
        state.dealsAndCouponsLoading = false;
        state.dealsAndCouponsError = action.payload as string;
      })
      .addCase(fetchPasses.pending, (state) => {
        state.passesLoading = true;
        state.passesError = null;
      })
      .addCase(fetchPasses.fulfilled, (state, action) => {
        state.passesLoading = false;
        state.passes = action.payload.passes;
      })
      .addCase(fetchPasses.rejected, (state, action) => {
        state.passesLoading = false;
        state.passesError = action.payload as string;
      })
      .addCase(fetchPassDetails.pending, (state) => {
        state.passesLoading = true;
        state.passesError = null;
      })
      .addCase(fetchPassDetails.fulfilled, (state, action) => {
        state.passesLoading = false;
        state.currentPass = action.payload.pass;
      })
      .addCase(fetchPassDetails.rejected, (state, action) => {
        state.passesLoading = false;
        state.passesError = action.payload as string;
      })
      .addCase(fetchUserPasses.pending, (state) => {
        state.userPassesLoading = true;
        state.userPassesError = null;
      })
      .addCase(fetchUserPasses.fulfilled, (state, action) => {
        state.userPassesLoading = false;
        state.userPasses = action.payload.userPasses;
      })
      .addCase(fetchUserPasses.rejected, (state, action) => {
        state.userPassesLoading = false;
        state.userPassesError = action.payload as string;
      });
  },
});

export const { clearLocationDetails, clearCurrentPass } = locationDetailsSlice.actions;

export const selectLocationDetails = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.data;
export const selectLocationDetailsLoading = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.loading;
export const selectLocationDetailsError = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.error;

export const selectDeals = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.deals;
export const selectCoupons = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.coupons;
export const selectDealsAndCouponsLoading = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.dealsAndCouponsLoading;
export const selectDealsAndCouponsError = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.dealsAndCouponsError;

export const selectPasses = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.passes;
export const selectCurrentPass = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.currentPass;
export const selectUserPasses = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.userPasses;
export const selectPassesLoading = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.passesLoading;
export const selectPassesError = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.passesError;
export const selectUserPassesLoading = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.userPassesLoading;
export const selectUserPassesError = (state: { locationDetails: LocationDetailsState }) => state.locationDetails.userPassesError;

export default locationDetailsSlice.reducer;
