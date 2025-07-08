import { Alert, Button, Box, Typography, Card, CardContent } from '@mui/joy';
import { Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function ErrorDisplay({
  error,
  title = 'An error occurred',
  message,
  showRefresh = false,
  onRefresh,
  color = 'danger',
  size = 'md',
  variant = 'default'
}) {
  const { t } = useTranslation();
  const errorMessage = error?.message || message || t('common.error');

  if (variant === 'card') {
    return (
      <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2, color: 'var(--joy-palette-danger-500)' }}>
            {title}
          </Typography>
          <Typography level="body1" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
            {errorMessage}
          </Typography>
          {showRefresh && onRefresh && (
            <Button
              variant="outlined"
              color={color}
              startDecorator={<Refresh />}
              onClick={onRefresh}
            >
              {t('common.tryAgain')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert
      color={color}
      variant="outlined"
      sx={{ mb: 3 }}
      endDecorator={
        showRefresh && onRefresh ? (
          <Button
            variant="outlined"
            color={color}
            size="sm"
            startDecorator={<Refresh />}
            onClick={onRefresh}
          >
            {t('common.tryAgain')}
          </Button>
        ) : null
      }
    >
      <Box>
        <Typography level="title-sm" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography level="body-sm">
          {errorMessage}
        </Typography>
      </Box>
    </Alert>
  );
}
