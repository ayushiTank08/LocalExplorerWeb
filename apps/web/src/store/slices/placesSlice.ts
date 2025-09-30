import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/api';
import { API_ENDPOINTS, DEFAULT_REQUEST_OPTIONS } from '@/config/api.config';
import { LOCATION_CONFIG } from '@/config/location.config';

export interface Place {
  Id: number;
  Latitude: number;
  Longitude: number;
  Address: string;
  City: string;
  State: string;
  Country: string;
  ZipCode: string;
  Phone: string;
  Title: string;
  DistanceInMeter: number;
  DistanceInMile: number;
  Distance: string | null;
  MemberId: number;
  CustomerName: string;
  Thumb: string;
  AvgRating: number;
  IsFeatrureList: boolean;
  AdvertiseId: number;
  IsAlreadyInFav: boolean;
  IsAlreadyInWishList: boolean;
  IsVerified: boolean;
  BrewerId: number;
  BeerCount: number;
  ProductCount: number;
  BoothNumber: string | null;
  TitleComputed: string | null;
  WebSite: string;
  IsBeerChip: boolean;
  IsSponsor: boolean;
  IsVisited: boolean;
  Category: string;
  Regions: number[];
  IsMember: boolean | null;
  Tags: any[];
  IsProductionOnly: boolean | null;
  Image: string | null;
  Images?: string[];
  Features: any[];
  CustomHours?: string;
  Activities?: Array<{
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
  }>;
}

export interface Region {
  Id: number;
  Name: string;
  Image?: string | null;
  Description?: string | null;
  CreatedDate?: number | null;
  TotalBreweries?: number | null;
}

export interface CategoryNode {
  CategoryId: number;
  CategoryName: string;
  Icon?: string | null;
  level?: number | null;
  Categories: CategoryNode[];
  CategoryIcon?: string | null;
  CategorySVGIcon?: string | null;
}

export interface DefaultLocation {
  Latitude: number;
  Longitude: number;
  Radius?: number;
}

export interface PlacesState {
  places: Place[];
  allPlaces: Place[];
  selectedPlace: Place | null;
  hoveredPlace: Place | null;
  defaultLocation: DefaultLocation | null;
  loading: boolean;
  error: string | null;
  isSidebarOpen: boolean;
  searchText: string;
  regions: Region[];
  selectedRegionId: number;
  regionsLoading: boolean;
  regionsError: string | null;
  regionsLastFetchedAt: number | null;
  categories: CategoryNode[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  categoriesLastFetchedAt: number | null;
  selectedTopCategoryId: number | null;
  selectedCategoryIds: number[];
  token: string;
}

const loadTokenFromStorage = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('authToken') || '';
};

const initialState: PlacesState = {
  places: [],
  allPlaces: [],
  selectedPlace: null,
  token: loadTokenFromStorage(),
  hoveredPlace: null,
  defaultLocation: null,
  loading: false,
  error: null,
  isSidebarOpen: true,
  searchText: '',
  regions: [],
  selectedRegionId: 0,
  regionsLoading: false,
  regionsError: null,
  regionsLastFetchedAt: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  categoriesLastFetchedAt: null,
  selectedTopCategoryId: null,
  selectedCategoryIds: [],
};

const selectToken = (state: { places: PlacesState }) => state.places.token;

//remove the function in the future if it is not used
const findCategoryNodeById = (roots: CategoryNode[], id: number): CategoryNode | null => {
  if (!Array.isArray(roots) || roots.length === 0) return null;
  const stack: CategoryNode[] = [...roots];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.CategoryId === id) return n;
    if (Array.isArray(n.Categories) && n.Categories.length) stack.push(...n.Categories);
  }
  return null;
};

//remove the function in the future if it is not used
const collectDescendantCategoryIds = (node: CategoryNode | null): number[] => {
  if (!node) return [];
  const ids: number[] = [];
  const stack: CategoryNode[] = [node];
  while (stack.length) {
    const n = stack.pop()!;
    if (typeof n.CategoryId === 'number' && n.CategoryId > 0) ids.push(n.CategoryId);
    if (Array.isArray(n.Categories) && n.Categories.length) stack.push(...n.Categories);
  }
  return Array.from(new Set(ids));
};

