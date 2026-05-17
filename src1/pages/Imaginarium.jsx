import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ImaginariumDoor from '@/components/imaginarium/ImaginariumDoor';
import ImaginariumRoom from '@/components/imaginarium/ImaginariumRoom';

export default function Imaginarium() {
  const [phase, setPhase] = useState('door'); // door | opening | room
  const [isOutOfService, setIsOutOfService] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const handleEnterDoor = () => {
    setPhase('opening');
    setTimeout(() => setPhase('room'), 2000);
  };

  if (phase === 'door' || phase === 'opening') {
    return (
      <ImaginariumDoor
        phase={phase}
        isOutOfService={isOutOfService}
        onEnter={handleEnterDoor}
        onBack={() => window.history.back()}
      />
    );
  }

  return (
    <ImaginariumRoom
      user={user}
      onExit={() => setPhase('door')}
    />
  );
}