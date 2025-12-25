import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- Styles ---
const styles = {
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  sidebar: (isOpen: boolean) => ({
    width: isOpen ? '320px' : '0px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: isOpen ? '1px solid var(--border-color)' : 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: isOpen ? '20px' : '0px',
    flexShrink: 0,
    zIndex: 10,
    transition: 'all 0.3s ease',
    overflowY: 'auto' as const,
    opacity: isOpen ? 1 : 0,
    whiteSpace: 'nowrap' as const,
  }),
  brand: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: 'var(--accent-color)',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  apiKeyContainer: {
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
  },
  configContainer: {
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
  },
  keyItem: {
    backgroundColor: 'var(--bg-dark)',
    padding: '8px',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '0.8rem',
    border: '1px solid var(--border-color)',
  },
  keyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  statusDot: (status: ApiKeyData['status']) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: status === 'valid' ? 'var(--success)' : status === 'quota' ? 'var(--danger)' : status === 'invalid' ? 'var(--danger)' : '#888',
    display: 'inline-block',
    marginRight: '6px',
    flexShrink: 0,
  }),
  quotaBarBg: {
    width: '100%',
    height: '4px',
    backgroundColor: '#333',
    borderRadius: '2px',
    marginTop: '4px',
    overflow: 'hidden',
  },
  navItem: (active: boolean) => ({
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    backgroundColor: active ? 'var(--bg-panel)' : 'transparent',
    fontWeight: active ? 'bold' : 'normal',
    borderLeft: active ? '4px solid var(--accent-color)' : '4px solid transparent',
    transition: 'all 0.2s',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative' as const,
    backgroundColor: 'var(--bg-dark)',
  },
  searchContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    height: '100%',
    overflowY: 'auto' as const,
  },
  panel: {
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    flexShrink: 0,
  },
  logContainer: {
    flex: 1,
    minHeight: '150px',
    backgroundColor: '#000',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px',
    overflowY: 'auto' as const,
    fontFamily: "'Consolas', monospace",
    fontSize: '0.85rem',
    lineHeight: '1.4',
  },
  resultsContainer: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    marginBottom: '0px',
    overflowX: 'auto' as const,
    paddingBottom: '5px',
    borderBottom: '1px solid var(--border-color)',
  },
  tab: (active: boolean) => ({
    padding: '10px 16px',
    paddingRight: '28px',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    backgroundColor: active ? 'var(--bg-panel)' : '#222',
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    border: active ? '1px solid var(--border-color)' : '1px solid transparent',
    borderBottom: active ? '1px solid var(--bg-panel)' : '1px solid var(--border-color)',
    marginBottom: '-1px',
    fontWeight: active ? 'bold' : 'normal',
    fontSize: '0.85rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    minWidth: '150px',
    position: 'relative' as const,
    userSelect: 'none' as const,
  }),
  tabCloseBtn: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: '#aaa',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: 1,
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '0 0 8px 8px',
    border: '1px solid var(--border-color)',
    borderTop: 'none',
    position: 'relative' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
    minWidth: '1200px',
  },
  th: (isSortable: boolean) => ({
    backgroundColor: 'var(--table-header)',
    color: 'var(--text-main)',
    padding: '12px',
    textAlign: 'left' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 5,
    fontWeight: 600,
    cursor: isSortable ? 'pointer' : 'default',
    userSelect: 'none' as const,
    borderBottom: '2px solid var(--border-color)',
    transition: 'background 0.2s',
  }),
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle',
    borderBottom: '1px solid var(--border-color)',
  },
  thumbnail: {
    width: '80px',
    height: '45px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
  },
  toggleButton: {
    position: 'absolute' as const,
    top: '15px',
    left: '15px',
    zIndex: 20,
    padding: '8px',
    backgroundColor: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-main)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
};

// --- Types ---
interface VideoResult {
  id: string;
  thumbnail: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  viewsPerHour: number;
  likeCount: number;
  subscriberCount: number;
  viewSubRatio: number;
  duration: string;
  durationSec: number;
  publishedAt: string;
  link: string;
}

interface LogEntry {
  message: string;
  type: 'info' | 'error' | 'success' | 'warn';
  time: string;
}

interface ApiKeyData {
  key: string;
  status: 'idle' | 'valid' | 'invalid' | 'quota';
  quotaUsed: number;
}

interface SearchHistoryItem {
    id: number;
    timestamp: string;
    keywordSummary: string;
    totalResults: number;
    data: VideoResult[];
}

