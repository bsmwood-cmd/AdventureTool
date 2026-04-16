var map = L.map('map').setView([39.8283, -98.5795], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 2,
        fillOpacity: 0.1
      }
    }).addTo(map);
  });

// Define locations
const locations = [
  {name: 'Little Lakes Valley', lat: 37.422, lng: -118.745},
  {name: 'Bishop Pass', lat: 37.094, lng: -118.515},
  {name: 'North Fork Lone Pine Creek', lat: 36.583, lng: -118.283},
  {name: 'Whitney Portal', lat: 36.593, lng: -118.233},
  {name: 'Sabrina Lake', lat: 37.22, lng: -118.64},
  {name: 'South Lake', lat: 37.08, lng: -118.66},
  {name: 'North Lake', lat: 37.23, lng: -118.61},
  {name: 'Rock Creek', lat: 37.45, lng: -118.72},
  {name: 'Convict Lake', lat: 37.59, lng: -118.85},
  {name: 'McGee Creek', lat: 37.58, lng: -118.78},
  {name: 'Big Pine Creek', lat: 37.12, lng: -118.44},
  {name: 'Glacier Lodge', lat: 37.18, lng: -118.74},
  {name: 'Onion Valley', lat: 36.78, lng: -118.33},
  {name: 'Horseshoe Meadow', lat: 36.45, lng: -118.18},
  {name: 'Cottonwood Lakes', lat: 36.51, lng: -118.22},
  {name: 'Agnew Meadows', lat: 37.68, lng: -119.08},
  {name: 'Devils Postpile', lat: 37.61, lng: -119.08},
  {name: 'Reds Meadow', lat: 37.65, lng: -119.07},
  {name: 'Thousand Island Lake', lat: 37.73, lng: -119.18},
  {name: 'Rock Creek Lake', lat: 37.42, lng: -119.33}
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

// Fetch rankings and add markers
fetch('rankings.csv')
  .then(response => response.text())
  .then(text => {
    const lines = text.trim().split('\n');
    const rankings = {};
    lines.slice(1).forEach(line => { // skip header
      const [loc, rank] = line.split(',');
      rankings[loc.trim()] = parseInt(rank.trim()) || 0;
    });
    locations.forEach(loc => {
      const ranking = rankings[loc.name] || 0;
      L.marker([loc.lat, loc.lng], {icon: getIcon(ranking)})
        .bindPopup(`${loc.name} (Ranking: ${ranking})`)
        .addTo(map);
    });
  });