export { setupNotifications } from './permissions';

export const triggerNotification = (
  title: string,
  options: NotificationOptions = {}
) => {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function (reg) {
      if (reg) {
        const opts: NotificationOptions = {
          ...options,
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            ...options.data,
          },
        };
        reg.showNotification(title, opts);
      }
    });
  }
};
