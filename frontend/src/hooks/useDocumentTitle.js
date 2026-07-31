import { useEffect } from 'react';

/**
 * Sets the document title with the TalentLense brand suffix.
 * @param {string} title - The page-specific title
 * @param {boolean} [includeBrand=true] - Whether to append " | TalentLense"
 */
const useDocumentTitle = (title, includeBrand = true) => {
  useEffect(() => {
    document.title = includeBrand ? `${title} | TalentLense` : title;
  }, [title, includeBrand]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useDocumentTitle;
