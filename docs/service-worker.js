const CACHE = 'orcamento-v1'

const ARQUIVOS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
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
    // Ignora requisições que não sejam HTTP/HTTPS (como WebSockets do Live Server)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then(function(resposta) {
            return resposta || fetch(event.request).catch(() => {
                // Retorna nada ou uma resposta básica para não quebrar a promessa
            })
        })
    )
})