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
    mintemp: 0,
    maxtemp: 0,
    windspeed: 0,
    weathericon: "",
    humidity: 0,
    weatherDescription: "",
    newCovidCases: 0,
    activeCovidCases: 0,
    covidRecoveries: 0,
    covidDeaths: 0,
    USDexchange: 0,
    EURexchange: 0,
    newsTitle1: "",
    newsTitle2: "",
    newsTitle3: "",
    newsTitle4: "",
    newsLink1: "",
    newsLink2: "",
    newsLink3: "",
    newsLink4: "",
    newsImage1: "",
    newsImage2: "",
    newsImage3: "",
    newsImage4: "",
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
let capitalMarker;
let regionMarkerLayer;
let earthquakeMarkerLayer;
let wikiMarkerLayer;
let mapOptions;

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

// Get country code and use to gather country info
const getCountryCode = (lat, lng) => {
    callApi("getCountryCode", lat, lng, useCountryCode);
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

// Go to location and populate the marker with the sunrise, plus clock
const zoomToPlace = (data) => {

    clickLocationLat = data.data.lat;
    clickLocationLng = data.data.lng;

    const sunrise = data.sunrise;
    timeoffset = data.timeoffset;
    //const sunriseString = getSunrise(sunrise);
    setCurrentTime(timeoffset);

    /* let landmarkMarker = L.ExtraMarkers.icon({
        icon: "fa-compress-alt",
        markerColor: "purple",
        shape: "penta",
        prefix: "fa",
    })

    capitalMarker = L.marker([clickLocationLat, clickLocationLng], {icon: landmarkMarker}).addTo(map).bindPopup(
        `The capital city of ${country.countryName} is ${country.capital}. Its population is ${region.population.toLocaleString("en-US")}. ${sunriseString}`
    );

    callApi("getEarthquakes", country.geonameId, "", displayEarthquakes);
    callApi("getWiki", country.north, country.south, displayWiki, country.east, country.west);
    callApi("getCountryRegions", country.geonameId, "", displayRegions);*/
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

// Remove previous polygon/features and get new data
const getData = () => {
    if (geoJsonFeature.type !== "loading") {
        resetMap()
    }

    callApi("getCountryInfo", "en", country.iso2, getBasicData);
    callApi("getPolygon", country.iso2, "", displayPolygon);
    callApi("getWeather", country.capital, "metric", getWeatherData);
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

    callApi("getMoreCountryInfo", country.iso2, country.currency, saveMoreBasicData);

    // Either zoom to capital or user's location/place clicked
    let countryCapitalMinusSpaces = country.capital.split(" ").join("_");

    callApi("getCapitalCoords", countryCapitalMinusSpaces, country.iso2, zoomToPlace);
};

// Get the extra top level and call the display
const saveMoreBasicData = (data) => {
    country.officialName = data.officialName;
    country.demonym = data.demonym;
    country.currencyName = data.currencies.name;
    country.currencySymbol = data.currencies.symbol;
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
    //displayTopLevel()
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
    let weather = (screenCheck.matches) ? `https://openweathermap.org/img/wn/${country.weathericon}@2x.png` : `https://openweathermap.org/img/wn/${country.weathericon}.png`;
    $("#item-A").html(`The Weather in ${country.capital}, ${country.countryName}`);
    $("#item-B").html(`Today: ${country.weatherDescription}`);
    $("#item-2").html(`<img src="${weather}" alt="Weather icon">`);
    $("#item-C").html("Max Temperature");
    $("#item-3").html(`${country.maxtemp}&#176;C`);
    $("#item-D").html("Min Temperature");
    $("#item-4").html(`${country.mintemp}&#176;C`);
    $("#item-E").html("Wind Speed");
    $("#item-5").html(`${country.windspeed} mph`);
    $("#item-F").html("Humidity");
    $("#item-6").html(`${country.humidity}%`);
    $("#item-G").html("");
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
    map.removeLayer(polyGonLayer);//,
    //wikiMarkerLayer.clearLayers(),
    //regionMarkerLayer.clearLayers(),
    //earthquakeMarkerLayer.clearLayers(),
    //capitalMarker.remove(),
    //wikiMarkers.remove(),
    //earthquakeMarkers.remove(),
    //regionMarkers.remove()
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
