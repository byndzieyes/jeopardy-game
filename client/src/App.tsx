import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { socket } from './socket';
import { getOrCreateUserId } from './utils/user';
import type { Player, Preset } from '@shared/types';
import { JoinForm, type UserRole } from './components/JoinForm';
import { Lobby } from './components/Lobby';

const TOAST_OPTIONS = {
  style: {
    background: '#091048',
    borderColor: 'rgba(254, 198, 114, 0.2)',
    color: '#ffffff',
    fontFamily: 'var(--font-sans)',
    borderRadius: '4px',
    padding: '12px 18px',
    fontSize: '18px',
  },
};

const playSound = (ref: React.RefObject<HTMLAudioElement | null>, path: string) => {
  if (!ref.current) {
    ref.current = new Audio(path);
  }
  ref.current.currentTime = 0;
  ref.current.volume = 0.4;
  ref.current.play().catch((error) => {
    console.warn('Browser blocked autoplay:', error);
  });
};

function App() {
  const [userId] = useState<string>(() => getOrCreateUserId());
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('jeopardy_username') || '';
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (sessionStorage.getItem('jeopardy_role') as UserRole) || 'player';
  });
  const [roomCode, setRoomCode] = useState<string>(() => {
    return sessionStorage.getItem('jeopardy_roomcode') || '';
  });
  const [isInRoom, setIsInRoom] = useState<boolean>(() => {
    const savedRole = sessionStorage.getItem('jeopardy_role');
    const savedCode = sessionStorage.getItem('jeopardy_roomcode');
    const savedName = localStorage.getItem('jeopardy_username');
    return !!(savedRole && savedCode && savedName);
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const prevPlayerCountRef = useRef(-1);
  const joinSoundRef = useRef<HTMLAudioElement | null>(null);
  const leaveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    socket.on('room_created', (generatedCode: string) => {
      setRoomCode(generatedCode);
      setIsInRoom(true);

      sessionStorage.setItem('jeopardy_role', 'host');
      sessionStorage.setItem('jeopardy_roomcode', generatedCode);
    });

    socket.on('room_joined_success', ({ roomCode: serverCode, role: serverRole }) => {
      setIsInRoom(true);
      setRole(serverRole as UserRole);
      setRoomCode(serverCode);

      sessionStorage.setItem('jeopardy_role', serverRole);
      sessionStorage.setItem('jeopardy_roomcode', serverCode);
    });

    socket.on('update_players', (serverPlayers: Player[]) => {
      if (prevPlayerCountRef.current !== -1) {
        if (serverPlayers.length > prevPlayerCountRef.current) {
          playSound(joinSoundRef, '/sounds/join_room.mp3');
        } else if (serverPlayers.length < prevPlayerCountRef.current) {
          playSound(leaveSoundRef, '/sounds/leave_room.mp3');
        }
      }

      prevPlayerCountRef.current = serverPlayers.length;
      setPlayers(serverPlayers);
    });

    socket.on('error_message', (message: string) => {
      toast.error(message);
      sessionStorage.removeItem('jeopardy_role');
      sessionStorage.removeItem('jeopardy_roomcode');

      setIsInRoom(false);
      setRoomCode('');
      setPlayers([]);
      prevPlayerCountRef.current = -1;
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined_success');
      socket.off('update_players');
      socket.off('error_message');
    };
  }, []);

  useEffect(() => {
    const savedRole = sessionStorage.getItem('jeopardy_role');
    const savedCode = sessionStorage.getItem('jeopardy_roomcode');
    const savedName = localStorage.getItem('jeopardy_username');

    if (savedRole && savedCode && savedName) {
      console.log(`Autoreconnect: ${savedCode}`);

      socket.emit('join_room', { id: getOrCreateUserId(), username: savedName, roomCode: savedCode });
    }
  }, []);

  const handleJoinSubmit = (
    submittedName: string,
    submittedRole: UserRole,
    submittedRoomCode: string,
    submittedPreset: Preset,
  ) => {
    setName(submittedName);
    setRole(submittedRole);
    setRoomCode(submittedRoomCode);

    localStorage.setItem('jeopardy_username', submittedName);

    if (submittedRole === 'host') {
      socket.emit('create_room', { id: userId, username: submittedName, preset: submittedPreset });
    } else {
      socket.emit('join_room', { id: userId, username: submittedName, roomCode: submittedRoomCode });
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', { id: userId, username: name, roomCode: roomCode });

    sessionStorage.removeItem('jeopardy_role');
    sessionStorage.removeItem('jeopardy_roomcode');

    setRoomCode('');
    setPlayers([]);
    setIsInRoom(false);
  };

  return (
    <>
      <Toaster theme="dark" position="top-center" toastOptions={TOAST_OPTIONS} />
      {isInRoom ? (
        <Lobby name={name} role={role} roomCode={roomCode} players={players} onLeave={handleLeaveRoom} />
      ) : (
        <JoinForm initialName={name} initialRole={role} initialRoomCode={roomCode} onSubmit={handleJoinSubmit} />
      )}
    </>
  );
}

export default App;
