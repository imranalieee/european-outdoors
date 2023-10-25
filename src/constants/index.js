const adminHeader = [
  {
    icon: 'icon-products',
    title: 'Products',
    to: '/'
  },
  {
    icon: 'icon-orders',
    title: 'Orders',
    to: '/orders'
  },
  {
    icon: 'icon-purchasing',
    title: 'Purchasing',
    to: '/purchasing'
  },
  {
    icon: 'icon-supplier',
    title: 'Suppliers',
    to: '/suppliers'
  }
];

const userHeader = [
  {
    icon: 'icon-users',
    title: 'Users',
    to: '/users',
    adminOnly: true
  },
  {
    icon: 'icon-jobs',
    title: 'Jobs',
    to: '/jobs',
    adminOnly: true
  },
  {
    icon: 'icon-products',
    title: 'Products',
    to: '/products'
  },
  {
    icon: 'icon-orders',
    title: 'Orders',
    to: '/orders'
  },
  {
    icon: 'icon-purchasing',
    title: 'Purchasing',
    to: '/purchasing'
  },
  {
    icon: 'icon-supplier',
    title: 'Suppliers',
    to: '/suppliers'
  },
  {
    icon: 'icon-products',
    title: 'Marketplace Inventory',
    adminOnly: true,
    to: '/marketplace-inventory'
  }
];
const orderSubheader = [
  {
    title: 'Order Manager',
    to: '/orders'
  },
  {
    title: 'Pick Sheet',
    to: '/orders/pick-sheet'
  },
  {
    title: 'Process Orders',
    to: '/orders/process-orders'
  }
];
const purchasingSubheader = [
  {
    title: 'Add item to Queue',
    to: '/purchasing'
  },
  {
    title: 'PO Queue',
    to: '/purchasing/po-queue'
  },
  {
    title: 'All PO',
    to: '/purchasing/all-po'
  }
];
const printSheetData = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Sales Channel', 'Order Date'];
const menuList = ['View Product', 'Edit Product', 'View Orders', 'Edit Orders', 'View Purchasing', 'Edit Purchasing'];
const permissionsMenu = ['View Products', 'Edit Products', 'View Orders', 'Edit Orders', 'View Purchasing', 'Edit Purchasing', 'View Suppliers', 'Edit Suppliers'];
const permission = ['View Products', 'Edit Products', 'View Orders', 'Edit Orders', 'View Purchasing', 'Edit Purchasing', 'View Suppliers', 'Edit Suppliers'];
const tableHeader = ['Name', 'Email Address', 'Permissions', 'Status', 'SignUp Date', 'Status Change Date', ''];
const sortTableHeader = ['SignUp Date', 'Status Change Date'];
const tableHeaderArchived = ['Name', 'Email Address', 'Status', 'SignUp Date', 'Archived Date', ''];
const supplierHeader = ['Company Name', 'Supplier Name', 'Supplier Code', 'Account #', 'Email Address', 'Phone #', 'Fax #', 'Street Address', 'Country', 'Zip Code', ''];
const fileDocumentHeader = ['File Name', 'Size', 'Date', ''];
const supplierRealtedHeader = ['PO No.', 'Supplier Code', 'Order Date', 'Order Total', 'Quantity Total', 'Note to Supplier', 'Warehouse Instructions', 'Printed  ', 'Received', 'Completed', ''];
const productMangerHeader = ['Product', 'MFG Part No.', 'Supplier', 'Cost', 'Sell Price', 'Stock', 'Back Order  ', 'Reserved', 'On Order', 'Location', 'Pack', ''];
const sortableProductMangerHeader = ['Product', 'MFG Part No.', 'Cost', 'Sell Price', 'Stock'];
const jobsHeader = ['Store Name', 'Job Name', 'Job Attributes', 'Progress', 'Status', 'Next Run At', 'Lock At', ''];
const notificationHeader = ['Title', 'Details', 'Date'];
const poHistoryHeader = ['PO No.', 'Supplier ', 'MFG Part No.', 'Order Date', 'Cost', 'Quantity', 'PO Confirmed', 'PO Printed', 'PO Received'];
const packComponentHeader = ['Stock No.', 'MFG Part No. ', 'Qty. in Pack', 'Quantity In Stock', 'Cost Price', 'Added By', ''];
const sortPackComponentHeader = ['Qty. in Pack'];
const inventoryHeader = ['Transaction', 'Quantity', 'Order No.', 'Timestamp', 'Order Status', 'Added By', 'Marketplace Channel'];
const ordersHeader = ['Order No.', 'Quantity', 'Unit Price', 'Sub Total', 'Sales Channel', 'Order Status', 'Order Item Status', 'Order Date', 'SKU', ''];
const marketPlaceHeader = ['Marketplace Item/Title', 'Marketplace ', 'Marketplace SKU', 'Marketplace UPC', 'Asin', 'Last Update', ''];
const locationHeader = ['Warehouse.', 'Location ', 'Quantity', 'In Transfer', ''];
const reservedHeader = ['Order Number ', 'Order Date', 'Sales Channel', 'Quantity', 'Order Status', 'Order Item Status'];
const packDetailsHeader = ['Item Name', 'MFG Part No.', 'Quantity Ordered', 'Qty. in Stock ', 'Cost Price', 'Status', ''];
const sortPackDetailsHeader = ['Quantity Ordered'];
const boxLogs = ['Name', 'Date', 'Action'];
const openOpsHeader = ['PO #', 'PO Order Time & Date:', 'Expect on', ''];
const labelHeader = ['Products', 'Quantity', '', ''];
const updateOrderItemHeader = ['Title', 'MFG Part No.', 'Cost', 'Sell Price', 'Supplier', 'Stock', 'Location', ''];
const addOrderItemHeader = ['Title', 'MFG Part No.', 'Cost', 'Sell Price', 'Supplier', 'Pack', 'Stock', 'Location', ''];
const addItemsHeader = ['Title', 'MFG Part No.', 'Cost', 'Sell Price', 'Supplier', 'Stock', 'Location', ''];
const orderManagementOrder = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Sales Channel', 'Order Status', 'Order Date', ''];
const processOrderHeader = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Sales Channel', 'Order Date', ''];
const addPaymentHeader = ['Payment Method', 'Amount', 'Added by User', 'Time & Date', 'Transaction No.', 'Cheque No.', 'Credit Card Type', 'Paypal Confirmation', 'Attachment', ''];
const sortAddPaymentHeader = ['Time & Date'];
const nonConfirmPosHeader = ['PO No.', 'Supplier Code', 'Supplier Name', 'Order Date', 'PO Total', 'Shipping', 'Tax', 'Order Total', ''];
const confirmPosHeader = ['PO No.', 'Supplier Code', 'Supplier Name', 'Order Date', 'PO Total', 'Shipping', 'Tax', 'Order Total', 'Printed', 'Received', 'Completed', ''];
const allPosHeader = ['PO No.', 'PO Type', 'Supplier Code', 'Supplier Name', 'Order Date', 'PO Quantity', 'Shipping', 'Tax', 'Line Total', 'Printed', 'Received', 'Completed', ''];
const poQueueHeader = ['Product', 'MFG Part No.', 'Supplier', 'PO Qty.', 'Unit Cost', 'Line Total', 'Stock', 'FBA', 'Back Order', 'Reserved', 'On Order', 'Added By User', 'Time & Date', 'FBA Item', ''];
const nonConfirmPoHeader = ['Title', 'MFG Part No.', 'Quantity', 'Unit Cost', 'Line Total', 'Added by', 'Time added', 'Received', 'Back order', 'Qty cancelled', ''];
const itemsPackHeader = ['Title', 'MFG Part No.', 'Cost', 'Sell Price', 'Supplier', 'Stock', 'Location', ''];
const confrimPoHeader = ['Title', 'MFG Part No.', 'Ordered', 'Received', 'Back ordered', 'Stock', 'Received Manually', ''];
const relationalProductHeader = ['Title', 'MFG Part No.', 'Cost', 'Sell Price', 'Supplier', 'Stock', 'Location', '', ''];
const purchaseHeader = ['Supplier', 'PO Qty', 'Unit Cost', 'Line Total', 'MOQ', 'Last Order Date', ''];
const sortPurchaseHeader = ['PO Qty', 'Unit Cost'];
const addItemHeader = ['Product', 'MFG Part No.', 'Supplier', 'Cost', 'Sell Price', 'Stock', 'FBA US', 'Back Order', 'Reserved', 'On Order', 'Location', ''];
const orderedItemHeader = ['Item Details', 'Marketplace SKU', 'Quantity Ordered', 'Quantity In-Stock', 'Price', 'Back Order', 'On Order', 'FBA US', 'Reserved', 'MFG Part #', 'Relational SKU', 'Order Status', 'Pack', ''];
const newOrderedItemHeader = ['Item Details', 'MFG Part #', 'Quantity In-Stock', 'Quantity Ordered', 'Back Order', 'On Order', 'FBA US', 'Reserved', 'Unit Price', 'Sub Total', 'Relational SKU', 'RP Stock', 'Status of Item', 'Pack', ''];
const newOrderItemHeader = ['Item Details', 'MFG Part #', 'Quantity In-Stock', 'Quantity Ordered', 'Committed By', 'Committed Quantity', 'Back Order', 'On Order', 'FBA US', 'Reserved', 'Unit Price', 'Sub Total', 'Marketplace SKU', 'Relational SKU', 'RP Stock', 'Status of Item', 'Pack', ''];
const shipmentTrackHeader = ['Box Dimensions', 'Boxed Quantity', 'MSKUS', 'Shipment Carrier', 'Tracking ID'];
const sortShipmentTrackHeader = ['Boxed Quantity', 'MSKUS', 'Shipment Carrier', 'Tracking ID'];
const orderedWorkflowHeader = ['Item Details', 'Order Qty', 'Boxed Qty', 'To Box Qty', ''];
const sortOrderedWorkflowHeader = ['Order Qty', 'Boxed Qty', 'To Box Qty'];
const printPickHeader = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Sales Channel', 'Order Date'];
const batchDetailsHeader = ['Batch Pick ID', 'Printed Format', 'Time & Date Printed', 'Created by User', 'Total Orders in Batch', ''];
const completeBatchesHeader = ['Batch Pick ID', 'Printed Format', 'Time & Date Printed', 'Created by User', 'Total Orders in Batch'];
const newPhoneOrderItemHeader = ['Item Details', 'MFG Part #', 'Quantity In-Stock', 'Quantity Ordered', 'Committed By', 'Committed Quantity', 'Back Order', 'On Order', 'FBA US', 'Reserved', 'Unit Price', 'Sub Total', 'Relational SKU', 'RP Stock', 'Status of Item', 'Pack', ''];
const relationalProductTabHeader = ['Item Details', 'MFG Part #', 'Quantity In-Stock', 'Match Stock #', 'Committed Quantity', 'Back Order', 'On Order', 'FBA US', 'Reserved', 'Unit Price', 'Sub Total', 'Status of Item', ''];
const orderManagementBySalesChannel = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Order Status', 'Order Date', ''];
const orderManagementByOrderStatus = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Sales Channel', 'Order Date', ''];
const orderManagementByFilters = ['Order No.', 'Marketplace Order ID', 'Recipient', 'Order Date', ''];
const printHeaderPdf = ['', 'Title', 'SKU', 'Location', 'Qty'];
const printInvoiceHeader = ['Quantity', 'Product Details', 'Unit price', 'Order Totals'];
const packingSlipHeader = ['Order Date', 'Order Number', 'Sales Channel'];
const packingSlipTableHeader = ['Units', 'Item #', 'Description', 'Each', 'Line Total'];
const sortTableByOrderItemsHeader = ['Unit Price', 'Quantity Ordered', 'Quantity In-Stock', 'RP Stock', 'Sub Total'];
const sortRelationalProductTabHeader = ['Unit Price', 'Quantity Ordered', 'Committed Quantity', 'Quantity In-Stock', 'RP Stock', 'Sub Total'];
const orderManagementSort = ['Order Date'];
const orderPickSheetSort = ['Order Date'];
const orderProcessSort = ['Order Date'];
const orderBatchDetailSort = ['Time & Date Printed', 'Total Orders in Batch'];
const productOrderSort = ['Quantity', 'Unit Price', 'Sub Total', 'Order Date'];
const poHistorySort = ['Order Date', 'Cost', 'Quantity'];
const productInventorySort = ['Quantity', 'Timestamp'];
const productReservedQtySort = ['Quantity', 'Order Date'];
const productMarketplaceControllerSort = ['Last Update'];
const relationalProductHeaderSort = ['Cost', 'Sell Price', 'Stock'];
const itemsPackHeaderSort = ['Cost', 'Sell Price', 'Stock'];
const addOrderItemHeaderSort = ['Cost', 'Sell Price', 'Stock'];
const matchItemHeaderSort = ['Cost', 'Sell Price', 'Stock'];
const updateOrderItemHeaderSort = ['Cost', 'Sell Price', 'Stock'];
const poQueueHeaderSort = ['PO Qty.', 'Unit Cost', 'Line Total']; // 'Stock', 'Back Order', 'Reserved', 'On Order'
const addItemToQueueSort = ['Cost', 'Sell Price', 'Stock'];
const allPosHeaderSort = ['Order Date', 'PO Quantity', 'Shipping', 'Tax', 'Line Total'];
const nonConfirmAddItemsHeaderSort = ['Cost', 'Sell Price', 'Stock'];
const itemsOfReceivePOSort = ['Ordered', 'Received', 'Received Manually'];
const itemsOfNonConfirmPOSort = ['Quantity', 'Unit Cost', 'Line Total'];
const orderItemPackHeader = ['Item Name', 'MFG Part No.', 'Qty. in Stock', 'Quantity Ordered', 'Committed By', 'Cost Price', 'Status', 'Relational SKU', 'RP Stock', 'Added By', ''];
const packDetailsSort = ['Quantity Ordered'];

