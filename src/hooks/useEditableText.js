import { useState, useEffect } from 'react';
import { textConfigService } from '../services/textConfigServiceApi';

// Custom hook for managing editable text content
export const useEditableText = () => {
  const [texts, setTexts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have URL config
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    const hasUrlConfig = !!configParam;
    
    // Load initial texts
    const loadTexts = async () => {
      if (hasUrlConfig) {
        try {
          const decodedConfig = JSON.parse(atob(configParam));
          
          // Save URL config to API service to make it persistent
          await textConfigService.saveTexts(decodedConfig);
          
          setTexts(decodedConfig);
          setLoading(false);
          
          // Clean up URL after saving to API
          setTimeout(() => {
            const url = new URL(window.location);
            url.searchParams.delete('config');
            window.history.replaceState({}, document.title, url.pathname);
          }, 1000);
          
          return;
        } catch (error) {
          // Silently handle URL config errors
        }
      }
      
      // Load from API service
      try {
        const savedTexts = await textConfigService.getTexts();
        setTexts(savedTexts);
        setLoading(false);
      } catch (error) {
        setTexts(textConfigService.defaultTexts);
        setLoading(false);
      }
    };

    loadTexts();

    // Set up polling to check for updates from the config server
    const pollInterval = setInterval(async () => {
      try {
        const latestTexts = await textConfigService.getTexts();
        setTexts(prevTexts => {
          // Only update if texts actually changed to avoid unnecessary re-renders
          if (JSON.stringify(prevTexts) !== JSON.stringify(latestTexts)) {
            return latestTexts;
          }
          return prevTexts;
        });
      } catch (error) {
        // Silently handle polling errors
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Get text by key with fallback
  const getText = (key, fallback = '') => {
    return texts[key] || fallback;
  };

  return {
    texts,
    getText,
    loading,
  };
};

export default useEditableText;
