//this is the older code
import { jawgKey } from "./config.js";


//set up country object with all the info options
const country = {
    iso2:"",
    iso3:"",
    population:0,
    countryName:"",
    currency:"",
    capital:"",
    geonameId:0,
    flag:"",
    area:0,
    currentHours:0,
    currentMinutes:0,
    amOrPm:"am",
    mintemp:0,
    maxtemp:0,
    windspeed:0,
    weathericon:"",
    humidity:0,
    weatherDescription:"",
    confirmedCovidCases:0,
    criticalCovidcases:0,
    totalCovidDeaths:0,
    USDexchange:0,
    EURexchange:0,
    newsTitle:"",
    newsTitle2:"",
    newsTitle3:"",
    newsTitle4:"",
    newsLink:"",
    newsLink2:"",
    newsLink3:"",
    newsLink4:"",
    newsImage:"",
    newsImage2:"",
    newsImage3:"",
    newsImage4:"",
    officialName:"",
    demonym:"",
    currencyName:"",
    currencySymbol:"",
    languages:[],
    worldBankRating:"",
    lifeExpectancy:"",
    north:0,
    south:0,
    east:0,
    west:0
};
    
let polyGonLayer,
wikiMarkerLayer,
earthquakeMarkerLayer,
regionMarkerLayer,
capitalMarker,
youAreHereMarker,
circleMarker,
mapOptions,
centerOnLat,
centerOnLong,
clickLocationLat = 0,
clickLocationLng = 0,
timeoffset = 0,
errorLocation = !1,

screenCheck = window.matchMedia("(min-width: 400px)"),
geoJsonFeature = {type:"loading"};
const earthquakeMarkers = L.markerClusterGroup(),
wikiMarkers = L.markerClusterGroup(),
regionMarkers = L.markerClusterGroup();


//run pre-loader
$(document).ready(function(){
    $(".spinner-wrapper").length&&$(".spinner-wrapper").delay(3e3).fadeOut(3e3, function(){
        $(".spinner-wrapper").remove()
    })
});


//set up Leaflet maps
const map=L.map("map",{dragging:!L.Browser.mobile,tap:!L.Browser.mobile}).fitWorld(),

//using Jawg streets
mapDesign=L.tileLayer(
    "https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token={accessToken}",
    {
        attribution:'<a href="http://jawg.io" title="Tiles by  Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom:0,
        maxZoom:22,
        subdomains:"abcd",
        accessToken:jawgKey,
        crossOrigin:""
    }
);

mapDesign.addTo(map);


//on load find the user's location and add a marker
const onLocationFound=t=>{
    clickLocationLat=t.latlng.lat,
    clickLocationLng=t.latlng.lng,
    initialiseMaps(clickLocationLat, clickLocationLng)
},

//if not allowed location data center on London
onLocationError=t=>{
    initialiseMaps(clickLocationLat=51.50853, clickLocationLng=-.12574)
};

map.on("locationfound",onLocationFound),
map.on("locationerror",onLocationError),

map.locate({setView:"{clickLocationLat, clickLocationLng}",maxZoom:5}),


//when the user clicks the map, go to location rather than capital
map.on("dblclick",function(t){
    clickLocationLat=t.latlng.lat,
    clickLocationLng=t.latlng.lng,
    initialiseMaps(clickLocationLat,clickLocationLng)
}),

//when select is opted for zoom to capital
$("#countrySelect").change(function(){
    country.iso2=$("#countrySelect option:selected").val(),
    getData()
});


const initialiseMaps=(t,e)=>{
    //populate the drop down list with countries
    getSelectData(),
    //find out iso2 code
    getCountryCode(t,e)
},

getData=()=>{
    //remove previous polygon and features
    "loading"!==geoJsonFeature.type&&resetMap(),
    
    callApi("getCountryInfo","en",country.iso2,getBasicData),
    callApi("getPolygon",country.iso2,"",displayPolygon)
},

//once we have cocrdinates we can get the country code
getCountryCode=(t,e)=>{
    callApi("getCountryCode",t,e,useCountryCode)
},
//and use it to get the name, population, capital, area, currency and flag info
useCountryCode=t=>{
    $("#countrySelect").val(`${t.data}`).change()
};

//set up buttons to open and close modal and call API if necessary
$("#closeModal").click(function(){
    $(".modal").modal("hide",function(){})
}),

L.easyButton("far fa-flag",function(){
    resetModal(),
    displayTopLevel(),
    $(".modal").modal("show")},function(){}).addTo(map),
    
L.easyButton("fas fa-rainbow",function(){
    resetModal(),
    displayWeather(),
    $(".modal").modal("show")},function(){}).addTo(map),
    
L.easyButton("fas fa-heartbeat fa",function(){
    resetModal(),
    displayVirus(),
    $(".modal").modal("show")},function(){}).addTo(map),
    
