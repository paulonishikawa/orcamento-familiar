const CACHE = 'orcamento-v1'

const ARQUIVOS = [
    '/orcamento-familiar/',
    '/orcamento-familiar/index.html',
    '/orcamento-familiar/style.css',
    '/orcamento-familiar/app.js'
]

// Instala o service worker e cacheia os arquivos
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return cache.addAll(ARQUIVOS)
        })
    )
})

// Intercepta requisições - serve do cache se offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(resposta) {
            return resposta || fetch(event.request)
        })
    )
})