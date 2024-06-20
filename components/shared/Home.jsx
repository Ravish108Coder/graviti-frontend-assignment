'use client'

import Head from 'next/head';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer, Autocomplete, useJsApiLoader, DistanceMatrixService } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 from uuid library
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { CirclePlus, Trash } from 'lucide-react';
import SelectTravelMode from '@/components/shared/SelectTravelMode'

const mapContainerStyle = {
    minHeight: '375px',
    width: '100%',
    maxHeight: '511px'
};

//TODO: add input icons, more map features, zod react-hook-form, and markers and use place multiple values.
//TODO: add readme and urls and descriptions properly , also bonus points.
//TODO: some fixes for handleSubmit on unselected inputs of stops (may not be needed to change)

// const center = {
//     lat: -3.745,
//     lng: -38.523,
// };

export default function Home() {
    const defaultCenter = {
        lat: 28.6139,  // Latitude of New Delhi (fallback)
        lng: 77.2090   // Longitude of New Delhi (fallback)
      };
    const [center, setCenter] = useState(defaultCenter);

    // Function to fetch current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting current location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    // Call getCurrentLocation when component mounts to get current location
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const [libraries] = useState(['places']);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [changeDistance, setChangeDistance] = useState(false)

    const [originName, setOriginName] = useState('');
    const [destinationName, setDestinationName] = useState('');
    const [waypoints, setWaypoints] = useState([{ id: uuidv4(), location: null, stopover: true }]); // Initialize with a single waypoint containing a UUID
    const [directions, setDirections] = useState(null);
    const [map, setMap] = useState(null);
    const [distance, setDistance] = useState(null)
    const [stopsAdded, setStopsAdded] = useState(false)
    const [blur, setBlur] = useState(false)

    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const waypointRefs = useRef({});

    const [travelMode, setTravelMode] = useState('DRIVING')

    const handleLoad = useCallback(map => {
        setMap(map);
    }, []);

    const calculateDistance = (origin, waypointsArray, destination) => {
        const waypointsLocations = [origin, ...waypointsArray.map(w => w.location), destination];

        const distanceService = new window.google.maps.DistanceMatrixService();
        let totalDistance = 0;
        let completedRequests = 0;

        for (let i = 0; i < waypointsLocations.length - 1; i++) {
            distanceService.getDistanceMatrix(
                {
                    origins: [waypointsLocations[i]],
                    destinations: [waypointsLocations[i + 1]],
                    travelMode: window.google.maps.TravelMode[travelMode],
                },
                (response, status) => {
                    if (status === 'OK') {
                        const distance = response.rows[0].elements[0].distance.value;
                        totalDistance += distance;
                        completedRequests += 1;

                        if (completedRequests === waypointsLocations.length - 1) {
                            setDistance((totalDistance / 1000).toFixed(2) + ' km');
                            if (window.innerWidth < 768) {
                                window.scrollTo({
                                    top: document.body.scrollHeight,
                                    behavior: 'smooth', // This makes the scroll smooth
                                });
                            }
                            console.log('Total calculated distance:', (totalDistance / 1000).toFixed(2) + ' km');
                        }
                    } else {
                        console.error(`Error fetching distance ${status}`, response);
                    }
                }
            );
        }
    };

    // useEffect(() => {
    //     setBlur(true)
    // }, [originName, destinationName, waypoints.length])




    const handlePlaceChanged = (ref, setter, nameSetter) => {
        if (ref.current) {
            // console.log(ref.current.getPlace())
            const place = ref.current.getPlace();
            if (place && place.formatted_address) {
                // console.log("Selected place:", place.formatted_address);
                setter(place);
                // setter(place.formatted_address);
                nameSetter(place.name)
                setBlur(true)
            } else {
                console.log("No place selected or invalid input");
                setter(''); // Clear input if no valid place is selected
            }
        }
    };

    const handleWaypointChange = (id) => {
        const ref = waypointRefs.current[id];
        if (ref.getPlace().formatted_address.length > 0) {
            // console.log(ref)
            const place = ref.getPlace();
            if (place && place.formatted_address) {
                const updatedWaypoints = waypoints.map(waypoint =>
                    // waypoint.id === id ? { ...waypoint, location: place.formatted_address, name: place.name } : waypoint
                    waypoint.id === id ? { ...waypoint, location: place, name: place.name } : waypoint
                );
                setWaypoints(updatedWaypoints);
                setBlur(true)
            } else {
                console.log(`Place or formatted address for waypoint ${id} is invalid`);
            }
        } else {
            console.log(`Autocomplete ref for waypoint ${id} is invalid`);
        }
    };

    const handleAddWaypoint = () => {
        const flag = waypoints.find(item=>item.location===null || item.name==='')
        // if(waypoints[waypoints.length-1].location===null){
        if(flag!==undefined){
            alert('Fill the empty stop slot to add more stops if not filled.\nOnly selected inputs are valid, if there are unselected inputs.')
            return;
        } 
        const newWaypoint = { id: uuidv4(), location: null, name: '', stopover: true };
        setWaypoints([...waypoints, newWaypoint]);
    };

    const handleSubmit = () => {
        if (!origin || !destination) {
            console.error("Origin and Destination must be selected.");
            alert("Origin and Destination must be selected.");
            return;
        }
        if(origin.name !== originName || destination.name !== destinationName){
            console.error("Inputs must be selected not manually typed");
            alert("Origin and Destination must be selected not manually typed");
            return;
        }
        console.log(waypoints)
        waypoints.forEach(item=>console.log(item.location?.formatted_address, item.location?.name))
        const waypointsList = waypoints.filter(waypoint => (waypoint.location !== null && waypoint.name === waypoint.location.name)) || [];
        console.log(waypointsList)
        const waypointsFormatted = waypointsList.map(waypoint => ({
            location: waypoint.location.formatted_address,
            stopover: waypoint.stopover,
        }));

        if (waypointsFormatted.length > 0) {
            setStopsAdded(true)
        }

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: origin.formatted_address,
                destination: destination.formatted_address,
                waypoints: waypointsFormatted,
                travelMode: window.google.maps.TravelMode[travelMode]
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    setChangeDistance(true)
                    calculateDistance(origin.formatted_address, waypointsFormatted, destination.formatted_address); // Call distance calculation here
                } else {
                    console.error(`Error fetching directions ${status}`, result);
                }
            }
        );
        setChangeDistance(false)
        setBlur(false);
    };

    const handlDeleteWaypoint = (id) => {
        const newWaypoints = waypoints.filter(item => item.id !== id);
        setWaypoints(newWaypoints);
        setBlur(true)
    }

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps...</div>;
    }

    return (
        <div className='w-full pt-4'>
            <Head>
                <title>Route Planner</title>
            </Head>

            <div className='text-[#1B31A8] text-center'>Let&apos;s calculate <strong>distance</strong> from Google maps</div>

            <div className='w-full flex flex-col-reverse md:flex-row py-4 px-[2%] sm:px-[4%] lg:px-[10%] gap-[3%] sm:gap-[5%] lg:gap-[10%] h-full min-h-[520px]'>

                {/* widthout map */}
                <div className='w-full flex flex-col justify-between h-full gap-8'>

                    {/* input fields */}
                    <div className='py-4 flex flex-col justify-normal items-center md:justify-between md:flex-row gap-3'>

                        {/* inputs */}
                        <div className='w-full sm:px-0 px-4'>
                            <Label htmlFor="origin">Origin</Label>
                            <Autocomplete onLoad={ref => originRef.current = ref} onPlaceChanged={() => handlePlaceChanged(originRef, setOrigin, setOriginName)}>
                                <Input type="text" id='origin' className='md:max-w-[250px] lg:max-w-[320px] mt-1 mb-4' placeholder="Origin" value={originName || ''} onChange={(e) => setOriginName(e.target.value)} />
                            </Autocomplete>

                            {waypoints.map(waypoint => (
                                <div key={waypoint.id}>
                                    <Label htmlFor={waypoint.id}>Stop</Label>
                                    <Autocomplete
                                        onLoad={ref => waypointRefs.current[waypoint.id] = ref}
                                        onPlaceChanged={() => handleWaypointChange(waypoint.id)}
                                    >
                                        <Input
                                            id={waypoint.id}
                                            type="text"
                                            placeholder={`Enter Stop`}
                                            value={waypoint.name || ''}
                                            className='md:max-w-[250px] lg:max-w-[320px] mt-1 mb-2'
                                            onChange={(e) => {
                                                const updatedWaypoints = [...waypoints];
                                                updatedWaypoints.find(wp => wp.id === waypoint.id).name = e.target.value;
                                                setWaypoints(updatedWaypoints);
                                            }}
                                        />

                                    </Autocomplete>
                                    {
                                        waypoints.length>1 && (
                                            <p onClick={()=>handlDeleteWaypoint(waypoint.id)} className='inline-flex items-center gap-2 cursor-pointer text-sm hover:underline'><Trash size={"16px"}/> Delete</p>
                                        )
                                    }
                                </div>
                            ))}
                            <div className='flex justify-end md:max-w-[250px] lg:max-w-[320px] gap-1 items-center cursor-pointer' onClick={handleAddWaypoint}><CirclePlus size={"18px"} />Add Stop</div>

                            <Label htmlFor="destination">Destination</Label>
                            <Autocomplete onLoad={ref => destinationRef.current = ref} onPlaceChanged={() => handlePlaceChanged(destinationRef, setDestination, setDestinationName)}>
                                <Input type="text" id='destination' className='md:max-w-[250px] lg:max-w-[320px] mt-1 mb-4' placeholder="Destination" value={destinationName || ''} onChange={(e) => setDestinationName(e.target.value)} />
                            </Autocomplete>

                            <SelectTravelMode travelMode={travelMode} setTravelMode={setTravelMode} />
                        </div>

                        {/* calculate btn */}
                        <Button className={`mt-4 md:mt-0 w-[40%] md:w-1/4 bg-[#1B31A8] rounded-2xl hover:bg-[#1b30a8d4]`} onClick={handleSubmit}>Calculate</Button>
                    </div>

                    {/* distance div */}
                    <div className={`${distance === null && "hidden"} w-full flex flex-col gap-2 rounded-2xl shadow-md sm:px-0 px-4`}>
                        <div className='p-4 flex justify-between items-center rounded-t-2xl bg-white'>
                            <span className='text-[#1E2A32] text-[20px]'>Distance</span>
                            <span className={`text-[#0079FF] text-[30px] ${blur && "blur-sm"}`}>{distance}</span>
                        </div>
                        <div className='text-[#1E2A32] p-4'>
                            The distance between <strong>{origin?.name}</strong> and <strong>{destination?.name + " "}</strong>
                            via {changeDistance && (stopsAdded ? (waypoints.filter(waypoint => (waypoint.location !== null && waypoint.name === waypoint.location.name)).map((waypoint, index) => (
                                <span key={waypoint.id}>
                                    {index > 0 && ', '}
                                    <strong>{waypoint.name}</strong>
                                </span>
                            ))) : ("selected place"))}
                            {" "}is <strong className={`${blur && "blur-sm"}`}>{distance}</strong>.
                        </div>
                    </div>

                </div>

                {/* google map */}
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={10}
                    onLoad={handleLoad}
                >
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                        />
                    )}
                </GoogleMap>
            </div>
        </div>
    );
}
