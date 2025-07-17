import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Stack, Grid } from '@mui/joy';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_NEWS, GET_PUBLISHED_NEWS } from '../graphql/queries';
import { formatDate, truncateText } from '../utils/constants';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';
import { useTranslation } from 'react-i18next';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const { t } = useTranslation();

  // Fetch article by slug
  const { data: newsData, loading: newsLoading, error: newsError } = useQuery(GET_NEWS, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-and-network',
  });

  // Fetch related articles (same category)
  const { data: relatedNewsData } = useQuery(GET_PUBLISHED_NEWS, {
    variables: {
      categoryId: newsData?.newsArticle?.category?.id ? parseInt(newsData.newsArticle.category.id) : null,
      search: null,
      tagId: null,
      sortBy: 'newest'
    },
    skip: !newsData?.newsArticle?.category?.id,
    fetchPolicy: 'cache-and-network',
  });

  const news = newsData?.newsArticle;
  const relatedArticles = relatedNewsData?.publishedNews?.filter(article => article.slug !== slug)?.slice(0, 3) || [];

  if (newsLoading) {
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
        <Button component={Link} to="/news" >
          {t('newsDetail.backToNews')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '90%', mx: 'auto', pt: 4 }}>
      {/* Back Button */}
      <Button
        component={Link}
        to="/news"
        variant="outlined"
        size="sm"
        sx={{ mb: 3, fontSize: '1rem', color: '#3a9285', borderColor: '#3a9285', '&:hover': { backgroundColor: '#f0f0f0' }} }
      >
        ← {t('newsDetail.backToNews')}
      </Button>

      <Grid container spacing={4}>        

        {/* Main Article Section - right on desktop, above on mobile */}
        <Grid item xs={12} md={9} sx={{ order: { xs: 2, md: 1 }, pl: 10}}>   
          {/* Article Header */}
          <Box sx={{ mb: 4 }}>
            <Typography level="h1" sx={{ mb: 2, color: '#3a9285' }}>
              {news.title}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography level="body2" sx={{ color: 'var(--joy-palette-text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                  {t('newsDetail.by')}: {news.author?.firstName} {news.author?.lastName}
                </Typography>
                <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                  {formatDate(news.createdAt)}
                </Typography>
              </Box>
              {news.category && (
                <Chip size="sm" variant="soft" >
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

          {/* Article Info Section */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-text-primary)', fontWeight: '700' }}>
                {t('newsDetail.articleInfo')}
              </Typography>

              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body2" sx={{ fontWeight: '600', color: 'var(--joy-palette-text-primary)' }}>
                      {t('newsDetail.publishedDate')}:
                    </Typography>
                    <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                      {formatDate(news.createdAt)}
                    </Typography>
                  </Box>

                  {news.category && (
                    <Box>
                      <Typography level="body2" sx={{ fontWeight: '600', color: 'var(--joy-palette-text-primary)' }}>
                        {t('newsDetail.category')}:
                      </Typography>
                      <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                        {news.category.name}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* Right Column */}
                <Grid xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography level="body2" sx={{ fontWeight: '600', color: 'var(--joy-palette-text-primary)' }}>
                      {t('newsDetail.author')}:
                    </Typography>
                    <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                      {news.author?.firstName} {news.author?.lastName}
                    </Typography>
                  </Box>

                  {news.tags && news.tags.length > 0 && (
                    <Box>
                      <Typography level="body2" sx={{ fontWeight: '600', color: 'var(--joy-palette-text-primary)', mb: 1 }}>
                        {t('newsDetail.tags')}:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {news.tags.map((tag) => (
                          <Chip
                            key={tag.id}
                            size="sm"
                            variant="soft"
                            sx={{
                              backgroundColor: 'var(--joy-palette-primary-50)',
                              color: 'var(--joy-palette-primary-700)',
                              fontWeight: 500,
                            }}
                          >
                            {tag.name}
                          </Chip>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          
        </Grid>

        {/* Related Articles Section - left on desktop, below on mobile */}
        {relatedArticles.length > 0 && (
          <Grid item xs={12} md={3} sx={{ order: { xs: 1, md: 2 } }}>
            <Card variant="outlined" sx={{ mb: { xs: 4, md: 5, lg: 5 }, position: 'sticky',width: '100%', mr:2 }}>
              <CardContent>
                <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-text-primary)' }}>
                  {t('newsDetail.relatedArticles')}
                </Typography>
                <Grid container spacing={3}>
                  {relatedArticles.map((article) => (
                    <Grid key={article.id} xs={12}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transform: 'scale(0.95)',
                          transformOrigin: 'top center',
                          transition: 'all 0.2s ease-in-out',
                          mb: 2,
                          '&:hover': {
                            boxShadow: 'var(--joy-shadow-md)',
                            transform: 'scale(1) translateY(-2px)',
                          }
                        }}
                      >
                        {article.featuredImageUrl ? (
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 100,
                              overflow: 'hidden',
                              borderRadius: 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0',
                            }}
                          >
                            <Box
                              component="img"
                              src={processImageUrlForDisplay(article.featuredImageUrl)}
                              alt={article.title}
                              onError={(e) => {
                                e.target.src = '/default-news.svg';
                                e.target.onerror = () => {
                                  e.target.style.display = 'none';
                                };
                              }}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: 100,
                              backgroundColor: 'var(--joy-palette-background-level2)',
                              borderRadius: 'var(--joy-radius-sm) var(--joy-radius-sm) 0 0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--joy-palette-text-tertiary)',
                            }}
                          >
                            📰
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            level="title-sm"
                            sx={{
                              mb: 0,
                              color: 'var(--joy-palette-text-primary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.95rem',
                            }}
                          >
                            {article.title}
                          </Typography>
                          <Typography
                            level="body3"
                            sx={{
                              flexGrow: 1,
                              fontSize: '0.875rem',
                              color: 'var(--joy-palette-text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {truncateText(article.excerpt || article.content, 100)}
                          </Typography>
                          <Button
                            component={Link}
                            to={`/news/${article.slug}`}
                            variant="outlined"
                            size="sm"
                            fullWidth
                            sx={{
                              backgroundColor: '#3a9285',
                              color: '#fff',
                              '&:hover': {
                                backgroundColor: '#3a9285',
                                transform: 'scale(1.05)',
                                color: '#fff',
                              },
                            }}
                          >
                            {t('newsDetail.readMore')}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      {/* Call to Action Section */}
          <Card variant="outlined" sx={{ textAlign: 'center', mb: 1 }}>
            <CardContent>
              <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-text-primary)' }}>
                {t('newsDetail.stayUpdated')}
              </Typography>
              <Typography level="body1" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
                {t('newsDetail.stayUpdatedDesc')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  component={Link}
                  to="/news"
                  variant="solid"
                  size="lg"
                  sx={{ backgroundColor: '#57a297', color: 'white', '&:hover': { backgroundColor: '#4a8f82', color: 'white' } }}
                >
                  {t('newsDetail.browseAllNews')}
                </Button>
                {news.category && (
                  <Button
                    component={Link}
                    to={`/news?category=${news.category.slug}`}
                    variant="outlined"
                    size="lg"
                  >
                    {t('newsDetail.moreCategoryNews', { category: news.category.name })}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
    </Box>
  );
}
