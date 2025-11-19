export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'system';
              const root = document.documentElement;
              root.classList.remove('light', 'dark');
              if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
              } else {
                root.classList.add(theme);
              }
              
              // Sistem teması değişikliklerini dinle
              window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                const currentTheme = localStorage.getItem('theme') || 'system';
                if (currentTheme === 'system') {
                  root.classList.remove('light', 'dark');
                  root.classList.add(e.matches ? 'dark' : 'light');
                }
              });
            } catch (e) {
              // localStorage erişilemezse varsayılan olarak light kullan
              document.documentElement.classList.add('light');
            }
          })();
        `,
      }}
    />
  )
}
