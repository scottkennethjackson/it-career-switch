// Set up country object with all of the info options
const country = {
    iso2: "",
    iso3: "",
    population: 0,
    countryName: "",
    currency: "",
    capital: "",
    geonameId: 0,
    flag: "",
    area: 0,
    currentHours: "00",
    currentMinutes: "00",
    amOrPm: "am",
    timeOfDay: "",
    temp: 0,
    feelsLike: 0,
    mintemp: 0,
    maxtemp: 0,
    windspeed: 0,
    windforce: 0,
    weathericon: "",
    humidity: 0,
    visibility: "",
    weatherForecast: "",
    newCovidCases: 0,
    totalCovidCases: 0,
    covidRecoveries: 0,
    covidDeaths: 0,
    GBPexchange: 0,
    EURexchange: 0,
    USDexchange: 0,
    newsTitle1: "",
    newsTitle2: "",
    newsTitle3: "",
    newsTitle4: "",
    newsTitle5: "",
    newsTitle6: "",
    newsLink1: "",
    newsLink2: "",
    newsLink3: "",
    newsLink4: "",
    newsLink5: "",
    newsLink6: "",
    newsImage1: "",
    newsImage2: "",
    newsImage3: "",
    newsImage4: "",
    newsImage5: "",
    newsImage6: "",
    officialName: "",
    demonym: "",
    currencyName: "",
    currencySymbol: "",
    languages: [],
    worldBankRating: "",
    lifeExpectancy: 0,
    north: 0,
    south: 0,
    east: 0,
    west: 0
};

let clickLocationLat = 0;
let clickLocationLng = 0;
let centerOnLat = 0;
let centerOnLong = 0;
let timeoffset = 0;

let polyGonLayer;
let earthquakeMarkerLayer;
let wikiMarkerLayer;
let regionMarkerLayer;
let mapOptions;

let screenCheck = window.matchMedia("(min-width: 480px)");
let geoJsonFeature = {type: "loading"};

const earthquakeMarkers = L.markerClusterGroup();
const wikiMarkers = L.markerClusterGroup();
const regionMarkers = L.markerClusterGroup();

// Run pre-loader
$(window).on("load", function () {
    if ($("#spinner-wrapper").length) {
        $("#spinner-wrapper").delay(3000).fadeout(3000, function () {
            $("#spinner-wrapper").remove();
        });
    }
});

// Set up Leaflet maps using Jawg Streets
const map = L.map("map", {dragging: !L.Browser.mobile, tap: !L.Browser.mobile}).fitWorld();
const mapDesign = L.tileLayer(
    "https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=TLTmRrpPzKzH8UQJeTh5dVLPG4sr3Pv16d9rCAkXMMQz7z6uBuqTFz1veT2hkv1Z",
    {
        attribution: "&copy; <a href='http://jawg.io' title='Tiles by Jawg Maps' target='_blank'> <b>Jawg</b>Maps</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        minZoom: 2,
        maxZoom: 20,
        subdomains: "abcd",
        crossOrigin: "",
    }
);

mapDesign.addTo(map);

// Set up easyButton(s) to open and close modal and call API if necessary
$("#closeModal").click(function () {
    $(".modal").modal("hide", function () {});
});

L.easyButton("fa-solid fa-info", function () {
    resetModal()
    displayTopLevel()
    $(".modal").modal("show");}, function () {}).addTo(map);

L.easyButton("fa-solid fa-cloud-sun-rain", function () {
    resetModal()
    displayWeather()
    $(".modal").modal("show");}, function () {}).addTo(map);

L.easyButton("fa-solid fa-book-medical", function () {
    resetModal()
    displayVirus()
    $(".modal").modal("show");}, function () {}).addTo(map);

L.easyButton("fa-solid fa-piggy-bank", function () {
    resetModal()
    displayMoney()
    $(".modal").modal("show");}, function () {}).addTo(map);

