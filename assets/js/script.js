const API_KEY = "c400f31fe476e73c1cbfdaf4bfc0bb7d"; // Your OpenWeather API Key

$(document).ready(function () {
    loadSearchHistory();

    // Event listener for search button
    $("#searchBtn").on("click", function () {
        let city = $("#cityInput").val().trim();
        if (city) {
            getCoordinates(city);
        } else {
            alert("Please enter a city name.");
        }
    });

    // Event listener for search history
    $(document).on("click", ".history-item", function () {
        let city = $(this).text();
        getCoordinates(city);
    });

    function getCoordinates(city) {
        let geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

        fetch(geoUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    let lat = data[0].lat;
                    let lon = data[0].lon;
                    getWeather(lat, lon, city);
                    saveToHistory(city);
                } else {
                    alert("City not found. Please try again.");
                }
            })
            .catch(error => console.error("Error fetching coordinates:", error));
    }

    function getWeather(lat, lon, city) {
        let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Debugging: See API response

                // Extract weather details
                let cityName = data.name;
                let temperature = data.main.temp;
                let humidity = data.main.humidity;
                let windSpeed = data.wind.speed;
                let weatherDescription = data.weather[0].description;
                let weatherIcon = data.weather[0].icon;
                let iconUrl = `https://openweathermap.org/img/w/${weatherIcon}.png`;

                // Display data on page
                $("#cityName").text(cityName);
                $("#temperature").text(`${temperature}°C`);
                $("#humidity").text(`${humidity}%`);
                $("#windSpeed").text(`${windSpeed} m/s`);
                $("#weatherIcon").attr("src", iconUrl);
                $("#weatherDescription").text(weatherDescription);
                $("#currentWeather").removeClass("d-none");

                // Fetch and display 5-day forecast
                getForecast(lat, lon);
            })
            .catch(error => console.error("Error fetching weather:", error));
    }

    function getForecast(lat, lon) {
        let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    
        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                $("#forecast").empty();
                let forecastDays = [];
    
                data.list.forEach(forecast => {
                    let forecastDate = new Date(forecast.dt_txt).toLocaleDateString();
    
                    // Only add unique dates (avoiding duplicate days)
                    if (!forecastDays.includes(forecastDate) && forecastDays.length < 5) {
                        forecastDays.push(forecastDate);
                        
                        let temp = forecast.main.temp;
                        let humidity = forecast.main.humidity;
                        let wind = forecast.wind.speed;
                        let icon = forecast.weather[0].icon;
    
                        let forecastCard = `
                            <div class="forecast-card">
                                <p>${forecastDate}</p>
                                <img src="https://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
                                <p>🌡️ ${temp}°C</p>
                                <p>💧 ${humidity}%</p>
                                <p>🌬️ ${wind} m/s</p>
                            </div>
                        `;
    
                        $("#forecast").append(forecastCard);
                    }
                });
            })
            .catch(error => console.error("Error fetching forecast:", error));
    }

    function saveToHistory(city) {
        let history = JSON.parse(localStorage.getItem("history")) || [];
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem("history", JSON.stringify(history));
            loadSearchHistory();
        }
    }

    function loadSearchHistory() {
        let history = JSON.parse(localStorage.getItem("history")) || [];
        $("#historyList").empty();
        history.forEach(city => {
            $("#historyList").append(`<li class="list-group-item history-item">${city}</li>`);
        });
    }
});