import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// CinematicIntro is retired — cinematic builder coming separately.
// Route exists but immediately redirects to dashboard.
export default function CinematicIntro() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/', { replace: true }); }, [navigate]);
  return null;
}