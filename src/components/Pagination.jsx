import { Box, Button, Typography, Stack } from '@mui/joy';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxButtons = 5,
  size = 'md',
  variant = 'outlined'
}) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const halfMax = Math.floor(maxButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* First Page */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <FirstPage />
        </Button>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <ChevronLeft />
        </Button>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'solid' : variant}
          size={size}
          onClick={() => onPageChange(page)}
          sx={{ 
            minWidth: 'auto', 
            px: 2,
            fontWeight: page === currentPage ? 'bold' : 'normal'
          }}
        >
          {page}
        </Button>
      ))}

      {/* Next Page */}
      {showPrevNext && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <ChevronRight />
        </Button>
      )}

      {/* Last Page */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant={variant}
          size={size}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          <LastPage />
        </Button>
      )}
    </Stack>
  );
}
