
const stations = [
  {
    "id": 40,
    "title": "Hit Radio",
    "streamUrl": "https://hitradio-maroc.ice.infomaniak.ch/hitradio-maroc-128.mp3",
    "imageUrl": "./image/hit.png",
    "category": "Music",
    "website": "https://hitradio.ma"
  },
  {
    "id": 50,
    "title": "Urban Radio",
    "streamUrl": "https://uradio-aac.ice.infomaniak.ch/uradio.aac",
    "imageUrl": "./image/uradio.png",
    "category": "Music",
    "website": "https://uradio.ma/"
  },
  {
    "id": 15,
    "title": "Medi 1 Radio",
    "streamUrl": "https://streaming2.medi1tv.com/webradio/radio_mag.stream_aac/chunklist_w1607380952.m3u8",
    "imageUrl": "./image/medi.png",
    "category": "News & Talk",
    "website": "https://medi1.com"
  },
  {
    "id": 16,
    "title": "Al-Jazeera",
    "streamUrl": "https://live-hls-audio-web-aja.getaj.net/VOICE-AJA/01.m3u8",
    "imageUrl": "./image/aljazeera.png",
    "category": [
     "News & Talk",
      "Arabic",
      "International"
    ],    
    "website": "https://aljazeera.com"
  },
  {
    "id": 72,
    "title": "RT Radio",
    "streamUrl": "https://rt-arb.rttv.com/dvr/rtarab/playlist_64Kb.m3u8",
    "imageUrl": "./image/rtradio.png",
    "category": [
     "News & Talk",
      "Arabic",
      "International"
    ],      
    "website": "https://www.rtarabic.com"
  }
];

stations.forEach(station => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": station.title,
    "description": `Listen to ${station.title} for free.`,
    "provider": {
      "@type": "Organization",
      "name": station.title
    },
    "areaServed": {
      "@type": "Country",
      "name": "MA"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Radio Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": `Streaming of ${station.title}`
          },
          "price": "0",
          "priceCurrency": "MAD"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "125"
    },
    "serviceOutput": {
      "@type": "MusicRecording",
      "byArtist": station.title,
      "url": station.streamUrl,
      "inLanguage": "ar"
    }
  });
  document.head.appendChild(script);
});
