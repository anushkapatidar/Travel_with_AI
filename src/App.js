import { useState } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { Container, TextField, Typography, Card, CardContent, Grid, Button, Box, List, ListItem, ListItemText, Link } from '@mui/material';
import Place from './Place';

const WEATHER_API_KEY = '6616f991e59cdcf88cda2f2b4d6c73ed';
const GOOGLE_API_KEY = 'AIzaSyBLd_kR2bLVqLLVDrZ-1oBgN5hTqLmRfgM';

export default function TravelApp() {
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');

  // Function to fetch places
  const fetchPlaces = (location) => {
    fetch(`http://localhost:5000/places?lat=${location.lat()}&lng=${location.lng()}`)
      .then((response) => response.json())
      .then((data) => {
        const filteredPlaces = data.results.filter(
          (place) => place.rating > 3 && place.photos && place.photos.length > 0
        );
        setPlaces(filteredPlaces);
      })
      .catch((error) => console.error('Failed to fetch places:', error));
  };

  // Fetch Weather based on city
  const fetchWeather = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Failed to fetch weather', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h3" textAlign="center" gutterBottom>
      Your Travel Buddy
      </Typography>

      {/* City Selection */}
      <Box display="flex" justifyContent="center" my={2}>
        <Autocomplete
          apiKey={GOOGLE_API_KEY}
          onPlaceSelected={(place) => {
            const cityName = place.address_components?.find((c) =>
              c.types.includes('locality')
            )?.long_name;

            if (cityName) {
              setCity(cityName);
              fetchWeather(cityName);
              if (place.geometry) fetchPlaces(place.geometry.location);
            }
          }}
          onChange={(e) => {
            if (e.target.value === '') {
              setCity('');
              setWeather(null);
              setPlaces([]);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search City" variant="outlined" fullWidth />
          )}
        />
      </Box>

      {/* Weather Display */}
      {weather && weather.main && city && (
        <Card sx={{ my: 2 }}>
          <CardContent>
            <Typography variant="h5">Selected City: {city}</Typography>
            <Typography variant="h6">Weather in {weather.name}</Typography>
            <Typography>Temperature: {weather.main.temp}°C</Typography>
            <Typography>Condition: {weather.weather[0].description}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Places Display */}
      {city && (
        <>
          <Typography variant="h4" my={2}>
            Top Attractions
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {places.length > 0 ? (
              places.map((place) => (
                <Grid item xs={12} sm={6} md={4} key={place.place_id}>
                  <Place place={place} />
                </Grid>
              ))
            ) : (
              <Typography>No places found</Typography>
            )}
          </Grid>
        </>
      )}

      {/* Booking Links */}
      {city && (
        <Box sx={{ position: 'absolute', right: 20, top: 20 }}>
          <Typography variant="h6">Book Your Travel</Typography>
          <List>
            {[
              { name: 'Flights', link: 'https://www.makemytrip.com/flights/' },
              { name: 'Trains', link: 'https://www.irctc.co.in/' },
              { name: 'Ola', link: 'https://www.olacabs.com/' },
              { name: 'Uber', link: 'https://www.uber.com/' },
              { name: 'Rapido', link: 'https://www.rapido.bike/' },
              { name: 'Indrive', link: 'https://www.indrive.com/' },
            ].map((item) => (
              <ListItem key={item.name}>
                <Link href={item.link} target="_blank" rel="noopener noreferrer" underline="hover">
                  <ListItemText primary={item.name} />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
}



