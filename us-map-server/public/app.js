var map = L.map('map').setView([39.8283, -98.5795], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const highlightedAreas = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Lake Tahoe',
        description: 'Lake Tahoe shaded area for management / planning reference.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-120.1378, 39.2392],
          [-120.1225, 39.2352],
          [-120.0947, 39.2143],
          [-120.0778, 39.1764],
          [-120.0764, 39.1470],
          [-120.0664, 39.1208],
          [-120.0481, 39.0898],
          [-120.0180, 39.0681],
          [-119.9897, 39.0557],
          [-119.9578, 39.0450],
          [-119.9262, 39.0351],
          [-119.9083, 39.0198],
          [-119.9034, 38.9948],
          [-119.9051, 38.9711],
          [-119.9202, 38.9511],
          [-119.9403, 38.9458],
          [-119.9708, 38.9449],
          [-120.0006, 38.9485],
          [-120.0237, 38.9594],
          [-120.0489, 38.9771],
          [-120.0814, 39.0144],
          [-120.0942, 39.0411],
          [-120.1068, 39.0712],
          [-120.1229, 39.1158],
          [-120.1321, 39.1537],
          [-120.1326, 39.1872],
          [-120.1378, 39.2392]
        ]]
      }
    }
  ]
};

L.geoJSON(highlightedAreas, {
  style: feature => ({
    color: '#ff7800',
    weight: 2,
    fillColor: 'orange',
    fillOpacity: 0.25
  }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.description}`);
  }
}).addTo(map);

fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
  .then(response => response.json())
  .then(data => {
    // Removed state boundaries
    // L.geoJSON(data, {
    //   style: {
    //     color: 'blue',
    //     weight: 2,
    //     fillOpacity: 0.1
    //   }
    // }).addTo(map);
  });

// Define locations
const locations = [
  {name: 'Little Lakes Valley', lat: 37.4219, lng: -118.7458},
  {name: 'Bishop Pass', lat: 37.0936, lng: -118.5147},
  {name: 'North Fork Lone Pine Creek', lat: 36.5833, lng: -118.2833},
  {name: 'Whitney Portal', lat: 36.5931, lng: -118.2331},
  {name: 'Sabrina Lake', lat: 37.2200, lng: -118.6400},
  {name: 'South Lake', lat: 37.0800, lng: -118.6600},
  {name: 'North Lake', lat: 37.2300, lng: -118.6100},
  {name: 'Rock Creek', lat: 37.4500, lng: -118.7200},
  {name: 'Convict Lake', lat: 37.5900, lng: -118.8500},
  {name: 'McGee Creek', lat: 37.5800, lng: -118.7800},
  {name: 'Big Pine Creek', lat: 37.1200, lng: -118.4400},
  {name: 'Glacier Lodge', lat: 37.1800, lng: -118.7400},
  {name: 'Onion Valley', lat: 36.7800, lng: -118.3300},
  {name: 'Horseshoe Meadow', lat: 36.4500, lng: -118.1800},
  {name: 'Cottonwood Lakes', lat: 36.5100, lng: -118.2200},
  {name: 'Agnew Meadows', lat: 37.6800, lng: -119.0800},
  {name: 'Devils Postpile', lat: 37.6100, lng: -119.0800},
  {name: 'Reds Meadow', lat: 37.6500, lng: -119.0700},
  {name: 'Thousand Island Lake', lat: 37.7300, lng: -119.1800},
  {name: 'Rock Creek Lake', lat: 37.4200, lng: -119.3300}
];

// Function to get icon based on ranking
function getIcon(ranking) {
  let color = 'blue';
  if (ranking >= 8) color = 'green';
  else if (ranking >= 5) color = 'orange';
  else if (ranking >= 1) color = 'red';
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Fetch locations from Airtable and add markers
fetch('https://api.airtable.com/v0/appLtM6ElUXPCVCPl/tblu7GgCz8uRaXYu1', {
  headers: {
    'Authorization': 'Bearer pattew3Rm3GxWyzS5'
  }
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Airtable data:', data);
    data.records.forEach(record => {
      const obj = record.fields;
      console.log('Record fields:', obj);
      const loc = {name: obj.Name, lat: parseFloat(obj.Lat), lng: parseFloat(obj.Lng)};
      if (isNaN(loc.lat) || isNaN(loc.lng)) {
        console.error('Invalid lat/lng for', obj.Name, obj.Lat, obj.Lng);
        return;
      }
      let popupContent = `<b>${loc.name}</b><br>`;
      for (let key in obj) {
        if (key !== 'Name' && key !== 'Lat' && key !== 'Lng') popupContent += `${key}: ${obj[key]}<br>`;
      }
      L.marker([loc.lat, loc.lng], {icon: getIcon(parseInt(obj.Rating) || 0)})
        .bindPopup(popupContent)
        .addTo(map);
    });
  })
  .catch(error => {
    console.error('Error fetching from Airtable:', error);
  });