'use client'

import Head from 'next/head';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, DirectionsRenderer, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 from uuid library
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CirclePlus, Trash } from 'lucide-react';
import SelectTravelMode from '@/components/shared/SelectTravelMode'
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'

const mapContainerStyle = {
    minHeight: '375px',
    width: '70%',
    // maxHeight: '511px'
    maxHeight: '711px'
};

//TODO: add input icons, more map features, zod react-hook-form, and markers and use place multiple values.
//TODO: add readme and urls and descriptions properly , also bonus points.
//TODO: some fixes for handleSubmit on unselected inputs of stops (may not be needed to change)
//TODO: app icon is not showing in deployment and add share route feature

// const center = {
//     lat: -3.745,
//     lng: -38.523,
// };

export default function RouterPage() {
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
    const [travelTime, setTravelTime] = useState(null) // State for travel time
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
        console.log("waypointsArray", waypointsArray)
        const waypointsLocations = waypointsArray === undefined ? [origin, destination] : [origin, ...waypointsArray.map(w => w.location), destination];

        const distanceService = new window.google.maps.DistanceMatrixService();
        let totalDistance = 0;
        let totalDuration = 0;
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
                        const duration = response.rows[0].elements[0].duration.value; // Duration in seconds
                        totalDistance += distance;
                        totalDuration += duration;
                        completedRequests += 1;

                        console.log('hi')

                        if (completedRequests === waypointsLocations.length - 1) {
                            const validDistance = (totalDistance / 1000).toFixed(2) + ' km'
                            setDistance(validDistance);
                            setTravelTime(formatDuration(totalDuration));
                            // alert(calculateDistance)
                            console.log('Total calculated distance:', (totalDistance / 1000).toFixed(2) + ' km');
                            console.log('Total calculated time:', formatDuration(totalDuration));
                        }
                    } else {
                        console.error(`Error fetching distance ${status}`, response);
                    }
                }
            );
        }
    };

    const formatDuration = (duration) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours > 0 ? hours + ' hr ' : ''}${minutes} min`;
    };

    const searchParams = useSearchParams()


    useEffect(() => {

        const origin = decodeURIComponent(searchParams.get('origin'));
        const destination = decodeURIComponent(searchParams.get('destination'));
        const waypoints = decodeURIComponent(searchParams.get('waypoints'));
        const fetchedTravelMode = decodeURIComponent(searchParams.get('travelMode'));
        if(fetchedTravelMode === "WALKING" || fetchedTravelMode === "DRIVING"){
            setTravelMode(fetchedTravelMode)
        }
        // const waypoints = (searchParams.get('waypoints'));
        const waypointsFormatted = waypoints.length === 0 ? [] : decodeURIComponent(waypoints).split('|').map(address => ({
            location: address,
            stopover: true,
        }));

        console.log(origin, destination, waypoints)

        if (!origin || !destination) {
            return; // If origin or destination is not provided in the query params, exit early
        }

        if (!isLoaded) return; // Exit early if Google Maps API is not loaded
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypointsFormatted,
                travelMode: window.google.maps.TravelMode[travelMode]
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    setChangeDistance(true)
                    calculateDistance(origin, waypointsFormatted, destination); // Call distance calculation here
                } else {
                    console.error(`Error fetching directions ${status}`, result);
                }
            }
        );
        setChangeDistance(false)
    }, [searchParams, isLoaded]); // Run the effect whenever searchParams changes


    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps...</div>;
    }

    return (
        <div className='w-full pt-4 flex flex-col gap-20 justify-center bg-slate-200 h-screen items-center'>

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

            {/* distance and eta div */}
            <div className={`${distance === null && "hidden"} w-[70%] max-w-[600px] flex flex-col gap-2 rounded-2xl shadow-md sm:px-0 px-4`}>
                <div className='p-4 flex justify-between items-center rounded-t-2xl bg-white'>
                    <span className='text-[#1E2A32] text-[20px]'><span className='capitalize'>{travelMode.toLowerCase()}</span> Distance</span>
                    <span className={`text-[#0079FF] text-[20px] md:text-[30px] ${blur && "blur-sm"}`}>{distance}</span>
                </div>
                <div className='p-4 flex justify-between items-center bg-white'>
                    <span className='text-[#1E2A32] text-[20px]'>ETA</span>
                    <span className={`text-[#0079FF] text-[20px] md:text-[30px] ${blur && "blur-sm"}`}>{travelTime}</span>
                </div>
                <div className='text-[#1E2A32] p-4'>
                    The {travelMode.toLowerCase()} distance between <strong>{origin?.name}</strong> and <strong>{destination?.name + " "}</strong>
                    via {(stopsAdded ? (waypoints.filter(waypoint => (waypoint.location !== null && waypoint.name === waypoint.location.name)).map((waypoint, index) => (
                        <span key={waypoint.id}>
                            {index > 0 && ', '}
                            <strong>{waypoint.name}</strong>
                        </span>
                    ))) : ("selected place"))}
                    {" "}is <strong className={`${blur && "blur-sm"}`}>{distance}</strong>.
                    The estimated travel time is <strong className={`${blur && "blur-sm"}`}>{travelTime}</strong>.
                </div>
            </div>
        </div>
    );
}
