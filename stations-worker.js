
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Block direct access to the JSON file
  if (url.pathname === '/stations.json') {
    return new Response('Access Denied', { status: 403, statusText: 'Forbidden' });
  }

  // Only process requests for our designated API path
  if (url.pathname === '/api/stations') {
    // Construct the full URL to the stations.json file on your site
    const jsonUrl = new URL('/stations.json', request.url).toString()

    // Fetch the JSON file
    const response = await fetch(jsonUrl)

    // Re-create the response to ensure correct headers and avoid any direct redirects
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // For all other requests, fetch them as usual
  return fetch(request)
}
