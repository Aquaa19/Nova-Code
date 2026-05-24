// src/features/terminal/hooks/useTerminalEngine.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { useProjectStore } from '../../../store/useProjectStore';

interface UseTerminalEngineProps {
  onOutput: (data: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  onUploadAck?: (filename: string) => void;
}

export const useTerminalEngine = (props: UseTerminalEngineProps) => {
  const { engineUrl, engineAuthToken, localUserId } = useSettingsStore();
  const { sessionId, setSessionId } = useTerminalStore();
  const { currentProject } = useProjectStore();
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const callbacksRef = useRef(props);
  useEffect(() => {
    callbacksRef.current = props;
  });

  const connect = useCallback(async () => {
    if (socketRef.current) return;

    try {
      let activeSessionId = useTerminalStore.getState().sessionId;
      const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');

      // 1. If no session exists, provision a new one via HTTP
      if (!activeSessionId) {
        const res = await fetch(`${httpUrl}/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': engineAuthToken,
            'x-user-id': localUserId
          }
        });
        if (!res.ok) throw new Error('Failed to start execution container');
        const data = await res.json();
        activeSessionId = data.sessionId;
        setSessionId(activeSessionId);
      }

      // 2. Open WebSocket connection
      const projectParam = currentProject ? `&project=${encodeURIComponent(currentProject.name)}` : '';
      const wsUrl = `${engineUrl}/sessions/${activeSessionId}/terminal?token=${engineAuthToken}&localUserId=${localUserId}${projectParam}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        callbacksRef.current.onConnected?.();
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'output') {
            callbacksRef.current.onOutput(payload.data);
            if (payload.data && payload.data.includes('Session invalid or unauthorized.')) {
              setSessionId(null);
            }
          }
        } catch (e) {}
      };

      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        callbacksRef.current.onDisconnected?.();
      };

      socket.onerror = (e: any) => {
        const msg = e.message || JSON.stringify(e);
        callbacksRef.current.onError?.(msg);
      };

    } catch (err: any) {
      callbacksRef.current.onError?.(err.message);
    }
  }, [engineUrl, engineAuthToken, localUserId, setSessionId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const sendInput = useCallback((data: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'input', data }));
    }
  }, []);

  const sendFile = useCallback((filename: string, content: string) => {
    const activeSessionId = useTerminalStore.getState().sessionId;
    if (!activeSessionId) {
      callbacksRef.current.onError?.('No active sandbox session available');
      return;
    }

    const httpUrl = engineUrl.replace('ws://', 'http://').replace('wss://', 'https://');

    fetch(`${httpUrl}/sessions/${activeSessionId}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': engineAuthToken,
        'x-user-id': localUserId
      },
      body: JSON.stringify({ filename, content })
    })
    .then(async (res) => {
      if (res.ok) {
        callbacksRef.current.onUploadAck?.(filename);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'Session not found' || res.status === 404) {
          useTerminalStore.getState().setSessionId(null);
        }
        callbacksRef.current.onError?.(errData.error || `Upload failed: ${res.status}`);
      }
    })
    .catch((err) => {
      callbacksRef.current.onError?.(`Upload error: ${err.message}`);
    });
  }, [engineUrl, engineAuthToken]);

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
