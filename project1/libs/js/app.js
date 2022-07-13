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
    currentHours: 0,
    currentMinutes: 0,
    amOrPm: "am",
    mintemp: 0,
    maxtemp: 0,
    windspeed: 0,
    weathericon: "",
    humidity: 0,
    visibility: "",
    weatherDescription: "",
    newCovidCases: 0,
    activeCovidCases: 0,
    covidRecoveries: 0,
    covidDeaths: 0,
    USDexchange: 0,
    EURexchange: 0,
    newsTitle: "",
    newsTitle2: "",
    newsTitle3: "",
    newsTitle4: "",
    newsLink: "",
    newsLink2: "",
    newsLink3: "",
    newsLink4: "",
    newsImage: "",
    newsImage2: "",
    newsImage3: "",
    newsImage4: "",
    officialName: "",
    demonym: "",
    currencyName: "",
    currencySymbol: "",
    languages: [],
    worldBankRating: "",
    lifeExpectancy: "",
    north: 0,
    south: 0,
    east: 0,
    west: 0
};

let clickLocationLat = 0;
let clickLocationLng = 0;
let timeoffset = 0;

let polyGonLayer;
let wikiMarkerLayer;
let earthquakeMarkerLayer;
let regionMarkerLayer;
let capitalMarker;
let mapOptions;
let centerOnLat;
let centerOnLong;

let screenCheck = window.matchMedia("(min-width: 480px)");
let geoJsonFeature = {type: "loading"};

const earthquakeMarkers = L.markerClusterGroup();
const wikiMarkers = L.markerClusterGroup();
const regionMarkers = L.markerClusterGroup();

// Run pre-loader
// Preloader script goes <-here->

// Set up Leaflet maps using Jawg Streets
const map = L.map("map", {dragging: !L.Browser.mobile, tap: !L.Browser.mobile}).fitWorld();
const mapDesign = L.tileLayer(
    "https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=TLTmRrpPzKzH8UQJeTh5dVLPG4sr3Pv16d9rCAkXMMQz7z6uBuqTFz1veT2hkv1Z",
    {
        attribution: "&copy; <a href='http://jawg.io' title='Tiles by Jawg Maps' target='_blank'> <b>Jawg</b>Maps</a> &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
        minZoom: 0,
        maxZoom: 22,
        subdomains: "abcd",
        crossOrigin: "",
    }
);

mapDesign.addTo(map);

// On load find the user's location and add a marker
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

// When the user clicks on the map go to clicked location rather than the capital city
map.on("dblclick", function (e) {
    clickLocationLat = e.latlng.lat;
    clickLocationLng = e.latlng.lng;
    initialiseMaps(clickLocationLat, clickLocationLng)
});

// When select is opted for zoom to capital
$("#countrySelect").change(function () {
    country.iso2 = $("#countrySelect option:selected").val();
    getData()
});

// Populate the dropdown list with countries and find iso2 code
const initialiseMaps = (clickLocationLat, clickLocationLng) => {
    getSelectData();
    getCountryCode(clickLocationLat, clickLocationLng);
};

// Remove previous polygon and features
const getData = () => {
    if (geoJsonFeature.type !== "loading") {
        resetMap()
    }

    callApi("getCountryInfo", "en", country.iso2, getBasicData);
    callApi("getPolygon", country.iso2, "", displayPolygon);
};

// Use country code to get name, population, capital, area, currency and flag info
const getCountryCode = (lat, lng) => {
    callApi("getCountryCode", lat, lng, useCountryCode);
};

const useCountryCode = (data) => {
    $("#countrySelect").val(`${data.data}`).change()
};

// Set up buttons to open and close modal and call API if necessary
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

