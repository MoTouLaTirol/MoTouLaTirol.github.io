/* Bike Trail Tirol Beispiel */

let innsbruck = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 9
};

// WMTS Hintergrundlayer der eGrundkarte Tirol definieren
const eGrundkarteTirol = {
    sommer: L.tileLayer(
        "http://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png", {
            attribution: `Datenquelle: <a href="https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol">eGrundkarte Tirol</a>`
        }
    ),
    winter: L.tileLayer(
        "http://wmts.kartetirol.at/gdi_winter/{z}/{x}/{y}.png", {
            attribution: `Datenquelle: <a href="https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol">eGrundkarte Tirol</a>`
        }
    ),
    ortho: L.tileLayer(
        "http://wmts.kartetirol.at/gdi_ortho/{z}/{x}/{y}.png", {
            attribution: `Datenquelle: <a href="https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol">eGrundkarte Tirol</a>`
        }
    ),
    nomenklatur: L.tileLayer(
        "http://wmts.kartetirol.at/gdi_nomenklatur/{z}/{x}/{y}.png", {
            attribution: `Datenquelle: <a href="https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol">eGrundkarte Tirol</a>`,
            pane: "overlayPane",
        }
    )
}

// eGrundkarte Tirol Sommer als Startlayer
let startLayer = eGrundkarteTirol.sommer;

// Overlays Objekt für den GPX Track Layer
let overlays = {
    gpx: L.featureGroup(),
    poi: L.featureGroup()
};

// Karte initialisieren
let map = L.map("map", {
    center: [innsbruck.lat, innsbruck.lng],
    zoom: innsbruck.zoom,
    layers: [
        startLayer
    ],
});


// Layer control mit WMTS Hintergründen und Overlay
let layerControl = L.control.layers({
    "eGrundkarte Tirol Sommer": startLayer,
    "eGrundkarte Tirol Winter": eGrundkarteTirol.winter,
    "eGrundkarte Tirol Orthofoto": eGrundkarteTirol.ortho,
    "eGrundkarte Tirol Orthofoto mit Beschriftung": L.layerGroup([
        eGrundkarteTirol.ortho,
        eGrundkarteTirol.nomenklatur,
    ])
}, {
    "GPX Track der Etappe": overlays.gpx
    //"Points of Interest": overlays.poi
}).addTo(map);

// Maßstab control
L.control.scale({
    imperial: false
}).addTo(map);

// Fullscreen control
L.control.fullscreen().addTo(map);

// GPX Track Layer beim Laden anzeigen
overlays.gpx.addTo(map);
//overlays.poi.addTo(map);

// GPX Track Layer implementieren
let gpxTrack = new L.GPX("../data/viller-moor.gpx", {
    async: true,
    marker_options: {
        startIconUrl: 'icons/start.png', //Hier andere Icons hernehmen weil Start und Ziel am gleichen Punkt 
        shadowUrl: null,
        iconSize: [32, 37],
        iconAnchor: [16, 37]
    },
    polyline_options: {
        color: "black",
        dashArray: [2, 5]
    }
}).addTo(overlays.gpx);

//Verschiedene Marker für Points of interest --> Verschiedene Icons je nach Thema 

gpxTrack.on("loaded", function (evt) {
    let gpxLayer = evt.target;
    map.fitBounds(gpxLayer.getBounds())
    let popup = `<h3>Themenwanderung Lanser Moor</h3>
    <ul>
        <li>Streckenlänge: ${(gpxLayer.get_distance()/1000).toFixed()}km </li>
        <li>tiefster Punkt:  ${gpxLayer.get_elevation_min().toFixed()}m </li>
        <li>höchster Punkt: ${gpxLayer.get_elevation_max().toFixed()}m </li>
        <li>Höhenmeter bergauf: ${gpxLayer.get_elevation_gain().toFixed()}m </li>
        <li>Höhenmeter bergab: ${gpxLayer.get_elevation_loss().toFixed()}m </li>`;
    gpxLayer.bindPopup(popup);
})

let elevationControl = L.control.elevation({
    time: false,
    elevationDiv: "#profile",
    theme: 'bike-tirol',
    height: 200,
}).addTo(map);
gpxTrack.on("addline", function (evt) {
    elevationControl.addData(evt.line);
})

//Points of Interest
//Je nach Type von poi jetzt noch unterschiedliche Marker hinzufügen -> Done!
for (let point of pointsOfInterest) {
    //console.log(etappe);
    if (point.type == "Bushaltestelle") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>
        <p>"Linie:" ${point.linie}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/bus.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Tramhaltestelle") {
        popup = `
            <h3>${point.name}</h3>
            <p>${point.type}<p>
            <p>"Linie: "${point.linie}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/tramway.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Spielplatz") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/playground.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Badesee") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/lake.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Aussichtspunkt") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/panoramicview.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Moor") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/moor.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Information") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/information.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Parkplatz") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/parking.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Restaurant") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/restaurant.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Lebensmittelladen") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/supermarket.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    } else if (point.type == "Hofladen") {
        popup = `
        <h3>${point.name}</h3>
        <p>${point.type}<p>`
        L.marker([point.lat, point.lng], {
            icon: L.icon({
                iconUrl: "icons/farmstand.png",
                iconAnchor: [16, 37],
                popupAnchor: [0, -37]
            })
        }).bindPopup(popup).addTo(map)
    }
}

//Einladen von Moorpolygonen --> Marker hinzufügen für Infos über Moore 
async function loadMoore(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);

    let moore = L.geoJSON(geojson, {
        style: function (feature) {
            return {
                color: "#F012BE"
            }
        }

    }).addTo(map);
}

loadMoore("moordaten.json")