const selectStatus = [
  {
    value: 'all',
    label: 'All'
  },
  {
    value: 'registered',
    label: 'Registered'
  },
  {
    value: 'invited',
    label: 'Invited'
  },
  {
    value: 'archived',
    label: 'Archived'
  }
];

const salesChannel = [
  {
    value: 'all',
    label: 'All'
  },
  {
    value: 'sellerCentral FBM',
    label: 'Amazon FBM'
  },
  {
    value: 'ebay',
    label: 'eBay'
  },
  {
    value: 'walmart',
    label: 'Walmart'
  },
  {
    value: 'vendorCentralDirectFulfillment',
    label: 'VC Direct Fulfillment'
  },
  {
    value: 'vendorCentralPurchase',
    label: 'VC Purchase Orders'
  },
  {
    value: 'phoneOrder',
    label: 'Phone Order'
  }
];

const orderStatus = [{
  value: 'onHold',
  label: 'On Hold'
}, {
  value: 'cancelled',
  label: 'Cancelled'
}];

const pickOption = [
  {
    value: 'Pick Sheet',
    label: 'Pick Sheet Only'
  },
  {
    value: 'Packing Slip',
    label: 'Packing Slip Only'
  },
  {
    value: 'Pick Sheet & Packing Slip',
    label: 'Pick Sheet & Packing Slip'
  }
];
const ADD_ORDER_STATUS = [{
  value: 'backOrdered',
  label: 'Back Ordered'
},
{
  value: 'onHold',
  label: 'On Hold'
}
];