L.easyButton("fa-solid fa-stethoscope", function () {
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

// Set up the select list from countryBorders.geo.json
const getSelectData = () => {
    callApi("getSelectData", "", "", displaySelectData);
};

const displaySelectData = (data) => {
    const results = data.data;
    for (let i = 0; i < results.length; i++) {
        const selectOption = results[i][0];
        const isoOption = results[i][1];
        $("#countrySelect").append(`<option value="${isoOption}">${selectOption}</option>`);
    }
};

// Get country name, population, currency, capital, flag and area
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
    country.population = parseFloat(results.population / 1000000);
    country.countryName = results.countryName;
    country.currency = results.currencyCode;
    country.capital = results.capital;
    country.iso3 = results.isoAlpha3;
    country.area = Math.round(results.areaInSqKm).toLocaleString("en-US");

    $("#titleCountry").html(country.countryName);

    callApi("getMoreCountryInfo", country.iso2, country.currency, saveMoreBasicData);

    // Either zoom to capital or user's location/place clicked
    let countryCapitalMinusSpaces = country.capital.split(" ").join("_");

    callApi("getCapitalCoords", countryCapitalMinusSpaces, "", zoomToPlace);
};

// Get the extra top level and call the display
const saveMoreBasicData = (data) => {
    country.officialName = data.officialName;
    country.demonym = data.demonym;
    country.currencyName = data.currencies.name;
    country.currencySymbol = data.currencies.symmbol;
    country.languages = data.languages;
    country.flag = data.flag;
    $("#flag2").html(`<img src="${country.flag}" alt="Flag of ${country.countryName}">`);
    callApi("getWHOData", country.iso3, "", saveWHOData);
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

// Populate the marker with the sunrise, plus clock, plus go to location
const zoomToPlace = (data) => {

    clickLocationLat = data.data.lat;
    clickLocationLng = data.data.lng;

    const sunrise = data.sunrise;
    timeoffset = data.timeoffset;
    const sunriseString = getSunrise(sunrise);
    setCurrentTime(timeoffset);

    let landmarkMarker = L.ExtraMarkers.icon({
        icon: "fa-compress-alt",
        markerColor: "purple",
        shape: "penta",
        prefix: "fa",
    })

    capitalMarker = L.marker([clickLocationLat, clickLocationLng], {icon: landmarkMarker}).addTo(map).bindPopup(
        `The capital city of ${country.countryName} is ${country.capital}. Its population is ${region.population.toLocaleString("en-US")}. ${sunriseString}`
    );

    callApi("getEarthquakes", country.north, country.south, displayEarthquakes, country.east, country.west);
    callApi("getWiki", country.north, country.south, displayWiki, country.east, country.west);
    callApi("getCountryRegions", country.geonameId, "", displayRegions);
};

// Present the sunrise in the marker
const getSunrise = (sunrise) => {
    const date = new Date(sunrise * 1000);
    const hours = date.getUTCHours().toString().padStart(2, 0);
    const minutes = date.getUTCMinutes().toString().padStart(2, 0);
    const seconds = date.getUTCSeconds().toString().padStart(2, 0);
    return `The sun rose there this morning at ${hours}:${minutes}:${seconds}.`;
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

// Put a polygon or multi-polygon around selected country
const displayPolygon = (data) => {
    if (data.data.length > 1) {
        geoJsonFeature = {
            type: "Feature",
            geometry: {
                type: "MultiPolygon",
                coordinates: data.data,
            },
        };
    } else {
        geoJsonFeature = {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: data.data,
            },
        };
    }

    polyGonLayer = L.geoJson(geoJsonFeature, {
        style: {color: "#43a783", opacity: "0.5", weight: "2"},
    })
    polyGonLayer.addTo(map).bringToBack();
};

// Populate home button and titleCountry + flag
const displayTopLevel = () => {
    $("#item-A").html(country.officialName);
    $("#flag2").attr("src", country.flag);
    $("#item-B").html("Local Time");
    $("#item-2").html(`${country.currentHours}:${country.currentMinutes}${country.amOrPm}`);
    $("#item-C").html("Capital City");
    $("#item-3").html(country.capital);
    $("#item-D").html("Population");
    $("#item-4").html(country.population.toFixed(2) + "m");
    $("#item-E").html("Area");
    $("#item-5").html(`${country.area} km&sup2;`);
    $("#item-F").html("Inhabitants");
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

// Populate weather modal and display it
const getWeatherData = (data) => {
    const results = data.data;
    country.weatherDescription = results.weather[0].description;
    country.maxtemp = Math.round(results.main.temp_max);
    country.mintemp = Math.round(results.main.temp_min);
    country.windspeed = parseFloat(results.wind.speed);
    country.windspeed = (2.23694 * country.windspeed).toFixed(0);
    country.weathericon = results.weather[0].icon;
    country.humidity = results.main.humidity;
    country.visibility = results.visibility;
};

const displayWeather = () => {
    $("#item-A").html(`The Weather in ${country.capital}, ${country.countryName}`);
    let weather = (screenCheck.matches) ? `https://openweathermap.org/img/wn/${country.weathericon}@2x.png` : `https://openweathermap.org/img/wn/${country.weathericon}.png`;
    $("#item-B").html(`Today: ${country.weatherDescription}`);
    $("#item-2").html(`<img src="${weather}" alt="Weather conditions">`);
    $("#item-C").html("Max Temperature");
    $("#item-3").html(`${country.maxtemp}&#176;C`);
    $("#item-D").html("Min Temperature");
    $("#item-4").html(`${country.mintemp}&#176;C`);
    $("#item-E").html("Wind Speed");
    $("#item-5").html(`${country.windspeed} mph`);
    $("#item-F").html("Humidity");
    $("#item-6").html(`${country.humidity}%`);
    $("#item-G").html("Visibility");
    $("#item-7").html(`${country.visibility}`);
};
// Populate virus modal and display it
const getVirusData = (data) => {
    const results = data[0];
    country.newCovidCases = results.cases.new.toLocaleString("en-US");
    country.activeCovidCases = results.cases.active.toLocaleString("en-US");
    country.covidRecoveries = results.cases.recovered.toLocaleString("en-US");
    country.covidDeaths = results.deaths.total.toLocaleString("en-US");
};

const displayVirus = () => {
    $("#item-A").html(`Health in ${country.countryName}`);
    $("#item-B").html("Average Life Expectancy*");
    $("#item-2").html(`${country.lifeExpectancy} years`);
    $("#item-C").html("Recent Number of New Covid Cases");
    $("#item-3").html(country.newCovidCases);
    $("#item-D").html("Current Number of Active Covid Cases");
    $("#item-4").html(country.activeCovidCases);
    $("#item-E").html("Total Number of Covid Recoveries");
    $("#item-5").html(country.covidRecoveries);
    $("#item-F").html("Total Number of Covid-related Deaths");
    $("#item-6").html(country.covidDeaths);
    $("#item-G").html(`<sub>*data provided by the World Health Organisation</sub>`);
};

// Populate money modal and display it
const getMoneyData = (data) => {
    const results = data.data.conversion_rates;
    country.USDexchange = results.USD;
    country.EURexchange = results.EUR;
};

const displayMoney = () => {
    $("#item-A").html(`${country.demonym} Money`);
    $("#item-B").html("Currency");
    $("#item-2").html(`${country.currencyName} (${country.currency})`);
    $("#item-C").html("Symbol");
    $("#item-3").html(country.currencySymbol);
    $("#item-D").html("World Bank Rating");
    $("#item-4").html(country.worldBankRating);
    $("#item-E").html("Exchange Rate with US Dollars ($)");
    $("#item-5").html(country.USDexchange);
    $("#item-F").html("Exchange Rate with Euros (&#8364;)");
    $("#item-6").html(country.EURexchange);
};

// Populate news modal and display it
const getNews = (data) => {
    const results = data.data;
    if (results[0]) {
        country.newsTitle = [0][0];
        country.newsLink = results[0][1];
        country.newsImage = results[0][2];
    }
    if (results[1]) {
        country.newsTitle2 = [1][0];
        country.newsLink2 = results[1][1];
        country.newsImage2 = results[1][2];
    }
    if (results[2]) {
        country.newsTitle3 = [2][0];
        country.newsLink3 = results[2][1];
        country.newsImage3 = results[2][2];
    }
    if (results[3]) {
        country.newsTitle4 = [3][0];
        country.newsLink4 = results[3][1];
        country.newsImage4 = results[3][2];
    }
};

const displayNews = () => {
    $("#item-A").html(`Latest News`);
    $("#item-B").html(`<img class="newsImage" src=${country.newsImage}>`);
    $("#item-2").html(`<a href=${country.newsLink} class="justify" target="_blank">${country.newsTitle}</a>`);
    $("#item-C").html(`<img class="newsImage" src=${country.newsImage2}>`);
    $("#item-3").html(`<a href=${country.newsLink2} class="justify" target="_blank">${country.newsTitle2}</a>`);
    $("#item-D").html(`<img class="newsImage" src=${country.newsImage3}>`);
    $("#item-4").html(`<a href=${country.newsLink3} class="justify" target="_blank">${country.newsTitle3}</a>`);
    $("#item-E").html(`<img class="newsImage" src=${country.newsImage4}>`);
    $("#item-5").html(`<a href=${country.newsLink4} class="justify" target="_blank">${country.newsTitle4}</a>`);
};

// Populate earthquake markers
const displayEarthquakes = (data) => {
    const results = data.data.earthquakes;

    let severity;
    let markerColor;

    results.map((earthquake) => {
        switch (true) {
            case (earthquake.magnitude < 4):
                severity = "Minor";
                markerColor = "green";
            break;
            case (earthquake.magnitude < 6):
                severity = "Moderate";
                markerColor = "yellow";
            break;
            case (earthquake.magnitude < 8):
                severity = "Major";
                markerColor = "orange";
            break;
            case (earthquake.magnitude < 10):
                severity = "Catastrophic";
                markerColor = "red";
            break;
            default:
                severity = "Recorded";
            break;
        }

        let quakeMarker = L.ExtraMarkers.icon({
            icon: "fa-solid fa-star",
            markerColor: markerColor,
            shape: "star",
            prefix: "fa"
        })

        let earthquakeMarker = L.marker([earthquake.lat, earthquake.lng], {icon: quakeMarker}).bindPopup(
            `${severity} earthquake on ${earthquake.datetime}, magnitude ${earthquake.magnitude}`
        );

        earthquakeMarkers.addLayer(earthquakeMarker);
    })

    earthquakeMarkerLayer = earthquakeMarkers.addTo(map).bringToFront();
};

// Populate Wikipedia markers
const displayWiki = (data) => {
    const results = data.data.geonames;
    
    results.map((wikiEntry) => {
        let aWikiMarker = L.ExtraMarkers.icon({
            icon: "fa-info-circle",
            markerColor: "blue",
            shape: "square",
            prefix: "fa"
        })

        let wikiMarker = L.marker([wikiEntry.lat, wikiEntry.lng], {icon: aWikiMarker}).bindPopup(`<strong>${wikiEntry.title}</strong><br>${wikiEntry.summary}<br><a href="https://${wikiEntry.wikipediaUrl}" target="_blank">Wiki Link</a>`);

        wikiMarkers.addLayer(wikiMarker);
    })

    wikiMarkerLayer = wikiMarkers.addTo(map).bringToFront();
};

// Populate region markers
const displayRegions = (data) => {
    const results = data.data;

    results.map((region) => {
        let aRegionMarker = L.ExtraMarkers.icon({
            icon: "fa-map-marked-alt",
            markerColor: "dark-orange",
            shape: "penta",
            prefix: "fa"
        })

        let regionMarker = L.marker([region.lat, region.lng], {icon: aRegionMarker}).bindPopup(`<strong>${region.adminName1}</srtong><br>population: ${region.population.toLocaleString("en-US")}`);

        regionMarkers.addLayer(regionMarker);
    })

    regionMarkerLayer = regionMarkers.addTo(map).bringToFront();

    callApi("getWeather", country.capital, "metric", getWeatherData);
    callApi("getVirus", country.iso2, "", getVirusData);
    callApi("getNews", country.iso2, country.demonym, getNews);
    callApi("getMoney", country.currency, "", getMoneyData);
};

// Reset map
const resetMap = () => {
    map.removeLayer(polyGonLayer),
    wikiMarkerLayer.clearLayers(),
    regionMarkerLayer.clearLayers(),
    earthquakeMarkerLayer.clearLayers(),
    capitalMarker.remove(),
    wikiMarkers.remove(),
    earthquakeMarkers.remove(),
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