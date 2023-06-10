var searchForm = document.getElementById("search-form");
var searchHistoryDiv = document.getElementById("search-history");
var searchInput = document.getElementById("search-input");
var resultsDiv = document.getElementById("results");
var forecastDiv = document.getElementById("forecast");

var apiKey = "637ce9c6d877f665b3fcca0a330d1fe0";

function displayResults(results) {
    console.log(results);
}

function getWeather(lat, lon) {
    // Set up url
    var weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?appid=" + apiKey;
    weatherUrl += ("&lat=" + lat);
    weatherUrl += ("&lon=" + lon);

    // Fetch, format, and pass along data
    fetch(weatherUrl).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        var results = {};
        results.forecast = [];
        var dayjsFormat = "M/D/YYYY";
        results.name = data.city.name;
        for (var i = 0; i < data.list.length; i++) {
            results.forecast.push({
                date: dayjs.unix(data.list[i].dt).format(dayjsFormat),
                icon: data.list[i].weather[0].icon,
                temp: data.list[i].main.temp,
                humidity: data.list[i].main.humidity,
                windSpeed: data.list[i].wind.speed
            });
        }
        displayResults(results);
    });
}

function getApiData(cityName) {
    // Set up URL
    var geocodingUrl = "http://api.openweathermap.org/geo/1.0/direct?appid=" + apiKey;

    // Get lat and long through geocoding API form input city name
    geocodingUrl += ("&q=" + cityName);
    fetch(geocodingUrl).then(function(response) {
        return response.json();
    }).then(function(data) {
        getWeather(data[0].lat, data[0].lon);
    });
}

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var weatherData = getApiData(searchInput.value);
});