export const fetchDefaultLocation = createAsyncThunk(
  'places/fetchDefaultLocation',
  async () => {
    const response = await apiRequest<{ Data: DefaultLocation }>({
      url: `${API_ENDPOINTS.DEFAULT_LOCATION}`,
      method: 'PUT',
      params: {
        appName: 'MC',
        customerid: LOCATION_CONFIG.CUSTOMER_ID
      }
    });
    return response.Data;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { places: PlacesState };
      const { defaultLocation } = state.places;
      return !defaultLocation;
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'places/fetchCategories',
  async (params: { languageId?: number; filterType?: number } | undefined) => {
    const payload = {
      LanguageId: params?.languageId ?? 1,
      FilterType: params?.filterType ?? 1,
    };
    const response = await apiRequest<{ Data: CategoryNode[] }>({
      url: `${API_ENDPOINTS.CATEGORIES}`,
      method: 'PUT',
      body: payload
    });
    return response.Data;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { places: PlacesState };
      const { categoriesLastFetchedAt, categories } = state.places;
      const now = Date.now();
      const maxAge = 5 * 60 * 1000;
      if (!categoriesLastFetchedAt) return true;
      const isStale = now - categoriesLastFetchedAt > maxAge;
      if (!categories || categories.length === 0) return true;
      return isStale;
    }
  }
);

const filterPlaces = (items: Place[], searchText: string, regionId: number, categoryIds: number[] = []): Place[] => {
  const q = (searchText || '').trim().toLowerCase();
  const hasQuery = q.length > 0;
  return items.filter((p) => {
    const matchRegion = regionId && regionId > 0 ? (Array.isArray(p.Regions) && p.Regions.includes(regionId)) : true;
    const matchCategory = Array.isArray(categoryIds) && categoryIds.length > 0
      ? (() => {
          const ids = String(p.Category || '')
            .split(',')
            .map(s => Number(s.trim()))
            .filter(n => Number.isFinite(n));
          return ids.some(id => categoryIds.includes(id));
        })()
      : true;
    const textHay = [p.Title, p.Address, p.City, p.State, p.ZipCode, p.Country]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchText = hasQuery ? textHay.includes(q) : true;
    return matchRegion && matchCategory && matchText;
  });
};

export const fetchRegions = createAsyncThunk(
  'places/fetchRegions',
  async (params: { customerId?: number; pageNumber?: number; pageSize?: number; sectionId?: number; languageId?: number } | undefined) => {
    const payload = {
      CustomerId: params?.customerId ?? LOCATION_CONFIG.CUSTOMER_ID,
      PageNumber: params?.pageNumber ?? 1,
      PageSize: params?.pageSize ?? 50,
      SectionId: params?.sectionId ?? 0,
      LanguageId: params?.languageId ?? 1,
    };

    const response = await apiRequest<{ Data: { List: Region[] } }>({
      url: `${API_ENDPOINTS.REGIONS}`,
      method: 'PUT',
      body: payload
    });
    
    return response.Data?.List || [];
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { places: PlacesState };
      const { regionsLastFetchedAt, regions } = state.places;
      const now = Date.now();
      const maxAge = 5 * 60 * 1000;
      if (!regionsLastFetchedAt) return true;
      const isStale = now - regionsLastFetchedAt > maxAge;
      if (regions.length === 0) return true;
      return isStale;
    }
  }
);

