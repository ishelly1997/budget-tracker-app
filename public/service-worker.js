//nav service worker = user offline 
//files to be stored for offline use

const FILES_TO_CACHE = ["/", "/index.html", "/js/index.js", "/styles.css", "/js/idb.js" , "/icons/icon-96x96.png", "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
"https://cdn.jsdelivr.net/npm/chart.js@2.8.0"];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
//initiate service worker
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});
//activate service worker
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
        return Promise.all(
            keyList.map(key => {
              if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                return caches.delete(key);
              }
            })
          );
        })
      );

  self.clients.claim();
});
//make api fetch call
self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
      e.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then(cache => {
            return fetch(e.request)
              .then(response => {
                if (response.status === 200) {
                  cache.put(e.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                return cache.match(e.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
e.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(e.request).then(response => {
        return response || fetch(e.request);
      });
    })
  );
});