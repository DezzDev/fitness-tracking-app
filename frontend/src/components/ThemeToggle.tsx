import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${nextTheme === 'dark' ? 'oscuro' : 'claro'}`}
      title={`Tema actual: ${theme === 'dark' ? 'oscuro' : 'claro'}`}
      className="rounded-lg"
    >
      {theme === 'dark' ? (
        <Sun className="size-5 text-muted-foreground" />
      ) : (
        <Moon className="size-5 text-muted-foreground" />
      )}
    </Button>
  );
}