const ORDER_STATUS = [{
  value: 'all', label: 'All'
}, {
  value: 'imported',
  label: 'Imported'
}, {
  value: 'commit',
  label: 'Commit'
}, {
  value: 'partialCommit',
  label: 'Partial Commit'
}, {
  value: 'backOrdered',
  label: 'Back Ordered'
}, {
  value: 'onHold',
  label: 'On Hold'
}, {
  value: 'cancelled',
  label: 'Cancelled'
}, {
  value: 'printed',
  label: 'Printed'
}, {
  value: 'shipped',
  label: 'Shipped'
}, {
  value: 'picked',
  label: 'Picked'
}];

const orderType = [
  {
    value: 'CONFIRMED',
    label: 'Confirm'
  },
  {
    value: 'NON_CONFIRM',
    label: 'Non Confirm'
  }
];

const platform = [
  {
    value: 'amazon',
    label: 'Amazon'
  },
  {
    value: 'ebay',
    label: 'eBay'
  },
  {
    value: 'walmart',
    label: 'Walmart'
  },
  {
    value: 'vendorCentral',
    label: 'Vendor Central'
  }
];

const exportFile = [
  {
    value: 'pdf',
    label: 'PDF'
  },
  {
    value: 'excel',
    label: 'Excel'
  }
];

