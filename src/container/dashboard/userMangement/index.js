import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { camelCase, startCase } from 'lodash';
import moment from 'moment';
import PasswordStrengthBar from 'react-password-strength-bar';
// material
import {
  Divider, Grid, Box, List, ListItem, Stack
} from '@mui/material';
// icons
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// constant
import {
  menuList
} from '../../../constants/index';
// component
import Checkbox from '../../../components/checkbox/index';
import Button from '../../../components/button/index';
import Drawer from '../../../components/drawer/index';
import Input from '../../../components/inputs/input/index';
import LoaderWrapper from '../../../components/loader/index';
import Modal from '../../../components/modal/index';
import Upload from '../../../components/upload/index';

import {
  UpdateUser,
  GetPreSignedUrl,
  UpdateProfileImage,
  SetUserNotifyState,
  SetUserState
} from '../../../redux/slices/user-slice';
import { SetAuthState } from '../../../redux/slices/auth-slice';

import { ValidatePassword, UploadDocumentOnS3, GetS3ImageUrl } from '../../../../utils/helpers';

// styles
import UserManagementWrapper from './style';
// images
import UserImage from '../../../static/images/user.svg';

const Index = () => {
  const dispatch = useDispatch();

  const {
    loading,
    userUpdated,
    loggedUser,
    success,
    preSignedUrl,
    fileUploadKey,
    tempUserProfile
  } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const [changeProfile, setChangeProfile] = useState(false);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const [name, setName] = useState(user.name);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [helperNameText, setHelperNameText] = useState('');
  const [helperOldPasswordText, setHelperOldPasswordText] = useState('');
  const [helperNewPasswordText, setHelperNewPasswordText] = useState('');
  const [helperConfirmPasswordText, setHelperConfirmPasswordText] = useState('');
  const [imageName, setImageName] = useState('');
  const [uploadResponse, setUploadResponse] = useState(false);
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);

  const handleSubmit = () => {
    const errorsArray = [{
      isNamePasswordValid: false
    }, {
      isOldPasswordValid: false
    }, {
      isNewPasswordValid: false
    }, {
      isConfirmPasswordValid: false
    }];
    if (!helperNameText.length
      && !helperOldPasswordText.length
      && !helperNewPasswordText.length
      && !helperConfirmPasswordText.length) {
      if (!(name.length)) {
        setHelperNameText('Name is required!');
      } else {
        errorsArray.pop();
        setHelperNameText('');
      }
      if (!oldPassword.length) {
        setHelperOldPasswordText('Old Password is required!');
      } else {
        errorsArray.pop();
        setHelperOldPasswordText('');
      }
      if (!newPassword.length) {
        setHelperNewPasswordText('Password is required!');
      } else {
        errorsArray.pop();
        setHelperNewPasswordText('');
      }
      if (!confirmPassword.length) {
        setHelperConfirmPasswordText('Confirm Password is required!');
      } else {
        errorsArray.pop();
        setHelperConfirmPasswordText('');
      }
    }
    if (!errorsArray.length
      && !helperNameText.length
      && !helperOldPasswordText.length
      && !helperNewPasswordText.length
      && !helperConfirmPasswordText.length) {
      dispatch(UpdateUser({ oldPassword, updateParams: { name, password: newPassword } }));
    }
  };

  const handleChange = (value, key) => {
    if (key === 'name') {
      setName(value);
      if (!(value.length)) {
        setHelperNameText('Name is required!');
      } else {
        setHelperNameText('');
      }
    } else if (key === 'oldPassword') {
      setOldPassword(value);
      if (!value.length) {
        setHelperOldPasswordText('Old Password is required!');
      } else {
        setHelperOldPasswordText('');
      }
    } else if (key === 'newPassword') {
      setNewPassword(value);
      let passwordError = '';
      passwordError = ValidatePassword({ password: value });
      setHelperNewPasswordText(passwordError);
      if (confirmPassword) {
        if (confirmPassword === value) {
          setPasswordMatch(true);
          setHelperConfirmPasswordText('');
        } else if (confirmPassword !== value) {
          setPasswordMatch(false);
          setHelperConfirmPasswordText('Password Mismatch');
        }
      }
    } else if (key === 'confirmPassword') {
      setConfirmPassword(value);
      if (!value.length) {
        setHelperConfirmPasswordText('Confirm Password is required!');
      } else if (newPassword === value) {
        setHelperConfirmPasswordText('');
        setPasswordMatch(true);
      } else if (newPassword !== value) {
        setHelperConfirmPasswordText('Password Mismatch');
        setPasswordMatch(false);
      } else {
        setHelperNewPasswordText('');
        setHelperConfirmPasswordText('');
      }
    }
  };

  const handleChangeUploadFile = async (e) => {
    const { files } = e.target;
    const maxFileSize = 1e+6;
    if (files?.length) {
      const file = files[0];
      const {
        name: imgName,
        size
      } = file;

      const extension = imgName.split('.').pop();
      if (extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
        if (size > maxFileSize) {
          dispatch(SetUserNotifyState({ message: 'Upload an image upto 1MB', type: 'error' }));
        } else {
          setAttachment(file);
          setImageName(file.name);
        }
      } else {
        dispatch(SetUserNotifyState({ message: 'Upload a file with png/jpg/jpeg extensions', type: 'error' }));
      }
    }
    e.target.value = null;
  };

  const handleSaveTempProfileImage = () => {
    const file = attachment;
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Data = reader.result;
      dispatch(SetUserState({ field: 'tempUserProfile', value: base64Data }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSaveImage = async () => {
    if (!attachment) {
      dispatch(SetUserNotifyState({ message: 'Choose file', type: 'error' }));
      return;
    }

    const {
      name: imgName,
      type
    } = attachment;

    const extension = imgName.split('.').pop();
    const fileName = `${user?.userId.toString()}-${Date.now().toString(36) + Math.random().toString(36).slice(2)}.${extension}`;
    setAttachmentLoading(true);
    dispatch(GetPreSignedUrl({
      fileName,
      fileType: type,
      extension,
      uploadBucket: 'userProfile'
    }));
  };

  const handleImageError = (event) => {
    event.target.src = UserImage;
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({ preSignedUrl, file: attachment });
    if (response) {
      handleSaveTempProfileImage();
      setAttachmentResponse(true);
    } else {
      setAttachmentLoading(false);
      dispatch(SetUserNotifyState({ message: 'File Uploading failed on S3', type: 'error' }));
    }

    dispatch(SetUserState({ field: 'preSignedUrl', value: '' }));
  };

  useEffect(() => {
    if (attachmentResponse) {
      setAttachmentLoading(false);
      setUploadFileModal(false);
      setImageName('');
      setAttachment(null);
      setAttachmentResponse(false);
      dispatch(UpdateProfileImage({ updateParams: { profileImage: fileUploadKey } }));
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (preSignedUrl && preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (success) {
      setChangeProfile(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    if (!success && !loading) {
      setAttachmentLoading(false);
    }
  }, [success, loading]);

  useEffect(() => {
    setHelperNameText('');
    setHelperOldPasswordText('');
    setHelperNewPasswordText('');
    setHelperConfirmPasswordText('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setName(user?.name);
  }, [changeProfile]);

  useEffect(() => {
    if (!uploadFileModal) {
      setImageName('');
      setAttachment(null);
    }
  }, [uploadFileModal]);

  useEffect(() => {
    if (userUpdated) {
      dispatch(SetAuthState({ field: 'user', value: loggedUser }));
    }
  }, [userUpdated]);

  useEffect(() => {
    if (tempUserProfile) setImageUrl(tempUserProfile);
  }, [tempUserProfile]);

  useEffect(() => {
    if (user.profileImage && user.profileImage !== '') {
      if (uploadResponse) {
        setUploadResponse(false);
        setTimeout(() => {
          const url = GetS3ImageUrl({ bucketName: 'userProfile', key: loggedUser.profileImage });
          setImageUrl(url);
        }, 8000);
      } else {
        const url = GetS3ImageUrl({ bucketName: 'userProfile', key: user.profileImage });
        setImageUrl(url);
      }
    }
  }, [user, userUpdated]);

  return (
    <UserManagementWrapper>
      <Box component="h2" mt={0.25}>User Management</Box>
      <Divider sx={{ backgroundColor: '#979797', margin: '23px 0px' }} />
      <Grid container columnSpacing={2}>
        <Grid item md={7}>
          <Grid container columnSpacing={1}>
            <Grid item md={3}>
              <Box className="info-box" display="flex" flexDirection="column" mt={0.3}>
                <Box component="span">Full name</Box>
                <Box component="span">{user?.name || '--'}</Box>
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box className="info-box" display="flex" flexDirection="column" ml={3.87} mt={0.3}>
                <Box component="span">Email Address</Box>
                <Box component="span">{user?.email || '--'}</Box>
              </Box>
            </Grid>
          </Grid>
          <Box mt={4.1}>
            <Box component="h3">Permissions</Box>
            <List className="user-list">
              <Grid container columnSpacing={2}>
                <Grid item md={12}>
                  {menuList.map((list, index) => (
                    <ListItem disablePadding key={index}>
                      <Checkbox
                        label={list}
                        marginBottom="7px"
                        checked={Boolean(user?.permissions?.[camelCase(list)])}
                      />
                    </ListItem>
                  ))}
                </Grid>
              </Grid>
            </List>
          </Box>
          <Box mt={0.9}>
            <h3>Status</h3>
            <Stack direction="row" sx={{ marginTop: '14px' }}>
              <Box component="span" sx={{ marginTop: '2px' }} className="badge success">{startCase(user?.status) || '--'}</Box>
              <Box component="span" sx={{ marginTop: '5px', marginLeft: '23px' }} className="label-color">{user?.createdAt ? moment(user?.createdAt).format('ddd, lll') : '--'}</Box>
            </Stack>
          </Box>
        </Grid>
        <Grid item md={4}>
          <Box sx={{ paddingTop: '2px', marginLeft: '-98px' }}>
            <Box position="relative">
              <img src={imageUrl || UserImage} onError={handleImageError} alt="no-user" className="rounded-image" />
              <Box borderRadius="50%" className="edit-icon pointer" onClick={() => setUploadFileModal(true)}>
                <span className="icon-edit" />
              </Box>
            </Box>
            <Box sx={{ paddingTop: '30px', marginLeft: '-8px' }}>
              <Button
                varient="outlined"
                text="Update Profile"
                startIcon={<span className="icon-update-profile" />}
                onClick={() => {
                  setChangeProfile(true);
                  setPasswordMatch(false);
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Drawer open={changeProfile} width="473px" close={() => setChangeProfile(false)}>
        <Stack alignItems="center" direction="row" spacing={3}>
          {loading && changeProfile ? <LoaderWrapper /> : null}
          <Box component="span" className="icon-left pointer" onClick={() => setChangeProfile(false)} />
          <h2 className="m-0 pl-2">Change Password</h2>
        </Stack>
        <Divider sx={{ backgroundColor: '#979797', margin: '25px 0px' }} />
        <Input
          label="Name"
          placeholder="Enter Name"
          value={name}
          width="100%"
          helperText={helperNameText}
          onChange={(e) => handleChange(e.target.value, 'name')}
        />
        <Input
          label="Old Password"
          placeholder="Old password"
          value={oldPassword}
          width="100%"
          type="password"
          showIcon
          helperText={helperOldPasswordText}
          onChange={(e) => { handleChange(e.target.value, 'oldPassword'); }}
        />
        <Box position="relative">
          <Stack direction="row" spacing={1} position="absolute" right={2} top={3}>
            <PasswordStrengthBar
              password={newPassword}
              minLength={5}
              shortScoreWord=""
              className="password-strength"
            />
          </Stack>

          <Input
            name="password"
            label="New Password"
            placeholder="New password"
            width="100%"
            marginBottom="16px"
            type="password"
            showIcon
            msgColor={helperNewPasswordText && newPassword ? 'danger' : 'default'}
            value={newPassword}
            isError={!!helperNewPasswordText && newPassword}
            helperText={!newPassword
              ? 'Password must contain Capital, small letter, number and symbols'
              : helperNewPasswordText}
            onChange={(e) => {
              handleChange(e.target.value, 'newPassword');
            }}
          />

        </Box>
        <Box position="relative">
          <Stack direction="row" spacing={1} position="absolute" right={2} top={3}>
            <PasswordStrengthBar
              password={confirmPassword}
              minLength={5}
              shortScoreWord=""
              className="password-strength"
            />
          </Stack>

          <Input
            name="password"
            label="Confirm Password"
            placeholder="Confirm new password"
            width="100%"
            marginBottom="23px"
            type="password"
            showIcon
            value={confirmPassword}
            isError={!passwordMatch}
            helperText={passwordMatch ? 'Password Match' : helperConfirmPasswordText}
            msgColor={passwordMatch ? 'success' : 'danger'}
            onChange={(e) => {
              handleChange(e.target.value, 'confirmPassword');
            }}
          />

        </Box>
        <Box textAlign="right">
          <Button
            text="Save"
            variant="contained"
            width="87px"
            startIcon={<span className="icon-Save" />}
            onClick={handleSubmit}
          />
        </Box>
      </Drawer>
      <Modal show={uploadFileModal} width={472} onClose={() => setUploadFileModal(false)}>
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '471px' }}>
          <CancelOutlinedIcon
            className="pointer"
            onClick={() => setUploadFileModal(false)}
            sx={{
              color: '#979797',
              fontSize: 14,
              position: 'absolute',
              right: '23px',
              top: '25px',
              opacity: attachmentLoading ? 0.5 : 1,
              pointerEvents: attachmentLoading ? 'none' : 'auto'
            }}
          />
          <h2>Upload Profile Picture</h2>
          <Box mt={7}>
            <Upload
              handleChangeAttachment={handleChangeUploadFile}
              title="Drag or Click to Profile"
              attachmentName={imageName}
              accept="image/png, image/jpg, image/jpeg"
              loading={attachmentLoading}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                text="Save"
                variant="contained"
                width="87px"
                startIcon={<span className="icon-Save" />}
                disabled={attachmentLoading || !attachment}
                onClick={handleUploadSaveImage}
              />
            </Box>
          </Box>
        </Box>
      </Modal>
    </UserManagementWrapper>
  );
};

export default Index;
