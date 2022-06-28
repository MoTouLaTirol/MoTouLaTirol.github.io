/* Wetterstationen Tirol Beispiel */

//* WMTS Hintergrundkarte
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

let innsbruck = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11
};

let startLayer = eGrundkarteTirol.ortho;


// Overlays Objekt für die thematischen Layer
let overlays = {
    Moore: L.featureGroup(),
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
    "eGrundkarte Tirol Orthofoto": startLayer,
    "eGrundkarte Tirol Winter": eGrundkarteTirol.winter,
    "eGrundkarte Tirol Sommer": eGrundkarteTirol.sommer,
    "eGrundkarte Tirol Orthofoto mit Beschriftung": L.layerGroup([
        eGrundkarteTirol.ortho,
        eGrundkarteTirol.nomenklatur,
    ])
}, {
    "Moore": overlays.Moore,
}).addTo(map);

// Layer control ausklappen
layerControl.expand();

// Maßstab control
L.control.scale({
    imperial: false
}).addTo(map);

// Minimap


// Fullscreen control
L.control.fullscreen().addTo(map);

//Moore beim Laden anzeigen 
overlays.Moore.addTo(map);


//Legende 
let legend = L.control({position: 'bottomright'});
legend.onAdd = getLegend;
legend.addTo(map);

function getLegend () {
  return '<h3>Legende</h3>' +
    '<i style="background:#eff3ff"></i> 0 - 25<br>' +
    '<i style="background:#bdd7e7"></i> 25 - 50<br>' +
    '<i style="background:#6baed6"></i> 50 - 75<br>' +
    '<i style="background:#2171b5"></i> 75 - 100';
}


// Moore in die Karte einfügen

async function loadMoore(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    //console.log(geojson);

    L.geoJSON(geojson, {

        style: function (feature) {
            if (feature.properties.BODENTYP.includes("UM") == true){
                return {
                    color: "#0074D9"
                }
            };
            if (feature.properties.BODENTYP.includes("NM") == true){
                return {
                    color: "#FFDC00"
                }
            };
            if (feature.properties.BODENTYP.includes("HM") == true){
                return {
                    color: "#39CCCC"
                }
            };
            if (feature.properties.BODENTYP.includes("M") == true){
                return {
                    color: "#2ECC40 "
                }
            };
            if (feature.properties.BODENTYP.includes("N") == true){
                return {
                    color: "#001f3f"
                }
            }

    }}).bindPopup(function (layer) {
        //*console.log(layer.feature.properties)
        let prop = layer.feature.properties;
        return `<h3>Ort: ${prop.KG_NAME}</h3>
        <hr>
        <strong>Bodentyp:</strong> ${prop.BODENTYP}
        <br><strong>Zustand:</strong> ${prop.ZUSTAND}
        <br><strong>Wasserstufe:</strong> ${prop.WASSERSTUF}`
    }).addTo(overlays.Moore);
}


loadMoore("moordaten.json")
    



