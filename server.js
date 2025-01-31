import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'

dotenv.config();  // Load .env file

const app = express();
app.use(cors());

// Use environment variable for Google API key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Function to fetch places by type or keyword
const fetchPlacesByType = async (lat, lng, type, keyword = "") => {
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&key=${GOOGLE_API_KEY}`;

    if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
    } else {
        url += `&type=${type}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Filter places with valid photos (not personal/random)
        const filteredResults = data.results.filter(place =>
            place.photos &&
            place.photos.length > 0 &&
            (!place.html_attributions || place.html_attributions.length === 0) // Ignore user-uploaded images
        );

        return filteredResults || [];
    } catch (error) {
        console.error(`Error fetching ${type || keyword}:`, error);
        return [];
    }
};

// API endpoint for fetching places
app.get("/places", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    try {
        // Fetch different place types, including hotels & restaurants
        const [touristAttractions, historicalPlaces, outdoorAttractions, restaurants, hotels, temples, jyotirlingas, Trekkings] = await Promise.all([
            fetchPlacesByType(lat, lng, "tourist_attraction"),
            fetchPlacesByType(lat, lng, "museum"),
            fetchPlacesByType(lat, lng, "park"),
            fetchPlacesByType(lat, lng, "restaurant"),  // Ensures restaurants are fetched
            fetchPlacesByType(lat, lng, "lodging"), // "lodging" covers hotels, resorts, motels
            fetchPlacesByType(lat, lng, "hindu_temple"),
            fetchPlacesByType(lat, lng, "", "Jyotirlinga"),
            fetchPlacesByType(lat, lng, "", "Trekking")
        ]);

        // Combine and remove duplicates
        const uniquePlaces = {};
        [...touristAttractions, ...historicalPlaces, ...outdoorAttractions, ...restaurants, ...hotels, ...temples, ...jyotirlingas, ...Trekkings].forEach(place => {
            uniquePlaces[place.place_id] = place;
        });

        const allPlaces = Object.values(uniquePlaces);
        res.json({ results: allPlaces });
    } catch (error) {
        console.error("Error fetching places:", error);
        res.status(500).json({ error: "Failed to fetch places" });
    }
});

// Start the server
app.listen(5001, () => console.log("Server running on port 5001"));
