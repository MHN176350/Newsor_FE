import { Box, Typography, Button, Card, CardContent, Stack } from '@mui/joy';
import { Link } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';


export default function NotFoundPage() {
  const { t } = useTranslation();
 
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
            {t('error.notFound.title')}
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
            {t('error.notFound.message')}
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
              {t('error.notFound.goHome')}
            </Button>
            
            <Button
              variant="outlined"
              size="lg"
              startDecorator={<ArrowBack />}
              onClick={() => window.history.back()}
              sx={{ minWidth: 140 }}
            >
              {t('error.notFound.goBack')}
            </Button>
          </Stack>

          {/* Additional Help */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid var(--joy-palette-divider)' }}>
            <Typography 
              level="body2" 
              sx={{ 
                color: 'var(--joy-palette-text-primary)',
                mb: 2,
              }}
            >
              {t('error.notFound.needHelp')}
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
                sx={{
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: 'var(--joy-palette-primary-100)',
                    color: 'var(--joy-palette-primary-700)',
                  },
                }}
              >
                {t('navigation.news')}
              </Button>
              
              <Button
                component={Link}
                to="/profile"
                variant="plain"
                size="sm"
                sx={{
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: 'var(--joy-palette-primary-100)',
                    color: 'var(--joy-palette-primary-700)',
                  },
                }}
              >
                {t('navigation.profile')}
              </Button>
              
              <Button
                component={Link}
                to="/articles/create"
                variant="plain"
                size="sm"
                sx={{
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: 'var(--joy-palette-primary-100)',
                    color: 'var(--joy-palette-primary-700)',
                  },
                }}
              >
                {t('article.create.title')}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
