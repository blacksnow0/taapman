const body = document.querySelector("body");
body.style.backgroundImage = "url('assets/background2.jpeg')";
const apiKey = "91c48464a38d4ea38b1181735251002";
const btn = document.querySelector("#input-search-btn"); // Button
const input = document.querySelector("#input-search"); // Input field
const fiveDays = document.querySelector("#five-days-forecast");
const todaysHighlight = document.querySelector("#todays-highlight");

const dropDown = document.querySelector("#drop-down");
const searchHistory = document.querySelector("#search-history");

// Function to save search in local storage
function saveSearch(location) {
  let searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!searches.includes(location)) {
    if (searches.length >= 5) searches.pop(); // Remove the oldest search
    searches.unshift(location); // Add new search to the top
    localStorage.setItem("searchHistory", JSON.stringify(searches));
  }
}

// Function to load searches into dropdown
function loadSearchHistory() {
  if (!searchHistory) return; // Prevent error if searchHistory is missing
  searchHistory.innerHTML = ""; // Clear previous list

  const searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searches.forEach((search) => {
    const li = document.createElement("li");
    li.className = "p-2 hover:bg-gray-200 cursor-pointer";
    li.textContent = search;
    li.addEventListener("click", () => {
      fetchData(search);
      searchHistory.classList.add("hidden"); // Close dropdown after selection
    });
    searchHistory.appendChild(li);
  });

  searchHistory.classList.remove("hidden"); // Show dropdown
}

// Toggle dropdown on click
dropDown.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent dropdown from closing immediately
  if (searchHistory.classList.contains("hidden")) {
    loadSearchHistory();
  } else {
    searchHistory.classList.add("hidden");
  }
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (
    !dropDown.contains(event.target) &&
    !searchHistory.contains(event.target)
  ) {
    searchHistory.classList.add("hidden");
  }
});