interface AppConfig {
    apiKeys: ApiKeyData[];
    keywordInput: string;
    channelInput: string;
    searchHistory: SearchHistoryItem[];
    relatedHistory: SearchHistoryItem[];
    filters: {
        days: number;
        duration: string;
        minDurationMin: number | '';
        maxDurationMin: number | '';
        minViews: number;
        minViewsPerHour: number;
        regionCode: string;
        lang: string;
    }
}

type ViewMode = 'search' | 'results' | 'related';
type SearchMode = 'keyword' | 'channel';

const QUOTA_LIMIT = 10000;

// --- Main App Component ---
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  
  const apiKeysRef = useRef<ApiKeyData[]>([]);
  useEffect(() => {
    apiKeysRef.current = apiKeys;
    localStorage.setItem('yt_api_keys_v2', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const [keywordInput, setKeywordInput] = useState('');
  const [channelInput, setChannelInput] = useState('');
  
  // Results for normal search
  const [results, setResults] = useState<VideoResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);

  // Results for "Related Videos" search
  const [relatedResults, setRelatedResults] = useState<VideoResult[]>([]);
  const [relatedHistory, setRelatedHistory] = useState<SearchHistoryItem[]>([]);
  const [activeRelatedId, setActiveRelatedId] = useState<number | null>(null);

  // Sorting State
  const [sortCol, setSortCol] = useState<keyof VideoResult>('viewCount');
  const [sortAsc, setSortAsc] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [days, setDays] = useState(10);
  const [duration, setDuration] = useState('long'); 
  const [minDurationMin, setMinDurationMin] = useState<number | ''>(60);
  const [maxDurationMin, setMaxDurationMin] = useState<number | ''>('');
  const [minViews, setMinViews] = useState(20000);
  const [minViewsPerHour, setMinViewsPerHour] = useState(600);
  const [regionCode, setRegionCode] = useState('KR');
  const [lang, setLang] = useState('ko');

  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Initial Data
  useEffect(() => {
    const savedKeys = localStorage.getItem('yt_api_keys_v2');
    if (savedKeys) {
        try { 
          const parsed = JSON.parse(savedKeys);
          setApiKeys(parsed);
          apiKeysRef.current = parsed;
        } catch(e) {}
    }

    const savedKeyword = localStorage.getItem('yt_input_keyword');
    const savedChannel = localStorage.getItem('yt_input_channel');
    if (savedKeyword !== null) setKeywordInput(savedKeyword);
    if (savedChannel !== null) setChannelInput(savedChannel);

    const savedHistory = localStorage.getItem('yt_search_history');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            setSearchHistory(parsed);
            if (parsed.length > 0) {
                setActiveHistoryId(parsed[0].id);
                setResults(parsed[0].data);
            }
        } catch(e) {}
    }

    const savedRelatedHistory = localStorage.getItem('yt_related_history');
    if (savedRelatedHistory) {
        try {
            const parsed = JSON.parse(savedRelatedHistory);
            setRelatedHistory(parsed);
            if (parsed.length > 0) {
                setActiveRelatedId(parsed[0].id);
                setRelatedResults(parsed[0].data);
            }
        } catch(e) {}
    }

    addLog('시스템 준비 완료. API 키 사용량을 수동으로 관리하세요.', 'info');
  }, []);

  // Persistence
  useEffect(() => { localStorage.setItem('yt_input_keyword', keywordInput); }, [keywordInput]);
  useEffect(() => { localStorage.setItem('yt_input_channel', channelInput); }, [channelInput]);
  useEffect(() => { localStorage.setItem('yt_search_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('yt_related_history', JSON.stringify(relatedHistory)); }, [relatedHistory]);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs, currentView]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { message, type, time }]);
  };

  const handleClear = () => {
    if (currentView === 'results') {
        setResults([]);
        setActiveHistoryId(null);
    } else if (currentView === 'related') {
        setRelatedResults([]);
        setActiveRelatedId(null);
    }
    addLog('현재 화면의 결과 뷰가 초기화되었습니다.', 'info');
  };

  const handleAddKey = () => {
      const keys = newKeyInput.split(/[ ,;\n]+/).map(k => k.trim()).filter(Boolean);
      if (keys.length === 0) return;
      setApiKeys(prev => {
          const existing = new Set(prev.map(p => p.key));
          const filtered = keys.filter(k => !existing.has(k)).map(k => ({ key: k, status: 'idle' as const, quotaUsed: 0 }));
          return [...prev, ...filtered];
      });
      setNewKeyInput('');
      addLog(`${keys.length}개의 키가 목록에 추가되었습니다.`, 'success');
  };

  const handleDeleteKey = (key: string) => { setApiKeys(prev => prev.filter(k => k.key !== key)); };

  const handleManualResetQuota = () => {
    if (!confirm('모든 API 키의 사용량을 즉시 0%로 초기화하시겠습니까?')) return;
    const resetKeys: ApiKeyData[] = apiKeys.map(k => ({ ...k, quotaUsed: 0, status: 'idle' }));
    setApiKeys(resetKeys);
    apiKeysRef.current = resetKeys;
    addLog('모든 API 키의 사용량이 0%로 초기화되었습니다.', 'success');
  };

  const updateKeyStatus = (index: number, status: ApiKeyData['status']) => {
      setApiKeys(prev => {
          const clone = [...prev];
          clone[index] = { ...clone[index], status };
          return clone;
      });
  };

  const updateKeyQuota = (index: number, cost: number) => {
      setApiKeys(prev => {
          const clone = [...prev];
          clone[index] = { ...clone[index], quotaUsed: clone[index].quotaUsed + cost };
          return clone;
      });
  };

  const handleExportConfig = () => {
    const config: AppConfig = {
        apiKeys,
        keywordInput,
        channelInput,
        searchHistory,
        relatedHistory,
        filters: { days, duration, minDurationMin, maxDurationMin, minViews, minViewsPerHour, regionCode, lang }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `yt_full_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    addLog('데이터 백업 완료', 'success');
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target?.result as string) as AppConfig;
            if (config.apiKeys) setApiKeys(config.apiKeys);
            if (config.keywordInput !== undefined) setKeywordInput(config.keywordInput);
            if (config.channelInput !== undefined) setChannelInput(config.channelInput);
            if (config.searchHistory) {
                setSearchHistory(config.searchHistory);
                if (config.searchHistory.length > 0) {
                    setActiveHistoryId(config.searchHistory[0].id);
                    setResults(config.searchHistory[0].data);
                }
            }
            if (config.relatedHistory) {
                setRelatedHistory(config.relatedHistory);
                if (config.relatedHistory.length > 0) {
                    setActiveRelatedId(config.relatedHistory[0].id);
                    setRelatedResults(config.relatedHistory[0].data);
                }
            }
            if (config.filters) {
                setDays(config.filters.days); setDuration(config.filters.duration);
                setMinDurationMin(config.filters.minDurationMin); setMaxDurationMin(config.filters.maxDurationMin);
                setMinViews(config.filters.minViews); setMinViewsPerHour(config.filters.minViewsPerHour);
                setRegionCode(config.filters.regionCode); setLang(config.filters.lang);
            }
            addLog('백업 데이터 복원 성공.', 'success');
        } catch (err) { addLog('잘못된 백업 파일입니다.', 'error'); }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const apiCall = async (endpoint: string, params: Record<string, any>): Promise<any> => {
      let triedCount = 0;
      const execute = async (startIndex: number): Promise<any> => {
          const currentKeys = apiKeysRef.current;
          if (triedCount >= currentKeys.length) throw new Error("가용한 API 키가 없습니다. 초기화가 필요합니다.");
          let currentIndex = -1;
          for (let i = 0; i < currentKeys.length; i++) {
              const idx = (startIndex + i) % currentKeys.length;
              if (currentKeys[idx].status !== 'quota' && currentKeys[idx].status !== 'invalid') {
                  currentIndex = idx;
                  break;
              }
          }
          if (currentIndex === -1) throw new Error("사용 가능한 키가 없습니다. 모든 키의 할당량이 초과되었습니다.");
          const activeKey = currentKeys[currentIndex];
          const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
          url.searchParams.append('key', activeKey.key);
          Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));
          const response = await fetch(url.toString());
          if (!response.ok) {
              let errorData: any = {};
              try { errorData = await response.json(); } catch(e) {}
              const message = errorData.error?.message || response.statusText;
              if (response.status === 403 && (message.includes('quota') || message.includes('Rate Limit'))) {
                  addLog(`[키 전환] ${activeKey.key.substring(0,5)}... 할당량 소진.`, 'warn');
                  updateKeyStatus(currentIndex, 'quota');
                  triedCount++;
                  return execute(currentIndex + 1); 
              }
              throw new Error(message);
          }
          const cost = endpoint === 'search' ? 100 : 1;
          updateKeyQuota(currentIndex, cost);
          if (activeKey.status === 'idle') updateKeyStatus(currentIndex, 'valid');
          return response.json();
      };
      return execute(0);
  };

  const processData = (videos: any[], channelMap: Record<string, any>, isRelatedMode = false): VideoResult[] => {
    const now = new Date();
    return videos.map(v => {
      const stats = v.statistics || {};
      const viewCount = parseInt(stats.viewCount) || 0;
      
      // '연관 동영상 찾기'에서는 모든 성능 필터를 해제하여 유튜브 검색과 동일한 결과를 보장
      if (!isRelatedMode) {
          if (viewCount < minViews) return null;
      }

      const publishedAt = new Date(v.snippet.publishedAt);
      const hoursSince = Math.max(0.1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
      const viewsPerHour = viewCount / hoursSince;
      
      if (!isRelatedMode) {
          if (viewsPerHour < minViewsPerHour) return null;
      }

      const channelStats = channelMap[v.snippet.channelId] || {};
      const subscriberCount = parseInt(channelStats.subscriberCount) || 0;
      const viewSubRatio = subscriberCount > 0 ? (viewCount / subscriberCount) * 100 : 0;
      const durMatch = (v.contentDetails.duration || '').match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      let durationStr = "00:00";
      let durationSec = 0;
      if (durMatch) {
         const h = parseInt(durMatch[1] || '0'), m = parseInt(durMatch[2] || '0'), s = parseInt(durMatch[3] || '0');
         durationSec = h * 3600 + m * 60 + s;
         durationStr = `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      
      if (!isRelatedMode) {
          if (minDurationMin !== '' && durationSec < Number(minDurationMin) * 60) return null;
          if (maxDurationMin !== '' && durationSec > Number(maxDurationMin) * 60) return null;
      }

      return {
        id: v.id, thumbnail: v.snippet.thumbnails.medium?.url, title: v.snippet.title,
        channelTitle: v.snippet.channelTitle, viewCount, viewsPerHour,
        likeCount: parseInt(stats.likeCount) || 0, subscriberCount, viewSubRatio,
        duration: durationStr, durationSec, publishedAt: v.snippet.publishedAt,
        link: `https://www.youtube.com/watch?v=${v.id}`
      } as VideoResult;
    }).filter((item): item is VideoResult => item !== null);
  };

  const handleStart = async () => {
    if (apiKeys.length === 0) { alert('API Key를 먼저 등록하세요.'); return; }
    const hasAvailableKey = apiKeysRef.current.some(k => k.status !== 'quota' && k.status !== 'invalid');
    if (!hasAvailableKey) { alert('모든 API 키의 할당량이 초과되었습니다. "모든 사용량 초기화"를 눌러주세요.'); return; }
    const currentInputText = searchMode === 'keyword' ? keywordInput : channelInput;
    const inputs = currentInputText.split('\n').map(s => s.trim()).filter(Boolean);
    if (inputs.length === 0) { alert('검색 내용을 입력하세요.'); return; }
    setResults([]); 
    setActiveHistoryId(null); 
    setLoading(true); 
    setCurrentView('search');
    addLog('[시작] 데이터 수집을 시작합니다.', 'info');
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);
    const publishedAfterISO = publishedAfter.toISOString();
    let sessionResults: VideoResult[] = [];
    try {
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        let detectedChannelTitle = '';
        const prefix = `[${i+1}/${inputs.length}] '${input}'`;
        let videoIds: string[] = [];
        try {
            if (searchMode === 'keyword') {
              const data = await apiCall('search', { part: 'snippet', q: input, type: 'video', maxResults: 50, publishedAfter: publishedAfterISO, order: 'viewCount', regionCode, relevanceLanguage: lang, videoDuration: duration !== 'any' ? duration : undefined });
              videoIds = data.items.map((item: any) => item.id.videoId);
            } else {
              const cData = await apiCall('search', { part: 'snippet', q: input, type: 'channel', maxResults: 1 });
              const channelId = cData.items[0]?.snippet?.channelId;
              detectedChannelTitle = cData.items[0]?.snippet?.title || '';
              if (channelId) {
                 const vData = await apiCall('search', { part: 'snippet', channelId, type: 'video', maxResults: 50, publishedAfter: publishedAfterISO, order: 'date', videoDuration: duration !== 'any' ? duration : undefined });
                 videoIds = vData.items.map((item: any) => item.id.videoId);
              }
            }
            if (videoIds.length > 0) {
              const vData = await apiCall('videos', { part: 'snippet,statistics,contentDetails', id: videoIds.join(',') });
              const videos = vData.items;
              const channelIds = [...new Set(videos.map((v: any) => v.snippet.channelId))];
              const cRes = await apiCall('channels', { part: 'statistics', id: channelIds.join(',') });
              const channelMap: Record<string, any> = {};
              cRes.items.forEach((c: any) => channelMap[c.id] = c.statistics);
              const processed = processData(videos, channelMap);
              sessionResults = [...sessionResults, ...processed];
              setResults([...sessionResults]);
              addLog(`${prefix}${detectedChannelTitle ? ` [${detectedChannelTitle}]` : ''} - 분석 완료 (${processed.length}개 유효)`, 'success');
            } else { addLog(`${prefix} - 검색 결과가 없습니다.`, 'warn'); }
        } catch (innerE: any) { 
            addLog(`${prefix} - 오류: ${innerE.message}`, 'error');
            if (innerE.message.includes("가용한 API 키가 없습니다")) throw innerE;
        }
        await new Promise(r => setTimeout(r, 100));
      }
      addLog(`[성공] 총 ${sessionResults.length}개의 데이터가 수집되었습니다.`, 'success');
    } catch (e: any) { addLog(`중단: ${e.message}`, 'error'); } finally {
      setLoading(false);
      if (sessionResults.length > 0) {
          const timestamp = new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\. /g, '.');
          const summary = `${inputs[0].slice(0,8)}${inputs.length > 1 ? ` 외 ${inputs.length-1}` : ''}`;
          const historyItem: SearchHistoryItem = { id: Date.now(), timestamp, keywordSummary: summary, totalResults: sessionResults.length, data: sessionResults };
          setSearchHistory(prev => [historyItem, ...prev].slice(0, 10));
          setActiveHistoryId(historyItem.id);
      }
    }
  };

  const handleFindRelated = async (video: VideoResult) => {
    if (apiKeys.length === 0) { alert('API Key를 먼저 등록하세요.'); return; }
    setLoading(true);
    setCurrentView('related');
    setRelatedResults([]);
    setActiveRelatedId(null);
    addLog(`[연관 동영상 찾기] '${video.title}' 분석 기반 검색 최적화 중...`, 'info');
    
    // 유튜브 UI와 동일한 결과를 내기 위한 지능형 쿼리 정규화
    // 1. 특수 구분자 기준으로 제목 자르기 (| , ㅣ , [ , : )
    // 2. 불필요한 태그/연속 마침표 제거
    // 3. 핵심 서사 구문만 추출하여 광범위 매칭 유도
    const baseTitle = video.title.split(/[|ㅣ\[:：]/)[0].trim();
    const cleanQuery = baseTitle
        .replace(/\.{2,}/g, ' ') // ".." 제거
        .replace(/\s+/g, ' ') // 중복 공백 제거
        .trim();

    // 쿼리가 너무 길면 뒤쪽 서술어를 살짝 쳐내어 검색 범위를 넓힘 (엄마카드 -> 아빠카드 등 변주를 잡기 위함)
    const finalQuery = cleanQuery.length > 50 ? cleanQuery.substring(0, 50) : cleanQuery;

    try {
        addLog(`[검색어 최적화] '${finalQuery}' 키워드로 광범위 검색을 시도합니다.`, 'info');
        const data = await apiCall('search', { 
            part: 'snippet', 
            q: finalQuery, 
            type: 'video', 
            maxResults: 50, 
            order: 'relevance',
            regionCode,
            relevanceLanguage: lang
        });
        const videoIds = data.items.map((item: any) => item.id.videoId);

        if (videoIds.length > 0) {
            const vData = await apiCall('videos', { part: 'snippet,statistics,contentDetails', id: videoIds.join(',') });
            const videos = vData.items;
            const channelIds = [...new Set(videos.map((v: any) => v.snippet.channelId))];
            const cRes = await apiCall('channels', { part: 'statistics', id: channelIds.join(',') });
            const channelMap: Record<string, any> = {};
            cRes.items.forEach((c: any) => channelMap[c.id] = c.statistics);
            
            // isRelatedMode=true: 모든 성능 필터링을 우회하여 유튜브 검색 결과에 나온 모든 연관 영상을 표시
            const processed = processData(videos, channelMap, true);
            setRelatedResults(processed);
            
            const timestamp = new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\. /g, '.');
            const summary = `연관찾기: ${finalQuery.slice(0, 15)}...`;
            const historyItem: SearchHistoryItem = { id: Date.now(), timestamp, keywordSummary: summary, totalResults: processed.length, data: processed };
            setRelatedHistory(prev => [historyItem, ...prev].slice(0, 10));
            setActiveRelatedId(historyItem.id);
            addLog(`[연관 동영상 찾기] 완료 (총 ${processed.length}개 연관 영상 검색됨)`, 'success');
        } else { addLog(`[연관 동영상 찾기] 검색 결과가 없습니다.`, 'warn'); }
    } catch (e: any) { addLog(`[연관 동영상 찾기] 오류: ${e.message}`, 'error'); } finally { setLoading(false); }
  };

  const handleHistoryClick = (item: SearchHistoryItem) => { setActiveHistoryId(item.id); setResults([...item.data]); };
  const handleDeleteHistory = (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); setSearchHistory(prev => prev.filter(item => item.id !== id));
      if (activeHistoryId === id) { setResults([]); setActiveHistoryId(null); }
  };

  const handleRelatedHistoryClick = (item: SearchHistoryItem) => { setActiveRelatedId(item.id); setRelatedResults([...item.data]); };
  const handleDeleteRelatedHistory = (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); setRelatedHistory(prev => prev.filter(item => item.id !== id));
      if (activeRelatedId === id) { setRelatedResults([]); setActiveRelatedId(null); }
  };

  const handleSort = (col: keyof VideoResult) => {
      if (sortCol === col) { setSortAsc(!sortAsc); } 
      else { setSortCol(col); setSortAsc(false); }
  };

  const getSortedData = (data: VideoResult[]) => {
      return [...data].sort((a, b) => {
          let valA = a[sortCol];
          let valB = b[sortCol];

          if (typeof valA === 'string' && typeof valB === 'string') {
              const res = sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
              return res;
          }
          
          if (valA < valB) return sortAsc ? -1 : 1;
          if (valA > valB) return sortAsc ? 1 : -1;
          return 0;
      });
  };

  const sortedResults = useMemo(() => getSortedData(results), [results, sortCol, sortAsc]);
  const sortedRelatedResults = useMemo(() => getSortedData(relatedResults), [relatedResults, sortCol, sortAsc]);

  const handleExport = (data: VideoResult[]) => {
    if (data.length === 0) return;
    const sortedExport = getSortedData(data);
    const headers = ['제목', '채널명', '조회수', '시간당', '좋아요', '구독자', '비율', '길이', '게시일', '링크'];
    let csv = "\uFEFF" + headers.join(',') + '\n';
    sortedExport.forEach(row => { csv += [`"${row.title.replace(/"/g, '""')}"`, `"${row.channelTitle.replace(/"/g, '""')}"`, row.viewCount, Math.round(row.viewsPerHour), row.likeCount, row.subscriberCount, row.viewSubRatio.toFixed(2), row.duration, row.publishedAt.split('T')[0], row.link].join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `yt_report_${Date.now()}.csv`; link.click();
  };

  const renderTable = (data: VideoResult[], activeId: number | null) => (
    <table style={styles.table}>
        <thead>
            <tr>
                <th style={styles.th(false)}>#</th>
                <th style={styles.th(false)}>썸네일</th>
                <th style={styles.th(true)} onClick={() => handleSort('title')}>제목 {sortCol === 'title' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('channelTitle')}>채널 {sortCol === 'channelTitle' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('viewCount')}>조회수 {sortCol === 'viewCount' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('viewsPerHour')}>시간당 {sortCol === 'viewsPerHour' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('subscriberCount')}>구독자 {sortCol === 'subscriberCount' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('viewSubRatio')}>비율 {sortCol === 'viewSubRatio' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('durationSec')}>길이 {sortCol === 'durationSec' ? (sortAsc ? '▲' : '▼') : ''}</th>
                <th style={styles.th(true)} onClick={() => handleSort('publishedAt')}>게시일 {sortCol === 'publishedAt' ? (sortAsc ? '▲' : '▼') : ''}</th>
            </tr>
        </thead>
        <tbody>{data.map((row, i) => (
            <tr key={`${activeId}-${row.id}-${i}`}>
                <td style={styles.td}>{i+1}</td>
                <td style={styles.td}><img src={row.thumbnail} style={styles.thumbnail}/></td>
                <td style={styles.td}>
                    <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                        <a href={row.link} target="_blank" style={{color: 'var(--text-main)', textDecoration: 'none', fontWeight:'500'}}>{row.title}</a>
                        <button className="btn btn-sm" style={{alignSelf:'flex-start', padding:'2px 8px', fontSize:'0.7rem', backgroundColor:'var(--accent-color)'}} onClick={() => handleFindRelated(row)}>🎯 연관동영상찾기</button>
                    </div>
                </td>
                <td style={styles.td}>{row.channelTitle}</td>
                <td style={styles.td}>{row.viewCount.toLocaleString()}</td>
                <td style={{...styles.td, color:'var(--success)', fontWeight:'bold'}}>{Math.round(row.viewsPerHour).toLocaleString()}</td>
                <td style={styles.td}>{row.subscriberCount.toLocaleString()}</td>
                <td style={styles.td}>{row.viewSubRatio.toFixed(1)}%</td>
                <td style={styles.td}><span className="badge">{row.duration}</span></td>
                <td style={styles.td}>{new Date(row.publishedAt).toLocaleDateString()}</td>
            </tr>
        ))}</tbody>
    </table>
  );

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar(sidebarOpen)}>
        <div style={styles.brand}>📊 YT Analytics PRO</div>
        
        <div style={styles.apiKeyContainer}>
            <label style={styles.label}>API Keys 관리</label>
            <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                <input type="password" value={newKeyInput} onChange={(e) => setNewKeyInput(e.target.value)} placeholder="키 추가" style={{fontSize:'0.8rem', padding:'6px'}}/>
                <button className="btn btn-sm" onClick={handleAddKey}>추가</button>
            </div>
            <div style={{maxHeight:'180px', overflowY:'auto', marginBottom:'10px'}}>
                {apiKeys.map((k, idx) => (
                    <div key={idx} style={styles.keyItem}>
                        <div style={styles.keyHeader}>
                            <div style={{display:'flex', alignItems:'center'}}><span style={styles.statusDot(k.status)}></span><span title={k.key} style={{fontFamily:'monospace', fontSize:'0.75rem'}}>{k.key.substring(0, 4)}...{k.key.slice(-4)}</span></div>
                            <button className="btn btn-sm btn-danger" style={{padding:'2px 5px', fontSize:'0.6rem'}} onClick={() => handleDeleteKey(k.key)}>X</button>
                        </div>
                        <div style={{fontSize:'0.65rem', color:'#aaa', display:'flex', justifyContent:'space-between', marginTop:'2px'}}><span>사용: {k.quotaUsed.toLocaleString()}</span><span>{Math.round((k.quotaUsed/QUOTA_LIMIT)*100)}%</span></div>
                        <div style={styles.quotaBarBg}><div style={{ width: `${Math.min(100, (k.quotaUsed/QUOTA_LIMIT)*100)}%`, height:'100%', backgroundColor: k.quotaUsed > 9000 ? 'var(--danger)' : 'var(--success)', transition: 'width 0.3s'}}></div></div>
                    </div>
                ))}
            </div>
            <button className="btn btn-sm btn-danger" style={{width:'100%', fontSize:'0.8rem', padding:'10px', fontWeight:'bold'}} onClick={handleManualResetQuota} disabled={apiKeys.length === 0}>🔄 모든 사용량 초기화 (0%)</button>
        </div>

        <div style={styles.configContainer}>
             <label style={styles.label}>백업 및 복구</label>
             <div style={{display:'flex', gap:'5px'}}>
                <button className="btn btn-sm" style={{flex:1}} onClick={handleExportConfig}>💾 내보내기</button>
                <button className="btn btn-sm" style={{flex:1}} onClick={() => fileInputRef.current?.click()}>📂 불러오기</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} accept=".json" onChange={handleImportConfig}/>
             </div>
        </div>

        <nav>
          <div style={styles.navItem(currentView === 'search' && searchMode === 'keyword')} onClick={() => { setCurrentView('search'); setSearchMode('keyword'); }}>🔍 키워드 검색</div>
          <div style={styles.navItem(currentView === 'search' && searchMode === 'channel')} onClick={() => { setCurrentView('search'); setSearchMode('channel'); }}>📺 채널 분석</div>
          <div style={styles.navItem(currentView === 'results')} onClick={() => setCurrentView('results')}>📂 키워드, 채널 검색결과 ({searchHistory.length})</div>
          <div style={styles.navItem(currentView === 'related')} onClick={() => setCurrentView('related')}>🏆 연관동영상찾기 ({relatedHistory.length})</div>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        <button style={styles.toggleButton} onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
        
        {currentView === 'search' && (
          <div style={{...styles.searchContainer, marginLeft: sidebarOpen ? '0' : '40px'}}>
             <div style={styles.panel}>
                <div style={styles.filterGrid}>
                    <div><label style={styles.label}>기간 (일)</label><input type="number" value={days} onChange={e => setDays(Number(e.target.value))}/></div>
                    <div><label style={styles.label}>영상 길이</label>
                        <div style={{display:'flex', gap:'4px'}}><select value={duration} onChange={e => setDuration(e.target.value)} style={{flex:1.5}}><option value="any">전체</option><option value="short">숏츠</option><option value="medium">중간</option><option value="long">롱폼</option></select>
                        <input type="number" value={minDurationMin} onChange={e => setMinDurationMin(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Min(분)" style={{flex:1}}/></div>
                    </div>
                    <div><label style={styles.label}>최소 조회수 / 시간당</label>
                        <div style={{display:'flex', gap:'4px'}}><input type="number" value={minViews} onChange={e => setMinViews(Number(e.target.value))}/><input type="number" value={minViewsPerHour} onChange={e => setMinViewsPerHour(Number(e.target.value))}/></div>
                    </div>
                    <div><label style={styles.label}>국가 / 언어</label>
                        <div style={{display:'flex', gap:'4px'}}><input type="text" value={regionCode} onChange={e => setRegionCode(e.target.value)}/><input type="text" value={lang} onChange={e => setLang(e.target.value)}/></div>
                    </div>
                </div>
                <div><label style={styles.label}>{searchMode === 'keyword' ? '키워드 목록 (한 줄에 하나씩)' : '채널 URL 또는 핸들명 (@포함)'}</label>
                    <textarea value={searchMode === 'keyword' ? keywordInput : channelInput} onChange={e => searchMode === 'keyword' ? setKeywordInput(e.target.value) : setChannelInput(e.target.value)} style={{height: '100px', resize: 'vertical'}}/>
                </div>
                <div style={{display:'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button className="btn" style={{padding:'10px 30px'}} onClick={handleStart} disabled={loading}>{loading ? '분석 중...' : '분석 시작'}</button>
                    <button className="btn btn-danger" onClick={handleClear}>초기화</button>
                </div>
             </div>
             <div style={styles.logContainer}>
                {logs.map((log, i) => (<div key={i} style={{marginBottom: '4px', color: log.type === 'error' ? '#f55' : log.type === 'success' ? '#4b8' : log.type === 'warn' ? '#fa0' : '#5ff'}}>[{log.time}] {log.message}</div>))}
                <div ref={logEndRef} />
             </div>
          </div>
        )}

        {currentView === 'results' && (
             <div style={{...styles.resultsContainer, marginLeft: sidebarOpen ? '0' : '40px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <h2 style={{margin:0}}>키워드, 채널 검색결과 ({results.length})</h2>
                    <button className="btn btn-success" onClick={() => handleExport(results)} disabled={results.length === 0}>CSV 저장</button>
                </div>
                <div style={styles.tabBar}>
                    {searchHistory.map(item => (
                        <div key={item.id} style={styles.tab(activeHistoryId === item.id)} onClick={() => handleHistoryClick(item)}>
                            <button style={styles.tabCloseBtn} onClick={(e) => handleDeleteHistory(e, item.id)}>✕</button>
                            <div style={{fontSize:'0.7rem', color:'var(--accent-color)', fontWeight:'bold'}}>{item.timestamp}</div>
                            <div style={{fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%'}}>{item.keywordSummary}</div>
                            <div style={{fontSize:'0.7rem', color:'#888'}}>{item.totalResults}건</div>
                        </div>
                    ))}
                </div>
                <div style={styles.tableContainer}>{renderTable(sortedResults, activeHistoryId)}</div>
             </div>
        )}

        {currentView === 'related' && (
             <div style={{...styles.resultsContainer, marginLeft: sidebarOpen ? '0' : '40px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <h2 style={{margin:0}}>연관동영상찾기 결과 ({relatedResults.length})</h2>
                    <button className="btn btn-success" onClick={() => handleExport(relatedResults)} disabled={relatedResults.length === 0}>CSV 저장</button>
                </div>
                <div style={styles.tabBar}>
                    {relatedHistory.map(item => (
                        <div key={item.id} style={styles.tab(activeRelatedId === item.id)} onClick={() => handleRelatedHistoryClick(item)}>
                            <button style={styles.tabCloseBtn} onClick={(e) => handleDeleteRelatedHistory(e, item.id)}>✕</button>
                            <div style={{fontSize:'0.7rem', color:'var(--accent-color)', fontWeight:'bold'}}>{item.timestamp}</div>
                            <div style={{fontSize:'0.85rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%'}}>{item.keywordSummary}</div>
                            <div style={{fontSize:'0.7rem', color:'#888'}}>{item.totalResults}건</div>
                        </div>
                    ))}
                </div>
                <div style={styles.tableContainer}>{renderTable(sortedRelatedResults, activeRelatedId)}</div>
             </div>
        )}
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);