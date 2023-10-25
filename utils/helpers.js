import { extend, isEmpty, startCase } from 'lodash';
import JsBarcode from 'jsbarcode';
import { jsPDF as JsPDF } from 'jspdf';

import { CURRENCIES_SYMBOL } from '../src/constants';

const BUCKET_NAMES = {
  userProfile: process.env.USER_PROFILE_BUCKET,
  productImage: process.env.PRODUCT_IMAGE_BUCKET,
  poDocs: process.env.PO_DOC_BUCKET,
  shipmentLabel: process.env.SHIPMENT_LABEL_BUCKET
};

const ValidateEmail = ({ email }) => {
  if (isEmpty(email)) {
    return 'Email is required!';
  } if (!/^\s*[\w.-]+@[a-zA-Z0-9_-]+\.[a-zA-Z]{2,}\s*$/.test(email)) {
    return 'Invalid email address!';
  }
  return '';
};

const ValidatePassword = ({ password }) => {
  if (isEmpty(password)) {
    return 'Password is required!';
  }

  const minLength = 8;
  const maxLength = 30;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumeric = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (password.length < minLength || password.length > maxLength) {
    return 'Password must have with min length 8 and max length 30!';
  }
  if (!hasLowerCase || !hasUpperCase || !hasNumeric || !hasSymbol) {
    return 'Password must contain Capital, small letter, number and symbols';
  }
  return '';
};

const UploadDocumentOnS3 = async ({ preSignedUrl, file }) => {
  try {
    const response = await fetch(preSignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });
    if (response.ok) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

const CamelCaseToTitleCase = (words) => words.map((word) => startCase(word));

const UploadedFileSize = (fileSize) => {
  const fSExt = ['Bytes', 'KB', 'MB', 'GB'];
  let i = 0;
  while (fileSize > 900) {
    fileSize /= 1024;
    i += 1;
  }
  const exactSize = `${Math.round(fileSize * 100) / 100} ${fSExt[i]}`;
  return exactSize;
};

const ValidatePhoneNumber = (number) => {
  const phonePattern = /^\+?[0-9]+(?:-[0-9]+)*$/;
  const valid = phonePattern.test(number);
  if (!number.length) return 'Phone number is required';
  if (!valid) return 'Enter the valid phone number';
  return '';
};

const HandleCatchBlock = (err) => {
  if (err.response && err.response.data) {
    return {
      error: err.response.data.error,
      status: err.response.status
    };
  }
  return {
    error: 'Network Error'
  };
};

const GetCurrencyAndSymbol = (value) => {
  value = String(value);
  let currencySymbol = '';
  let currencyAmount = value;
  for (let i = 0; i < CURRENCIES_SYMBOL.length; i += 1) {
    const currency = CURRENCIES_SYMBOL[i];
    if (value.includes(currency)) {
      currencyAmount = value.replace(currency, '');
      currencySymbol = currency;
      break;
    }
  }
  return {
    currencySymbol,
    currencyAmount
  };
};

const IsNumber = (value) => {
  if (/^-?\d+(,\d{3})*(\.\d+)?$/.test(value)) {
    return true;
  }
  return false;
};

const GetS3ImageUrl = ({ bucketName, key }) => {
  const nameOfBucket = BUCKET_NAMES[bucketName];
  let url;
  if (!isEmpty(key)) {
    url = `https://${nameOfBucket}.s3.amazonaws.com/${key}`;
  }
  return url;
};

const GenerateBarCode = ({ barCode, barCodeText, format = 'CODE128A' }) => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, barCode, {
    format,
    text: barCodeText || barCode,
    font: 'sans-serif',
    fontSize: 40,
    textAlign: 'center',
    width: 4,
    margin: 1,
    displayValue: true
  });

  return canvas.toDataURL('image/png');
};

