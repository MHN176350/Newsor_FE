import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Sheet, IconButton, Avatar, Dropdown, Menu, MenuButton, MenuItem, Chip, Select, Option, Divider, Stack } from '@mui/joy';
import { useColorScheme } from '@mui/joy/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import {
  LocationOn,
  Phone,
  Email,
  Home,
  Info,
  ContactPage,
  Apps,
  ArrowForward,
} from '@mui/icons-material';


export default function Layout({ children }) {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];
  // Language change handler
  const handleLanguageChange = (event, newValue) => {
    console.log('Language change attempted:', { event, newValue, currentLang: i18n.language });
    if (newValue) {
      i18n.changeLanguage(newValue);
    }
  };
  const toggleColorScheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load EvoluSoft CSS files
  useEffect(() => {

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
          <a href="/" className="logo d-flex align-items-center me-auto me-xl-0">
            <h1 className="sitename">
              <img src="/evolusoft/assets/img/company_name.png" alt="EvoluSoft" />
            </h1>
          </a>

          <nav id="navmenu" className="navmenu">
  <ul>
    <li><a href="/#hero" className="active">Home</a></li>
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
        onClick={e => { 
          e.preventDefault(); 
          navigate('/news'); 
          setNewsDropdownOpen(false); // Đóng dropdown sau khi navigate
        }}
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
            zIndex: 9999, // Tăng z-index cao hơn
            padding: '8px 0',
            margin: 0,
            listStyle: 'none'
          }}
          onMouseEnter={() => setNewsDropdownOpen(true)} // Giữ dropdown mở khi hover vào
          onMouseLeave={() => setNewsDropdownOpen(false)} // Đóng khi rời khỏi dropdown
        >
          <li>
            <a
              href="/news"
              onClick={e => { 
                e.preventDefault(); 
                e.stopPropagation(); // Ngăn event bubbling
                navigate('/news'); 
                setNewsDropdownOpen(false); 
              }}
              style={{ 
                display: 'block', 
                padding: '8px 16px', 
                color: '#333', 
                textDecoration: 'none',
                pointerEvents: 'auto' // Đảm bảo có thể click
              }}
            >
             All News
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
                    onClick={e => { 
                      e.preventDefault(); 
                      e.stopPropagation(); // Ngăn event bubbling
                      navigate(`/news?category=${category.slug}`); 
                      setNewsDropdownOpen(false); 
                    }}
                    style={{ 
                      display: 'block', 
                      padding: '8px 16px', 
                      color: '#333', 
                      textDecoration: 'none',
                      pointerEvents: 'auto' // Đảm bảo có thể click
                    }}
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
          <a className="btn-getstarted" href="#about">Get started</a>
        </div>
      </header>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          py: 0,
          px: 0,
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
          p: 4,
          borderTop: '1px solid',
          borderColor: 'neutral.outlinedBorder',
          bgcolor: '#f4f4f9',
          mt: 'auto',
        }}
      >
        <Box className="container" sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
          {/* Company Info */}
          <Box sx={{ flex: 1, minWidth: 250 }} className="col-lg-8 col-md-6 ">
            <Typography level="title-md" fontWeight="bold" sx={{
              color: 'text.primary',
              fontSize: '26px',
            }}>
              EvoluSoft Technology Company Limited
            </Typography>
            <Stack spacing={1} mt={2} sx={{ fontSize: '14px' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography level="body-sm" color='#000000'>
                  <strong>Address: </strong>16, BT4-3, Vinaconex 3 - Trung Van, Nam Tu Liem, Hanoi, Vietnam
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography level="body-sm" color='text.primary' ><strong>Phone: </strong>(024) 73046618</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography level="body-sm" color='text.primary' ><strong>Email: </strong>support@evolusoft.vn</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Box sx={{ minWidth: 180 }}>
            <Typography level="title-sm" fontWeight="md" gutterBottom fontSize={'16px'}>
              Quick Access
            </Typography>
            <Stack spacing={1} fontSize={'14px'}>
              <Link to="/#hero" className="custom-link">Home</Link>
              <Link to="#about" className="custom-link">About Us</Link>
              <Link to="#contact" className="custom-link">Contact</Link>
              <Link to="#services" className="custom-link">Services</Link>
              <Link to="/news" className="custom-link">All News</Link>
            </Stack>
          </Box>

          {/* Core Services */}
          <Box sx={{ minWidth: 200 }}>
            <Typography level="title-sm" fontWeight="md" gutterBottom fontSize={'16px'}>
              Core Services
            </Typography>
            <Stack spacing={1} fontSize={'14px'}>
              <Link to="#services" className="custom-link">
                {t('serviceName1', { defaultValue: 'Database Services' })}
              </Link>
              <Link to="#services" className="custom-link">
                {t('serviceName2', { defaultValue: 'Application Development' })}
              </Link>
              <Link to="#services" className="custom-link">
                {t('serviceName3', { defaultValue: 'System Integration' })}
              </Link>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3, backgroundColor: '#212529' }} />

        {/* Bottom copyright */}
        <Typography level="body-xs" textAlign="center" fontWeight={'normal'} sx={{ color: 'text.primary', fontSize: '14px' }}>
          © {new Date().getFullYear()} <strong>EvoluSoft Technology Company Limited</strong> — All Rights Reserved.
        </Typography>
        {/* Scroll Top */}
        <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
          <i className="bi bi-arrow-up-short"></i>
        </a>
      </Sheet>
    </Box>
  );
}
