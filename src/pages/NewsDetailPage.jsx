import { Box, Typography, Card, CardContent, Chip, Button, Stack, Divider, Avatar } from '@mui/joy';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS } from '../graphql/queries';
import { TOGGLE_LIKE, CREATE_COMMENT } from '../graphql/mutations';
import { formatDate } from '../utils/constants';
import { useAuth } from '../core/presentation/hooks/useAuth';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');

  const { data, loading, error } = useQuery(GET_NEWS, {
    variables: { slug: slug },
    skip: !slug,
  });

  const [toggleLike] = useMutation(TOGGLE_LIKE);
  const [createComment] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_NEWS, variables: { slug: slug } }],
  });

  const news = data?.newsArticle;

  const handleLike = () => {
    if (!isAuthenticated) return;
    toggleLike({ variables: { newsId: news.id } });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;
    
    createComment({
      variables: {
        newsId: news.id,
        content: comment,
      },
    });
    setComment('');
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
              <Chip key={tag.id} size="sm" variant="outlined">
                #{tag.name}
              </Chip>
            ))}
          </Stack>
        )}
      </Box>

      {/* Featured Image */}
      {news.featuredImage && (
        <Box sx={{ mb: 4 }}>
          <Box
            component="img"
            src={news.featuredImage}
            alt={news.title}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 'lg',
            }}
          />
        </Box>
      )}

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
              variant={news.isLikedByUser ? 'solid' : 'outlined'}
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              ❤️ {news.likesCount}
            </Button>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              💬 {news.commentsCount} Comments
            </Typography>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              👁️ {news.readCount} Reads
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Comments ({news.commentsCount})
          </Typography>

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit}>
              <Stack spacing={2} sx={{ mb: 4 }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--joy-palette-divider)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
                <Button type="submit" size="sm" sx={{ alignSelf: 'flex-start' }}>
                  Post Comment
                </Button>
              </Stack>
            </form>
          ) : (
            <Box sx={{ mb: 4, p: 2, backgroundColor: 'var(--joy-palette-background-level1)', borderRadius: 'sm' }}>
              <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                <Link to="/login" style={{ color: 'var(--joy-palette-primary-700)' }}>
                  Sign in
                </Link>{' '}
                to leave a comment
              </Typography>
            </Box>
          )}

          <Stack spacing={3}>
            {news.comments?.map((comment) => (
              <Box key={comment.id}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar size="sm" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography level="body2" sx={{ fontWeight: 600, color: 'var(--joy-palette-text-primary)' }}>
                        {comment.author?.firstName} {comment.author?.lastName}
                      </Typography>
                      <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}

            {(!news.comments || news.comments.length === 0) && (
              <Typography level="body2" textAlign="center" sx={{ py: 4, color: 'var(--joy-palette-text-tertiary)' }}>
                No comments yet. Be the first to comment!
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
