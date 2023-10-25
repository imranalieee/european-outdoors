import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

const axiosBaseUrl = () => {
  axios.defaults.baseURL = process.env.API_URL;
  return axios;
};

export {
  setAuthToken,
  axiosBaseUrl
};
