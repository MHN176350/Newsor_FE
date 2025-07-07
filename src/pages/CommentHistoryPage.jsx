import { Box, Typography, Card, CardContent, Button, Grid, Stack, Input } from '@mui/joy';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { GET_USER_COMMENT_HISTORY } from '../graphql/queries';
import { formatDate, truncateText } from '../utils/constants';
import { SEO, LoadingSpinner, ErrorDisplay, Pagination } from '../components/index.js';

export default function CommentHistoryPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [filter, setFilter] = useState({ fromDate: '', toDate: '' });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_USER_COMMENT_HISTORY, {
    variables: { userId: Number(user?.id), limit: 100, offset: 0 },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, refetch]);

  // Lọc theo ngày (dùng filter state, không phải fromDate/toDate trực tiếp)
  const comments = (data?.userCommentHistory || []).filter(comment => {
    if (filter.fromDate && new Date(comment.createdAt) < new Date(filter.fromDate)) return false;
    if (filter.toDate && new Date(comment.createdAt) > new Date(filter.toDate)) return false;
    return true;
  });
  const totalItems = comments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentComments = comments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box>
      <SEO title="Comment History" description="Your comment history on articles." />
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography level="h1" sx={{ mb: 2 }}>
              Comment History
            </Typography>
            <Typography level="body1">
              All your comments on articles
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
              <Typography level="body2" sx={{ minWidth: 70 }}>From Date</Typography>
              <Input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                size="sm"
                variant="outlined"
                sx={{ minWidth: 150 }}
                slotProps={{ input: { 'aria-label': 'From date' } }}
                placeholder="From date"
              />
              <Typography level="body2" sx={{ minWidth: 70 }}>To Date</Typography>
              <Input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                size="sm"
                variant="outlined"
                sx={{ minWidth: 150 }}
                slotProps={{ input: { 'aria-label': 'To date' } }}
                placeholder="To date"
              />
              <Button
                variant="solid"
                size="sm"
                sx={{ minWidth: 90 }}
                onClick={() => {
                  setFilter({ fromDate, toDate });
                  setCurrentPage(1);
                }}
              >
                Search
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
      {loading && <LoadingSpinner size="lg" message="Loading comment history..." variant="card" type="comment" />}
      {error && (
        <ErrorDisplay
          error={error}
          title="Unable to load comment history"
          message="Please check your connection to the backend server."
          showRefresh={true}
          onRefresh={() => refetch()}
          color="warning"
          size="md"
        />
      )}
      {!loading && !error && currentComments.length === 0 && (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 2 }}>
              No Comments Found
            </Typography>
            <Typography level="body1">
              You haven't commented on any articles yet.
            </Typography>
          </CardContent>
        </Card>
      )}
      {!loading && !error && currentComments.length > 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {currentComments.map((comment) => (
              <Grid key={comment.id} xs={12} sm={6} lg={4}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography level="body2" sx={{ mb: 1, color: 'var(--joy-palette-text-secondary)' }}>
                      {formatDate(comment.createdAt)}
                    </Typography>
                    <Typography level="body1" sx={{ mb: 2 }}>
                      {truncateText(comment.content, 120)}
                    </Typography>
                    {comment.article && (
                      <Button
                        component={Link}
                        to={`/news/${comment.article.slug}`}
                        variant="outlined"
                        size="sm"
                        fullWidth
                        sx={{ mt: 'auto',
                          '&:hover .view-article-text': {
                            color: 'primary.600',
                            fontWeight: 'bold',
                          }
                        }}
                      >
                        <span className="view-article-text">View Article: {comment.article.title}</span>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showFirstLast={true}
                showPrevNext={true}
                maxButtons={5}
                size="md"
                variant="outlined"
              />
            </Box>
          )}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography level="body3">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} comments
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
