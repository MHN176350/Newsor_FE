import { Box, Typography, Button, Card, CardContent, Stack } from '@mui/joy';
import { Link } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';

export default function NotFoundPage() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2
      }}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          maxWidth: 500, 
          width: '100%',
          textAlign: 'center',
          p: 4
        }}
      >
        <CardContent>
          {/* 404 Graphic */}
          <Typography 
            level="h1" 
            sx={{ 
              fontSize: '8rem', 
              fontWeight: 'bold',
              color: 'var(--joy-palette-primary-500)',
              lineHeight: 1,
              mb: 2
            }}
          >
            404
          </Typography>

          {/* Error Message */}
          <Typography 
            level="h2" 
            sx={{ 
              mb: 2,
              color: 'var(--joy-palette-text-primary)'
            }}
          >
            Page Not Found
          </Typography>

          <Typography 
            level="body1" 
            sx={{ 
              mb: 4,
              color: 'var(--joy-palette-text-secondary)',
              maxWidth: 400,
              mx: 'auto'
            }}
          >
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </Typography>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              component={Link}
              to="/"
              variant="solid"
              size="lg"
              startDecorator={<Home />}
              sx={{ minWidth: 140 }}
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              size="lg"
              startDecorator={<ArrowBack />}
              onClick={() => window.history.back()}
              sx={{ minWidth: 140 }}
            >
              Go Back
            </Button>
          </Stack>

          {/* Additional Help */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid var(--joy-palette-divider)' }}>
            <Typography 
              level="body2" 
              sx={{ 
                color: 'var(--joy-palette-text-tertiary)',
                mb: 2
              }}
            >
              Need help? Try these popular pages:
            </Typography>
            
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                component={Link}
                to="/news"
                variant="plain"
                size="sm"
              >
                Browse News
              </Button>
              
              <Button
                component={Link}
                to="/profile"
                variant="plain"
                size="sm"
              >
                Profile
              </Button>
              
              <Button
                component={Link}
                to="/articles/create"
                variant="plain"
                size="sm"
              >
                Write Article
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
