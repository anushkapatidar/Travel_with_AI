import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

const GOOGLE_API_KEY = 'AIzaSyBLd_kR2bLVqLLVDrZ-1oBgN5hTqLmRfgM';

const Place = ({ place }) => (
  <Card sx={{ maxWidth: 345, margin: 'auto', mb: 2, boxShadow: 3 }}>
    {place.photos && place.photos.length > 0 ? (
      <CardMedia
        component="img"
        height="200"
        image={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`}
        alt={place.name}
      />
    ) : (
      <Box height={200} display="flex" alignItems="center" justifyContent="center" bgcolor="#f0f0f0">
        <Typography variant="body2" color="text.secondary">No image available</Typography>
      </Box>
    )}
    <CardContent>
      <Typography variant="h6" gutterBottom>{place.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {place.opening_hours?.open_now ? "Open Now" : "Closed"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Rating: {place.rating || "N/A"}
      </Typography>
    </CardContent>
  </Card>
);

export default Place;

  