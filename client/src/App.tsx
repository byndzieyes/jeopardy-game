import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { socket } from './socket';
import { getOrCreateUserId } from './utils/user';
import type { Player } from '@shared/types';
import { JoinForm, type UserRole } from './components/JoinForm';
import { Lobby } from './components/Lobby';

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
  const prevPlayerCountRef = useRef(0);
  const joinSoundRef = useRef<HTMLAudioElement | null>(null);
  const leaveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    socket.on('room_created', (generatedCode: string) => {
      setRoomCode(generatedCode);
      setIsInRoom(true);

      sessionStorage.setItem('jeopardy_role', 'host');
      sessionStorage.setItem('jeopardy_roomcode', generatedCode);
    });

    socket.on('room_joined_success', ({ isActive, roomCode: serverCode, role: serverRole }) => {
      console.log(`Successfully joined room ${serverCode} as ${serverRole}. Game active: ${isActive}`);

      setIsInRoom(true);

      sessionStorage.setItem('jeopardy_role', serverRole);
      sessionStorage.setItem('jeopardy_roomcode', serverCode);

      if (isActive) {
        // setIsGameStarted(true);
      }
    });

    socket.on('update_players', (serverPlayers: Player[]) => {
      console.log('Updated player list:', serverPlayers);
      console.log(`prev: ${prevPlayerCountRef.current}, new: ${serverPlayers.length}`);

      if (serverPlayers.length > prevPlayerCountRef.current) {
        if (!joinSoundRef.current) {
          joinSoundRef.current = new Audio('/sounds/join_room.mp3');
        }
        joinSoundRef.current.currentTime = 0;
        joinSoundRef.current.volume = 0.4;
        joinSoundRef.current.play().catch((error) => {
          console.warn('Browser blocked autoplay:', error);
        });
      } else if (serverPlayers.length < prevPlayerCountRef.current && prevPlayerCountRef.current > 0) {
        if (!leaveSoundRef.current) {
          leaveSoundRef.current = new Audio('/sounds/leave_room.mp3');
        }
        leaveSoundRef.current.currentTime = 0;
        leaveSoundRef.current.volume = 0.4;
        leaveSoundRef.current.play().catch((error) => {
          console.warn('Browser blocked autoplay:', error);
        });
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
      prevPlayerCountRef.current = 0;
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

  const handleJoinSubmit = (submittedName: string, submittedRole: UserRole, submittedRoomCode: string) => {
    setName(submittedName);
    setRole(submittedRole);
    setRoomCode(submittedRoomCode);

    localStorage.setItem('jeopardy_username', submittedName);

    if (submittedRole === 'host') {
      socket.emit('create_room', { id: userId, username: submittedName });
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
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: '#091048',
            borderColor: 'rgba(254, 198, 114, 0.2)',
            color: '#ffffff',
            fontFamily: 'var(--font-sans)',
            borderRadius: '4px',
            padding: '16px 20px',
            fontSize: '18px',
          },
        }}
      />
      {isInRoom ? (
        <Lobby name={name} role={role} roomCode={roomCode} players={players} onLeave={handleLeaveRoom} />
      ) : (
        <JoinForm initialName={name} initialRole={role} initialRoomCode={roomCode} onSubmit={handleJoinSubmit} />
      )}
    </>
  );
}

export default App;
