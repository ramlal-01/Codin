import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [hash, pathname]);

  return null;
}

export default ScrollToTop;
