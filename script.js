// Access Token to link to my Mapbox Account

mapboxgl.accessToken = 'pk.eyJ1IjoiMzA3MDI3MWoiLCJhIjoiY201d2RuY3VxMDluMjJscXp5ZW42MG1zeCJ9.c7fETI_inRzWjln-_ePd-w';

// Setting up the Mapbox map to display in codepen - linking to my style created.

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/3070271j/cm75hdvcm00it01qva4e5dboq',
  center: [10.4515, 51.1657], //Approximate coordinates for the centre of Germany.
  zoom: 4.5 //Appropriate default zoom level for the map.
});

// Add navigation controls - compass and zoom-in and zoom-out buttons
map.addControl(new mapboxgl.NavigationControl(), "top-right");

// createPopup function used to make popup appear when the user clicks on a landmark.
function createPopup(landmark, coords = null) {
  const imageUrl = landmark.properties.image;  // 'image' field from the GeoJSON
  return new mapboxgl.Popup({ offset: [0, -15] })  //Offset defines location of popup relative to the lat/long set.
    .setLngLat(landmark.geometry.coordinates)  //Sets the longitude and latitude the popup will appear
    .setHTML(`
            <h3>${landmark.properties.name || `Unknown ${landmark.properties.historic}`}</h3>
            <p>Landmark Type: ${landmark.properties.historic.replace(/_/g, ' ')}</p>
            ${landmark.properties.opening_hours ? `<p>Opening Times: ${landmark.properties.opening_hours}</p>` : ''}
            ${landmark.properties.website ? `<p>Website: <a href="${landmark.properties.website}" target="_blank" rel="noopener noreferrer">${landmark.properties.website}</a></p>` : ''}
            ${imageUrl ? `<p><img src="${imageUrl}" alt="${landmark.properties.name}" style="max-width: 200px; height: auto;" onerror="this.style.display='none';" /></p>` : ''}
        `) //The content inside the popup. For some lines, JS code is checking whether the data actually exists, and only displaying if it does.
    .addTo(map); //Making the popup visible on the map.
}

// Function identifying landmarks available at clicked location
function showPopup(event) {
  const landmarks = map.queryRenderedFeatures(event.point, {
    layers: categories
  });

  if (!landmarks.length) return;
  createPopup(landmarks[0]);
} //Triggers createPopup function

map.on('click', showPopup); //Triggers showPopup function when user clicks on map

// Defining layer categories
const categories = ['castles', 'churches', 'city-gates', 'historic-houses', 'manors', 'monasteries', 'ruins', 'towers']; 

map.on('load', () => { 
  categories.forEach(category => {
    if (map.getLayer(category)) {
      map.setLayoutProperty(category, 'visibility', 'visible');
    }
  }); //Makes sure all the layers are visible once the map is loaded

  // Dropdown interaction code here
  const filterDropdown = document.getElementById('filter');
  if (filterDropdown) {
    filterDropdown.addEventListener('change', (event) => {
      const selectedCategory = event.target.value;

  // Making sure all categories are displayed when "all-landmarks" is selected
      if (selectedCategory === "all-landmarks") {
        categories.forEach(category => {
          if (map.getLayer(category)) {
            map.setLayoutProperty(category, 'visibility', 'visible');
          }
        });
        return;
      }        

      // Making sure all layers not relevant to the dropdown selection are hidden
      categories.forEach(category => {
        if (map.getLayer(category)) {
          map.setLayoutProperty(category, 'visibility', 'none');
        }
      });

      // Making sure the relevant layer to dropdown selection is showing.
      if (selectedCategory && map.getLayer(selectedCategory)) {
        map.setLayoutProperty(selectedCategory, 'visibility', 'visible');
      }
    });
  } 
});

// Random landmark button interaction
let currentPopup = null; //Used to track later which popup is open - first set it to null

function visitRandomLandmark() { //Triggers selection of a random landmark when button is clicked
  let allLandmarks = []; //Array to hold all landmarks

  categories.forEach(layer => {
    let landmarks = map.querySourceFeatures('composite', { sourceLayer: layer });
    allLandmarks = allLandmarks.concat(landmarks);
  }); //Puts landmarks from each layer into the new landmarks variable

  //Mathematical operation for actually selecting the random landmark - generating a random number between 0 and 1, incorporating the total number of landmarks in the array to pick a random landmark.
  let randomLandmark = allLandmarks[Math.floor(Math.random() * allLandmarks.length)];

  let coords = randomLandmark.geometry.coordinates; //Extracting coordinates of the chosen random landmark

  // map.flyTo allows the interface to move and zoom to the chosen landmark 
  map.flyTo({
    center: coords,
    zoom: 10,
  });

  // Close previous popup if it exists when button is clicked again
 if (currentPopup) {
    currentPopup.remove();
  } 

  currentPopup = createPopup(randomLandmark, coords);
} //Creates new popup for randomly chosen landmark

document.getElementById("random-landmark").addEventListener("click", visitRandomLandmark); //Triggers the visitRandomLandmark function when button is clicked.

//Search Box Geocoder code here
const searchBox = new MapboxGeocoder({ //Ini
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search for places in Germany", // Placeholder text for the search bar
  proximity: {
    longitude: 51.1657,
    latitude: 10.4515
  } // Coordinates of Germany centre - so results near this point are prioritised
});
map.addControl(searchBox, "top-right");