L.easyButton("fa-solid fa-newspaper", function () {
    resetModal()
    displayNews()
    $(".modal").modal("show");}, function () {}).addTo(map);

L.easyButton("fa-solid fa-crosshairs", function () {
    map.setView([centerOnLat, centerOnLong], 5)}).addTo(map);

// Set up #countrySelect list using countryBorders.geo.json
const getSelectData = () => {
    callApi("getSelectData", "", "", displaySelectData);
};

const displaySelectData = (data) => {
    const results = data.data;
    for (let i = 0; i < results.length; i++) {
        const selectOption = results[i][0];
        const isoOption = results[i][1];
        $("#countrySelect").append(
        `<option value="${isoOption}">${selectOption}</option>`);
    }
};

// Get country code and use it to gather info
const getCountryCode = (lat, lng) => {
    // callApi("getCountryCode", lat, lng, useCountryCode);
    $.ajax({
        url: "libs/php/getCountryCode.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: lat,
            param2: lng,
        },
    
        success: function (result) {
            useCountryCode(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getCountryCode.php: ajax call failed ${textStatus}`);
        },
    });
};

const useCountryCode = (data) => {
    $("#countrySelect").val(`${data.data}`).change()
};

// Populate the #countrySelect dropdown list and find iso2 code
const initialiseMaps = (clickLocationLat, clickLocationLng) => {
    getSelectData();
    getCountryCode(clickLocationLat, clickLocationLng);
};

// On load find and center on the user's location
const onLocationFound = (e) => {
    clickLocationLat = e.latlng.lat;
    clickLocationLng = e.latlng.lng;
    initialiseMaps(clickLocationLat, clickLocationLng)
};

// If location data unavailable center on London
const onLocationError = (e) => {
    clickLocationLat = 51.50853;
    clickLocationLng = -0.12574;
    initialiseMaps(clickLocationLat, clickLocationLng)
};

map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);

map.locate({setView: `{clickLocationLat, clickLocationLng}`, maxZoom: 5})

// When the user clicks on the map zoom to clicked location
map.on("dblclick", function (e) {
    clickLocationLat = e.latlng.lat;
    clickLocationLng = e.latlng.lng;
    initialiseMaps(clickLocationLat, clickLocationLng)
});

// When select is opted for zoom to chosen country
$("#countrySelect").change(function () {
    country.iso2 = $("#countrySelect option:selected").val();
    getData()
});

// Go to location, get time info and call marker APIs
const zoomToPlace = (data) => {

    clickLocationLat = data.data.lat;
    clickLocationLng = data.data.lng;

    timeoffset = data.timeoffset;
    setCurrentTime(timeoffset);

    // callApi("getEarthquakes", country.north, country.south, displayEarthquakes, country.east, country.west);
    $.ajax({
        url: "libs/php/getEarthquakes.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.north,
            param2: country.south,
            param3: country.east,
            param4: country.west,
        },
    
        success: function (result) {
            displayEarthquakes(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getEarthquakes.php: ajax call failed ${textStatus}`);
        },
    });

    // callApi("getWiki", country.north, country.south, displayWiki, country.east, country.west);
    $.ajax({
        url: "libs/php/getWiki.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.north,
            param2: country.south,
            param3: country.east,
            param4: country.west,
        },
    
        success: function (result) {
            displayWiki(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getWiki.php: ajax call failed ${textStatus}`);
        },
    });

    // callApi("getCountryRegions", country.geonameId, "", displayRegions);
    $.ajax({
        url: "libs/php/getCountryRegions.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.geonameId,
        },
    
        success: function (result) {
            displayRegions(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getCountryRegions.php: ajax call failed ${textStatus}`);
        },
    });
};

// Put a polygon or multi-polygon around selected country
const displayPolygon = (data) => {
    polyGonLayer = L.geoJson(data.data, {
        style: {color: "#43a783", opacity: "0.5", weight: "2"},
    })
    polyGonLayer.addTo(map).bringToBack();
}; 