const selectAgendaType = [
  {
    value: 'sellerCentral',
    label: 'Seller Central Agenda'
  },
  {
    value: 'vendorCentral',
    label: 'Vendor Central Agenda'
  },
  {
    value: 'ebay',
    label: 'Ebay Agenda'
  },
  {
    value: 'walmart',
    label: 'Walmart Agenda'
  },
  {
    value: 'orderJob',
    label: 'Order Jobs'
  },
  {
    value: 'otherJob',
    label: 'Other Jobs'
  }
];

const selectStore = [
  {
    value: 'all',
    label: 'All'
  },
  {
    value: 'sellerCentral',
    label: 'Seller Central'
  },
  {
    value: 'vendorCentral',
    label: 'Vendor Central'
  },
  {
    value: 'ebay',
    label: 'Ebay'
  },
  {
    value: 'walmart',
    label: 'Walmart'
  }
];

const amazonCondition = [
  {
    value: 'USED_LIKE_NEW',
    label: 'USED_LIKE_NEW'
  },
  {
    value: 'USED_VERY_GOOD',
    label: 'USED_VERY_GOOD'
  },
  {
    value: 'USED_GOOD',
    label: 'USED_GOOD'
  },
  {
    value: 'USED_ACCEPTABLE',
    label: 'USED_ACCEPTABLE'
  },
  {
    value: 'COLLECTIBLE_LIKE_NEW*',
    label: 'COLLECTIBLE_LIKE_NEW*'
  },
  {
    value: 'COLLECTIBLE_VERY_GOOD*',
    label: 'COLLECTIBLE_VERY_GOOD*'
  },
  {
    value: 'COLLECTIBLE_GOOD*',
    label: 'COLLECTIBLE_GOOD*'
  },
  {
    value: 'COLLECTIBLE_ACCEPTABLE*',
    label: 'COLLECTIBLE_ACCEPTABLE*'
  },
  {
    value: 'NOT_USED',
    label: 'NOT_USED'
  },
  {
    value: 'REFURBISHED',
    label: 'REFURBISHED'
  },
  {
    value: 'NEW',
    label: 'NEW'
  }
];

