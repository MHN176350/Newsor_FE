import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Stack, Divider, Avatar } from '@mui/joy';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS, GET_COUNTS_AND_COMMENTS, GET_COMMENTS_WITH_LIKE_STATUS } from '../graphql/queries';
import { CREATE_LIKE_ARTICLE, UPDATE_LIKE_STATUS, CREATE_COMMENT, CREATE_READING_HISTORY, CREATE_LIKE_COMMENT } from '../graphql/mutations';
import { formatDate } from '../utils/constants';
import { useAuth } from '../core/presentation/hooks/useAuth';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [articleId, setArticleId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [likeLoading, setLikeLoading] = useState(null);

  // 1. Fetch article by slug
  const { data: newsData, loading: newsLoading, error: newsError } = useQuery(GET_NEWS, {
    variables: { slug },
    skip: !slug,
    onCompleted: (data) => {
      if (data?.newsArticle?.id) setArticleId(Number(data.newsArticle.id));
    },
  });

  // 2. Fetch counts/comments by articleId
  const { data: countsData, loading: countsLoading } = useQuery(GET_COUNTS_AND_COMMENTS, {
    variables: { articleId },
    skip: !articleId,
  });

  // Fetch comments with like status (1 level replies only)
  const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(GET_COMMENTS_WITH_LIKE_STATUS, {
    variables: { articleId },
    skip: !articleId,
  });

  const [createLikeArticle] = useMutation(CREATE_LIKE_ARTICLE, {
    onCompleted: () => {
      // refetch counts/comments after like
      if (articleId) refetchCounts();
    },
  });
  const [updateLikeStatus] = useMutation(UPDATE_LIKE_STATUS, {
    onCompleted: () => {
      if (articleId) refetchCounts();
    },
  });
  const [createComment] = useMutation(CREATE_COMMENT);
  const [createReadingHistory] = useMutation(CREATE_READING_HISTORY);

  // Mutations for comment likes
  const [createLikeComment] = useMutation(CREATE_LIKE_COMMENT, {
    onCompleted: () => refetchComments(),
  });

  // Use existing UPDATE_LIKE_STATUS for comments too
  const [updateLikeCommentStatus] = useMutation(UPDATE_LIKE_STATUS, {
    onCompleted: () => refetchComments(),
  });

  // Helper to refetch counts/comments
  const { refetch: refetchCounts } = useQuery(GET_COUNTS_AND_COMMENTS, {
    variables: { articleId },
    skip: true,
  });

  const news = newsData?.newsArticle;
  const likesCount = countsData?.articleLikeCount ?? 0;
  const commentsCount = countsData?.articleCommentCount ?? 0;
  const commentsFromQuery = countsData?.articleComments ?? [];
  const readsCount = countsData?.articleReadCount ?? 0;
  const isLiked = countsData?.isArticleLiked ?? false;

  useEffect(() => {
    if (
      news &&
      isAuthenticated &&
      countsData &&
      countsData.hasReadArticle === false
    ) {
      createReadingHistory({ variables: { articleId: Number(news.id) } });
    }
  }, [news, isAuthenticated, createReadingHistory, countsData]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    if (!news) return;
    const articleIdNum = Number(news.id);
    if (isLiked) {
      await updateLikeStatus({ variables: { articleId: articleIdNum } });
    } else {
      await createLikeArticle({ variables: { articleId: articleIdNum } });
    }
  };

  // Fixed handleLikeComment to support like/unlike using existing UPDATE_LIKE_STATUS
  const handleLikeComment = async (commentId, isCurrentlyLiked) => {
    if (!isAuthenticated) return;

    setLikeLoading(commentId);
    try {
      if (isCurrentlyLiked) {
        // Unlike the comment using UPDATE_LIKE_STATUS
        await updateLikeCommentStatus({ variables: { commentId: Number(commentId) } });
      } else {
        // Like the comment
        await createLikeComment({ variables: { commentId: Number(commentId) } });
      }
    } catch (error) {
      console.error('Error handling comment like:', error);
    } finally {
      setLikeLoading(null);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;

    try {
      await createComment({
        variables: {
          articleId,
          content: replyTo ? `@${replyTo.author.username} ${comment}` : comment,
          parentId: replyTo?.id ? parseInt(replyTo.id, 10) : null,
        },
      });
      setComment('');
      setReplyTo(null);
      refetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };
  if (newsLoading || countsLoading || commentsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (newsError || !news) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>Article Not Found</Typography>
        <Button component={Link} to="/news">
          Back to News
        </Button>
      </Box>
    );
  }

  // Build flat comment list with proper ordering
  const buildFlatCommentList = (comments) => {
    const commentMap = {};
    const result = [];

    // Create map of all comments
    comments.forEach(comment => {
      commentMap[comment.id] = comment;
    });

    // Find root comments first
    const rootComments = comments.filter(c => !c.parent);

    // For each root comment, add it and all its descendants in order
    const addCommentAndReplies = (comment, level = 0) => {
      result.push({ ...comment, level });

      // Find direct replies to this comment
      const directReplies = comments.filter(c => {
        const parentId = c.parent?.id || c.parent;
        return parentId === comment.id;
      });

      // Add all replies at the same level (flat structure)
      directReplies.forEach(reply => {
        addCommentAndReplies(reply, level + 1);
      });
    };

    rootComments.forEach(rootComment => {
      addCommentAndReplies(rootComment);
    });

    return result;
  };



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
          <Avatar size="sm" src={news.author?.profile?.avatarUrl} />
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
              variant={isLiked ? 'solid' : 'outlined'}
              size="sm"
              onClick={handleLike}
              disabled={!isAuthenticated}
            >
              ❤️ {likesCount}
            </Button>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              💬 {commentsCount} Comments
            </Typography>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              👁️ {readsCount} Reads
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Comments ({commentsCount})
          </Typography>

          {/* Reply form UI - moved to top for better UX */}
          {isAuthenticated && (
            <form onSubmit={handleCommentSubmit}>
              <Stack spacing={2} sx={{ mb: 4 }}>
                {replyTo && (
                  <Box sx={{ mb: 1, p: 2, bgcolor: 'var(--joy-palette-neutral-50)', borderRadius: 'sm' }}>
                    <Typography level="body3">
                      Replying to <strong>{replyTo.author?.firstName} {replyTo.author?.lastName}</strong>
                      <Button size="sm" variant="plain" onClick={handleCancelReply} sx={{ ml: 2 }}>
                        Cancel
                      </Button>
                    </Typography>
                    <Typography level="body3" sx={{ color: 'var(--joy-palette-text-secondary)', mt: 1 }}>
                      "{replyTo.content}"
                    </Typography>
                  </Box>
                )}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={replyTo ? `Reply to ${replyTo.author?.firstName}...` : 'Write a comment...'}
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
                  {replyTo ? 'Post Reply' : 'Post Comment'}
                </Button>
              </Stack>
            </form>
          )}

          <Stack spacing={3}>
            {/* Use buildFlatCommentList for flat display */}
            {buildFlatCommentList(commentsData?.articleComments || [])
              .map((comment) => (
                <Box key={comment.id}>
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ pl: comment.level > 0 ? 3 : 0 }}>
                    <Avatar size="sm" src={comment.author?.profile?.avatarUrl} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography level="body2" sx={{ fontWeight: 600, color: 'var(--joy-palette-text-primary)' }}>
                          {comment.author?.firstName} {comment.author?.lastName}
                        </Typography>
                        <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                          {formatDate(comment.createdAt)}
                        </Typography>
                        {comment.level > 0 && (
                          <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)', fontStyle: 'italic' }}>
                            (Reply)
                          </Typography>
                        )}
                      </Stack>
                      <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                        {comment.content}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Button
                          size="sm"
                          variant={comment.isCommentLiked ? "solid" : "outlined"}
                          color={comment.isCommentLiked ? "primary" : "neutral"}
                          onClick={() => handleLikeComment(comment.id, comment.isCommentLiked)}
                          disabled={likeLoading === comment.id || !isAuthenticated}
                        >
                          👍 {comment.commentLikeCount || 0}
                        </Button>
                        
                        {isAuthenticated && (
                          <Button size="sm" variant="plain" onClick={() => handleReply(comment)}>
                            Reply
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            {(!commentsData?.articleComments || commentsData.articleComments.length === 0) && (
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