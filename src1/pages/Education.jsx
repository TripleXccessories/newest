import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Education now lives inside Academy Hub — redirect seamlessly
export default function Education() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/academy-hub', { replace: true });
  }, [navigate]);
  return null;
}