const dimensions = [
  {
    value: 22,
    label: '22'
  },
  {
    value: 'vendorCentral',
    label: 'Vendor Central'
  },
  {
    value: 'ebay',
    label: 'Ebay'
  },
  {
    value: 'walmart',
    label: 'Walmart'
  }
];

const selectState = [
  {
    value: 'all',
    label: 'All'
  },
  {
    value: '_STARTED_',
    label: 'Started'
  },
  {
    value: '_IN_PROGRESS_',
    label: 'InProgress'
  },
  {
    value: '_RETRY_',
    label: 'Retry'
  },
  {
    value: '_FAILED_',
    label: 'Failed'
  },
  {
    value: '_COMPLETED_',
    label: 'Completed'
  }
];
const packItem = [
  {
    value: 'all',
    label: 'All'
  },
  {
    value: 'pack',
    label: 'Pack'
  },
  {
    value: 'noPack',
    label: 'Non Pack'
  }
];

const paginationValue = [
  {
    value: 20,
    label: '20/page'
  },
  {
    value: 30,
    label: '30/page'
  },
  {
    value: 50,
    label: '50/page'
  },
  {
    value: 60,
    label: '60/page'
  }
];

const paginationValueWithMoreLimit = [
  {
    value: 100,
    label: '100/page'
  },
  {
    value: 200,
    label: '200/page'
  }
];

