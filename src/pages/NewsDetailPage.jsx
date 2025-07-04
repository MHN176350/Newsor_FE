import { Box, Typography, Card, CardContent, Chip, Button, Stack, Divider, Avatar } from '@mui/joy';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS } from '../graphql/queries';
import { TOGGLE_LIKE } from '../graphql/mutations';
import { formatDate } from '../utils/constants';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();

  const { data, loading, error } = useQuery(GET_NEWS, {
    variables: { slug: slug },
    skip: !slug,
  });

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    onCompleted: () => {
      // Use refetch sparingly to avoid infinite loops
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
    },
  });

  const news = data?.newsArticle;

  const handleLike = () => {
    if (!isAuthenticated || !news) return;
    toggleLike({ variables: { newsId: parseInt(news.id) } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !news) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>Article Not Found</Typography>
        <Button component={Link} to="/news">
          Back to News
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      <Button
        component={Link}
        to="/news"
        variant="outlined"
        size="sm"
        sx={{ mb: 3 }}
      >
        ← Back to News
      </Button>

      {/* Article Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          {news.title}
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar size="sm" />
          <Box>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-primary)' }}>
              {news.author?.firstName} {news.author?.lastName}
            </Typography>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              {formatDate(news.publishedAt)}
            </Typography>
          </Box>
          {news.category && (
            <Chip size="sm" variant="soft">
              {news.category.name}
            </Chip>
          )}
        </Stack>

        {news.tags && news.tags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {news.tags.map((tag) => (
              <Chip 
                key={tag.id} 
                size="sm" 
                variant="outlined"
                component={Link}
                to={`/news?tag=${tag.id}`}
                sx={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'var(--joy-palette-primary-100)',
                    borderColor: 'var(--joy-palette-primary-400)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                #{tag.name}
              </Chip>
            ))}
          </Stack>
        )}
      </Box>

    
      
      {/* Article Content */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              lineHeight: 1.7,
              color: 'var(--joy-palette-text-primary)',
              '& p': { margin: '0 0 1em 0' },
              '& h1, & h2, & h3': { 
                margin: '1.5em 0 0.5em 0', 
                fontWeight: 'bold',
                color: 'var(--joy-palette-text-primary)'
              },
              '& h1': { fontSize: '2em' },
              '& h2': { fontSize: '1.5em' },
              '& h3': { fontSize: '1.2em' },
              '& ul, & ol': { paddingLeft: '2em', margin: '1em 0' },
              '& blockquote': {
                borderLeft: '4px solid var(--joy-palette-primary-500)',
                paddingLeft: '1em',
                margin: '1em 0',
                fontStyle: 'italic',
                color: 'var(--joy-palette-text-secondary)',
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                margin: '1em 0',
                borderRadius: '8px',
                display: 'block',
              },
              '& a': {
                color: 'var(--joy-palette-primary-500)',
                textDecoration: 'underline',
              },
            }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </CardContent>
      </Card>

      {/* Engagement Section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              ❤️ {news.likeCount || 0}
            </Button>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              💬 0 Comments
            </Typography>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              👁️ {news.viewCount || 0} Views
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Comments (0)
          </Typography>

          <Box sx={{ mb: 4, p: 2, backgroundColor: 'var(--joy-palette-background-level1)', borderRadius: 'sm' }}>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Comments feature coming soon! Stay tuned for updates.
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* For now, show a message that comments are not implemented */}
            <Typography level="body2" textAlign="center" sx={{ py: 4, color: 'var(--joy-palette-text-tertiary)' }}>
              Comments feature coming soon!
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
