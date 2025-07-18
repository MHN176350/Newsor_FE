import { Box, Typography, Card, CardContent, Button, Grid, Chip, Stack } from '@mui/joy';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { GET_PUBLISHED_NEWS, GET_CATEGORIES, GET_TAGS } from '../graphql/queries';
import { formatDate, truncateText } from '../utils/constants';
import { SEO, LoadingSpinner, ErrorDisplay, Pagination } from '../components/index.jsx';
import SearchAndFilter from '../components/SearchAndFilter';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';
import { useTranslation } from 'react-i18next';

export default function NewsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchFilters, setSearchFilters] = useState({
    search: null,
    categoryId: null,
    tagId: searchParams.get('tag') ? parseInt(searchParams.get('tag')) : null,
    sortBy: 'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setSearchFilters(prev => ({ ...prev, categoryId: parseInt(category.id) }));
      }
    } else {
      setSearchFilters(prev => ({ ...prev, categoryId: null }));
    }
  }, [searchParams, categories]);

  const { data: newsData, loading: newsLoading, error: newsError, refetch: refetchNews } = useQuery(GET_PUBLISHED_NEWS, {
    variables: searchFilters,
    onCompleted: (data) => {
      console.log('News data loaded:', data);
      if (data?.publishedNews) {
        data.publishedNews.forEach((news, index) => {
          if (news.featuredImageUrl) {
            console.log(`Article ${index} - Image URL:`, news.featuredImageUrl);
          }
        });
      }
    },
    onError: (error) => {
      console.error('News query error:', error);
    }
  });

  const publishedNews = newsData?.publishedNews || [];

  const sortNews = (news, sortBy) => {
    const sortedNews = [...news];

    switch (sortBy) {
      case 'oldest':
        return sortedNews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'title_asc':
        return sortedNews.sort((a, b) => a.title.localeCompare(b.title));
      case 'title_desc':
        return sortedNews.sort((a, b) => b.title.localeCompare(a.title));
      case 'author_asc':
        return sortedNews.sort((a, b) => {
          const aName = `${a.author?.firstName || ''} ${a.author?.lastName || ''}`.trim();
          const bName = `${b.author?.firstName || ''} ${b.author?.lastName || ''}`.trim();
          return aName.localeCompare(bName);
        });
      case 'author_desc':
        return sortedNews.sort((a, b) => {
          const aName = `${a.author?.firstName || ''} ${a.author?.lastName || ''}`.trim();
          const bName = `${b.author?.firstName || ''} ${b.author?.lastName || ''}`.trim();
          return bName.localeCompare(aName);
        });
      case 'newest':
      default:
        return sortedNews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const sortedNews = sortNews(publishedNews, searchFilters.sortBy);

  const totalItems = sortedNews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = sortedNews.slice(startIndex, endIndex);

  const userRole = user?.profile?.role?.toLowerCase();
  const canCreateArticles = isAuthenticated && ['writer', 'manager', 'admin'].includes(userRole);

  const handleSearch = (searchTerm) => {
    setSearchFilters(prev => ({ ...prev, search: searchTerm || null }));
    setCurrentPage(1);
  };

  const handleFilter = (filters) => {
    setSearchFilters(filters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <SEO
        title={t('news.title')}
        description={t('news.subtitle')}
        keywords={['news', 'articles', 'stories', 'current events', 'breaking news']}
        type="website"
      />

      <Box sx={{ mx: 'auto' }}>
        <Box sx={{
          background: 'linear-gradient(180deg, #e3f2fd 40%, #ffffff )',
          py: 4,
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography level="h1" sx={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#3a9285',
            mb: 2
          }}>
            {t('news.title')}
          </Typography>
          <Typography level="body1" sx={{
            color: '#616161',
            mb: 4,
            maxWidth: 800,
            mx: 'auto'
          }}>
            {t('news.subtitle')}
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center', maxWidth: 900, mx: 'auto' }}>
            <Box sx={{ flex: 2 }}>
              <SearchAndFilter
                onSearch={handleSearch}
                onFilter={handleFilter}
                categories={categories}
                tags={tags}
                loading={newsLoading}
                initialFilters={searchFilters}
                variant="outlined"
                sx={{ width: '100%' }}
              />
            </Box>
          </Stack>

        </Box>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {newsLoading && (
            <LoadingSpinner
              size="lg"
              message={t('news.loading')}
              variant="card"
              type="news"
            />
          )}

          {newsError && (
            <ErrorDisplay
              error={newsError}
              title={t('news.error')}
              message={t('news.checkConnection')}
              showRefresh={true}
              onRefresh={() => refetchNews()}
              color="warning"
              size="md"
            />
          )}

          {!newsLoading && !newsError && currentNews.length === 0 && (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6, maxWidth: 500, mx: 'auto', mt: 6 }}>
              <CardContent>
                <Typography level="h4" sx={{ mb: 2, color: '#616161' }}>
                  {t('news.noNews')}
                </Typography>
                <Typography level="body1" sx={{ color: '#757575' }}>
                  {t('news.tryDifferentFilters')}
                </Typography>
                {canCreateArticles && (
                  <Button
                    component={Link}
                    to="/articles/create"
                    variant="solid"
                    sx={{ mt: 2, backgroundColor: '#3a9285', color: '#fff' }}
                  >
                    {t('news.createFirst')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {!newsLoading && !newsError && currentNews.length > 0 && (
            <Grid container spacing={3} sx={{ px: { xs: 1, md: 2 } }}>
              {currentNews.map((news) => (
                <Grid key={news.id} xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      background: '#fff',
                      overflow: 'hidden',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      {news.featuredImageUrl ? (
                        <Box
                          component="img"
                          src={processImageUrlForDisplay(news.featuredImageUrl)}
                          alt={news.title}
                          onError={(e) => {
                            e.target.src = '/default-news.svg';
                            e.target.onerror = () => {
                              e.target.style.display = 'none';
                            };
                          }}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            display: 'block',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            backgroundColor: '#f0f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#757575',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        >
                          📰
                        </Box>
                      )}

                      {news.category && (
                        <Chip
                          size="sm"
                          variant="soft"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 2,
                            backgroundColor: '#3a9285',
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            borderRadius: '8px',
                          }}
                        >
                          {news.category.name}
                        </Chip>
                      )}
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1, color: '#757575', fontSize: '0.875rem' }}>
                        <Typography level="body3">{formatDate(news.createdAt)}</Typography>
                        {news.readTime && <Typography level="body3">{news.readTime} min read</Typography>}
                      </Stack>
                      <Typography level="h6" sx={{ color: '#3a9285', fontWeight: 600, mb: 1, fontSize: '1.25rem' }}>
                        {news.title}
                      </Typography>
                      <Typography level="body2" sx={{ color: '#616161', mb: 2, minHeight: 60 }}>
                        {truncateText(news.excerpt || news.content, 150)}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/news/${news.slug}`}
                        variant="outlined"
                        size="sm"
                        fullWidth
                        sx={{
                          mt: 'auto',
                          backgroundColor: '#3a9285',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#3a9285',
                            transform: 'scale(1.05)',
                            color: '#fff',
                          },
                          px: 2,
                          py: 0.5,
                          fontSize: '0.875rem',
                        }}
                      >
                        {t('news.readMore')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

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
            <Typography level="body3" sx={{ color: '#3a9285' }}>
              {t('news.showing')} {startIndex + 1}-{Math.min(endIndex, totalItems)} {t('news.of')} {totalItems} {t('news.articles')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}