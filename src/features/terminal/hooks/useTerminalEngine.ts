// src/features/terminal/hooks/useTerminalEngine.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettingsStore } from '../../../store/useSettingsStore';

interface UseTerminalEngineProps {
  onOutput: (data: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onUploadAck?: (filename: string) => void;
}

export const useTerminalEngine = (props: UseTerminalEngineProps) => {
  const { engineUrl, engineAuthToken } = useSettingsStore();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Ref-wrap ALL callbacks so socket.onmessage always reads the latest version ──
  // This permanently fixes stale closure bugs without needing useCallback deps.
  const callbacksRef = useRef(props);
  useEffect(() => {
    callbacksRef.current = props;
  });

  const connect = useCallback(() => {
    if (socketRef.current) return;

    try {
      const socket = new WebSocket(engineUrl, undefined, {
        headers: { 'x-auth-token': engineAuthToken }
      });

      socket.onopen = () => {
        setIsConnected(true);
        callbacksRef.current.onConnected?.();
        console.log('[Terminal Engine] Connected');
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'output') {
            callbacksRef.current.onOutput(payload.data);
          } else if (payload.type === 'upload_ack') {
            console.log('[Terminal Engine] Upload acknowledged:', payload.filename);
            callbacksRef.current.onUploadAck?.(payload.filename);
          }
        } catch (e) {
          console.warn('[Terminal Engine] Failed to parse message:', event.data);
        }
      };

      socket.onclose = (e) => {
        setIsConnected(false);
        socketRef.current = null;
        callbacksRef.current.onDisconnected?.();
        console.log('[Terminal Engine] Disconnected');
      };

      socket.onerror = (e: any) => {
        const msg = e.message || JSON.stringify(e);
        callbacksRef.current.onError?.(msg);
        console.error('[Terminal Engine] Error:', msg);
      };

      socketRef.current = socket;
    } catch (err: any) {
      callbacksRef.current.onError?.(err.message);
    }
  }, [engineUrl, engineAuthToken]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const sendInput = useCallback((data: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'input', data }));
    } else {
      console.warn('[Terminal Engine] sendInput called but socket is not open');
    }
  }, []);

  const sendFile = useCallback((filename: string, content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('[Terminal Engine] Uploading file:', filename);
      socketRef.current.send(JSON.stringify({ type: 'upload', filename, content }));
    } else {
      console.warn('[Terminal Engine] sendFile called but socket is not open');
    }
  }, []);

  const sendResize = useCallback((cols: number, rows: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
    }
  }, []);

  return {
    connect,
    disconnect,
    sendInput,
    sendFile,
    sendResize,
    isConnected,
  };
};
