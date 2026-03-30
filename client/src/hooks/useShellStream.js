import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useShellStream Hook
 * 處理與後端 /api/run-stream 的 SSE 連線，提供即時輸出與執行狀態管理。
 */
export default function useShellStream() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [exitInfo, setExitInfo] = useState(null);
  const eventSourceRef = useRef(null);

  // 停止執行
  const stop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setRunning(false);
      setLogs(prev => [...prev, { type: 'stderr', text: '🛑 已手動中止' }]);
    }
  }, []);

  // 清除日誌
  const clear = useCallback(() => {
    setLogs([]);
    setExitInfo(null);
  }, []);

  // 執行腳本
  const run = useCallback((script, argsString = '') => {
    if (!script || running) return;

    setRunning(true);
    setLogs([]);
    setExitInfo(null);

    const params = new URLSearchParams({ script, args: argsString });
    const url = `/api/run-stream?${params.toString()}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = event => {
      if (event.data === '[DONE]') {
        es.close();
        setRunning(false);
        return;
      }

      try {
        const { type, data } = JSON.parse(event.data);

        if (type === 'exit') {
          setExitInfo(data);
        } else {
          setLogs(prev => [
            ...prev,
            { type, text: typeof data === 'string' ? data : JSON.stringify(data) },
          ]);
        }
      } catch {
        // 忽略解析錯誤
      }
    };

    es.onerror = () => {
      es.close();
      setRunning(false);
      setLogs(prev => [...prev, { type: 'error', text: '⚠️ 連線中斷' }]);
    };
  }, [running]);

  // 元件卸載時自動關閉連線
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    logs,
    running,
    exitInfo,
    run,
    stop,
    clear,
  };
}
