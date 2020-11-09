var google = {
    maps: {
        OverlayView: function () {
        },
        Marker: function () {
        },
        InfoWindow: function () {
        },
        LatLng: function (lat, lng) {
            return [lat, lng];
        },
        Map: function (htmlElement, googleMapOption) {
            let center = googleMapOption.center;
            return {
                addListener: function (map, evt, callback) { return true; },
                getCenter: function () { return center },
                setCenter: function (pos) { center = google.maps.LatLng(pos.lat, pos.lng) },
                setZoom: function() { }
            }
        },
        MapTypeId: { ROADMAP: true },
        places: {
            AutocompleteService: function () {

            },
            PlacesService: function (obj) {
                return {
                    PlacesServiceStatus: {
                        OK: true
                    },
                    textSearch: function (query) {
                        return [];
                    },
                    nearbySearch: function (query) {
                        return [];
                    }
                };
            }
        }
    }
};