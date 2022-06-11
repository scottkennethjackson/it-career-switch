// Elevation script
$('#elevationBtn').click(function() {
    $.ajax({
        url: 'libs/php/getElevation.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#elevationLat').val(),
            lng: $('#elevationLng').val()
        },

        success: function(result) {
            console.log(result);

            if (result.status.name == 'ok') {
                if (result.data === -32768) {
                    $('#elevationData').html('No elevation data. These coordinates are located in the middle of the ocean.');
                } else {
                    $('#elevationData').html(`The elevation at these coordinates is ${result.data} meters.`);
                }
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(`Error`);
        }
    });
});

// Ocean script
$('#oceanBtn').click(function() {
    $.ajax({
        url: 'libs/php/getOcean.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#oceanLat').val(),
            lng: $('#oceanLng').val()
        },

        success: function(result) {
            console.log(result);

            if (result.status.name =='ok') {
                if (result.data.ocean === null) {
                    $('#oceanName').html('There is no ocean or sea at these coordinates.');
                } else {
                    $('#oceanName').html(`These coordinates are located in the middle of the ${result.data.ocean.name}.`);
                }
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error');
        }
    });
});

// Weather script
$('#weatherBtn').click(function() {
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#weatherLat').val(),
            lng: $('#weatherLng').val()
        },

        success: function(result) {
            console.log(result);

            if (result.status.name =='ok') {
                console.log(result.data.weatherObservation);
                if (result.data.weatherObservation == null) {
                    $('#weatherInfo').html('There is no weather station within 100km of these coordinates.');
                } else {
                    $('#weatherInfo').html(`The nearest weather station is ${result.data.weatherObservation.stationName}
                    (${result.data.weatherObservation.countryCode}).
                    The last observation was taken on ${result.data.weatherObservation.datetime}.
                    The temperature is ${result.data.weatherObservation.temperature}\u00B0C,
                    with ${result.data.weatherObservation.humidity}% humidity.
                    Windspeed is ${result.data.weatherObservation.windSpeed}mph,
                    with ${result.data.weatherObservation.clouds}.`);
                }
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Error');
        }
    });
});