const ROUTE_PATH_BY_PERMISSION_BASE = {
  viewProducts: ['/products', '/products/add-product'],
  viewSuppliers: ['/suppliers', '/suppliers/:'],
  viewOrders: ['/orders', '/orders/process-orders', '/orders/pick-sheet', '/orders/:', '/orders/process-orders/:id', '/orders/pick-sheet/batch-detail'],
  viewPurchasing: ['/purchasing', '/purchasing/po-queue', '/purchasing/all-po', '/purchasing/non-confirm/:poId', '/purchasing/confirm/:poId'],
  default: ['/user-management', '/notifications']
};

const DEFAULT_ROUTES = [
  '/auth/sign-in', '/auth/reset-password', '/auth/forget-password',
  '/auth/email-send', '/auth/invite-user', '/'
];

const ADMIN_ROUTES = [
  '/products',
  '/products/add-product',
  '/suppliers',
  '/suppliers/:',
  '/orders',
  '/purchasing',
  '/user-management',
  '/notifications',
  '/users',
  '/jobs',
  '/marketplace-inventory',
  '/orders/process-orders',
  '/orders/pick-sheet',
  '/orders/:',
  '/orders/process-orders/:id',
  '/orders/pick-sheet/batch-detail',
  '/purchasing/po-queue',
  '/purchasing/all-po',
  '/purchasing/non-confirm/:poId',
  '/purchasing/confirm/:poId'
];

const REGEX_FOR_NUMBERS = /^[0-9]*$/;
const REGEX_FOR_DECIMAL_NUMBERS = /^\d*(\.\d{0,2})?$/;
const INPUT_TYPE_NUMBER = ['e', 'E', '+', '-'];

const CURRENCIES_SYMBOL = ['$', '€', '£', '₹', '¥'];

const packSelectorMenu = [{
  label: 'All',
  value: 'all'
}, {
  label: 'Pack',
  value: 'pack'
},
{
  label: 'Non Pack',
  value: 'nonPack'
}];

const PO_STATUS = {
  inQueue: 'IN_QUEUE',
  nonConfirm: 'NON_CONFIRM',
  confirm: 'CONFIRMED',
  printed: 'PRINTED',
  received: 'RECEIVED',
  closed: 'CLOSED'
};

const DISCOUNT_TYPE = {
  fixed: 'FIXED',
  percentage: 'PERCENTAGE'
};

const PAYMENT_METHOD = {
  WIRE_TRANSFER: 'Wire Transfer',
  CHEQUE: 'Cheque',
  CREDIT_CARD: 'Credit Card',
  PAYPAL: 'Paypal'
};

const EXTENSIONS_LIST = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'ico', 'psd', 'ai', 'eps', 'docm', 'docx', 'dot', 'csv', 'tsv', 'xlx', 'xlsm', 'xlsb', 'xltx', 'pdf', 'xltm', 'xls', 'xlt', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'txt', 'slk', 'dif', 'xps', 'rtf', 'dotx', 'dotm', 'docb', 'doc', 'xlsx', 'json'];

