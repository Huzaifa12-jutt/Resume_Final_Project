import { useEffect } from 'react';

/**
 * Sets the document title with the TEEROP brand suffix.
 * @param {string} title - The page-specific title
 * @param {boolean} [includeBrand=true] - Whether to append " | TEEROP"
 */
const useDocumentTitle = (title, includeBrand = true) => {
  useEffect(() => {
    document.title = includeBrand ? `${title} | TEEROP` : title;
  }, [title, includeBrand]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDocumentTitle;
