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

<<<<<<< HEAD
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
=======
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.username?.charAt(0)?.toUpperCase() || 'U';
  };
  const FilteredBox = ({ ownerState, ...rest }) => <Box {...rest} />;
>>>>>>> e1c724d6bf48ba5b1c9334f8b1ac14a61955f3ea

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.body' }}>
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
<<<<<<< HEAD
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
=======
                  🪶 {t('navigation.myArticles')}
                </Button>
              )}
              
              {/* Managers can review articles */}
              {['manager', 'admin'].includes(user?.profile?.role?.toLowerCase()) && (
                <Button
                  variant="soft"
                  component={Link}
                  to="/review"
                  sx={{ 
                    color: 'warning.600',
                    bgcolor: 'warning.100',
                    '&:hover': { bgcolor: 'warning.200' }
                  }}
                >
                  🔖 {t('navigation.reviewArticles')}
                </Button>
              )}
              
              {/* Additional navigation for authenticated users */}
              {/* <Button
                variant="plain"
                component={Link}
                to="/profile"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
                }}
              >
                {t('navigation.profile')}
              </Button> */}
              {user?.profile?.role?.toLowerCase() === 'admin' && (
                <Button
                  variant="plain"
                  component={Link}
                  to="/admin"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
                  }}
                >
                  {t('navigation.adminDashboard')}
                </Button>
              )}
            </>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          {/* <IconButton
            onClick={toggleColorScheme}
            sx={{ 
              borderRadius: '50%',
              bgcolor: 'neutral.100',
              '&:hover': { bgcolor: 'neutral.200' }
            }}
          >
            {mode === 'dark' ? '☀️' : '🌑'}
          </IconButton> */}

          {/* Auth Section */}
          {isAuthenticated ? (
            /* User Profile Dropdown */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notification Bell - only for managers and admins */}
              {user?.profile?.role && ['manager', 'admin', 'writer'].includes(user.profile.role.toLowerCase()) && (
                <NotificationBell />
              )}
              
              {/* User Role Badge */}
              {user?.profile?.role && (
                <Chip
                  size="sm"
                  variant="soft"
                  color={
                    user.profile.role.toLowerCase() === 'admin' ? 'danger' :
                    user.profile.role.toLowerCase() === 'manager' ? 'warning' :
                    user.profile.role.toLowerCase() === 'writer' ? 'success' : 'neutral'
                  }
                >
                  {user.profile.role.charAt(0).toUpperCase() + user.profile.role.slice(1).toLowerCase()}
                </Chip>
              )}
              
              <Dropdown>
                <MenuButton
                  slots={{ root: FilteredBox }}
                  slotProps={{
                    root: {
                      sx: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 'sm',
                        '&:hover': { bgcolor: 'neutral.100' }
                      }
                    }
                  }}
                >
                  <Avatar
                    size="sm"
                    src={processImageUrlForDisplay(user?.profile?.avatarUrl)}
                    sx={{ 
                      bgcolor: 'primary.500',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                    onError={(e) => {
                      console.log('Avatar load error, falling back to initials:', e.target.src);
                      e.target.style.display = 'none'; // This will show the initials
>>>>>>> e1c724d6bf48ba5b1c9334f8b1ac14a61955f3ea
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