L.easyButton("fas fa-money-bill-alt",function(){
    resetModal(),
    displayMoney(),
    $(".modal").modal("show")},function(){}).addTo(map),
    
L.easyButton("far fa-newspaper",function(){
    resetModal(),
    displayNews(),
    $(".modal").modal("show")},function(){}).addTo(map),
    
L.easyButton("fas fa-search-minus",function(){
    map.setView([centerOnLat,centerOnLong],5)
}).addTo(map);

//set up the select list from the countryBorders.geo.json - returns an array of arrays with name and iso2 of each country
const getSelectData=()=>{
    callApi("getSelectData","","",displaySelectData)
},

displaySelectData=t=>{
    const e=t.data;
    for(let t=0;t<e.length;t++){
        const a=e[t][0],n=e[t][1];$("#countrySelect").append(`<option value="${n}">${a}</option>`)
    }
},


//get countryname, currency, capital, flag, area
getBasicData=t=>{
    const e=t.data[0];
    country.north=e.north,
    country.south=e.south,
    country.east=e.east,
    country.west=e.west,
    country.geonameId=e.geonameId,
    
    centerOnLat=(e.north+e.south)/2,
    centerOnLong=(e.east+e.west)/2,
    
    mapOptions={
        lat:centerOnLat,
        lng:centerOnLong,
        zoom:5
    },
    
    map.fitBounds(polyGonLayer.getBounds()).panTo(mapOptions),
    country.population=parseFloat(e.population/1e6),
    country.countryName=e.countryName,
    country.currency=e.currencyCode,
    country.capital=e.capital,
    country.iso3=e.isoAlpha3,
    
    //beginning of alternate section
    screenCheck.matches?
    
    country.flag=`https://www.countryflags.io/${country.iso2}/shiny/64.png`:
    country.flag=`https://www.countryflags.io/${country.iso2}/shiny/48.png`,
    
    country.area=Math.round(e.areaInSqKm).toLocaleString("en-US"),
    $("#titleCountry").html(country.countryName),$("#flag").attr("src",country.flag),

    callApi("getMoreCountryInfo",country.iso2,country.currency,saveMoreBasicData);
    let a=country.capital.split(" ").join("_");"New_Delhi"===a&&(a="Delhi"),
    //end of alternate section

    callApi("getCapitalCoords",a,"",zoomToPlace)
},


//get the extra top level info and call the display
saveMoreBasicData=t=>{
    country.officialName=t.officialName,
    country.demonym=t.demonym,
    country.currencyName=t.currencies.name,
    country.currencySymbol=t.currencies.symbol,
    country.languages=t.languages,
    callApi("getWhoData",country.iso3,"",saveWhoData)
},

saveWhoData=t=>{
    t.data.dimension[4].code[0].attr.forEach(t=>{
        "WORLD_BANK_INCOME_GROUP"===t.category&&(country.worldBankRating=t.value)
    }),
    
    country.lifeExpectancy=t.data.fact[11].value.display,displayTopLevel()
},


//populate the marker with the sunrise, plus clock, plus go to location
zoomToPlace=t=>{
    clickLocationLat=t.data.lat,
    clickLocationLng=t.data.lng;
    
    const e=t.sunrise;
    timeoffset=t.timeoffset;
    const a=getSunrise(e);setCurrentTime(timeoffset);
    
    let n=L.ExtraMarkers.icon({
        icon:"fa-star-half-alt",
        markerColor:"yellow",
        shape:"star",
        prefix:"fa"
    });
    
    capitalMarker=L.marker([clickLocationLat,clickLocationLng],{icon:n}).addTo(map).bindPopup(
        `The capital of ${country.countryName} is ${country.capital}. <br>${a}`),
    callApi("getEarthquakes",country.north,country.south,displayEarthquakes,country.east,country.west),
    callApi("getWiki",country.north,country.south,displayWiki,country.east,country.west),
    callApi("getCountryRegions",country.geonameId,"",displayRegions)},

//present the sunrise in the marker
getSunrise=t=>{
    const e=new Date(1e3*t);
    return`The sun rose at ${e.getUTCHours().toString().padStart(2,0)}:${e.getUTCMinutes().toString().padStart(2,0)}:${e.getUTCSeconds().toString().padStart(2,0)}`
},

//and change the local time
setCurrentTime=t=>{
    const e=Date.now(),
    a=new Date(e+1e3*t);
    country.currentHours=a.getUTCHours().toString(),
    country.currentMinutes=a.getUTCMinutes().toString().padStart(2,0),
    country.amOrPm=country.currentHours<12?"am":"pm",
    country.currentHours>12&&(country.currentHours=country.currentHours-12)
},


