// Service Worker for RIPFLO PWA
const CACHE_NAME = 'ripflo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  '/app.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if this is an API request (should not be cached)
  const isApiRequest = url.pathname.includes('/workorders') ||
                       url.pathname.includes('/contacts') ||
                       url.pathname.includes('/assets') ||
                       url.pathname.includes('/users') ||
                       url.pathname.includes('/facilities') ||
                       url.pathname.includes('/brands') ||
                       url.pathname.includes('/labor_rates') ||
                       url.pathname.includes('/model_cats') ||
                       url.pathname.includes('/models') ||
                       url.pathname.includes('/manufacturers') ||
                       url.pathname.includes('/component_cats') ||
                       url.pathname.includes('/model_components') ||
                       url.pathname.includes('/asset_xfers') ||
                       url.pathname.includes('/workorder_notes') ||
                       url.pathname.includes('/workorder_assignment_roles') ||
                       url.pathname.includes('/workorder_techs') ||
                       url.pathname.includes('/workorder_items') ||
                       url.pathname.includes('/activations') ||
                       url.pathname.includes('/audit_log') ||
                       url.pathname.includes('/login_attempts') ||
                       url.pathname.includes('/password_reset_tokens') ||
                       url.pathname.includes('/sys_config') ||
                       url.pathname.includes('/sys_events') ||
                       url.pathname.includes('/workorder_statuses') ||
                       url.pathname.includes('/search/') ||
                       url.pathname.includes('/zips') ||
                       url.pathname.includes('/health') || // Health check endpoint
                       (url.hostname.includes('192.168') &&
                        (url.pathname !== '/' && url.pathname !== '/index.html')); // Local API requests

  if (isApiRequest) {
    // For API requests, always go to the network with proper error handling
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('API fetch failed:', error);
        // Return an error response if the network request fails
        return new Response(JSON.stringify({ error: 'Network error occurred' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For other requests (static assets), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available, otherwise fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          console.error('Static asset fetch failed:', error);
          // If both cache and network fail, return a fallback response
          return new Response('Offline content not available', {
            status: 503
          });
        });
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});