export const fetchPlaces = createAsyncThunk(
  'places/fetchPlaces',
  async (params: { latitude: number; longitude: number; searchText?: string; regionId?: number }) => {
    const payload = {
      CustomerId: LOCATION_CONFIG.CUSTOMER_ID,
      LanguageCode: 'en-US',
      CategoryId: '0',
      Latitude: params.latitude,
      Longitude: params.longitude,
      SearchText: params.searchText || '',
      PageNumber: 0,
      Base64: false,
      SortBy: 'distance',
      SortDir: 'asc',
      TagId: '',
      PageSize: 50,
      RegionId: params.regionId ?? 0,
      GroupCategoryIds: '',
      CategoryType: null,
      CheckwithDefault: true,
    };

    const response = await apiRequest<{ Data: { List: Place[] } }>({
      url: `${API_ENDPOINTS.LOCATION_DATA}`,
      method: 'PUT',
      body: payload
    });
        
    if (!response || !response.Data) {
      console.error('Invalid response format from places API');
      return [];
    }
    
    const places = response.Data.List || [];
    return places;
  }
);

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setSelectedPlace: (state, action: PayloadAction<Place | null>) => {
      state.selectedPlace = action.payload;
    },
    setHoveredPlace: (state, action: PayloadAction<Place | null>) => {
      state.hoveredPlace = action.payload;
    },
    clearSelectedPlace: (state) => {
      state.selectedPlace = null;
    },
    clearHoveredPlace: (state) => {
      state.hoveredPlace = null;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
      state.places = filterPlaces(state.allPlaces, state.searchText, state.selectedRegionId || 0, state.selectedCategoryIds);
    },
    setSelectedRegionId: (state, action: PayloadAction<number>) => {
      state.selectedRegionId = action.payload;
      state.places = filterPlaces(state.allPlaces, state.searchText, state.selectedRegionId || 0, state.selectedCategoryIds);
    },
    setSelectedTopCategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedTopCategoryId = action.payload;
      state.places = filterPlaces(state.allPlaces, state.searchText, state.selectedRegionId || 0, state.selectedCategoryIds);
    },
    setSelectedCategoryIds: (state, action: PayloadAction<number[]>) => {
      state.selectedCategoryIds = action.payload;
      state.places = filterPlaces(state.allPlaces, state.searchText, state.selectedRegionId || 0, state.selectedCategoryIds);
    },
    toggleSelectedCategoryId: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const set = new Set(state.selectedCategoryIds);
      if (set.has(id)) set.delete(id); else set.add(id);
      state.selectedCategoryIds = Array.from(set);
      state.places = filterPlaces(state.allPlaces, state.searchText, state.selectedRegionId || 0, state.selectedCategoryIds);
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDefaultLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefaultLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultLocation = action.payload;
      })
      .addCase(fetchDefaultLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch default location';
      })
      .addCase(fetchRegions.pending, (state) => {
        state.regionsLoading = true;
        state.regionsError = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action: PayloadAction<Region[]>) => {
        state.regionsLoading = false;
        state.regions = action.payload;
        state.regionsLastFetchedAt = Date.now();
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.regionsLoading = false;
        state.regionsError = action.error.message || 'Failed to fetch regions';
      })
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.allPlaces = action.payload;
        state.places = filterPlaces(state.allPlaces, state.searchText, state.selectedRegionId || 0, state.selectedCategoryIds);
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<CategoryNode[]>) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        state.categoriesLastFetchedAt = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.error.message || 'Failed to fetch categories';
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        console.error('fetchPlaces.rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch places';
      });
  },
});

export const { 
  setSelectedPlace, 
  clearSelectedPlace, 
  setHoveredPlace, 
  clearHoveredPlace, 
  toggleSidebar, 
  setSidebarOpen, 
  clearError, 
  setLoading, 
  setSearchText, 
  setSelectedRegionId, 
  setSelectedTopCategoryId, 
  setSelectedCategoryIds, 
  toggleSelectedCategoryId,
  setToken 
} = placesSlice.actions;
export default placesSlice.reducer;

export const applySearchText = (text: string) => async (dispatch: any) => {
  dispatch(setLoading(true));
  dispatch(setSearchText(text));
  await new Promise((res) => setTimeout(res, 700));
  dispatch(setLoading(false));
};

export const applyRegion = (regionId: number) => async (dispatch: any) => {
  dispatch(setLoading(true));
  dispatch(setSelectedRegionId(regionId));
  await new Promise((res) => setTimeout(res, 700));
  dispatch(setLoading(false));
};

export const applySelectedTopCategoryId = (id: number | null) => async (dispatch: any) => {
  dispatch(setLoading(true));
  dispatch(setSelectedTopCategoryId(id));
  await new Promise((res) => setTimeout(res, 700));
  dispatch(setLoading(false));
};

export const applySelectedCategoryIds = (ids: number[]) => async (dispatch: any) => {
  dispatch(setLoading(true));
  dispatch(setSelectedCategoryIds(ids));
  await new Promise((res) => setTimeout(res, 700));
  dispatch(setLoading(false));
};

export const applyToggleSelectedCategoryId = (id: number) => async (dispatch: any) => {
  dispatch(setLoading(true));
  dispatch(toggleSelectedCategoryId(id));
  await new Promise((res) => setTimeout(res, 700));
  dispatch(setLoading(false));
};