function validateUPC(barcode) {
  let isValid = false;
  if (barcode?.length === 11) {
    if (!/^\d{11}$/.test(barcode)) {
      isValid = false;
      return false;
    }
    isValid = true;
    return true;
  } if (barcode?.length === 12) {
    if (!/^\d{12}$/.test(barcode)) {
      isValid = false;
      return false;
    }

    const checkDigit = barcode.charAt(11);
    const oddSum = barcode
      .slice(0, 11)
      .split('')
      .filter((_, index) => index % 2 === 0)
      .map(Number)
      .reduce((sum, digit) => sum + digit, 0);

    const evenSum = barcode
      .slice(0, 11)
      .split('')
      .filter((_, index) => index % 2 !== 0)
      .map(Number)
      .reduce((sum, digit) => sum + digit, 0);

    const totalSum = oddSum * 3 + evenSum;
    const calculatedCheckDigit = (10 - (totalSum % 10)) % 10;

    isValid = Number(checkDigit) === calculatedCheckDigit;
    return Number(checkDigit) === calculatedCheckDigit;
  }
  return isValid;
}

const ValidateURLForImage = (url) => {
  const regex = /^https:\/\/.+?\.(gif|jpeg|jpg|png|tiff|psd|pdf|eps)$/;
  return regex.test(url);
};

const PrintBarCode = ({ value, title, format }) => {
  if (format && format === 'upc' && !(value?.length === 11 || value?.length === 12)) return { error: 'Upc should be 11 or 12 digit' };
  const pdfDoc = new JsPDF('landscape', 'px', [162, 90]);
  pdfDoc.setFontSize(8);

  if (title) pdfDoc.text(title, 7, 10, { align: 'left', maxWidth: 150 });

  const barCodeParams = {
    barCode: value,
    barCodeText: value
  };

  if (!isEmpty(format)) {
    extend(barCodeParams, { format });
  }
  const barcode = GenerateBarCode(barCodeParams);
  pdfDoc.addImage(barcode, 'PNG', 18, 40, 126, 40);
  pdfDoc.save(`${value}.pdf`);
};

const generateSalesChannelLink = ({ id, salesChannel }) => {
  let link = '';
  if (salesChannel === 'Amazon FBM') {
    link = `https://sellercentral.amazon.com/orders-v3/order/${id}`;
  } else if (salesChannel === 'VC Direct Fulfillment') {
    link = `https://vendorcentral.amazon.com/hz/vendor/members/df/orders?id=${id}`;
  } else if (salesChannel === 'VC Purchase Orders') {
    link = `https://vendorcentral.amazon.com/po/vendor/members/po-mgmt/order?poId=${id}`;
  } else if (salesChannel === 'eBay') {
    link = `https://www.ebay.com/mesh/ord/details?mode=SH&srn=38880&orderid=${id}&source=Orders&ru=https%3A%2F%2Fwww.ebay.com%2Fsh%2Ford`;
  } else if (salesChannel === 'Walmart') {
    link = `https://seller.walmart.com/order-management/details?orderGroups=All&poNumber=${id}`;
  }

  return link;
};

const MakeFormattedStringForIndividualOrders = (individualOrders) => {
  const individualOrdersString = individualOrders?.reduce((accumulator, currentValue) => {
    if (accumulator) {
      return `${accumulator} | ${currentValue.orderNumber}, ${currentValue.quantity}`;
    }
    return `${currentValue.orderNumber}, ${currentValue.quantity}`;
  }, '');

  return individualOrdersString;
};

export {
  generateSalesChannelLink,
  validateUPC,
  ValidateEmail,
  ValidatePassword,
  CamelCaseToTitleCase,
  UploadDocumentOnS3,
  UploadedFileSize,
  ValidatePhoneNumber,
  HandleCatchBlock,
  GetCurrencyAndSymbol,
  IsNumber,
  GetS3ImageUrl,
  GenerateBarCode,
  ValidateURLForImage,
  PrintBarCode,
  MakeFormattedStringForIndividualOrders
};
