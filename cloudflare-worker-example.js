addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const target = url.searchParams.get('url')
  if (!target) {
    return new Response('Missing url parameter', { status: 400 })
  }

  const upstream = await fetch(target, {
    headers: {
      // Optionally forward headers
      'User-Agent': request.headers.get('User-Agent') || '',
    }
  })

  // Copy headers and set CORS
  const headers = new Headers(upstream.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Headers', '*')
  headers.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
  // Optionally force correct content-type for HLS
  if (target.endsWith('.m3u8')) {
    headers.set('Content-Type', 'application/vnd.apple.mpegurl')
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers
  })
}
