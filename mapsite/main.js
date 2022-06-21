/* Wetterstationen Tirol Beispiel */

let innsbruck = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11
};

// WMTS Hintergrundlayer von https://lawinen.report (CC BY avalanche.report) als Startlayer
let startLayer = L.tileLayer("https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
    attribution: '&copy; <a href="https://lawinen.report">CC BY avalanche.report</a>'
})

// Overlays Objekt für die thematischen Layer
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    humidity: L.featureGroup(),
    snowheight: L.featureGroup(),
    wind: L.featureGroup(),
};

// Karte initialisieren
let map = L.map("map", {
    center: [innsbruck.lat, innsbruck.lng],
    zoom: innsbruck.zoom,
    layers: [
        startLayer
    ],
});

// Layer control mit WMTS Hintergründen und Overlays
let layerControl = L.control.layers({
    "Relief avalanche.report": startLayer,
    "Esri World Imagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Relative Feuchtigkeit": overlays.humidity,
    "Schneehöhe": overlays.snowheight,
    "Wind": overlays.wind
}).addTo(map);

// Layer control ausklappen
layerControl.expand();

// Maßstab control
L.control.scale({
    imperial: false
}).addTo(map);

// Fullscreen control
L.control.fullscreen().addTo(map);

//Diesen Layer beim Laden anzeigen
overlays.temperature.addTo(map);

//Farben nach Wert und Schwellen ermitteln 
let getColor = function (value, ramp) {
    console.log(value, ramp)
    for (let rule of ramp) {
        console.log(rule)
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
    }
};

// Wetterstationen mit Icons und Popups implementieren
let drawStations = function (geojson) {

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //console.log(geoJsonPoint.properties.name);
            let popup = `
            <strong>${geoJsonPoint.properties.name}</strong><br> (${geoJsonPoint.geometry.coordinates[2]} m ü. NN)
        
             `;

            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/wifi.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })

            }).bindPopup(popup);
        }

    }).addTo(overlays.stations);
}

//Temperaturen einladen 
let drawTemperature = function (geojson) {

    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.LT > -50 && geoJsonPoint.properties.LT < 50) {
                return true;
            }

        },

        pointToLayer: function (geoJsonPoint, latlng) {
            //console.log(geoJsonPoint.properties.name);
            let popup = `
            <strong>${geoJsonPoint.properties.name}</strong><br> (${geoJsonPoint.geometry.coordinates[2]} m ü. NN)
        
             `;

            let color = getColor(
                geoJsonPoint.properties.LT,
                COLORS.temperature
            );
            // L.marker(latlng).addTo(map);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${geoJsonPoint.properties.LT.toFixed(1)}°C</span>`
                })

            }).bindPopup(popup);
        }


    }).addTo(overlays.temperature);
}

//Schneehöhe 
let drawSnowheight = function (geojson) {

    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.HS > 0 && geoJsonPoint.properties.LT < 1000) {
                return true;
            }

        },

        pointToLayer: function (geoJsonPoint, latlng) {
            //console.log(geoJsonPoint.properties.name);
            let popup = `
            <strong>${geoJsonPoint.properties.name}</strong><br> (${geoJsonPoint.geometry.coordinates[2]})
        
             `;

            let color = getColor(
                geoJsonPoint.properties.HS,
                COLORS.snow_height
            );
            // L.marker(latlng).addTo(map);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${geoJsonPoint.properties.HS.toFixed(1)}cm</span>`
                })

            }).bindPopup(popup);
        }


    }).addTo(overlays.snowheight);
}

//Windgeschwindigkeit
let drawWind = function (geojson) {

    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.WG > 0 && geoJsonPoint.properties.WG < 300 && geoJsonPoint.properties.WR >= 0 && geoJsonPoint.properties.WR <= 360) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            //console.log(geoJsonPoint.properties.name);
            let popup = `
            <strong>${geoJsonPoint.properties.name}</strong><br> (${geoJsonPoint.geometry.coordinates[2]} m ü. NN)
        
             `;
            let color = getColor(
                geoJsonPoint.properties.WG,
                COLORS.wind
            );
            //L.marker(latlng).addTo(map);
            let deg = geoJsonPoint.properties.WR;
            //console.log(deg);

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}; transform: rotate(${deg}deg)"><i class="fa-solid fa-circle-arrow-up"></i>${geoJsonPoint.properties.WG.toFixed(1)}km/h</span>`
                })

            }).bindPopup(popup);
        }

    }).addTo(overlays.wind);
}



//relative Luftfeuchtigkeit
let drawHumidity = function (geojson) {

    L.geoJSON(geojson, {
        filter: function (geoJsonPoint) {
            if (geoJsonPoint.properties.RH > 0 && geoJsonPoint.properties.RH < 101) {
                return true;
            }
        },
        pointToLayer: function (geoJsonPoint, latlng) {
            //console.log(geoJsonPoint.properties.name);
            let popup = `
            <strong>${geoJsonPoint.properties.name}</strong><br> (${geoJsonPoint.geometry.coordinates[2]} m ü. NN)
        
             `;
            let color = getColor(
                geoJsonPoint.properties.RH,
                COLORS.humidity
            );
            //L.marker(latlng).addTo(map);
            let deg = geoJsonPoint.properties.RH;
            //console.log(deg);

            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}">${geoJsonPoint.properties.RH.toFixed(1)}%</span>`
                })

            }).bindPopup(popup);
        }

    }).addTo(overlays.humidity);
}

// Rainviewer
L.control.rainviewer({
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
}).addTo(map);

// Wetterstationen
async function loadData(url) {
    let response = await fetch(url);
    let geojson = await response.json();

    drawStations(geojson);
    drawTemperature(geojson);
    drawSnowheight(geojson);
    drawWind(geojson);
    drawHumidity(geojson);

}

loadData("https://static.avalanche.report/weather_stations/stations.geojson");