//put a polygon or multi-polygon around selected country
displayPolygon=t=>{
    geoJsonFeature=t.data.length>1?{
        type:"Feature",
        geometry:{
            type:"MultiPolygon",
            coordinates:t.data
        }
    }:{
        type:"Feature",
        geometry:{
            type:"Polygon",
            coordinates:t.data
        }
    },
    
    (polyGonLayer=L.geoJson(geoJsonFeature,{
        style:{color:"#ffe135",opacity:"0.7",weight:"2"}
    }))
    .addTo(map).bringToBack()
},


//populate home button and titleCountry + flag
displayTopLevel=()=>{
    $("#item-A").html(country.officialName),
    $("#flag2").attr("src",country.flag),
    $("#item-B").html("Local time"),
    $("#item-2").html(`${country.currentHours}:${country.currentMinutes}${country.amOrPm}`),
    $("#item-C").html("Capital"),
    $("#item-3").html(country.capital),
    $("#item-D").html("Population"),
    $("#item-4").html(country.population.toFixed(2)+"m"),
    $("#item-E").html("Area"),
    $("#item-5").html(`${country.area} km&sup2;`),
    $("#item-F").html("Inhabitants"),
    $("#item-6").html(country.demonym),
    $("#item-G").html("Languages");
    const t=Object.values(country.languages);
    
    if($("#item-7").html(`${t[0]}`),
    t.length>1)for(let e=1;e<t.length;e++)$("#item-7").append(`<br>${t[e]}`)
},
    
resetModal=()=>{
    $("#item-A").html(""),
    $("#flag2").attr("src",country.flag),
    $("#item-B").html(""),
    $("#item-2").html(""),
    $("#item-C").html(""),
    $("#item-3").html(""),
    $("#item-D").html(""),
    $("#item-4").html(""),
    $("#item-E").html(""),
    $("#item-5").html(""),
    $("#item-F").html(""),
    $("#item-6").html(""),
    $("#item-G").html(""),
    $("#item-7").html("")
},


//populate weather info and display it
getWeatherData=t=>{
    const e=t.data;
    
    country.weatherDescription=e.weather[0].description,
    country.maxtemp=Math.round(e.main.temp_max),
    country.mintemp=Math.round(e.main.temp_min),
    country.windspeed=parseFloat(e.wind.speed),
    country.windspeed=(2.23694*country.windspeed).toFixed(0),
    country.weathericon=e.weather[0].icon,
    country.humidity=e.main.humidity
},

displayWeather=()=>{
    $("#item-A").html(`The Weather in ${country.capital}`);let t=screenCheck.matches?`https://openweathermap.org/img/wn/${country.weathericon}@2x.png`:`https://openweathermap.org/img/wn/${country.weathericon}.png`;
    $("#item-2").html(`<img src="${t}" alt="Weather conditions">`),
    $("#item-C").html("Max"),
    $("#item-3").html(`${country.maxtemp}&#176;C`),
    $("#item-D").html("Min"),
    $("#item-4").html(`${country.mintemp}&#176;C`),
    $("#item-E").html("Wind"),
    $("#item-5").html(`${country.windspeed} mph`),
    $("#item-F").html("Humidity"),
    $("#item-6").html(`${country.humidity}%`),
    $("#item-7").html(country.weatherDescription)},


//populate virus modal and display it
getVirusData=t=>{
    const e=t[0];

    country.confirmedCovidCases=e.confirmed.toLocaleString("en-US"),
    country.criticalCovidcases=e.critical.toLocaleString("en-US"),
    country.totalCovidDeaths=e.deaths.toLocaleString("en-US")
},

displayVirus=()=>{
    $("#item-A").html(`Health in ${country.countryName}`),
    $("#item-B").html("Life expectancy"),
    $("#item-2").html(`${country.lifeExpectancy} years*`),
    $("#item-C").html("Total Covid cases"),
    $("#item-3").html(country.confirmedCovidCases),
    $("#item-D").html("Current critical Covid cases"),
    $("#item-4").html(country.criticalCovidcases),
    $("#item-E").html("Total deaths due to Covid"),
    $("#item-5").html(country.totalCovidDeaths),
    $("#item-F").html("* courtesy of World Health Organization")
},


//populate money modal and display it
getMoneyData=t=>{
    const e=t.data.conversion_rates;

    country.USDexchange=e.USD,
    country.EURexchange=e.EUR
},

displayMoney=()=>{
    $("#item-A").html(`${country.demonym} currency (${country.currency})`),
    $("#item-B").html("Money"),
    $("#item-2").html(country.currencyName),
    $("#item-C").html("Symbol"),
    $("#item-3").html(country.currencySymbol),
    $("#item-D").html("World Bank rating"),
    $("#item-4").html(country.worldBankRating),
    $("#item-E").html("Exchange Rate with US $"),
    $("#item-5").html(country.USDexchange),
    $("#item-F").html("Exchange Rate with Euros &#8364;"),
    $("#item-6").html(country.EURexchange)
},


