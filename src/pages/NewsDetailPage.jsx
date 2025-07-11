import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Stack, Divider, Avatar, Select, Option } from '@mui/joy';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NEWS, GET_COUNTS_AND_COMMENTS, GET_LATEST_COMMENTS, GET_TOP_LIKED_COMMENTS } from '../graphql/queries';
import { CREATE_LIKE_ARTICLE, UPDATE_LIKE_STATUS, CREATE_COMMENT, CREATE_READING_HISTORY, CREATE_LIKE_COMMENT } from '../graphql/mutations';
import { formatDate } from '../utils/constants';
import { useAuth } from '../core/presentation/hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [articleId, setArticleId] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [likeLoading, setLikeLoading] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [sortBy, setSortBy] = useState('top');

  // States for managing replies display
  const [visibleReplies, setVisibleReplies] = useState({});
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyText, setReplyText] = useState('');

  const REPLIES_PER_PAGE = 5;

  // 1. Fetch article by slug
  const { data: newsData, loading: newsLoading, error: newsError } = useQuery(GET_NEWS, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data?.newsArticle?.id) setArticleId(Number(data.newsArticle.id));
    },
  });
  
  // 2. Fetch counts/comments by articleId
  const { data: countsData, loading: countsLoading, refetch: refetchCounts } = useQuery(GET_COUNTS_AND_COMMENTS, {
    variables: { articleId },
    skip: !articleId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
  });

  // Fetch comments with like status (1 level replies only)
  const { data: topCommentsData, loading: topLoading, refetch: refetchTopComments } = useQuery(GET_TOP_LIKED_COMMENTS, {
    variables: { articleId, limit: 50, offset: 0 },
    skip: !articleId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
  });

  const { data: latestCommentsData, loading: latestLoading, refetch: refetchLatestComments } = useQuery(GET_LATEST_COMMENTS, {
    variables: { articleId, limit: 50, offset: 0 },
    skip: !articleId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
  });

  const commentsData = sortBy === 'top' ? topCommentsData : latestCommentsData;
  const commentsLoading = sortBy === 'top' ? topLoading : latestLoading;

  // Helper function to refetch comments based on current sort
  const refetchComments = () => {
    if (sortBy === 'top') {
      refetchTopComments();
    } else {
      refetchLatestComments();
    }
    // Also refetch counts to update comment count
    refetchCounts();
  };

  const [createLikeArticle] = useMutation(CREATE_LIKE_ARTICLE, {
    onCompleted: () => {
      if (articleId) refetchCounts();
    },
  });

  const [updateLikeStatus] = useMutation(UPDATE_LIKE_STATUS, {
    onCompleted: () => {
      if (articleId) refetchCounts();
    },
  });

  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      refetchComments();
    },
  });

  const [createReadingHistory] = useMutation(CREATE_READING_HISTORY, {
    onCompleted: () => {
      refetchCounts(); // refetch lại số đọc và trạng thái hasReadArticle
    }
  });
  // Mutations for comment likes
  const [createLikeComment] = useMutation(CREATE_LIKE_COMMENT, {
    onCompleted: () => refetchComments(),
  });

  // Use existing UPDATE_LIKE_STATUS for comments too
  const [updateLikeCommentStatus] = useMutation(UPDATE_LIKE_STATUS, {
    onCompleted: () => refetchComments(),
  });

  const news = newsData?.newsArticle;
  const likesCountFromQuery = countsData?.articleLikeCount ?? 0;
  const commentsCount = countsData?.articleCommentCount ?? 0;
  const commentsFromQuery = countsData?.articleComments ?? [];
  const readsCount = countsData?.articleReadCount ?? 0;
  const isLikedFromQuery = countsData?.isArticleLiked ?? false;

  // Initialize states from query data
  useEffect(() => {
    if (countsData) {
      setLikesCount(likesCountFromQuery);
      setIsLiked(isLikedFromQuery);
    }
  }, [countsData, likesCountFromQuery, isLikedFromQuery]);

  // Initialize comment like states
  useEffect(() => {
    const comments = commentsData?.topLikedComments || commentsData?.latestArticleComments || [];
    if (comments.length > 0) {
      const initialState = {};
      comments.forEach(comment => {
        initialState[comment.id] = {
          isLiked: comment.isCommentLiked,
          likeCount: comment.commentLikeCount || 0,
        };
        // Initialize for replies too
        if (comment.replies) {
          comment.replies.forEach(reply => {
            initialState[reply.id] = {
              isLiked: reply.isCommentLiked,
              likeCount: reply.commentLikeCount || 0,
            };
          });
        }
      });
      setCommentLikeState(initialState);
    }
  }, [commentsData]);

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
    if (!isAuthenticated || !news) return;

    const articleIdNum = Number(news.id);

    try {
      const { data } = await updateLikeStatus({
        variables: { articleId: articleIdNum },
      });

      if (data?.updateLikeStatus?.success) {
        const newIsLiked = data.updateLikeStatus.isActive;
        setIsLiked(newIsLiked);
        setLikesCount((prev) => prev + (newIsLiked ? 1 : -1));
      } else {
        console.error(data?.updateLikeStatus?.errors);
      }
    } catch (err) {
      console.error("Like mutation failed:", err);
    }
  };

  const handleLikeComment = async (commentId, isCurrentlyLiked) => {
    if (!isAuthenticated) return;

    setLikeLoading(commentId);

    try {
      const { data } = await updateLikeCommentStatus({
        variables: { commentId: Number(commentId) },
      });

      if (data?.updateLikeCommentStatus?.success) {
        const newIsLiked = data.updateLikeCommentStatus.isActive;

        setCommentLikeState((prev) => ({
          ...prev,
          [commentId]: {
            isLiked: newIsLiked,
            likeCount: prev[commentId].likeCount + (newIsLiked ? 1 : -1),
          },
        }));
      } else {
        console.error(data?.updateLikeCommentStatus?.errors);
      }
    } catch (error) {
      console.error("Error handling comment like:", error);
    } finally {
      setLikeLoading(null);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setShowReplyForm(comment.id);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setShowReplyForm(null);
    setReplyText('');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !isAuthenticated) return;

    try {
      await createComment({
        variables: {
          articleId,
          content: replyTo ? `**@${replyTo.author?.firstName} ${replyTo.author?.lastName}** ${comment}` : comment,
          parentId: replyTo?.id ? parseInt(replyTo.id, 10) : null,
        },
      });
      setComment('');
      setReplyTo(null);
      // refetchComments() will be called automatically via mutation's onCompleted
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleReplySubmit = async (e, targetComment) => {
    e.preventDefault();
    if (!replyText.trim() || !isAuthenticated) return;

    try {
      // If replying to a reply, use the original parent comment's ID
      const parentId = targetComment.parent ? targetComment.parent.id : targetComment.id;
      const actualParentId = targetComment.parent ? targetComment.parent.id : targetComment.id;

      await createComment({
        variables: {
          articleId,
          content: `**@${replyTo.author?.firstName} ${replyTo.author?.lastName}** ${replyText}`,
          parentId: parseInt(parentId, 10),
        },
      });

      // Automatically show the reply by expanding the parent comment's replies
      setVisibleReplies(prev => ({
        ...prev,
        [actualParentId]: Math.max((prev[actualParentId] || 0), 1) // Ensure at least 1 reply is visible
      }));

      setReplyText('');
      setShowReplyForm(null);
      setReplyTo(null);
      // refetchComments() will be called automatically via mutation's onCompleted
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleViewMoreReplies = (parentId) => {
    setVisibleReplies(prev => ({
      ...prev,
      [parentId]: (prev[parentId] || 0) + REPLIES_PER_PAGE
    }));
  };

  const getVisibleReplies = (replies, parentId) => {
    const visibleCount = visibleReplies[parentId] || 0;
    return replies.slice(0, visibleCount);
  };

  const hasMoreReplies = (replies, parentId) => {
    const visibleCount = visibleReplies[parentId] || 0;
    return replies.length > visibleCount;
  };

  if (newsLoading || countsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (newsError || !news) {
    return (
      <Box textAlign="center" py={4}>
        <Typography level="h3" sx={{ mb: 2 }}>{t('newsDetail.notFound')}</Typography>
        <Button component={Link} to="/news">
          {t('newsDetail.backToNews')}
        </Button>
      </Box>
    );
  }

  // Get root comments (comments without parent)
  const rootComments = commentsData?.topLikedComments?.filter(c => !c.parent) ||
    commentsData?.latestArticleComments?.filter(c => !c.parent) || [];

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
        ← {t('newsDetail.backToNews')}
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
              💬 {commentsCount} {t('newsDetail.comments')}
            </Typography>
            <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
              👁️ {readsCount} {t('newsDetail.reads')}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            {t('newsDetail.commentsTitle')} ({commentsCount})
          </Typography>
          {/* Sort Options */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Typography level="body2">{t('newsDetail.sortBy')}:</Typography>
            <Select
              value={sortBy}
              onChange={(e, value) => setSortBy(value)}
              size="sm"
              sx={{ minWidth: 150 }}
            >
              <Option value="top">{t('newsDetail.mostLiked')}</Option>
              <Option value="latest">{t('newsDetail.latest')}</Option>
            </Select>
          </Stack>
          {commentsLoading && (
            <Box display="flex" justifyContent="center" py={2}>
              <Typography>{t('newsDetail.loadingComments')}</Typography>
            </Box>
          )}
          {/* Main comment form */}
          {isAuthenticated && (
            <form onSubmit={handleCommentSubmit}>
              <Stack spacing={2} sx={{ mb: 4 }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('newsDetail.commentPlaceholder')}
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
                  {t('newsDetail.postComment')}
                </Button>
              </Stack>
            </form>
          )}

          <Stack spacing={3}>
            {rootComments.map((comment) => (
              <Box key={comment.id}>
                {/* Parent Comment */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar size="sm" src={comment.author?.profile?.avatarUrl} />
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
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Button
                        size="sm"
                        variant={commentLikeState[comment.id]?.isLiked ? "solid" : "outlined"}
                        color={commentLikeState[comment.id]?.isLiked ? "primary" : "neutral"}
                        onClick={() => handleLikeComment(comment.id, commentLikeState[comment.id]?.isLiked)}
                        disabled={likeLoading === comment.id || !isAuthenticated}
                      >
                        👍 {commentLikeState[comment.id]?.likeCount || 0}
                      </Button>

                      {isAuthenticated && (
                        <Button size="sm" variant="plain" onClick={() => handleReply(comment)}>
                          {t('newsDetail.reply')}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>

                {/* Reply Form for this comment */}
                {showReplyForm === comment.id && (
                  <Box sx={{ ml: 7, mt: 2 }}>
                    <form onSubmit={(e) => handleReplySubmit(e, comment)}>
                      <Stack spacing={2}>
                        <Box sx={{ p: 2, bgcolor: 'var(--joy-palette-neutral-50)', borderRadius: 'sm' }}>
                          <Typography level="body3">
                            {t('newsDetail.replyingTo')} <strong>{comment.author?.firstName} {comment.author?.lastName}</strong>
                            <Button size="sm" variant="plain" onClick={handleCancelReply} sx={{ ml: 2 }}>
                              {t('common.cancel')}
                            </Button>
                          </Typography>
                        </Box>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t('newsDetail.replyPlaceholder', { name: comment.author?.firstName })}
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
                          {t('newsDetail.postReply')}
                        </Button>
                      </Stack>
                    </form>
                  </Box>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && visibleReplies[comment.id] > 0 && (
                  <Box sx={{ ml: 7, mt: 2 }}>
                    {getVisibleReplies(comment.replies, comment.id).map((reply) => (
                      <Box key={reply.id} sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar size="sm" src={reply.author?.profile?.avatarUrl} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Typography level="body2" sx={{ fontWeight: 600, color: 'var(--joy-palette-text-primary)' }}>
                                {reply.author?.firstName} {reply.author?.lastName}
                              </Typography>
                              <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                                {formatDate(reply.createdAt)}
                              </Typography>
                            </Stack>
                            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                              <ReactMarkdown>{reply.content}</ReactMarkdown>
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                              <Button
                                size="sm"
                                variant={commentLikeState[reply.id]?.isLiked ? "solid" : "outlined"}
                                color={commentLikeState[reply.id]?.isLiked ? "primary" : "neutral"}
                                onClick={() => handleLikeComment(reply.id, commentLikeState[reply.id]?.isLiked)}
                                disabled={likeLoading === reply.id || !isAuthenticated}
                              >
                                👍 {commentLikeState[reply.id]?.likeCount || 0}
                              </Button>

                              {isAuthenticated && (
                                <Button size="sm" variant="plain" onClick={() => handleReply(reply)}>
                                  {t('newsDetail.reply')}
                                </Button>
                              )}
                            </Stack>
                          </Box>
                        </Stack>

                        {/* Reply Form for this reply */}
                        {showReplyForm === reply.id && (
                          <Box sx={{ ml: 7, mt: 2 }}>
                            <form onSubmit={(e) => handleReplySubmit(e, reply)}>
                              <Stack spacing={2}>
                                <Box sx={{ p: 2, bgcolor: 'var(--joy-palette-neutral-50)', borderRadius: 'sm' }}>
                                  <Typography level="body3">
                                    {t('newsDetail.replyingTo')} <strong>{reply.author?.firstName} {reply.author?.lastName}</strong>
                                    <Button size="sm" variant="plain" onClick={handleCancelReply} sx={{ ml: 2 }}>
                                      {t('common.cancel')}
                                    </Button>
                                  </Typography>
                                </Box>
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={t('newsDetail.replyPlaceholder', { name: reply.author?.firstName })}
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
                                  {t('newsDetail.postReply')}
                                </Button>
                              </Stack>
                            </form>
                          </Box>
                        )}
                      </Box>
                    ))}

                    {/* View More Replies Button */}
                    {hasMoreReplies(comment.replies, comment.id) && (
                      <Button
                        size="sm"
                        variant="plain"
                        onClick={() => handleViewMoreReplies(comment.id)}
                        sx={{ mt: 1 }}
                      >
                        {t('newsDetail.viewMoreReplies', { count: comment.replies.length - (visibleReplies[comment.id] || 0) })}
                      </Button>
                    )}
                  </Box>
                )}
                {/* View More Replies Button - hiển thị khi chưa có replies nào được hiển thị */}
                {comment.replies && comment.replies.length > 0 && (!visibleReplies[comment.id] || visibleReplies[comment.id] === 0) && (
                  <Box sx={{ ml: 7, mt: 2 }}>
                    <Button
                      size="sm"
                      variant="plain"
                      onClick={() => handleViewMoreReplies(comment.id)}
                    >
                      {t('newsDetail.viewReplies', { count: comment.replies.length })}
                    </Button>
                  </Box>
                )}

                <Divider sx={{ mt: 3 }} />
              </Box>
            ))}

            {rootComments.length === 0 && (
              <Typography level="body2" textAlign="center" sx={{ py: 4, color: 'var(--joy-palette-text-tertiary)' }}>
                {t('newsDetail.noComments')}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}