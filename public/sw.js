self.addEventListener("install", function (event) {
  console.log("Hello world from the Service Worker 🤙");
});

self.addEventListener('activate', async () => {
  // This will be called only once when the service worker is activated.
  console.log('service worker activate')

  try {
    const options = {
      userVisibleOnly: true,
    }
    const subscription = await self.registration.pushManager.subscribe(options)
    console.log(JSON.stringify(subscription))
  } catch (err) {
    console.log('Error', err)
  }
})