const BADGE_CLASS = {
  imported: 'badge success',
  commit: 'badge commit',
  partialCommit: 'badge progress',
  backOrdered: 'badge progress',
  onHold: 'badge warning',
  cancelled: 'badge failed',
  printed: 'badge started',
  shipped: 'badge success',
  picked: 'badge success',
  received: 'badge success',
  closed: 'badge closed',
  nonConfirm: 'badge progress',
  confirm: 'badge success',
  shipmentInProcess: 'badge progress'
};

const SALES_CHANNELS = {
  ALL: 'all',
  SELLER_CENTRAL_FBA: 'sellerCentral FBA',
  SELLER_CENTRAL_FBM: 'sellerCentral FBM',
  VENDOR_CENTRAL_ORDER: 'vendorCentralDirectFulfillment',
  VENDOR_CENTRAL_PURCHASE_ORDER: 'vendorCentralPurchase',
  EBAY: 'ebay',
  WALMART: 'walmart',
  PHONE_ORDER: 'phoneOrder'
};

const PLATFORMS = {
  'sellerCentral FBA': 'Amazon FBA',
  'sellerCentral FBM': 'Amazon FBM',
  sellerCentral: 'Seller Central',
  vendorCentralPurchase: 'VC Purchase Orders',
  vendorCentralDirectFulfillment: 'VC Direct Fulfillment',
  ebay: 'eBay',
  walmart: 'Walmart',
  phoneOrder: 'Phone Order'
};
const SHIPPING_METHOD = [{
  value: 'UPS Next Day Air',
  label: 'UPS Next Day Air'
}, {
  value: 'UPS Second Day Air',
  label: 'UPS Second Day Air'
}, {
  value: 'UPS 3 Day Air',
  label: 'UPS 3 Day Air'
}, {
  value: 'UPS Ground',
  label: 'UPS Ground'
}, {
  value: 'USPS Priority Mail',
  label: 'USPS Priority Mail'
}, {
  value: 'USPS First Class Mail',
  label: 'USPS First Class Mail'
}];

const MARKETPLACE_LIST = [{
  value: 'sellerCentral',
  label: 'Seller Central'
}, {
  value: 'walmart',
  label: 'Walmart'
}, {
  value: 'ebay',
  label: 'eBay'
}, {
  value: 'vendorCentralDirectFulFillment',
  label: 'VC DirectFulFillment'
}];

const sellerCentralInventoryHeader = ['Title', 'Marketplace Id', 'Seller Sku', 'Asin', 'FulfillmentType', 'Quantity'];
const walmartInventoryHeader = ['Title', 'Item Id', 'Seller Sku', 'Quantity'];
const ebayInventoryHeader = ['Title', 'Seller Sku', 'UPC', 'Quantity'];
const vCInventoryHeader = ['Title', 'Seller Sku', 'UPC', 'Asin', 'Quantity'];

const MarketplaceIdMapping = {
  A2EUQ1WTGCTBG2: 'CA',
  ATVPDKIKX0DER: 'US'
};

const Shipper = {
  Name: 'European Outdoors',
  ShipperNumber: '69R3X6',
  Address: {
    AddressLine: [
      '2596 NY-17M'
    ],
    City: 'GOSHEN',
    StateProvinceCode: 'NY',
    PostalCode: '10924',
    CountryCode: 'US'
  }
};

const DIMENSIONAL_FACTOR_UPS_WEIGHT = 139;

const VENDOR_CENTRAL = 'vendorCentralDirectFulfillment';
const AMAZON_CHANNEL = 'sellerCentral FBM';

const editOrderItemsPackDetailsPermission = ['COMMIT', 'BACK ORDERED'];

