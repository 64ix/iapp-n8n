import { useState, useEffect } from 'react';
import { Page } from '../types';

export const usePageState = () => {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');

  // Initialize page from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page') as Page;
    
    if (pageParam && ['welcome', 'protect', 'view', 'workflow-details'].includes(pageParam)) {
      setCurrentPage(pageParam);
    } else {
      // Set default page and update URL
      updatePageInURL('welcome');
    }
  }, []);

  // Update URL when page changes
  const updatePageInURL = (page: Page) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url.toString());
  };

  // Navigate to page and update URL
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    updatePageInURL(page);
  };

  return {
    currentPage,
    navigateTo
  };
}; 