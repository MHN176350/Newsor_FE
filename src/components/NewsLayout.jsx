import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Sheet, IconButton, Select, Option } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { useTranslation } from 'react-i18next';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LanguageIcon from '@mui/icons-material/Language';

export default function NewsLayout({ children }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const categoriesRef = useRef(null);

  // Fetch categories for navigation
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  // Language change handler
  const handleLanguageChange = (event, newValue) => {
    console.log('Language change attempted:', { event, newValue, currentLang: i18n.language });
    if (newValue) {
      i18n.changeLanguage(newValue);
    }
  };

  // Check if scrolling is needed
  const checkScrollability = () => {
    if (categoriesRef.current) {
      const container = categoriesRef.current;
      const isScrollable = container.scrollWidth > container.clientWidth;
      setShowLeftArrow(isScrollable && container.scrollLeft > 0);
      setShowRightArrow(isScrollable && container.scrollLeft < container.scrollWidth - container.clientWidth);
    }
  };

  // Handle scroll navigation
  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 200; // Adjust scroll distance as needed
      const newScrollLeft = direction === 'left' 
        ? categoriesRef.current.scrollLeft - scrollAmount
        : categoriesRef.current.scrollLeft + scrollAmount;
      
      categoriesRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Load EvoluSoft CSS files
  useEffect(() => {
    const loadCSS = (href, id) => {
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.id = id;
        document.head.appendChild(link);
      }
    };

    // Load required CSS files for EvoluSoft header
    loadCSS('/evolusoft/assets/vendor/bootstrap/css/bootstrap.min.css', 'bootstrap-css');
    loadCSS('/evolusoft/assets/vendor/bootstrap-icons/bootstrap-icons.css', 'bootstrap-icons-css');
    loadCSS('/evolusoft/assets/css/main.css', 'evolusoft-main-css');

    // Load JavaScript files for functionality
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load required scripts
    const loadScripts = async () => {
      try {
        await loadScript('/evolusoft/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', 'bootstrap-js');
        await loadScript('/evolusoft/assets/js/main.js', 'evolusoft-main-js');
      } catch (error) {
        // Silently handle script loading failures
      }
    };

    loadScripts();
  }, []);

  // Check scrollability when categories load or window resizes
  useEffect(() => {
    checkScrollability();
    
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  // Add scroll event listener to update arrow visibility
  useEffect(() => {
    const handleScroll = () => checkScrollability();
    
    if (categoriesRef.current) {
      categoriesRef.current.addEventListener('scroll', handleScroll);
      return () => {
        if (categoriesRef.current) {
          categoriesRef.current.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, []);

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.body' }}>
      {/* Custom CSS for hiding scrollbars */}
      <style jsx global>{`
        .categories-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .categories-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
      `}</style>
      
      {/* EvoluSoft Header with Categories Navigation */}
      <header id="header" className="header d-flex align-items-center fixed-top">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="/" className="logo d-flex align-items-center me-auto me-xl-0">
            <h1 className="sitename">
              <img src="/evolusoft/assets/img/company_name.png" alt="EvoluSoft" />
            </h1>
          </a>

          {/* Language Switcher - positioned between logo and navigation */}
          <Select
            value={i18n.language}
            onChange={(event, newValue) => handleLanguageChange(event, newValue)}
            size="sm"
            variant="outlined"
            sx={{
              minWidth: '60px',
              height: '28px',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              mr: 2
            }}
            startDecorator={<LanguageIcon sx={{ fontSize: '12px' }} />}
          >
            <Option value="en">EN</Option>
            <Option value="vi">VI</Option>
          </Select>

          {/* Categories Navigation */}
          <nav id="navmenu" className="navmenu" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative', maxWidth: '70%' }}>
              {/* Left Arrow */}
              {showLeftArrow && (
                <IconButton
                  onClick={() => scrollCategories('left')}
                  sx={{
                    position: 'absolute',
                    left: -40,
                    zIndex: 10,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <KeyboardArrowLeftIcon />
                </IconButton>
              )}

              {/* Categories Container */}
              <div
                ref={categoriesRef}
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '20px',
                  padding: '10px 0',
                  minWidth: '300px',
                  maxWidth: '100%'
                }}
                className="categories-scroll"
              >
                
                {/* All News Item */}
                <a
                  href="/news"
                  onClick={e => { e.preventDefault(); navigate('/news'); }}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '8px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={e => {
                    e.target.style.textDecoration = 'underline';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.color = '#0066cc';
                  }}
                  onMouseLeave={e => {
                    e.target.style.textDecoration = 'none';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.color = '#333';
                  }}
                >
                  🗞️ All News
                </a>

                {/* Category Items */}
                {categories.map(category => (
                  <a
                    key={category.id}
                    href={`/news?category=${category.slug}`}
                    onClick={e => { e.preventDefault(); navigate(`/news?category=${category.slug}`); }}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '16px',
                      fontWeight: 'light'
                    }}
                    onMouseEnter={e => {
                      e.target.style.textDecoration = 'underline';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.color = '#0066cc';
                    }}
                    onMouseLeave={e => {
                      e.target.style.textDecoration = 'none';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.color = '#333';
                    }}
                  >
                    {category.name}
                  </a>
                ))}
              </div>

              {/* Right Arrow */}
              {showRightArrow && (
                <IconButton
                  onClick={() => scrollCategories('right')}
                  sx={{
                    position: 'absolute',
                    right: -40,
                    zIndex: 10,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <KeyboardArrowRightIcon />
                </IconButton>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          py: 3,
          px: 2,
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%',
          mt: '80px', 
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Sheet
        component="footer"
        sx={{
          p: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'neutral.200',
          bgcolor: 'background.surface',
          mt: 'auto',
        }}
      >
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          {t('footer.copyright')}
        </Typography>
      </Sheet>
    </Box>
  );
}