//populate news modal and display it
getNews=t=>{
    const e=t.data;

    e[0]&&(
        country.newsTitle=e[0][0],
        country.newsLink=e[0][1],
        country.newsImage=e[0][2]
    ),
    e[1]&&(
        country.newsTitle2=e[1][0],
        country.newsImage2=e[1][2],
        country.newsLink2=e[1][1]
    ),
    e[2]&&(
        country.newsTitle3=e[2][0],
        country.newsLink3=e[2][1],
        country.newsImage3=e[2][2]
    ),
    e[4]&&(
        country.newsTitle4=e[3][0],
        country.newsLink4=e[3][1],
        country.newsImage4=e[3][2]
    )
},

displayNews=()=>{
    $("#item-A").html("Latest News"),
    $("#item-B").html(`<img class="newsImage" src=${country.newsImage}>`),
    $("#item-2").html(`<a href=${country.newsLink} target="_blank">${country.newsTitle}</a>`),
    $("#item-C").html(`<img class="newsImage" src=${country.newsImage2}>`),
    $("#item-3").html(`<a href=${country.newsLink2} target="_blank">${country.newsTitle2}</a>`),
    $("#item-D").html(`<img class="newsImage" src=${country.newsImage3}>`),
    $("#item-4").html(`<a href=${country.newsLink3} target="_blank">${country.newsTitle3}</a>`),
    $("#item-E").html(`<img class="newsImage" src=${country.newsImage4}>`),
    $("#item-5").html(`<a href=${country.newsLink4} target="_blank">${country.newsTitle4}</a>`)
},


//populate markers
displayEarthquakes = t => {
    let e,a;t.data.earthquakes.map(t=>{
        switch(!0){
            case t.magnitude<4:e="Minor",a="green";
            break;
            case t.magnitude<6:e="Moderate",a="orange";
            break;
            case t.magnitude<8:e="Major",a="red";
            break;
            case t.magnitude<10:e="Catastrophic",a="black";
            break;
            default:e="Recorded"
        }
        
        let n=L.ExtraMarkers.icon({
            icon:"fa-compress-alt",
            markerColor:a,
            shape:"penta",
            prefix:"fa"
        }),
        o=L.marker([t.lat,t.lng],{icon:n}).bindPopup(`${e} earthquake on ${t.datetime} - magnitude ${t.magnitude}`);
        earthquakeMarkers.addLayer(o)
    }),
    earthquakeMarkerLayer=earthquakeMarkers.addTo(map).bringToFront()
},
    
displayWiki=t=>{
    t.data.geonames.map(t=>{
        let e=L.ExtraMarkers.icon({
            icon:"fa-info-circle",
            markerColor:"cyan",
            shape:"square",
            prefix:"fa"
        }),
        a=L.marker([t.lat,t.lng],{icon:e}).bindPopup(`<strong>${t.title}</strong><br>${t.summary}<br><a href="https://${t.wikipediaUrl}" target="_blank">Wiki Link</a>`);
        wikiMarkers.addLayer(a)
    }),
    wikiMarkerLayer=wikiMarkers.addTo(map).bringToFront()
},

displayRegions=t=>{
    t.data.map(t=>{
        let e=L.ExtraMarkers.icon({
            icon:"fa-map-marked-alt",
            markerColor:"dark-orange",
            shape:"penta",
            prefix:"fa"
        }),
        a=L.marker([t.lat,t.lng],{icon:e}).bindPopup(`<strong>${t.adminName1}</strong><br>population ${t.population.toLocaleString("en-US")}`);regionMarkers.addLayer(a)
    }),
    regionMarkerLayer=regionMarkers.addTo(map).bringToFront(),
    callApi("getWeather",country.capital,"metric",getWeatherData),
    callApi("getVirus",country.iso2,"",getVirusData),
    callApi("getNews",country.iso2,country.demonym,getNews),
    callApi("getMoney",country.currency,"",getMoneyData)
},
            
resetMap = () => {
    map.removeLayer(polyGonLayer),
    wikiMarkerLayer.clearLayers(),
    regionMarkerLayer.clearLayers(),
    earthquakeMarkerLayer.clearLayers(),
    capitalMarker.remove(),
    wikiMarkers.remove(),
    earthquakeMarkers.remove(),
    regionMarkers.remove()
},


//Generic function for API call
callApi = (t,e,a,n,o,r) => {
    const i = `libs/php/${t}.php`;
    $.ajax({
        url: i,
        type: "POST",
        dataType: "json",
        data: {
            param1: e,
            param2: a,
            param3: o,
            param4: r
        },
        success: function (t) {
            n(t)
        },
        error: function (t, e, a) {
            console.log(`${i}: ajax call failed ${e}`)
        }
    })
};