// Function to fetch weather data
async function fetchData(city) {
  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=yes&alerts=no`
    );

    saveSearch(response.data.location.name);
    updateUI(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Function to update the UI

function updateUI(data) {
  if (!data) return;

  const location = `${data.location.name}, ${data.location.country}`; // City, Country
  const date = new Date(data.location.localtime).toDateString(); // Readable date
  const description = data.current.condition.text; // Weather description
  const rainChance = data.current.precip_mm; // Rain probability (in mm)
  const iconUrl = `https:${data.current.condition.icon}`; // Weather icon

  const forecast = data.forecast.forecastday; // Five Days forecast
  fiveDays.innerHTML = "";
  fiveDays.classList.add(
    "p-4",
    "rounded-lg",
    "shadow-lg",
    "flex",
    "justify-between",
    "overflow-x-auto"
  );

  forecast.map((day) => {
    const maxTemp = day.day.maxtemp_c;
    const minTemp = day.day.mintemp_c;
    const desc = day.day.condition.text;
    const icon = `https:${day.day.condition.icon}`;
    const forecastDay = new Date(day.date).toLocaleDateString("en-US", {
      weekday: "short",
    });

    const fiveDayDiv = document.createElement("div");
    fiveDayDiv.classList.add(
      "bg-blue-200",
      "p-4",
      "rounded-lg",
      "shadow-md",
      "text-center",
      "min-w-[120px]",
      "flex-shrink-0" // Ensures cards are responsive in flexbox
    );

    fiveDayDiv.innerHTML = `
    <p class="text-xs text-blue-900 drop-shadow-lg font-bold">${forecastDay}</p>
    <img src="${icon}" alt="${desc}" class="w-12 h-12 mx-auto my-2"/>
    <p class="text-sm">
        <span class="text-black font-light">${maxTemp}°C</span> | 
        <span class="text-gray-500">${minTemp}°C</span>
    </p>
`;

    fiveDays.appendChild(fiveDayDiv);
  });

  // Update UI
  const current_location = document.querySelector("#current-location");
  current_location.innerHTML = `
    <div class="bg-white p-5 rounded-lg shadow-lg text-center ">
      <h2 class="text-xl font-mono text-blue-900 font-semibold">${location}</h2>
      <p class=" font-mono text-gray-600">${date}</p>
      <img src="${iconUrl}" alt="${description}" class="w-24 h-24 mx-auto">
      <p class="text-lg font-semibold">${description}</p>
      <p class="text-blue-900 font-semibold">Rain Probability: <span class="font-bold">${rainChance}mm </span> </p>
    </div>
  `;

  //update Ui for today's highlight
  const uvIndex = data.current.uv; // UV Index
  const windSpeed = data.current.wind_kph; // Wind speed in km/h
  const humidity = data.current.humidity; // Humidity percentage
  const visibility = data.current.vis_km; // Visibility in km
  const aqi = data.current.air_quality["us-epa-index"]; // Air Quality Index (EPA standard)
  const sunrise = data.forecast.forecastday[0].astro.sunrise; // Sunrise time
  const sunset = data.forecast.forecastday[0].astro.sunset; // Sunset time

  // Add emoji representations
  const uvEmoji = uvIndex > 7 ? "🌞" : uvIndex > 3 ? "⛅" : "🌥️";
  const windEmoji = windSpeed > 30 ? "💨" : "🍃";
  const humidityEmoji = humidity > 70 ? "💧" : "🌫️";
  const visibilityEmoji = visibility < 5 ? "🌁" : "👀";
  const aqiEmoji = aqi > 4 ? "😷" : aqi > 2 ? "😌" : "🌿";
  const sunriseEmoji = "🌅";
  const sunsetEmoji = "🌇";

  // Update the Today's Highlights UI
  todaysHighlight.innerHTML = `
    <div class="bg-gray-200 p-5 rounded-lg shadow-md text-center">
      <p class="text-sm font-semibold text-blue-900 drop-shadow-md">UV Index ${uvEmoji}</p>
      <p class="text-2xl font-bold">${uvIndex}</p>
    </div>
    <div class="bg-gray-200 p-5 rounded-lg shadow-md text-center">
      <p class="text-sm font-semibold text-blue-900 drop-shadow-md">Wind Speed ${windEmoji}</p>
      <p class="text-2xl font-bold">${windSpeed} km/h</p>
    </div>
    <div class="bg-gray-200 p-5 rounded-lg shadow-md text-center">
      <p class="text-sm font-semibold text-blue-900 drop-shadow-md">Humidity ${humidityEmoji}</p>
      <p class="text-2xl font-bold">${humidity}%</p>
    </div>
    <div class="bg-gray-200 p-5 rounded-lg shadow-md text-center">
      <p class="text-sm font-semibold text-blue-900 drop-shadow-md">Visibility ${visibilityEmoji}</p>
      <p class="text-2xl font-bold">${visibility} km</p>
    </div>
    <div class="bg-gray-200 p-5 rounded-lg shadow-md text-center">
      <p class="text-sm font-semibold text-blue-900 drop-shadow-md">Air Quality ${aqiEmoji}</p>
      <p class="text-2xl font-bold">${aqi}</p>
    </div>
    <div class="bg-gray-200 p-5 rounded-lg shadow-md text-center">
      <p class="text-sm font-semibold text-blue-900 drop-shadow-md">Sunrise & Sunset</p>
      <p class="text-lg font-bold">${sunriseEmoji} ${sunrise} | ${sunsetEmoji} ${sunset}</p>
    </div>
  `;
}

// Get user's location and fetch weather data
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const city = `${lat},${lon}`; // Use lat,lon to get the nearest city
        const data = await fetchData(city);
        updateUI(data);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Location access denied. Please enter a city manually.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Fetch weather for user location on page load
window.onload = getUserLocation;

// Fetch weather based on user input when button is clicked
btn.addEventListener("click", async () => {
  const city = input.value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }
  const data = await fetchData(city);
  updateUI(data);
});
