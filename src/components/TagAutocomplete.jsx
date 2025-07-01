import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import {
  Box,
  Input,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemButton,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
} from '@mui/joy';
import { CREATE_TAG } from '../graphql/mutations';
import { GET_TAGS } from '../graphql/queries';
import { generateSlug } from '../utils/constants';

export default function TagAutocomplete({ 
  tags = [], 
  selectedTags = [], 
  onTagsChange, 
  loading = false,
  label = "Tags",
  placeholder = "Type to search or add tags...",
  required = false
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [createTag] = useMutation(CREATE_TAG, {
    update(cache, { data }) {
      if (data?.createTag?.success && data?.createTag?.tag) {
        // Read the current tags from cache
        const existingTags = cache.readQuery({ query: GET_TAGS });
        if (existingTags) {
          // Write the new tag to the cache
          cache.writeQuery({
            query: GET_TAGS,
            data: {
              tags: [...existingTags.tags, data.createTag.tag]
            }
          });
        }
      }
    }
  });

  // Filter tags based on input value
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredTags([]);
      return;
    }

    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.some(selectedTag => selectedTag.id === tag.id)
    );
    
    setFilteredTags(filtered);
  }, [inputValue, tags, selectedTags]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleInputKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      await handleAddTag(inputValue.trim());
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const newSelectedTags = selectedTags.slice(0, -1);
      onTagsChange(newSelectedTags);
    }
  };

  const handleSelectTag = (tag) => {
    const newSelectedTags = [...selectedTags, tag];
    onTagsChange(newSelectedTags);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAddTag = async (tagName) => {
    if (!tagName.trim()) return;

    // Check if tag already exists
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (existingTag) {
      // Tag exists, just select it
      if (!selectedTags.some(selected => selected.id === existingTag.id)) {
        handleSelectTag(existingTag);
      }
      return;
    }

    // Create new tag
    try {
      setIsCreatingTag(true);
      const slug = generateSlug(tagName);
      const { data } = await createTag({
        variables: { 
          name: tagName,
          slug: slug
        }
      });

      if (data?.createTag?.success && data?.createTag?.tag) {
        const newTag = data.createTag.tag;
        const newSelectedTags = [...selectedTags, newTag];
        onTagsChange(newSelectedTags);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
      } else {
        console.error('Failed to create tag:', data?.createTag?.errors);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => tag.id !== tagToRemove.id);
    onTagsChange(newSelectedTags);
  };

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!listRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const shouldShowCreateOption = inputValue.trim() && 
    !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) &&
    !selectedTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase());

  return (
    <FormControl required={required}>
      <FormLabel>{label}</FormLabel>
      <Box sx={{ position: 'relative' }}>
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5, 
            mb: 1,
            p: 1,
            border: '1px solid',
            borderColor: 'neutral.300',
            borderRadius: 'sm',
            backgroundColor: 'background.surface'
          }}>
            {selectedTags.map((tag) => (
              <Chip
                key={tag.id}
                variant="soft"
                size="sm"
                endDecorator={
                  <Box
                    component="span"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'danger.200' }
                    }}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </Box>
                }
              >
                {tag.name}
              </Chip>
            ))}
          </Box>
        )}

        {/* Input Field */}
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={loading}
          endDecorator={
            (loading || isCreatingTag) && <CircularProgress size="sm" />
          }
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              backgroundColor: 'background.popup',
              border: '1px solid',
              borderColor: 'neutral.300',
              borderRadius: 'sm',
              boxShadow: 'md',
              maxHeight: 200,
              overflow: 'auto',
              mt: 0.5
            }}
          >
            <List ref={listRef} size="sm">
              {/* Existing tags */}
              {filteredTags.map((tag) => (
                <ListItem key={tag.id}>
                  <ListItemButton
                    onClick={() => handleSelectTag(tag)}
                    sx={{ py: 0.5 }}
                  >
                    <Typography level="body-sm">{tag.name}</Typography>
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Create new tag option */}
              {shouldShowCreateOption && (
                <ListItem>
                  <ListItemButton
                    onClick={() => handleAddTag(inputValue.trim())}
                    disabled={isCreatingTag}
                    sx={{ 
                      py: 0.5,
                      fontStyle: 'italic',
                      color: 'primary.500'
                    }}
                  >
                    <Typography level="body-sm">
                      {isCreatingTag ? 'Creating...' : `Create "${inputValue.trim()}"`}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              )}

              {/* No results */}
              {filteredTags.length === 0 && !shouldShowCreateOption && (
                <ListItem>
                  <Typography level="body-sm" sx={{ color: 'text.secondary', py: 1 }}>
                    No tags found
                  </Typography>
                </ListItem>
              )}
            </List>
          </Box>
        )}
      </Box>
    </FormControl>
  );
}