// Remove previous polygon/features, call APIs and get new data
const getData = () => {
    if (geoJsonFeature.type !== "loading") {
        resetMap()
    }

    // callApi("getCountryInfo", country.iso2, "", getBasicData);
    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.iso2,
        },
    
        success: function (result) {
            getBasicData(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getCountryInfo.php: ajax call failed ${textStatus}`);
        },
    });

    // callApi("getPolygon", country.iso2, "", displayPolygon);
    $.ajax({
        url: "libs/php/getPolygon.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.iso2,
        },
    
        success: function (result) {
            displayPolygon(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getPolygon.php: ajax call failed ${textStatus}`);
        },
    });
};

// Get countryName, population, currency, capital, flag and area info
const getBasicData = (data) => {
    const results = data.data[0];
    country.north = results.north;
    country.south = results.south;
    country.east = results.east;
    country.west = results.west;
    country.geonameId = results.geonameId;

    centerOnLat = (results.north + results.south) / 2;
    centerOnLong = (results.east + results.west) / 2;

    mapOptions = {
        lat: centerOnLat,
        lng: centerOnLong,
        zoom: 5,
    };

    map.fitBounds(polyGonLayer.getBounds()).panTo(mapOptions);
    country.countryName = results.countryName;
    country.population = parseFloat(results.population / 1000000);
    country.currency = results.currencyCode;
    country.capital = results.capital;
    country.iso3 = results.isoAlpha3;
    country.area = Math.round(results.areaInSqKm).toLocaleString("en-US");

    $("#titleCountry").html(country.countryName);

    // callApi("getMoreCountryInfo", country.iso2, country.currency, saveMoreBasicData);
    $.ajax({
        url: "libs/php/getMoreCountryInfo.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.iso2,
            param2: country.currency,
        },
    
        success: function (result) {
            saveMoreBasicData(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getMoreCountryInfo.php: ajax call failed ${textStatus}`);
        },
    });

    // Either zoom to capital or user's location/place clicked
    let countryCapitalMinusSpaces = country.capital.split(" ").join("_");

    // callApi("getCapitalCoords", countryCapitalMinusSpaces, country.iso2, zoomToPlace);
    $.ajax({
        url: "libs/php/getCapitalCoords.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: countryCapitalMinusSpaces,
            param2: country.iso2,
        },
    
        success: function (result) {
            zoomToPlace(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getCapitalCoords.php: ajax call failed ${textStatus}`);
        },
    });
};

