var searchForm = document.getElementById("search-form");
var searchHistoryDiv = document.getElementById("search-history");
var searchInput = document.getElementById("search-input");
var clearHistoryBtn = document.getElementById("clear-history");

var apiKey = "637ce9c6d877f665b3fcca0a330d1fe0";

function getIconUrl(code) {
    return "https://openweathermap.org/img/wn/" + code + "@2x.png";
}

function displayResults(results) {
    var resultsDiv = document.getElementById("results");
    var forecastDiv = document.getElementById("forecast");

    // Clear previous results
    resultsDiv.innerHTML = "";
    forecastDiv.innerHTML = "";

    // Loop through all weather results and pick out 6 times, each with a unique date    
    var days = [];
    var newestDate = dayjs(results.forecast[0].date);
    days.push(results.forecast[0]);
    for (var i = 0; i < results.forecast.length; i++) {        
        if (dayjs(results.forecast[i].date).isAfter(newestDate, "day")) {
            newestDate = results.forecast[i].date;
            days.push(results.forecast[i + 3]);
        }
    }

    //Display today
    var firstDay = days[0];
    resultsDiv.insertAdjacentHTML("afterbegin",
    "<h2>Today in " + results.name + ", " + firstDay.date + ":</h2>" +
    '<p><img src="' + getIconUrl(firstDay.icon) + '"></img></p>' +
    "<p>Temp: " + firstDay.temp + " &deg;F</p>" +
    "<p>Wind: " + firstDay.windSpeed + " MPH</p>" +
    "<p>Humidity: " + firstDay.humidity + "%</p>");

    //Display forecast
    for (var i = 1; i < days.length; i++) {
        var day = days[i];
        var newDiv = document.createElement("div");
        newDiv.insertAdjacentHTML("afterbegin", 
        "<h3>" + day.date + "</h3>" +
        '<p><img src="' + getIconUrl(day.icon) + '"></img></p>' +
        "<p>Temp: " + day.temp + " &deg;F</p>" +
        "<p>Wind: " + day.windSpeed + " MPH</p>" +
        "<p>Humidity: " + day.humidity + "%</p>");
        forecastDiv.append(newDiv);
    }
}

function getWeather(lat, lon) {
    // Set up url
    var weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=" + apiKey;
    weatherUrl += ("&lat=" + lat);
    weatherUrl += ("&lon=" + lon);

    // Fetch, format, and pass along data
    fetch(weatherUrl).then(function(response) {
        return response.json();
    }).then(function(data) {
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
    // If the user submitted without typing anything in, exit function to avoid HTTP errors
    if (!cityName) {
        return;
    }

    // Set up URL
    var geocodingUrl = "https://api.openweathermap.org/geo/1.0/direct?appid=" + apiKey;

    // Get lat and long through geocoding API form input city name
    geocodingUrl += ("&q=" + cityName);
    fetch(geocodingUrl).then(function(response) {
        return response.json();
    }).then(function(data) {
        getWeather(data[0].lat, data[0].lon);
    });
}

function saveInput(input, savedHistory) {
    // Check if the provided input already exists within the array, exit function if it does
    if (savedHistory.includes(input)) {
        return;
    }

    // It's the user's first time searching for this city, so save it
    savedHistory.push(input);
    localStorage.setItem("searchHistory", JSON.stringify(savedHistory));
}

function loadHistory() {
    var historyObj = localStorage.getItem("searchHistory");
    if (historyObj) {
        return JSON.parse(historyObj);
    }
    return [];
}

function displayHistory(savedHistory) {
    // Clear existing display
    searchHistoryDiv.innerHTML = "";

    // Loop through array and append elements
    for (var i = 0; i < savedHistory.length; i++) {
        var newDiv = document.createElement("div");
        newDiv.insertAdjacentHTML("afterbegin", "<p>" + savedHistory[i] + "</p>");
        searchHistoryDiv.append(newDiv);
    }
}

// When page loads, load and display any previously saved search history
var savedHistory = loadHistory();
displayHistory(savedHistory);

searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var input = searchInput.value;
    getApiData(input);
    saveInput(input, savedHistory);
    displayHistory(savedHistory);

    searchInput.value = "";
});

searchHistoryDiv.addEventListener("click", function(event) {
    getApiData(event.target.textContent);
})

clearHistoryBtn.addEventListener("click", function() {
    savedHistory = [];
    displayHistory(savedHistory);
    localStorage.clear();
})