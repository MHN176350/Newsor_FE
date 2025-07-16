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
        <Button component={Link} to="/news">
          {t('newsDetail.backToNews')}
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
        ← {t('newsDetail.backToNews')}
      </Button>

      {/* Article Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          {news.title}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-primary)' }}>
              {t('newsDetail.by')} {news.author?.firstName} {news.author?.lastName}
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

      {/* Article Summary/Info Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
            {t('newsDetail.articleInfo')}
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography level="body2" sx={{ fontWeight: 'bold', color: 'var(--joy-palette-text-primary)' }}>
                {t('newsDetail.publishedDate')}:
              </Typography>
              <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                {formatDate(news.publishedAt)}
              </Typography>
            </Box>
            <Box>
              <Typography level="body2" sx={{ fontWeight: 'bold', color: 'var(--joy-palette-text-primary)' }}>
                {t('newsDetail.author')}:
              </Typography>
              <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                {news.author?.firstName} {news.author?.lastName}
              </Typography>
            </Box>
            {news.category && (
              <Box>
                <Typography level="body2" sx={{ fontWeight: 'bold', color: 'var(--joy-palette-text-primary)' }}>
                  {t('newsDetail.category')}:
                </Typography>
                <Chip size="sm" variant="soft" sx={{ mt: 1 }}>
                  {news.category.name}
                </Chip>
              </Box>
            )}
            {news.tags && news.tags.length > 0 && (
              <Box>
                <Typography level="body2" sx={{ fontWeight: 'bold', color: 'var(--joy-palette-text-primary)', mb: 1 }}>
                  {t('newsDetail.tags')}:
                </Typography>
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
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography level="h4" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
              {t('newsDetail.relatedArticles')}
            </Typography>
            <Grid container spacing={3}>
              {relatedArticles.map((article) => (
                <Grid key={article.id} xs={12} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 'var(--joy-shadow-md)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    {article.featuredImageUrl ? (
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 150,
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
                          height: 150,
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
                          mb: 1, 
                          color: 'var(--joy-palette-text-primary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography 
                        level="body3" 
                        sx={{ 
                          mb: 2, 
                          flexGrow: 1, 
                          color: 'var(--joy-palette-text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {truncateText(article.excerpt || article.content, 100)}
                      </Typography>
                      <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)', mb: 2 }}>
                        {formatDate(article.publishedAt)}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/news/${article.slug}`}
                        variant="outlined"
                        size="sm"
                        fullWidth
                        sx={{
                          mt: 'auto',
                          borderColor: 'var(--joy-palette-primary-300)',
                          color: 'var(--joy-palette-primary-700)',
                          '&:hover': {
                            backgroundColor: 'var(--joy-palette-primary-50)',
                            borderColor: 'var(--joy-palette-primary-500)',
                          }
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
      )}

      {/* Call to Action Section */}
      <Card variant="outlined" sx={{ textAlign: 'center' }}>
        <CardContent>
          <Typography level="h4" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
            {t('newsDetail.stayUpdated')}
          </Typography>
          <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('newsDetail.stayUpdatedDesc')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={Link}
              to="/news"
              variant="solid"
              size="lg"
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
