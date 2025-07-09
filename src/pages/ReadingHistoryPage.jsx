import { Box, Typography, Card, CardContent, Button, Grid, Stack, Input } from '@mui/joy';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { GET_USER_READING_HISTORY } from '../graphql/queries';
import { formatDate } from '../utils/constants';
import { SEO, LoadingSpinner, ErrorDisplay, Pagination } from '../components/index.js';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';
import { useTranslation } from 'react-i18next';

export default function ReadingHistoryPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [filter, setFilter] = useState({ fromDate: '', toDate: '' });
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_USER_READING_HISTORY, {
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
    const history = (data?.userReadingHistory || []).filter(item => {
        if (filter.fromDate && new Date(item.readAt) < new Date(filter.fromDate)) return false;
        if (filter.toDate && new Date(item.readAt) > new Date(filter.toDate)) return false;
        return true;
    });
    const totalItems = history.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentHistory = history.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Box>
            <SEO title={t('readingHistory.title')} description={t('readingHistory.description')} />
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box>
                        <Typography level="h1" sx={{ mb: 2 }}>
                            {t('readingHistory.title')}
                        </Typography>
                        <Typography level="body1">
                            {t('readingHistory.subtitle')}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
                            <Typography level="body2" sx={{ minWidth: 70 }}>{t('readingHistory.fromDate')}</Typography>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                size="sm"
                                variant="outlined"
                                sx={{ minWidth: 150 }}
                                slotProps={{ input: { 'aria-label': t('readingHistory.fromDate') } }}
                                placeholder={t('readingHistory.fromDate')}
                            />
                            <Typography level="body2" sx={{ minWidth: 70 }}>{t('readingHistory.toDate')}</Typography>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                size="sm"
                                variant="outlined"
                                sx={{ minWidth: 150 }}
                                slotProps={{ input: { 'aria-label': t('readingHistory.toDate') } }}
                                placeholder={t('readingHistory.toDate')}
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
                                {t('common.search')}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Box>
            {loading && <LoadingSpinner size="lg" message={t('readingHistory.loading')} variant="card" type="news" />}
            {error && (
                <ErrorDisplay
                    error={error}
                    title={t('readingHistory.errorTitle')}
                    message={t('readingHistory.errorMessage')}
                    showRefresh={true}
                    onRefresh={() => refetch()}
                    color="warning"
                    size="md"
                />
            )}
            {!loading && !error && currentHistory.length === 0 && (
                <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
                    <CardContent>
                        <Typography level="h4" sx={{ mb: 2 }}>
                            {t('readingHistory.noHistory')}
                        </Typography>
                        <Typography level="body1">
                            {t('readingHistory.noHistoryMessage')}
                        </Typography>
                    </CardContent>
                </Card>
            )}
            {!loading && !error && currentHistory.length > 0 && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {currentHistory.map((item) => (
                            <Grid key={item.id} xs={12} sm={6} lg={4}>
                                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {item.article?.featuredImageUrl && (
                                        <Box
                                            component="img"
                                            src={processImageUrlForDisplay(item.article.featuredImageUrl)}
                                            alt={item.article.title}
                                            sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0' }}
                                            onError={e => { e.target.src = '/default-news.svg'; }}
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography level="title-md" sx={{ mb: 1 }}>
                                            {item.article?.title}
                                        </Typography>
                                        <Typography level="body2" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
                                            {t('readingHistory.readAt')}: {formatDate(item.readAt)}
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to={`/news/${item.article?.slug}`}
                                            variant="outlined"
                                            size="sm"
                                            fullWidth
                                            sx={{ mt: 'auto',
                                                '&:hover .view-article-text': {
                                                    color: 'primary.600',
                                                    fontWeight: 'bold',
                                                }
                                            }}
                                            disabled={!item.article?.slug}
                                        >
                                            <span className="view-article-text">{t('readingHistory.viewArticle')}</span>
                                        </Button>
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
                            {t('readingHistory.showing', { 
                                start: startIndex + 1, 
                                end: Math.min(endIndex, totalItems), 
                                total: totalItems 
                            })}
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    );
}
