import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';

export function NotFoundScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <Icon name="info" className="h-8 w-8 text-icon-muted" />
      <h1 className="text-h1 text-text-primary">Page not found</h1>
      <p className="text-body text-text-secondary">The screen you're looking for doesn't exist in the TBOS registry.</p>
      <Link to="/" className="text-body text-text-link underline">
        Go back home
      </Link>
    </div>
  );
}
