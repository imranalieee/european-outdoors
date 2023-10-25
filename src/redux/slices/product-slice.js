import { cloneDeep } from 'lodash';
import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetS3PreSignedUrl = createAsyncThunk(
  'product/get-s3-pre-signed-url',
  async (data, { rejectWithValue }) => {
    try {
      const {
        fileType,
        fileExtension,
        fileName,
        uploadBucket,
        id = ''
      } = data;

      const response = await axios.get(`others/get-s3-pre-signed-url?id=${id}&fileType=${fileType}&extension=${fileExtension}&fileName=${fileName}&uploadBucket=${uploadBucket}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddNewProduct = createAsyncThunk(
  'product/add-product',
  async (data, { rejectWithValue }) => {
    try {
      const {
        stockNumber,
        title,
        mfgPartNo,
        primaryUpc,
        secondaryUpc,
        supplier,
        minimumOq,
        costPrice,
        salePrice,
        mapPrice,
        location,
        relationalProduct,
        primaryImageUrl,
        specialMakeup,
        isPacked
      } = data;

      const response = await axios.post('/product/add-product', {
        stockNumber,
        title,
        mfgPartNo,
        primaryUpc,
        secondaryUpc,
        supplier,
        minimumOq: minimumOq ? Number(minimumOq)?.toFixed(2) : 0,
        costPrice: costPrice ? Number(costPrice)?.toFixed(2) : 0,
        salePrice: salePrice ? Number(salePrice)?.toFixed(2) : 0,
        mapPrice: mapPrice ? Number(mapPrice)?.toFixed(2) : 0,
        location,
        relationalProduct,
        primaryImageUrlLink: primaryImageUrl,
        specialMakeup,
        isPacked
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProductDetails = createAsyncThunk(
  'product/get-product-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const { productId } = data;
      const response = await axios.get('/product/get-product-by-id', {
        params: {
          productId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProductSupplierDetails = createAsyncThunk(
  'product/get-product-supplier-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const { productId } = data;
      const response = await axios.get('/product/get-product-by-id', {
        params: {
          productId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAndSaveUploadedSheetInDb = createAsyncThunk(
  'product/get-and-save-uploaded-sheet-in-db',
  async (data, { rejectWithValue }) => {
    try {
      const {
        bulkAction,
        userId,
        fileUploadKey
      } = data;

      let jobName = '';
      if (bulkAction === 'itemUpload') {
        jobName = 'get-and-save-s3-uploaded-products-file';
      } else if (bulkAction === 'packUpload') {
        jobName = 'get-and-save-s3-uploaded-pack-file';
      }
      const response = await fetch(`${process.env.JOB_URL}/script?method=StartSingleJob&jobName=${jobName}&userId=${userId}&fileUploadKey=${fileUploadKey}`);
      return response;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProducts = createAsyncThunk(
  'product/get-products',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        advanceFilters,
        sortBy
      } = data;
      const response = await axios.get('/product/get-products', {
        params: {
          advanceFilters: JSON.stringify(advanceFilters),
          skip,
          limit,
          sortBy
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateProduct = createAsyncThunk(
  'product/update-product',
  async ({ productId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/product/update-product', {
        productId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateProductImages = createAsyncThunk(
  'product/update-product-images',
  async ({ productId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/product/update-product', {
        productId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetRelationalProducts = createAsyncThunk(
  'product/get-relational-products',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters, skip, limit, productId, sortBy
      } = data;
      const response = await axios.get('/product/get-relational-products', {
        params: {
          filters: JSON.stringify(filters),
          skip,
          limit,
          productId,
          sortBy
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateProductPrimaryImage = createAsyncThunk(
  'product/update-product-primary-image',
  async (data, { rejectWithValue }) => {
    try {
      const {
        primaryImageUrl, productId
      } = data;
      const response = await axios.patch('/product/mark-image-primary', {
        productId,
        primaryImageUrl
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsForPack = createAsyncThunk(
  'product/get-items-for-pack',
  async (data, { rejectWithValue }) => {
    try {
      const {
        packFilters, skip, limit, productId, sortBy
      } = data;
      const response = await axios.get('/product/get-relational-products', {
        params: {
          filters: JSON.stringify(packFilters),
          skip,
          limit,
          productId,
          isItemsForPack: true,
          sortBy
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteProductImage = createAsyncThunk(
  'product/delete-product-image',
  async (data, { rejectWithValue }) => {
    try {
      const {
        imageUrl, productId, isPrimary
      } = data;

      const response = await axios.patch('/product/delete-product-image', {
        imageUrl, productId, isPrimary
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddNewMarketplaceInventoryController = createAsyncThunk(
  'marketplace-controller/add-marketplace-controller',
  async (data, { rejectWithValue }) => {
    try {
      const {
        userId,
        productId,
        marketplace,
        title,
        sku,
        upc,
        asin,
        itemDetails,
        controlInventory
      } = data;

      const response = await axios.post('/marketplace-controller/add-marketplace-controller', {
        userId,
        productId,
        marketplace,
        title,
        sku,
        upc,
        asin,
        itemDetails,
        controlInventory
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetMarketplaceInventoryController = createAsyncThunk(
  'marketplace-controller/get-marketplace-controllers',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId, skip, limit, sortBy
      } = data;
      const response = await axios.get('/marketplace-controller/get-marketplace-controllers', {
        params: {
          productId,
          skip,
          limit,
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateMarketplaceInventoryController = createAsyncThunk(
  'marketplace-controller/update-marketplace-inventory-controller',
  async (data, { rejectWithValue }) => {
    try {
      const {
        id,
        userId,
        updateParams
      } = data;

      const response = await axios.patch('marketplace-controller/update-marketplace-inventory-controller', {
        id,
        userId,
        updateParams: JSON.stringify(updateParams)
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteMarketplaceInventoryController = createAsyncThunk(
  'marketplace-controller/delete-marketplace-controller',
  async (data, { rejectWithValue }) => {
    try {
      const {
        id
      } = data;

      const response = await axios.delete('marketplace-controller/delete-marketplace-controller', {
        data: {
          marketplaceId: id
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetMinMaxProductAdvanceFilterValues = createAsyncThunk(
  'products/get-min-max-product-advance-filter-values',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get('product/get-min-max-product-advance-filter-values');
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveSelectedProductIds = createAsyncThunk(
  'product/save-export-product-params',
  async (data, { rejectWithValue }) => {
    try {
      const { selectIds } = data;

      const jsonSelectedProductIds = JSON.stringify(selectIds);
      const blobSelectedProductIds = new Blob([jsonSelectedProductIds], {
        type: 'application/json'
      });
      const formData = new FormData();
      formData.append('selectedProducts', blobSelectedProductIds);

      const response = await axios.post('/product/save-export-product-params', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadProducts = createAsyncThunk(
  'product/download-products-sheet',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-products?userId=${userId}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProductOrdersByProductId = createAsyncThunk(
  'product/get-product-orders-productId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId,
        skip,
        limit,
        filters,
        sortBy
      } = data;

      const response = await axios.get('/product/get-product-orders-productId', {
        params: {
          productId,
          filters: JSON.stringify(filters),
          skip,
          limit,
          sortBy
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProductReservedOrders = createAsyncThunk(
  'products/get-product-reserved-orders-by-productId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId,
        filters,
        skip,
        limit,
        sortBy
      } = data;
      const response = await axios.get('product/get-product-reserved-orders-by-productId', {
        params: {
          productId,
          skip,
          limit,
          filters: JSON.stringify(filters),
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const product = createSlice({
  name: 'product',
  initialState: {
    loading: false,
    success: false,
    preSignedUrl: '',
    fileUploadKey: '',
    jobTriggered: false,
    totalProducts: 0,
    products: [],
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    packItemsPagination: 100,
    saveSelectedProductParams: false,
    getRelationalProductsLoading: false,
    getItemsForPackLoading: false,
    productSupplierLoading: false,
    productAdded: false,
    productDetail: {},
    productImages: {},
    marketplaceInventoryControllersList: [],
    productSupplierDetail: {},
    totalMarketplaceInventoryControllers: 0,
    selectedPaginationOfInventoryController: 100,
    marketplaceInventoryControllerDeleted: false,
    marketplaceInventoryControllerUpdated: true,
    relationalProductsLoading: false,
    selectedTabPane: 0,
    minMaxProductCostAndSalePrices: {},
    minMaxCall: false,
    productManagerAdvanceFilters: {
      searchByKeyWords: {
        title: '',
        stockNumber: '',
        mfgPartNo: '',
        upc: ''
      },
      supplierCode: 'all',
      location: 'all',
      isPacked: 'all',
      costPriceMinValue: '',
      costPriceMaxValue: '',
      salePriceMinValue: '',
      salePriceMaxValue: '',
      stockMinValue: '',
      stockMaxValue: '',
      backOrderMinValue: '',
      backOrderMaxValue: '',
      reservedMinValue: '',
      reservedMaxValue: '',
      onOrderMinValue: '',
      onOrderMaxValue: ''
    },
    productManagerPageNumber: 1,
    productManagerPageLimit: 100,
    marketPlaceLoading: false,
    marketLoading: false,
    productOrders: [],
    getProductOrdersLoading: false,
    productOrdersTotal: 0,
    productOrdersTotalQuantity: 0,
    productOrderTotalAmount: 0,
    reservedOrders: [],
    totalReservedOrders: 0,
    reservedOrdersLoading: false,
    marketplaceInventoryControllerDeletedLoading: false,
    loadTabData: false
  },
  reducers: {
    SetProductState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetProductNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetS3PreSignedUrl.pending]: (state, action) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetS3PreSignedUrl.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      preSignedUrl: action.payload.data.preSignedUrl,
      fileUploadKey: action.payload.data.fileUploadKey
    }),
    [GetS3PreSignedUrl.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [AddNewProduct.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      productAdded: false
    }),
    [AddNewProduct.fulfilled]: (state, action) => {
      const currentState = current(state);
      const productList = cloneDeep(currentState.products);

      const { totalProducts, productManagerPageLimit } = currentState;
      const { newProduct } = action.payload.data;

      productList.unshift(newProduct);
      if (productList.length > productManagerPageLimit) {
        productList.pop();
      }

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        products: productList,
        productAdded: true,
        totalProducts: totalProducts + 1
      };
    },
    [AddNewProduct.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      productAdded: false
    }),
    [GetAndSaveUploadedSheetInDb.pending]: (state, action) => ({
      ...state,
      success: false,
      loading: true,
      jobTriggered: false
    }),
    [GetAndSaveUploadedSheetInDb.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notify: true,
      jobTriggered: true,
      notifyMessage: 'It takes few minutes to save uploaded the sheet',
      notifyType: 'success'
    }),
    [GetAndSaveUploadedSheetInDb.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      jobTriggered: false
    }),
    [GetProducts.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetProducts.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      totalProducts: action.payload.data.totalProduct,
      products: action.payload.data.products
    }),
    [GetProducts.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetProductDetails.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetProductDetails.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      productDetail: action.payload.data.product,
      productImages: action.payload.data.product.images
    }),
    [GetProductDetails.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetProductSupplierDetails.pending]: (state) => ({
      ...state,
      success: false,
      productSupplierLoading: true
    }),
    [GetProductSupplierDetails.fulfilled]: (state, action) => ({
      ...state,
      productSupplierLoading: false,
      success: true,
      productSupplierDetail: action.payload.data.product.supplier
    }),
    [GetProductSupplierDetails.rejected]: (state, action) => ({
      ...state,
      productSupplierLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateProduct.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      productUpdated: false
    }),
    [UpdateProduct.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      productUpdated: true,
      productDetail: action.payload.data.updatedProduct
    }),
    [UpdateProduct.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      productUpdated: false
    }),
    [GetRelationalProducts.pending]: (state) => ({
      ...state,
      success: false,
      getRelationalProductsLoading: true
    }),
    [GetRelationalProducts.fulfilled]: (state, action) => ({
      ...state,
      getRelationalProductsLoading: false,
      success: true,
      totalRelationalProducts: action.payload.data.totalProduct,
      relationalProducts: action.payload.data.products
    }),
    [GetRelationalProducts.rejected]: (state, action) => ({
      ...state,
      getRelationalProductsLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateProductPrimaryImage.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [UpdateProductPrimaryImage.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      productImages: action.payload.data.productImages
    }),
    [UpdateProductPrimaryImage.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [DeleteProductImage.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [DeleteProductImage.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      productImages: action.payload.data.productImages
    }),
    [DeleteProductImage.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateProductImages.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      userUpdated: false
    }),
    [UpdateProductImages.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      productUpdated: true,
      productImages: action.payload.data.updatedProduct.images
    }),
    [UpdateProductImages.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      productUpdated: false
    }),
    [AddNewMarketplaceInventoryController.pending]: (state) => ({
      ...state,
      success: false,
      marketLoading: true
    }),
    [AddNewMarketplaceInventoryController.fulfilled]: (state, action) => {
      const currentState = current(state);
      const inventoryControllerList = cloneDeep(currentState.marketplaceInventoryControllersList);

      const {
        totalMarketplaceInventoryControllers,
        selectedPaginationOfInventoryController
      } = currentState;

      const { newMarketplaceInventoryController } = action.payload.data;

      inventoryControllerList.unshift(newMarketplaceInventoryController);
      if (inventoryControllerList.length > selectedPaginationOfInventoryController) {
        inventoryControllerList.pop();
      }

      return {
        ...state,
        marketLoading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        marketplaceInventoryControllersList: inventoryControllerList,
        totalMarketplaceInventoryControllers: totalMarketplaceInventoryControllers + 1
      };
    },
    [AddNewMarketplaceInventoryController.rejected]: (state, action) => ({
      ...state,
      marketLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [GetMarketplaceInventoryController.pending]: (state) => ({
      ...state,
      success: false,
      marketPlaceLoading: true
    }),
    [GetMarketplaceInventoryController.fulfilled]: (state, action) => ({
      ...state,
      marketPlaceLoading: false,
      success: true,
      totalMarketplaceInventoryControllers: action.payload.data.totalMarketplaceControllers,
      marketplaceInventoryControllersList: action.payload.data.marketplaceControllers
    }),
    [GetMarketplaceInventoryController.rejected]: (state, action) => ({
      ...state,
      marketPlaceLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetItemsForPack.pending]: (state) => ({
      ...state,
      success: false,
      getItemsForPackLoading: true
    }),
    [GetItemsForPack.fulfilled]: (state, action) => ({
      ...state,
      getItemsForPackLoading: false,
      success: true,
      totalItemsForPack: action.payload.data.totalProduct,
      itemsForPack: action.payload.data.products
    }),
    [GetItemsForPack.rejected]: (state, action) => ({
      ...state,
      getItemsForPackLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateMarketplaceInventoryController.pending]: (state) => ({
      ...state,
      success: false,
      marketLoading: true,
      marketplaceInventoryControllerUpdated: true
    }),
    [UpdateMarketplaceInventoryController.fulfilled]: (state, action) => {
      const currentState = current(state);
      const copyInventoryControllers = cloneDeep(currentState.marketplaceInventoryControllersList);
      const { updatedMarketplaceInventoryController } = action.payload.data;

      const index = copyInventoryControllers.findIndex(
        (doc) => String(doc._id) === updatedMarketplaceInventoryController._id
      );

      copyInventoryControllers[index] = updatedMarketplaceInventoryController;
      return {
        ...state,
        marketLoading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        marketplaceInventoryControllersList: copyInventoryControllers,
        marketplaceInventoryControllerUpdated: true
      };
    },
    [UpdateMarketplaceInventoryController.rejected]: (state, action) => ({
      ...state,
      marketLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      marketplaceInventoryControllerUpdated: false
    }),
    [DeleteMarketplaceInventoryController.pending]: (state, action) => ({
      ...state,
      success: false,
      marketplaceInventoryControllerDeletedLoading: true,
      marketplaceInventoryControllerDeleted: false
    }),
    [DeleteMarketplaceInventoryController.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      marketplaceInventoryControllerDeleted: true,
      marketplaceInventoryControllerDeletedLoading: false,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [DeleteMarketplaceInventoryController.rejected]: (state, action) => ({
      ...state,
      success: false,
      marketplaceInventoryControllerDeleted: false,
      marketplaceInventoryControllerDeletedLoading: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetMinMaxProductAdvanceFilterValues.pending]: (state, action) => ({
      ...state,
      success: false,
      loading: true,
      minMaxCall: false
    }),
    [GetMinMaxProductAdvanceFilterValues.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      minMaxCall: true,
      minMaxProductCostAndSalePrices: action.payload.data.productMinMaxPricesValues
    }),
    [GetMinMaxProductAdvanceFilterValues.rejected]: (state, action) => ({
      ...state,
      success: false,
      loading: true,
      minMaxCall: false
    }),
    [SaveSelectedProductIds.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      saveSelectedProductParams: false
    }),
    [SaveSelectedProductIds.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      saveSelectedProductParams: true
    }),
    [SaveSelectedProductIds.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveSelectedProductParams: false
    }),
    [DownloadProducts.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      saveSelectedProductParams: false
    }),
    [DownloadProducts.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true
    }),
    [DownloadProducts.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetProductOrdersByProductId.pending]: (state, action) => ({
      ...state,
      getProductOrdersLoading: true,
      success: false
    }),
    [GetProductOrdersByProductId.fulfilled]: (state, action) => ({
      ...state,
      getProductOrdersLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      productOrders: action.payload.data.productOrders,
      productOrdersTotal: action.payload.data.totalProductOrders,
      productOrdersTotalQuantity: action.payload.data.totalQuantity,
      productOrderTotalAmount: action.payload.data.totalAmount
    }),
    [GetProductOrdersByProductId.rejected]: (state, action) => ({
      ...state,
      getProductOrdersLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetProductReservedOrders.pending]: (state) => ({
      ...state,
      success: false,
      reservedOrdersLoading: true,
      notify: false
    }),
    [GetProductReservedOrders.fulfilled]: (state, action) => ({
      ...state,
      reservedOrdersLoading: false,
      success: true,
      reservedOrders: action.payload.data.reservedOrders,
      totalReservedOrders: action.payload.data.totalReservedOrders
    }),
    [GetProductReservedOrders.rejected]: (state) => ({
      ...state,
      success: false,
      reservedOrdersLoading: false
    })
  }
});

const { reducer, actions } = product;

export const { SetProductState, SetProductNotifyState } = actions;

export default reducer;
