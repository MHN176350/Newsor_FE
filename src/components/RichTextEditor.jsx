import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Box, Button, Stack, IconButton, Divider, Input, Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/joy';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { GET_CLOUDINARY_SIGNATURE } from '../graphql/mutations';

const RichTextEditor = ({ content, onChange, placeholder = "Start writing your article..." }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [getCloudinarySignature] = useMutation(GET_CLOUDINARY_SIGNATURE);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'article-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'article-link',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor',
      },
    },
  });

  const uploadImageToCloudinary = async (file) => {
    try {
      setIsUploading(true);
      setUploadError('');

      // Get upload signature from backend
      const { data } = await getCloudinarySignature();
      
      if (!data?.getCloudinarySignature?.success) {
        throw new Error(data?.getCloudinarySignature?.errors?.[0] || 'Failed to get upload signature');
      }

      const uploadData = data.getCloudinarySignature;

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', uploadData.apiKey);
      formData.append('timestamp', uploadData.timestamp);
      formData.append('signature', uploadData.signature);
      formData.append('folder', uploadData.folder);

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${uploadData.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.secure_url;

    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      setUploadError('');
    } catch (error) {
      setUploadError(error.message || 'Failed to upload image');
    }
  };

  const insertImage = () => {
    if (!imageUrl || !editor) return;

    editor.chain().focus().setImage({ 
      src: imageUrl, 
      alt: altText || 'Article image' 
    }).run();

    // Reset form
    setImageUrl('');
    setAltText('');
    setIsImageModalOpen(false);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ 
        border: '1px solid var(--joy-palette-neutral-300)', 
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        p: 1,
        backgroundColor: 'var(--joy-palette-neutral-50)'
      }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {/* Text formatting */}
          <IconButton
            size="sm"
            variant={editor.isActive('bold') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </IconButton>
          
          <IconButton
            size="sm"
            variant={editor.isActive('italic') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </IconButton>

          <Divider orientation="vertical" />

          {/* Headings */}
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 1 }) ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </Button>
          
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 2 }) ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </Button>

          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 3 }) ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </Button>

          <Divider orientation="vertical" />

          {/* Lists */}
          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            • List
          </Button>

          <Button
            size="sm"
            variant={editor.isActive('orderedList') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            1. List
          </Button>

          <Divider orientation="vertical" />

          {/* Media */}
          <Button
            size="sm"
            variant="plain"
            onClick={() => setIsImageModalOpen(true)}
            title="Insert Image"
          >
            🖼️ Image
          </Button>

          <Button
            size="sm"
            variant="plain"
            onClick={insertLink}
            title="Insert Link"
          >
            🔗 Link
          </Button>

          <Divider orientation="vertical" />

          {/* Quote */}
          <Button
            size="sm"
            variant={editor.isActive('blockquote') ? 'solid' : 'plain'}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            " Quote
          </Button>
        </Stack>
      </Box>

      {/* Editor Content */}
      <Box sx={{ 
        border: '1px solid var(--joy-palette-neutral-300)',
        borderRadius: '0 0 8px 8px',
        minHeight: '300px',
        '& .rich-text-editor': {
          p: 2,
          minHeight: '300px',
          outline: 'none',
          '& p': {
            margin: '0 0 1em 0',
          },
          '& h1, & h2, & h3': {
            margin: '1em 0 0.5em 0',
            fontWeight: 'bold',
          },
          '& h1': { fontSize: '2em' },
          '& h2': { fontSize: '1.5em' },
          '& h3': { fontSize: '1.2em' },
          '& ul, & ol': {
            paddingLeft: '2em',
            margin: '0.5em 0',
          },
          '& blockquote': {
            borderLeft: '4px solid var(--joy-palette-primary-500)',
            paddingLeft: '1em',
            margin: '1em 0',
            fontStyle: 'italic',
            color: 'var(--joy-palette-text-secondary)',
          },
          '& .article-image': {
            maxWidth: '100%',
            height: 'auto',
            margin: '1em 0',
            borderRadius: '8px',
          },
          '& .article-link': {
            color: 'var(--joy-palette-primary-500)',
            textDecoration: 'underline',
          },
        }
      }}>
        <EditorContent editor={editor} placeholder={placeholder} />
      </Box>

      {/* Image Upload Modal */}
      <Modal open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
        <ModalDialog>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {uploadError && (
                <Alert color="danger">
                  {uploadError}
                </Alert>
              )}
              
              <Box>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {isUploading && <Box sx={{ mt: 1, fontSize: 'sm' }}>Uploading...</Box>}
              </Box>

              {imageUrl && (
                <Box>
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                  />
                </Box>
              )}

              <Input
                placeholder="Alt text (optional)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" onClick={() => setIsImageModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={insertImage}
              disabled={!imageUrl || isUploading}
            >
              Insert Image
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default RichTextEditor;
