export const setupNotifications = () => {
  if (!global.window) {
    return;
  }

  Notification.requestPermission().then((result) => {
    if (result === 'granted') {
      setupNotificationServiceWorker();
    }
  });
};

const setupNotificationServiceWorker = async () => {
  // const url = new URL('./worker.ts', import.meta.url);

  const registration = await navigator.serviceWorker.register('/sw.js');
  console.log(
    'Service Worker registration successful with scope: ',
    registration.scope
  );

  return registration;
};
