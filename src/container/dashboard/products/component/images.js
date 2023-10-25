import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ReSizer from 'react-image-file-resizer';
// icons
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import StarIcon from '@mui/icons-material/Star';
// components
import Button from '../../../../components/button/index';
import Modal from '../../../../components/modal/index';
import Upload from '../../../../components/document-upload/index';
import LoaderWrapper from '../../../../components/loader/index';

import {
  SetProductNotifyState, // use it if blink issue gets solve
  UpdateProductImages,
  UpdateProductPrimaryImage,
  DeleteProductImage
} from '../../../../redux/slices/product-slice';

import {
  GetS3PreSignedUrl,
  SetOtherState,
  SetOtherNotifyState
} from '../../../../redux/slices/other-slice';
// helpers
import { UploadDocumentOnS3, GetS3ImageUrl } from '../../../../../utils/helpers';
// images
import Image from '../../../../static/images/image1.png';
import Image2 from '../../../../static/images/image2.png';
import Alert from '../../../../static/images/alert.svg';

const Images = ({ productId }) => {
  const dispatch = useDispatch();

  const {
    loading,
    preSignedUrl,
    fileUploadKey,
    success
  } = useSelector((state) => state.other);

  const {
    productImages,
    loading: productLoading
  } = useSelector((state) => state.product);

  const {
    user: {
      permissions: { editProducts = false } = {}
    } = {}
  } = useSelector((state) => state.auth);

  const [uploadFile, setUploadFile] = useState(false);
  const [active, setActive] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [primaryImageUrlLink, setPrimaryImageUrlLink] = useState(null);
  const [imagesUrl, setImagesUrl] = useState([]);
  const [deleteProductImageUrl, setDeleteProductImageUrl] = useState('');
  const [extension, setExtension] = useState('');
  const [primaryImage, setPrimaryImage] = useState(false);
  const [primaryImageUrl, setPrimaryImageUrl] = useState(false);
  const [prevImageUrl, setPrevImageUrl] = useState('');

  const handleUploadAttachmentOnS3 = async () => {
    if (preSignedUrl && attachment) {
      const response = await UploadDocumentOnS3({
        preSignedUrl, file: attachment
      });
      if (response) {
        setUploadFile(false);
        setAttachmentResponse(true);
        dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      } else {
        setAttachmentLoading(false);
        dispatch(SetOtherNotifyState({ message: 'Image Uploading failed on S3', type: 'error' }));
      }
    }
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];

      const fileExtension = file.name.split('.').pop();
      if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
        const maxSizeInBytes = 500 * 1024;
        if (file.size > maxSizeInBytes) {
          ReSizer.imageFileResizer(
            file,
            800,
            800,
            'JPEG',
            90,
            0,
            (compressedFile) => {
              setAttachment(compressedFile);
              setAttachmentName(file.name.split('.')[0]);
              setExtension('jpeg');
              e.target.value = null;
            },
            'blob'
          );
        } else {
          setAttachment(file);
          setAttachmentName(file.name.split('.')[0]);
          setExtension(file.name.split('.').pop());
          e.target.value = null;
        }
      } else {
        dispatch(SetOtherNotifyState({ message: 'Upload a file with png/jpg/jpeg extensions', type: 'error' }));
        e.target.value = null;
      }
    }
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handleSaveAttachment = () => {
    if (!attachment) {
      dispatch(SetOtherNotifyState({ message: 'Import File or Drag File', type: 'error' }));
      return;
    }
    const formattedFileName = `${attachmentName}-${moment().format('YYYY-MM-DD HH:mm:ss')}.${extension}`.replace(/\s/g, '-');

    setAttachmentLoading(true);
    dispatch(GetS3PreSignedUrl({
      fileName: formattedFileName,
      fileType: attachment.type,
      fileExtension: extension,
      uploadBucket: 'productImage',
      id: String(productId)
    }));
  };

  const handleDeleteProductImage = () => {
    let isPrimary = false;
    if (deleteProductImageUrl === productImages.primaryImageUrl) isPrimary = true;

    dispatch(DeleteProductImage({
      productId,
      imageUrl: deleteProductImageUrl,
      isPrimary
    }));
  };

  useEffect(() => {
    if (!productLoading) {
      setDeleteModal(false);
    }
  }, [productLoading]);

  useEffect(() => {
    if (!attachmentLoading) {
      setAttachmentResponse(false);
    }
  }, [attachmentLoading]);

  useEffect(() => {
    if (attachmentResponse) {
      setAttachmentLoading(false);
      setAttachmentName('');
      setAttachment(null);
      dispatch(
        UpdateProductImages({
          productId,
          updateParams: { imageUrl: fileUploadKey }
        })
      );
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (productImages?.primaryImageUrl) {
      const primaryImageLink = GetS3ImageUrl({ bucketName: 'productImage', key: `${productImages.primaryImageUrl}` });
      setPrimaryImageUrlLink(primaryImageLink);
    } else {
      setPrimaryImageUrlLink(null);
    }
    if (productImages?.imagesUrl?.length) {
      setImagesUrl(productImages.imagesUrl);
    } else {
      setImagesUrl([]);
    }
  }, [productImages]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (!success && !loading) {
      setAttachmentLoading(false);
    }
  }, [success, loading]);

  useEffect(() => {
    if (primaryImage && (primaryImageUrl !== prevImageUrl)) {
      setPrevImageUrl(primaryImageUrl);
      dispatch(UpdateProductPrimaryImage({
        productId,
        primaryImageUrl
      }));
    }
    setPrimaryImage(false);
  }, [primaryImageUrl]);

  return (
    <>
      {/* { loading ? <LoaderWrapper /> : null} */}
      <Box display="flex" justifyContent="space-between" mb={1.5}>
        <Box component="h3" mt={0.25}>Image(S)</Box>
        <Button
          disabled={!editProducts}
          text="Upload Image"
          variant="contained"
          startIcon={<span className="icon-cloud-arrow-up" />}
          onClick={() => setUploadFile(true)}
        />
      </Box>
      <Grid key={`${Date.now().toString(36) + Math.random().toString(36).slice(2)}`} container columnSpacing={3}>
        {primaryImageUrlLink
          ? (
            <Grid item md={2}>
              <Box>
                <Box sx={{ border: '1px solid #D9D9D9', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }} textAlign="center">
                  <img
                    key={`${Date.now().toString(36) + Math.random().toString(36).slice(2)}`}
                    src={primaryImageUrlLink || Image}
                    onError={(e) => handleImageError(e, Image)}
                    alt="no-data"
                    width="198px"
                    height="198px"
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={1}
                  pb={1}
                  pl={1.5}
                  pr={2}
                  sx={{ border: '1px solid #D9D9D9', borderTop: '0px' }}
                  borderRadius="0px 0px 4px 4px"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Stack className="active" direction="row" spacing={1} alignItems="center">
                      <Box
                        component="span"
                        bgcolor="#3C76FF"
                        p={0.5}
                        borderRadius={0.5}
                      >
                        <StarIcon sx={{ color: '#fff', fontSize: 16 }} />

                      </Box>
                      <Box component="span" color="#3C76FF" fontSize="11px" fontWeight="600">Primary</Box>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      opacity: !editProducts ? 0.5 : 1,
                      pointerEvents: !editProducts ? 'none' : 'auto'
                    }}
                    className="icon-trash pointer"
                    onClick={() => {
                      setDeleteProductImageUrl(productImages?.primaryImageUrl);
                      setDeleteModal(true);
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          )
          : null}
        {imagesUrl?.map((imageUrl, index) => {
          const url = GetS3ImageUrl({ bucketName: 'productImage', key: `${imageUrl}` });
          return (
            <Grid item md={2} key={index}>
              <Box display="flex" flexDirection="column" mb={2}>
                <Box sx={{ border: '1px solid #D9D9D9', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }} textAlign="center">
                  <img
                    key={`${Date.now().toString(36) + Math.random().toString(36).slice(2)}`}
                    src={url || Image2}
                    onError={(e) => handleImageError(e, Image2)}
                    alt="no-data"
                    width="198px"
                    height="198px"
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  pt={0.75}
                  pb={1}
                  pl={1.5}
                  pr={2}
                  sx={{ border: '1px solid #D9D9D9', borderTop: '0px' }}
                  borderRadius="0px 0px 4px 4px"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Stack className="active" direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          opacity: !editProducts ? 0.5 : 1,
                          pointerEvents: !editProducts ? 'none' : 'auto'
                        }}
                        component="span"
                        onClick={() => {
                          setPrimaryImage(true);
                          setPrimaryImageUrl(imageUrl);
                        }}
                        className="pointer"
                        bgcolor={active ? '#3C76FF' : ''}
                        p={0.5}
                        borderRadius={0.5}
                      >
                        <StarIcon sx={{ color: active ? '#fff' : '#979797', fontSize: 16 }} />
                      </Box>
                      <Box
                        component="span"
                        color="#3C76FF"
                        fontSize="11px"
                        fontWeight="600"
                      >
                        Mark Primary
                      </Box>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      opacity: !editProducts ? 0.5 : 1,
                      pointerEvents: !editProducts ? 'none' : 'auto'
                    }}
                    className="icon-trash pointer"
                    onClick={() => {
                      setDeleteProductImageUrl(imageUrl);
                      setDeleteModal(true);
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          );
        })}

      </Grid>
      <Modal show={uploadFile} width={696} 
      onClose={() => {
              setUploadFile(false);
              setAttachmentLoading(false);
              setAttachment(null);
              setAttachmentName(null);
            }}>
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '696px' }} className="reinvite-modal">
          <CancelOutlinedIcon
            className="pointer"
            onClick={() => {
              setUploadFile(false);
              setAttachmentLoading(false);
              setAttachment(null);
              setAttachmentName(null);
            }}
            sx={{
              opacity: attachmentLoading ? 0.5 : 1,
              pointerEvents: attachmentLoading ? 'none' : 'auto',
              color: '#979797',
              fontSize: 17,
              position: 'absolute',
              right: '24px',
              top: '23px'
            }}
          />
          <h2>Upload Product</h2>
          <Box mt={3}>
            <Upload
              marginBottom="6px"
              loading={attachmentLoading}
              handleChangeAttachment={handleChangeAttachment}
              title="Drag & drop files"
              supportedFormat="Support Format JPG JPEG & PNG File"
              accept="image/png, image/jpg, image/jpeg"
              attachmentName={attachmentName}
              disabled={false}
            />
            <Box component="span" sx={{ fontSize: 10 }} color="#E61F00">
              {' '}
              { !attachment ? <span> Multiple images can’t be upload. </span> : null }
            </Box>
            <Box textAlign="right">
              <Button
                disabled={(attachmentLoading || !attachment)}
                text="Save"
                type="button"
                variant="contained"
                startIcon={<span className="icon-Save" />}
                onClick={handleSaveAttachment}
              />
            </Box>
          </Box>
        </Box>
      </Modal>
      <Modal show={deleteModal} width={362} 
         onClose={() => {
          setDeleteModal(false);
          setDeleteProductImageUrl("");
        }}
        loading={productLoading}

      >
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '362px' }} className="reinvite-modal">
          <Stack alignItems="center" justifyContent="center">
            <Box>
              <img src={Alert} alt="no-logo" />
            </Box>
            <Box textAlign="center" sx={{ marginTop: '24px' }}>
              <h3 className="m-0">
                Are You Sure You Want To
              </h3>
              <h3 className="m-0">
                Delete The Item?
              </h3>
            </Box>
            <Box sx={{ color: '#5A5F7D', fontSize: 13, marginTop: '16px' }} textAlign="center">
              You won’t be able to revert it back.
            </Box>

          </Stack>
          <Stack spacing={3} pt={3} direction="row" justifyContent="end">
            <Button variant="text" text="Yes" onClick={handleDeleteProductImage} />
            <Button
              variant="outlined"
              text="No"
              className="btn-large"
              onClick={() => {
                setDeleteModal(false); setDeleteProductImageUrl('');
              }}
            />
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default Images;
