//frontend/src/hooks/useSocket.js
import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * Returns the socket ref.
 * Usage: const socketRef = useSocket();
 *        socketRef.current?.emit('event', data);
 */
const useSocketHook = () => useContext(SocketContext);

export default useSocketHook;