// Get the extra top level info and call the display
const saveMoreBasicData = (data) => {
    country.officialName = data.officialName;
    country.demonym = data.demonym;
    country.currencyName = data.currencies.name;
    country.currencySymbol = data.currencies.symbol;
    country.languages = data.languages;
    country.flag = data.flag;
    $("#flag2").html(`<img src="${country.flag}" alt="Flag of ${country.countryName}">`);
    
    //callApi("getWHOData", country.iso3, "", saveWHOData);
    $.ajax({
        url: "libs/php/getWHOData.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.iso3,
        },
    
        success: function (result) {
            saveWHOData(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getWHOData.php: ajax call failed ${textStatus}`);
        },
    });

    // callApi("getWeather", country.capital, country.iso2, getWeatherData);
    $.ajax({
        url: "libs/php/getWeather.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.capital,
            param2: country.iso2,
        },
    
        success: function (result) {
            getWeatherData(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getWeather.php: ajax call failed ${textStatus}`);
        },
    });
    
    // callApi("getVirus", country.iso2, "", getVirusData);
    $.ajax({
        url: "libs/php/getVirus.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.iso2,
        },
    
        success: function (result) {
            getVirusData(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getVirus.php: ajax call failed ${textStatus}`);
        },
    });

    // callApi("getMoney", country.currency, "", getMoneyData);
    $.ajax({
        url: "libs/php/getMoney.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.currency,
        },
    
        success: function (result) {
            getMoneyData(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getMoney.php: ajax call failed ${textStatus}`);
        },
    });

    // callApi("getNews", country.name, country.demonym, getNews);
    $.ajax({
        url: "libs/php/getNews.php",
        type: "POST",
        dataType: "json",
        data: {
            param1: country.name,
            param2: country.demonym,
        },
    
        success: function (result) {
            getNews(result);
        },
    
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getNews.php: ajax call failed ${textStatus}`);
        },
    });
};

const saveWHOData = (data) => {
    data.data.dimension[4].code[0].attr.forEach(element => {
        if (element.category === "WORLD_BANK_INCOME_GROUP") {
            country.worldBankRating = element.value;
        }
    });

    country.lifeExpectancy = data.data.fact[11].value.display;
    displayTopLevel()
};

// Populate info modal and display it
const displayTopLevel = () => {
    $("#flag2").attr("src", country.flag);
    $("#item-A").html(country.officialName);
    $("#item-B").html("Local Time");
    $("#item-2").html(`${country.currentHours}:${country.currentMinutes}${country.amOrPm}`);
    $("#item-C").html("Capital City");
    $("#item-3").html(country.capital);
    $("#item-D").html("Population");
    $("#item-4").html(country.population.toFixed(2) + "m");
    $("#item-E").html("Area");
    $("#item-5").html(`${country.area} km&sup2;`);
    $("#item-F").html("Populace");
    $("#item-6").html(country.demonym);
    $("#item-G").html("Languages Spoken");
    const languages = Object.values(country.languages);
    $("#item-7").html(`${languages[0]}`);
    if (languages.length > 1) {
        for (let i = 1; i < languages.length; i++) {
            $("#item-7").append(`<br>${languages[i]}`);
        }
    }
};

// Update the local time
const setCurrentTime = (timeoffset) => {
    const currentTime = Date.now();
    const time = new Date(currentTime + timeoffset * 1000);
    country.currentHours = time.getUTCHours().toString();
    country.currentMinutes = time.getUTCMinutes().toString().padStart(2, 0);
    country.amOrPm = (country.currentHours < 12) ? "am" : "pm";
    if (country.currentHours > 12) {
        country.currentHours = country.currentHours - 12;
    }
};

// Get weather info
const getWeatherData = (data) => {
    const results = data.data;
    country.temp = Math.round(results.main.temp);
    country.feelsLike = Math.round(results.main.feels_like);
    country.mintemp = Math.round(results.main.temp_min);
    country.maxtemp = Math.round(results.main.temp_max);
    country.windspeed = Math.round(results.wind.speed);
    country.weathericon = results.weather[0].icon;
    country.humidity = results.main.humidity;

    // timeOfDay formula
    if (country.weathericon.includes("n")) {
        country.timeOfDay = "Tonight";
    } else {
        country.timeOfDay = "Today";
    }

    // weatherForecast formula
    if (country.weathericon == "01d") {
        country.weatherForecast = "clear skies and sunny";
    } else if (country.weathericon == "01n") {
        country.weatherForecast = "clear skies";
    } else if (country.weathericon.includes("02")) {
        country.weatherForecast = "a few clouds";
    } else if (country.weathericon.includes("03")) {
        country.weatherForecast = "scattered clouds";
    } else if (country.weathericon.includes("04")) {
        country.weatherForecast = "broken clouds";
    } else if (country.weathericon.includes("09")) {
        country.weatherForecast = "showers";
    } else if (country.weathericon.includes("10")) {
        country.weatherForecast = "rain";
    } else if (country.weathericon.includes("11")) {
        country.weatherForecast = "thunderstorms";
    } else if (country.weathericon.includes("13")) {
        country.weatherForecast = "snow";
    } else {
        country.weatherForecast = "misty";
    }

    // windforce formula
    if (country.windspeed < 4) {
        country.windforce = "calm conditions";
    } else if (country.windspeed < 8) {
        country.windforce = "a light breeze";
    } else if (country.windspeed < 13) {
        country.windforce = "a gentle breeze";
    } else if (country.windspeed < 19) {
        country.windforce = "a moderate breeze";
    } else if (country.windspeed < 25) {
        country.windforce = "a fresh breeze";
    } else if (country.windspeed < 32) {
        country.windforce = "a strong breeze";
    } else if (country.windspeed < 39) {
        country.windforce = "near gale-force winds";
    } else if (country.windspeed < 47) {
        country.windforce = "gale-force winds";
    } else if (country.windspeed < 55) {
        country.windforce = "strong gales";
    } else if (country.windspeed < 64) {
        country.windforce = "whole gale-force winds";
    } else if (country.windspeed < 75) {
        country.windforce = "storm-force winds";
    } else {
        country.windforce = "hurricane-force winds";
    }

    // visibility formula
    if (results.visibility < 1000) {
        country.visibility = "Very Poor";
    } else if (results.visibility < 4000) {
        country.visibility = "Poor";
    } else if (results.visibility < 7000) {
        country.visibility = "Moderate";
    } else {
        country.visibility = "Good";
    }
};

// Populate weather modal and display it
const displayWeather = () => {
    let weather = (screenCheck.matches) ? `https://openweathermap.org/img/wn/${country.weathericon}@2x.png` : `https://openweathermap.org/img/wn/${country.weathericon}.png`;
    $("#item-A").html(`The Weather in ${country.capital}, ${country.countryName}`);
    $("#item-B").html(
        `<div id="weatherForecast"><p>${country.timeOfDay}'s forecast is ${country.weatherForecast} with ${country.windforce}</p><p><strong>High:</strong> ${country.maxtemp}&#176;C | <strong>Low:</strong> ${country.mintemp}&#176;C</p></div>`
    );
    $("#item-2").html(`<img id="skyblue" src="${weather}" alt="Weather icon"></img>`);
    $("#item-C").html("Temperature");
    $("#item-3").html(`${country.temp}&#176;C`);
    $("#item-D").html("Feels Like");
    $("#item-4").html(`${country.feelsLike}&#176;C`);
    $("#item-E").html("Wind Speed");
    $("#item-5").html(`${country.windspeed} mph`);
    $("#item-F").html("Humidity");
    $("#item-6").html(`${country.humidity}%`);
    $("#item-G").html("Visibility");
    $("#item-7").html(`${country.visibility}`);
};

// Get virus info
const getVirusData = (data) => {
    const results = data.stats;
    country.newCovidCases = results.newlyConfirmedCases.toLocaleString("en-US");
    country.totalCovidCases = results.totalConfirmedCases.toLocaleString("en-US");
    country.covidRecoveries = results.totalRecoveredCases.toLocaleString("en-US");
    country.covidDeaths = results.totalDeaths.toLocaleString("en-US");
};

// Populate virus modal and display it
const displayVirus = () => {
    $("#item-A").html(`${country.demonym} Health`);
    $("#item-B").html("Average Life Expectancy*");
    $("#item-2").html(`${country.lifeExpectancy} years`);
    $("#item-C").html("Number of New Covid Cases");
    $("#item-3").html(country.newCovidCases);
    $("#item-D").html("Total Number of Covid Cases");
    $("#item-4").html(country.totalCovidCases);
    $("#item-E").html("Total Number of Covid Recoveries");
    $("#item-5").html(country.covidRecoveries);
    $("#item-F").html("Total Number of Covid-related Deaths");
    $("#item-6").html(country.covidDeaths);
    $("#item-G").html(`<sub><em>*according to the World Health Organisation</em></sub>`);
};

// Get money info
const getMoneyData = (data) => {
    const results = data.data.conversion_rates;
    country.GBPexchange = parseFloat(results.GBP).toFixed(4);
    country.EURexchange = parseFloat(results.EUR).toFixed(4);
    country.USDexchange = parseFloat(results.USD).toFixed(4);
};

// Populate the money modal and display it
const displayMoney = () => {
    $("#item-A").html(`${country.demonym} Money`);
    $("#item-B").html("Currency");
    $("#item-2").html(`${country.currencyName} (${country.currency})`);
    $("#item-C").html("Symbol");
    $("#item-3").html(country.currencySymbol);
    $("#item-D").html("World Bank Rating");
    $("#item-4").html(country.worldBankRating);
    $("#item-E").html("Exchange Rate with British Pounds");
    $("#item-5").html(`${country.currencySymbol}1 = £${country.GBPexchange}`);
    $("#item-F").html("Exchange Rate with Euros");
    $("#item-6").html(`${country.currencySymbol}1 = &#8364;${country.EURexchange}`);
    $("#item-G").html("Exchange Rate with US Dollars");
    $("#item-7").html(`${country.currencySymbol}1 = $${country.USDexchange}`);
};


// Get news info
const getNews = (data) => {
    const results = data.data;
    if (results[0]) {
        country.newsTitle1 = results[0][0];
        country.newsLink1 = results[0][1];
        country.newsImage1 = results[0][2];
    }
    if (results[1]) {
        country.newsTitle2 = results[1][0];
        country.newsLink2 = results[1][1];
        country.newsImage2 = results[1][2];
    }
    if (results[2]) {
        country.newsTitle3 = results[2][0];
        country.newsLink3 = results[2][1];
        country.newsImage3 = results[2][2];
    }
    if (results[3]) {
        country.newsTitle4 = results[3][0];
        country.newsLink4 = results[3][1];
        country.newsImage4 = results[3][2];
    }
    if (results[4]) {
        country.newsTitle5 = results[4][0];
        country.newsLink5 = results[4][1];
        country.newsImage5 = results[4][2];
    }
    if (results[5]) {
        country.newsTitle6 = results[5][0];
        country.newsLink6 = results[5][1];
        country.newsImage6 = results[5][2];
    }
};

// Populate the news modal and display it
const displayNews = () => {
    $("#item-A").html(`Latest News`);
    $("#item-B").html(`<p class="newsTitle">${country.newsTitle1}</p><a class="newsLink" href=${country.newsLink1} target="_blank">Read more...</a>`);
    $("#item-2").html(`<img class="newsImage" src=${country.newsImage1}>`);
    $("#item-C").html(`<p class="newsTitle">${country.newsTitle2}</p><a class="newsLink" href=${country.newsLink2} target="_blank">Read more...</a>`);
    $("#item-3").html(`<img class="newsImage" src=${country.newsImage2}>`);
    $("#item-D").html(`<p class="newsTitle">${country.newsTitle3}</p><a class="newsLink" href=${country.newsLink3} target="_blank">Read more...</a>`);
    $("#item-4").html(`<img class="newsImage" src=${country.newsImage3}>`);
    $("#item-E").html(`<p class="newsTitle">${country.newsTitle4}</p><a class="newsLink" href=${country.newsLink4} target="_blank">Read more...</a>`);
    $("#item-5").html(`<img class="newsImage" src=${country.newsImage4}>`);
    $("#item-F").html(`<p class="newsTitle">${country.newsTitle5}</p><a class="newsLink" href=${country.newsLink5} target="_blank">Read more...</a>`);
    $("#item-6").html(`<img class="newsImage" src=${country.newsImage5}>`);
    $("#item-G").html(`<p class="newsTitle">${country.newsTitle6}</p><a class="newsLink" href=${country.newsLink6} target="_blank">Read more...</a>`);
    $("#item-7").html(`<img class="newsImage" src=${country.newsImage6}>`);
};

// Populate earthquake markers and display them
const displayEarthquakes = (data) => {
    const results = data.data.earthquakes;

    let severity;
    let markerColor;

    results.map((earthquake) => {
        switch (true) {
            case (earthquake.magnitude < 4):
                severity = "Minor earthquake";
                markerColor = "green";
            break;
            case (earthquake.magnitude < 6):
                severity = "Moderate earthquake";
                markerColor = "yellow";
            break;
            case (earthquake.magnitude < 8):
                severity = "Major earthquake";
                markerColor = "orange";
            break;
            case (earthquake.magnitude < 10):
                severity = "Catastrophic earthquake";
                markerColor = "red";
            break;
            default:
                severity = "Earthquake";
                markerColor = "purple"
            break;
        }

        let quakeMarker = L.ExtraMarkers.icon({
            icon: "fa-solid fa-waveform",
            markerColor: markerColor,
            shape: "penta",
            prefix: "fa"
        })

        let earthquakeMarker = L.marker([earthquake.lat, earthquake.lng], {icon: quakeMarker}).bindPopup(
            `${earthquake.severity} recorded on ${earthquake.datetime}, magnitude ${earthquake.magnitude}`
        );

        earthquakeMarkers.addLayer(earthquakeMarker);
    })

    earthquakeMarkerLayer = earthquakeMarkers.addTo(map).bringToFront();
};

// Populate Wikipedia markers and display them
const displayWiki = (data) => {
    const results = data.data.geonames;
    
    results.map((wikiEntry) => {
        let aWikiMarker = L.ExtraMarkers.icon({
            icon: "fa-solid fa-info-circle",
            markerColor: "blue",
            shape: "circle",
            prefix: "fa"
        })

        let wikiMarker = L.marker([wikiEntry.lat, wikiEntry.lng], {icon: aWikiMarker}).bindPopup(
            `<div id="wikiHeader"><p id="wikiTitle">${wikiEntry.title}</p></div><div id="wikiBody"><img id="wikiThumbnail" src=${wikiEntry.thumbnailImg}><p id="wikiEntry">${wikiEntry.summary}</p><a id="wikiLink" href="https://${wikiEntry.wikipediaUrl}" target="_blank">Read More...</a></div>`
        );

        wikiMarkers.addLayer(wikiMarker);
    })

    wikiMarkerLayer = wikiMarkers.addTo(map).bringToFront();
};

// Populate regional population markers and display them
const displayRegions = (data) => {
    const results = data.data;

    results.map((region) => {
        let aRegionMarker = L.ExtraMarkers.icon({
            icon: "fa-solid fa-users",
            markerColor: "orange-dark",
            shape: "square",
            prefix: "fa"
        })

        let regionMarker = L.marker([region.lat, region.lng], {icon: aRegionMarker}).bindPopup(`<p id="population">The population of <strong>${region.adminName1}</strong> is approximately ${region.population.toLocaleString("en-US")} people.</p>`);

        regionMarkers.addLayer(regionMarker);
    })

    regionMarkerLayer = regionMarkers.addTo(map).bringToFront();
};

// Reset modal
const resetModal = () => {
    $("#item-A").html("");
    $("#flag2").attr("src", country.flag);
    $("#item-B").html("");
    $("#item-2").html("");
    $("#item-C").html("");
    $("#item-3").html("");
    $("#item-D").html("");
    $("#item-4").html("");
    $("#item-E").html("");
    $("#item-5").html("");
    $("#item-F").html("");
    $("#item-6").html("");
    $("#item-G").html("");
    $("#item-7").html("");
};

// Reset map
const resetMap = () => {
    map.removeLayer(polyGonLayer),
    earthquakeMarkerLayer.clearLayers(),
    wikiMarkerLayer.clearLayers(),
    regionMarkerLayer.clearLayers(),
    earthquakeMarkers.remove(),
    wikiMarkers.remove(),
    regionMarkers.remove()
};

// General function for API call
const callApi = (phpToCall, parameter1, parameter2, callbackFun, parameter3, parameter4) => {
    const apiUrl = `libs/php/${phpToCall}.php`;
    $.ajax({
        url: apiUrl,
        type: "POST",
        dataType: "json",
        data: {
            param1: parameter1,
            param2: parameter2,
            param3: parameter3,
            param4: parameter4,
        },

        success: function (result) {
            callbackFun(result);
        },

        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`${apiUrl}: ajax call failed ${textStatus}`);
        },
    });
};
