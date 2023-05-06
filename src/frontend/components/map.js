import React from "react";
import { DrawingManager, GoogleMap, LoadScript } from "@react-google-maps/api";
import axios from 'axios';



const GeoMaps = ({childToParent})=> {
    const mapLocation = {
        "lat" : 20.55795984110826,
        "lng" : 77.3951870565343
    }
    const libraries = ['drawing'];
    
    const onPolygonComplete = async(poly) => {
            const ployArray = poly.getPath().getArray();
            let paths = [];
            ployArray.forEach(function(path) {
                paths.push({lat:path.lat(), lng:path.lng()})
            })
            try {
                const response = await axios.post('http://localhost:4000/coordinates', paths);
                console.log(response.data.verified);
                if(response.data.verified) {
                    childToParent(paths);
                }
            } catch (err) {
                // Handle error response
                console.error(err);
                alert(err);
            }
    }   
    const apiKey = "AIzaSyDDzfRktk8Ql7qyxWdGJ1apYIQdc9714QU";
    return (
        <div className = "App">
            <LoadScript
                id="script-loader"
                googleMapsApiKey={apiKey}
                libraries={libraries}
                language="en"
                region="us"
            >

                <GoogleMap 
                    mapContainerClassName="appmap"
                    center={mapLocation}
                    zoom={5}
                >
                    <DrawingManager 
                        editable
                        draggable
                        onPolygonComplete={onPolygonComplete}
                    />
                </GoogleMap>

            </LoadScript>
        </div>
    )
}

export default GeoMaps;