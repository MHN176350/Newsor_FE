import { useState } from 'react';
import {
  Box,
  Input,
  Select,
  Option,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Card,
  IconButton,
  Typography,
} from '@mui/joy';
import { Search, FilterAlt, Clear } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function SearchAndFilter({ 
  onSearch, 
  onFilter, 
  categories = [], 
  tags = [],
  loading = false,
  initialFilters = {}
}) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.categoryId ? String(initialFilters.categoryId) : '');
  const [selectedTag, setSelectedTag] = useState(initialFilters.tagId ? String(initialFilters.tagId) : '');
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'newest', label: t('news.newest') },
    { value: 'oldest', label: t('news.oldest') },
    { value: 'title_asc', label: t('news.titleAsc') },
    { value: 'title_desc', label: t('news.titleDesc') },
    { value: 'author_asc', label: t('news.authorAsc') },
    { value: 'author_desc', label: t('news.authorDesc') },
  ];

  const handleSearch = () => {
    onSearch(searchTerm);
    onFilter({
      categoryId: selectedCategory ? parseInt(selectedCategory) : null,
      tagId: selectedTag ? parseInt(selectedTag) : null,
      search: searchTerm || null,
      sortBy: sortBy,
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('newest');
    onSearch('');
    onFilter({
      categoryId: null,
      tagId: null,
      search: null,
      sortBy: 'newest',
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2}>
        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Input
            placeholder={t('news.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            startDecorator={<Search />}
            sx={{ flexGrow: 1 }}
            disabled={loading}
          />
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startDecorator={<FilterAlt />}
          >
            {t('news.filter')}
          </Button>
          <Button
            onClick={handleSearch}
            loading={loading}
            startDecorator={<Search />}
          >
            {t('common.search')}
          </Button>
          {(searchTerm || selectedCategory || selectedTag) && (
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={handleClear}
              disabled={loading}
            >
              <Clear />
            </IconButton>
          )}
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>{t('news.sortBy')}</FormLabel>
              <Select
                value={sortBy}
                onChange={(event, newValue) => {
                  setSortBy(newValue);
                  // Auto-apply filter when changed
                  onFilter({
                    categoryId: selectedCategory ? parseInt(selectedCategory) : null,
                    tagId: selectedTag ? parseInt(selectedTag) : null,
                    search: searchTerm || null,
                    sortBy: newValue,
                  });
                }}
                disabled={loading}
              >
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>{t('navigation.categories')}</FormLabel>
              <Select
                placeholder={t('news.allCategories')}
                value={selectedCategory}
                onChange={(event, newValue) => {
                  setSelectedCategory(newValue);
                  // Auto-apply filter when changed
                  onFilter({
                    categoryId: newValue ? parseInt(newValue) : null,
                    tagId: selectedTag ? parseInt(selectedTag) : null,
                    search: searchTerm || null,
                    sortBy: sortBy,
                  });
                }}
                disabled={loading}
              >
                <Option value="">{t('news.allCategories')}</Option>
                {categories.map((category) => (
                  <Option key={category.id} value={String(category.id)}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <FormLabel>{t('article.details.tags')}</FormLabel>
              <Select
                placeholder={t('news.allTags')}
                value={selectedTag}
                onChange={(event, newValue) => {
                  setSelectedTag(newValue);
                  // Auto-apply filter when changed
                  onFilter({
                    categoryId: selectedCategory ? parseInt(selectedCategory) : null,
                    tagId: newValue ? parseInt(newValue) : null,
                    search: searchTerm || null,
                    sortBy: sortBy,
                  });
                }}
                disabled={loading}
              >
                <Option value="">{t('news.allTags')}</Option>
                {tags.map((tag) => (
                  <Option key={tag.id} value={String(tag.id)}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory || selectedTag || sortBy !== 'newest') && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {t('news.activeFilters')}:
            </Typography>
            {searchTerm && (
              <Box sx={{ 
                px: 1, 
                py: 0.5, 
                bgcolor: 'primary.50', 
                borderRadius: 'sm',
                fontSize: 'sm'
              }}>
                Search: "{searchTerm}"
              </Box>
            )}
            {selectedCategory && (
              <Box sx={{ 
                px: 1, 
                py: 0.5, 
                bgcolor: 'success.50', 
                borderRadius: 'sm',
                fontSize: 'sm'
              }}>
                Category: {categories.find(c => c.id === selectedCategory)?.name}
              </Box>
            )}
            {selectedTag && (
              <Box sx={{ 
                px: 1, 
                py: 0.5, 
                bgcolor: 'warning.50', 
                borderRadius: 'sm',
                fontSize: 'sm'
              }}>
                Tag: {tags.find(t => t.id === parseInt(selectedTag))?.name}
              </Box>
            )}
            {sortBy !== 'newest' && (
              <Box sx={{ 
                px: 1, 
                py: 0.5, 
                bgcolor: 'neutral.100', 
                borderRadius: 'sm',
                fontSize: 'sm'
              }}>
                {t('news.sortBy')}: {sortOptions.find(s => s.value === sortBy)?.label}
              </Box>
            )}
          </Box>
        )}
      </Stack>
    </Card>
  );
}
