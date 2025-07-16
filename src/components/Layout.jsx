import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Sheet, IconButton, Avatar, Dropdown, Menu, MenuButton, MenuItem, Chip } from '@mui/joy';
import { useColorScheme } from '@mui/joy/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';
import { useTranslation } from 'react-i18next';


export default function Layout({ children }) {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  const toggleColorScheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.body' }}>
      {/* Custom CSS for styling */}
      <style jsx global>{`
        .dropdown-menu {
          border-radius: 8px !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
        }
        .dropdown-menu li a:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
      
      {/* EvoluSoft Header */}
      <header id="header" className="header d-flex align-items-center fixed-top">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="#hero" className="logo d-flex align-items-center me-auto me-xl-0">
            <h1 className="sitename">
              <img src="/evolusoft/assets/img/company_name.png" alt="EvoluSoft" />
            </h1>
          </a>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li><a href="/" className="active">Home</a></li>
              <li><a href="#about">About us</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
              {/* News Dropdown */}
              <li 
                className="dropdown"
                style={{ position: 'relative' }}
                onMouseEnter={() => setNewsDropdownOpen(true)}
                onMouseLeave={() => setNewsDropdownOpen(false)}
              >
                <a 
                  href="/news"
                  onClick={e => { e.preventDefault(); navigate('/news'); }}
                  style={{ cursor: 'pointer' }}
                >
                  All News <span style={{fontSize: '0.8em'}}>▼</span>
                </a>
                {newsDropdownOpen && (
                  <ul 
                    className="dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      minWidth: '180px',
                      zIndex: 1000,
                      padding: '8px 0',
                      margin: 0,
                      listStyle: 'none'
                    }}
                  >
                    <li>
                      <a
                        href="/news"
                        onClick={e => { e.preventDefault(); navigate('/news'); setNewsDropdownOpen(false); }}
                        style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}
                      >
                        🗞️ All News
                      </a>
                    </li>
                    {categories.length > 0 && (
                      <>
                        <li style={{ fontWeight: 'bold', fontSize: '0.85em', padding: '4px 16px', color: '#888' }}>
                          All Categories
                        </li>
                        {categories.map(category => (
                          <li key={category.id}>
                            <a
                              href={`/news?category=${category.slug}`}
                              onClick={e => { e.preventDefault(); navigate(`/news?category=${category.slug}`); setNewsDropdownOpen(false); }}
                              style={{ display: 'block', padding: '8px 16px', color: '#333', textDecoration: 'none' }}
                            >
                              {category.name}
                            </a>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                )}
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>

          <a className="btn-getstarted" href="#about">Get started</a>
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
          // Add top margin to account for fixed header
          mt: '80px', // Adjust this value based on your header height
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
