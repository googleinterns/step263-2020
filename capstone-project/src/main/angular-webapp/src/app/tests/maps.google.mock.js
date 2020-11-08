var google = {
    maps : {
        OverlayView : function () {
        },
        Marker : function () {
        },
        InfoWindow : function () {
        },
        LatLng: function(lat, lng){
        	return [lat, lng];
        },
        Map: function(htmlElement, googleMapOption){
            return {
                addListener: function(map, evt, callback) { return true; },
                getCenter: function() { return googleMapOption.center }
            }
        },
        MapTypeId: {ROADMAP: true},
        places: {
        	AutocompleteService: function(){

        	},
    		PlacesService: function(obj){
    			return {
    				PlacesServiceStatus: {
	        			OK: true
	        		},
	        		textSearch: function(query){
	        			return [];
	        		},
	        		nearbySearch: function(query){
	        			return [];
	        		}
    			};	
    		}
        }
    }
};