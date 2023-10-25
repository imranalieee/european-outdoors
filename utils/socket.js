import { io } from 'socket.io-client';

const SERVER_ENDPOINT = new URL(process.env.API_URL).origin;

const initializeSocket = (token) => {
  const socket = io(SERVER_ENDPOINT, {
    extraHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  const subscribeToNotifications = (callback) => {
    socket.on('notification', (message) => {
      callback(message);
    });
  };

  const unsubscribeFromNotifications = () => {
    socket.off('notification');
  };

  return {
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
};

export default initializeSocket;
