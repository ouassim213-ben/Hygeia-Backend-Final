import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's no hash, scroll to top instantly on route change
    if (!hash) {
      window.scrollTo(0, 0);
    } 
    // If there is a hash (e.g. #services), the Home.jsx useEffect will handle the smooth scroll
  }, [pathname, hash]);

  return null;
}