export {
  adminHeader,
  EXTENSIONS_LIST,
  userHeader,
  menuList,
  packSelectorMenu,
  permissionsMenu,
  permission,
  tableHeader,
  tableHeaderArchived,
  selectAgendaType,
  selectStatus,
  paginationValue,
  paginationValueWithMoreLimit,
  supplierHeader,
  packComponentHeader,
  fileDocumentHeader,
  supplierRealtedHeader,
  itemsPackHeader,
  addItemsHeader,
  addOrderItemHeader,
  salesChannel,
  productMangerHeader,
  inventoryHeader,
  nonConfirmPoHeader,
  poHistoryHeader,
  confrimPoHeader,
  selectStore,
  selectState,
  addPaymentHeader,
  marketPlaceHeader,
  completeBatchesHeader,
  jobsHeader,
  exportFile,
  nonConfirmPosHeader,
  orderManagementOrder,
  confirmPosHeader,
  ordersHeader,
  addItemHeader,
  reservedHeader,
  poQueueHeader,
  labelHeader,
  purchaseHeader,
  newOrderedItemHeader,
  newOrderItemHeader,
  newPhoneOrderItemHeader,
  orderStatus,
  orderType,
  boxLogs,
  processOrderHeader,
  packDetailsHeader,
  locationHeader,
  notificationHeader,
  batchDetailsHeader,
  relationalProductHeader,
  ROUTE_PATH_BY_PERMISSION_BASE,
  DEFAULT_ROUTES,
  ADMIN_ROUTES,
  dimensions,
  REGEX_FOR_NUMBERS,
  REGEX_FOR_DECIMAL_NUMBERS,
  CURRENCIES_SYMBOL,
  amazonCondition,
  relationalProductTabHeader,
  openOpsHeader,
  printPickHeader,
  sortableProductMangerHeader,
  PO_STATUS,
  orderedItemHeader,
  orderedWorkflowHeader,
  PAYMENT_METHOD,
  shipmentTrackHeader,
  allPosHeader,
  platform,
  DISCOUNT_TYPE,
  BADGE_CLASS,
  ORDER_STATUS,
  SALES_CHANNELS,
  ADD_ORDER_STATUS,
  packItem,
  pickOption,
  printSheetData,
  PLATFORMS,
  orderManagementBySalesChannel,
  orderManagementByOrderStatus,
  orderManagementByFilters,
  SHIPPING_METHOD,
  INPUT_TYPE_NUMBER,
  MARKETPLACE_LIST,
  sellerCentralInventoryHeader,
  walmartInventoryHeader,
  ebayInventoryHeader,
  vCInventoryHeader,
  MarketplaceIdMapping,
  printHeaderPdf,
  printInvoiceHeader,
  Shipper,
  DIMENSIONAL_FACTOR_UPS_WEIGHT,
  orderSubheader,
  purchasingSubheader,
  packingSlipHeader,
  packingSlipTableHeader,
  VENDOR_CENTRAL,
  AMAZON_CHANNEL,
  sortTableByOrderItemsHeader,
  orderManagementSort,
  orderPickSheetSort,
  orderProcessSort,
  orderBatchDetailSort,
  productOrderSort,
  poHistorySort,
  productInventorySort,
  productReservedQtySort,
  productMarketplaceControllerSort,
  relationalProductHeaderSort,
  itemsPackHeaderSort,
  addOrderItemHeaderSort,
  matchItemHeaderSort,
  poQueueHeaderSort,
  addItemToQueueSort,
  allPosHeaderSort,
  nonConfirmAddItemsHeaderSort,
  itemsOfReceivePOSort,
  itemsOfNonConfirmPOSort,
  sortOrderedWorkflowHeader,
  sortShipmentTrackHeader,
  sortRelationalProductTabHeader,
  sortPackComponentHeader,
  sortPackDetailsHeader,
  sortPurchaseHeader,
  sortTableHeader,
  sortAddPaymentHeader,
  updateOrderItemHeader,
  updateOrderItemHeaderSort,
  orderItemPackHeader,
  editOrderItemsPackDetailsPermission,
  packDetailsSort
};
