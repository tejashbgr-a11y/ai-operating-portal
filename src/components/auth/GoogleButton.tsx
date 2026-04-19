import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Props {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  label?: string;
}

export function GoogleButton({ variant = 'default', size = 'sm', className, label = 'Continue with Google' }: Props) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setLoading(false);
      toast({ description: `Sign-in failed: ${error}`, variant: 'destructive' });
    }
    // success path redirects to Google
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handle} disabled={loading}>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.9 29 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.3-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.9 29 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 43c5 0 9.5-1.9 12.9-5l-6-5.1C29.1 34.5 26.7 35 24 35c-5.3 0-9.7-2.9-11.3-7.1l-6.5 5C9.6 39 16.2 43 24 43z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.4 5.4l6 5.1C40.6 35.6 43 30.2 43 24c0-1.2-.1-2.3-.4-3.5z"/>
        </svg>
      )}
      <span>{label}</span>
    </Button>
  );
}
