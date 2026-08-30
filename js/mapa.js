document.addEventListener("DOMContentLoaded", function () {

    const centerLat = -2.4430;
    const centerLng = -54.7083;

    const map = L.map("map", {
        zoomControl: false,
        attributionControl: true
    }).setView([centerLat, centerLng], 14);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    
});