// @ts-check

// Loaded blocking in <head> so the theme class is set before first paint.
(function () {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if ((saved ?? (prefersDark ? 'dark' : 'light')) === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {
    /* localStorage may be blocked; stay on light */
  }
})();
