import { useSignalRContext } from '../context/SignalRContext';

export const useSignalR = () => {
  const { connectionState, lastEvent } = useSignalRContext();

  return {
    connectionState,
    isConnected: connectionState === 'Connected',
    isReconnecting: connectionState === 'Reconnecting',
    isDisconnected: connectionState === 'Disconnected',
    lastEvent,
  };
};

export default useSignalR;
