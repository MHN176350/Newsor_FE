import { Box, CircularProgress, Typography, Card, CardContent } from '@mui/joy';

export default function LoadingSpinner({
  size = 'md',
  message,
  variant = 'default',
  type = 'default'
}) {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

  if (variant === 'card') {
    return (
      <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
        <CardContent>
          <CircularProgress size={getSize()} />
          {message && (
            <Typography level="body1" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CircularProgress size={getSize()} />
      {message && (
        <Typography level="body1" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
