/* OGD Wien Beispiel */

let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
}

let startLayer = L.tileLayer.provider("BasemapAT.basemap")
let map = L.map("map", {
    center: [stephansdom.lat, stephansdom.lng],
    zoom: 14,
    layers: [
        startLayer
    ]
})

let layerControl = L.control.layers({
    "BasemapAT Grau": startLayer,
    "Basemap Standard": L.tileLayer.provider("BasemapAT.grau"),
    "Basemap Terrain": L.tileLayer.provider("BasemapAT.terrain"),
    "Basemap Surface": L.tileLayer.provider("BasemapAT.surface"),
    "Basemap Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),
    "Basemap Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "Basemap Orthofoto mit Beschriftung": L.layerGroup([L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ])
}).addTo(map)

/*
let sightLayer = L.featureGroup();

layerControl.addOverlay(sightLayer, "Sehenswürdigkeiten");

let mrk = L.marker([stephansdom.lat, stephansdom.lng]).addTo(sightLayer)

sightLayer.addTo(map);
*/

L.control.scale({
    imperial: false
}).addTo(map);

L.control.fullscreen().addTo(map)

var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.grau"), {
        toggleDisplay: true
    }
).addTo(map);

// async heißt code läuft weiter bis Funktion fertig ist
//Sehenswüdigkeiten
async function loadSites(url) {
    let response = await fetch(url);
    let geojson = await response.json(url)
    //console.log(geojson);

    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Sehenswürdigkeiten");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map)
            let popup = `
            <img src="${geoJsonPoint.properties.THUMBNAIL}"
            alt=""><br>   
            <strong>${geoJsonPoint.properties.NAME}</strong>
            <hr>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            <a href="${geoJsonPoint.properties.WEITERE_INF}
            ">Weblink</a>
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}

//Bishaltestellen
async function loadStops(url) {
    let response = await fetch(url);
    let geojson = await response.json(url)
    //console.log(geojson);

    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Haltestellen Vienna Sightseeing");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map)
            let popup = `
            <strong>${geoJsonPoint.properties.LINE_NAME}</strong><br>
            Station ${geoJsonPoint.properties.STAT_NAME}
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/bus_${geoJsonPoint.properties.LINE_ID}.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}


//Buslinien
async function loadLines(url) {
    let response = await fetch(url);
    let geojson = await response.json(url)
    //console.log(geojson);

    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Liniennetz Vienna Sightseeing");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        style: function(feature){
            //Farben von clrs.cc 
            let colors = {
                "Red Line": "#FF4136",
                "Yellow Line": "#FFDC00",
                "Blue Line": "#0074D9",
                "Green Line": "#2ECC40",
                "Grey Line": "#AAAAAA",
                "Orange Line": "#FF851B"
            };
            return {
                color: `${colors[feature.properties.LINE_NAME]}`,
                //Dicke 
                weight: 4,
                //gestrichelt 
                dashArray: [15,7]
            }
        }
    }).bindPopup(function (layer) {
        return `
            <h4>${layer.feature.properties.LINE_NAME}</h4>
            von: ${layer.feature.properties.FROM_NAME}
            <br>
            nach:${layer.feature.properties.TO_NAME}
        `;
        //return layer.feature.properties.LINE_NAME;
    }).addTo(overlay);
}

//Fußgängerzonen
async function loadZones(url) {
    let response = await fetch(url);
    let geojson = await response.json(url)
    //console.log(geojson);

    let overlay = L.featureGroup();

    layerControl.addOverlay(overlay, "Fußgängerzonen");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        style: function(feature){
            return {
                color: "#F012BE",
                opacity: 0.1,
                //Fläche füllen 
                fill: true,
                //Transparenz von Füllung 
                fillOpacity: 0.1
            }}
        }).bindPopup(function (layer) {
        return `
            <h4>${layer.feature.properties.ADRESSE}</h4>
            Zeitraum: <br>
             ${layer.feature.properties.ZEITRAUM || ""}
            <br>
            ausgenommen: <br> ${layer.feature.properties.AUSN_TEXT || ""}
        `;
        //return layer.feature.properties.LINE_NAME;
    }).addTo(overlay);
}

//Hotels und Unterkünfte
async function loadHotels(url) {
    let response = await fetch(url);
    let geojson = await response.json(url)
    
    //Hotels nach namen sortieren
    geojson.features.sort(function(a ,b) {
        return a.properties.BETRIEB.toLowerCase() > b.properties.BETRIEB
    })

    let overlay = L.markerClusterGroup({
        disableClusteringAtZoom: 17
    });

    layerControl.addOverlay(overlay, "Hotels und Unterkünfte");
    overlay.addTo(map);

    let hotelsLayer = L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map)
            let searchList = document.querySelector("#searchList");
            searchList.innerHTML += `<option value="${geoJsonPoint.properties.BETRIEB}"></option>`;
            //console.log(document.querySelector("#searchList").innerHTML)
            
            let popup = `
               
            <strong>${geoJsonPoint.properties.BETRIEB}</strong>
            <hr>
            Betriebsart: ${geoJsonPoint.properties.BETRIEBSART_TXT}<br>
            Kategorie: ${geoJsonPoint.properties.KATEGORIE_TXT}<br>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            Telefonnummer: ${geoJsonPoint.properties.KONTAKT_TEL}<br>
            <a href="${geoJsonPoint.properties.KONTAKT_EMAIL}
            ">EMAIL-Adresse</a><br>
            <a href="mailto:${geoJsonPoint.properties.WEBLINK1}
            ">Website</a>
            `;
            if (geoJsonPoint.properties.BETRIEBSART == "H") {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/hotel_0star.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                }).bindPopup(popup)
            } else if (geoJsonPoint.properties.BETRIEBSART == "P") {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/lodging_0star.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                }).bindPopup(popup)
            } else if (geoJsonPoint.properties.BETRIEBSART == "A") {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: "icons/apartment-2.png",
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                }).bindPopup(popup)
            };
        }
    }).addTo(overlay);

    let form = document.querySelector("#searchForm");
    
    form.suchen.onclick = function() {
        console.log(form.hotel.value);
        hotelsLayer.eachLayer(function(marker){
            //console.log(marker)
            //console.log(marker.getLatLng())
            //console.log(marker.getPopup())
            //console.log(marker.feature.properties.BETRIEB)

            if (form.hotel.value == marker.feature.properties.BETRIEB) {
                console.log(marker.getLatLng())
                map.setView(marker.getLatLng(), 17)
                marker.openPopup();
            }
        })
    }

}

loadSites("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json")
loadStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json")
loadLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json")
loadZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json")
loadHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json")