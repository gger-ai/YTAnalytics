import React, { useState, useEffect, useRef } from 'react';
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
    overflowY: 'auto' as const, // Allow scrolling in sidebar for many keys
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
  // View: Search Mode
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
  // View: Results Mode
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
    paddingRight: '28px', // Make space for close button
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
    minWidth: '140px',
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
    borderRadius: '0 0 8px 8px', // Top corners square to meet tabs
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
  th: {
    backgroundColor: 'var(--table-header)',
    color: 'var(--text-main)',
    padding: '12px',
    textAlign: 'left' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 5,
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none' as const,
    borderBottom: '2px solid var(--border-color)',
  },
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

type ViewMode = 'search' | 'results';
type SearchMode = 'keyword' | 'channel';

// --- Main App Component ---
function App() {
  // UI Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword');

  // API Key Management
  const [newKeyInput, setNewKeyInput] = useState('');
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);

  // Search Data
  const [keywordInput, setKeywordInput] = useState('');
  const [channelInput, setChannelInput] = useState('');
  
  // Results & History
  const [results, setResults] = useState<VideoResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [days, setDays] = useState(10);
  const [duration, setDuration] = useState('long'); 
  const [minDurationMin, setMinDurationMin] = useState<number | ''>(60);
  const [maxDurationMin, setMaxDurationMin] = useState<number | ''>('');
  const [minViews, setMinViews] = useState(20000);
  const [minViewsPerHour, setMinViewsPerHour] = useState(600);
  const [regionCode, setRegionCode] = useState('KR');
  const [lang, setLang] = useState('ko');

  // Sorting
  const [sortCol, setSortCol] = useState<keyof VideoResult>('viewCount');
  const [sortAsc, setSortAsc] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init & Load Saved Data
  useEffect(() => {
    // Load Keys
    const savedKeys = localStorage.getItem('yt_api_keys_v2');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch(e) {}
    } else {
        // Fallback for old version
        const oldKey = localStorage.getItem('yt_api_key');
        if (oldKey) {
            setApiKeys([{ key: oldKey, status: 'idle', quotaUsed: 0 }]);
        }
    }

    // Load Inputs
    const savedKeyword = localStorage.getItem('yt_input_keyword');
    const savedChannel = localStorage.getItem('yt_input_channel');
    const oldInput = localStorage.getItem('yt_search_input');

    if (savedKeyword !== null) setKeywordInput(savedKeyword);
    else if (oldInput) setKeywordInput(oldInput); 

    if (savedChannel !== null) setChannelInput(savedChannel);

    // Load History
    const savedHistory = localStorage.getItem('yt_search_history');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            setSearchHistory(parsed);
            if (parsed.length > 0) {
                // Restore the most recent result
                setActiveHistoryId(parsed[0].id);
                setResults(parsed[0].data);
            }
        } catch(e) { console.error("History load error", e); }
    }

    addLog('시스템 준비 완료. API 키를 설정하고 테스트해주세요.', 'info');
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('yt_input_keyword', keywordInput);
  }, [keywordInput]);

  useEffect(() => {
    localStorage.setItem('yt_input_channel', channelInput);
  }, [channelInput]);

  useEffect(() => {
    localStorage.setItem('yt_api_keys_v2', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('yt_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, currentView]);


  // --- Actions ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { message, type, time }]);
  };

  const handleClear = () => {
    setResults([]);
    setActiveHistoryId(null);
    addLog('현재 화면의 결과 데이터가 초기화되었습니다. (히스토리는 유지됨)', 'info');
  };

  const handleAddKey = () => {
      const keys = newKeyInput.split(/[ ,;\n]+/).map(k => k.trim()).filter(Boolean);
      if (keys.length === 0) return;

      const newEntries: ApiKeyData[] = keys.map(k => ({
          key: k,
          status: 'idle',
          quotaUsed: 0
      }));

      // Avoid duplicates
      setApiKeys(prev => {
          const existing = new Set(prev.map(p => p.key));
          const filtered = newEntries.filter(n => !existing.has(n.key));
          return [...prev, ...filtered];
      });
      setNewKeyInput('');
      addLog(`${keys.length}개의 키가 목록에 추가되었습니다.`, 'success');
  };

  const handleDeleteKey = (key: string) => {
      setApiKeys(prev => prev.filter(k => k.key !== key));
  };

  const handleTestKey = async (index: number) => {
      const targetKey = apiKeys[index];
      addLog(`[테스트] 키 확인 중... (${targetKey.key.substring(0, 6)}...)`, 'info');

      try {
          const url = new URL(`https://www.googleapis.com/youtube/v3/search`);
          url.searchParams.append('key', targetKey.key);
          url.searchParams.append('part', 'snippet');
          url.searchParams.append('maxResults', '1');
          url.searchParams.append('q', 'test');

          const res = await fetch(url.toString());
          const data = await res.json();

          if (!res.ok) {
              const msg = data.error?.message || 'Error';
              if (msg.includes('quota')) {
                  updateKeyStatus(index, 'quota');
                  addLog(`[테스트 실패] 할당량 초과됨.`, 'error');
              } else {
                  updateKeyStatus(index, 'invalid');
                  addLog(`[테스트 실패] 유효하지 않은 키. (${msg})`, 'error');
              }
          } else {
              updateKeyStatus(index, 'valid');
              updateKeyQuota(index, 100); 
              addLog(`[테스트 성공] 사용 가능한 키입니다.`, 'success');
          }
      } catch (e: any) {
          addLog(`[테스트 에러] ${e.message}`, 'error');
      }
  };

  const updateKeyStatus = (index: number, status: ApiKeyData['status']) => {
      setApiKeys(prev => {
          const clone = [...prev];
          clone[index].status = status;
          return clone;
      });
  };

  const updateKeyQuota = (index: number, cost: number) => {
      setApiKeys(prev => {
          const clone = [...prev];
          clone[index].quotaUsed += cost;
          return clone;
      });
  };

  // --- Configuration Export / Import ---
  const handleExportConfig = () => {
    const config: AppConfig = {
        apiKeys,
        keywordInput,
        channelInput,
        filters: {
            days,
            duration,
            minDurationMin,
            maxDurationMin,
            minViews,
            minViewsPerHour,
            regionCode,
            lang
        }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `yt_config_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    addLog('설정(API키, 키워드 등) 내보내기 완료', 'success');
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
            
            if (config.filters) {
                setDays(config.filters.days);
                setDuration(config.filters.duration);
                setMinDurationMin(config.filters.minDurationMin);
                setMaxDurationMin(config.filters.maxDurationMin);
                setMinViews(config.filters.minViews);
                setMinViewsPerHour(config.filters.minViewsPerHour);
                setRegionCode(config.filters.regionCode);
                setLang(config.filters.lang);
            }
            
            addLog('설정 파일 불러오기 성공', 'success');
        } catch (err) {
            addLog('설정 파일 형식이 올바르지 않습니다.', 'error');
            console.error(err);
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };


  // --- Core API Logic with Rotation ---
  const apiCall = async (endpoint: string, params: Record<string, any>): Promise<any> => {
      let triedCount = 0;
      
      const execute = async (startIndex: number): Promise<any> => {
          if (triedCount >= apiKeys.length) {
              throw new Error("All Quota Exceeded");
          }

          let currentIndex = -1;
          for (let i = 0; i < apiKeys.length; i++) {
              const idx = (startIndex + i) % apiKeys.length;
              if (apiKeys[idx].status !== 'quota' && apiKeys[idx].status !== 'invalid') {
                  currentIndex = idx;
                  break;
              }
          }

          if (currentIndex === -1) {
              throw new Error("모든 키가 할당량 초과이거나 유효하지 않습니다.");
          }

          const activeKey = apiKeys[currentIndex];
          const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
          url.searchParams.append('key', activeKey.key);
          Object.keys(params).forEach(key => url.searchParams.append(key, String(params[key])));

          const response = await fetch(url.toString());
          
          if (!response.ok) {
              let errorData: any = {};
              try { errorData = await response.json(); } catch(e) {}
              const message = errorData.error?.message || response.statusText;
              
              if (response.status === 403 && (message.includes('quota') || message.includes('Rate Limit'))) {
                  addLog(`[자동전환] 키(${activeKey.key.substring(0,5)}...) 할당량 소진. 다음 키로 전환합니다.`, 'warn');
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

  // Data Processing
  const processData = (videos: any[], channelMap: Record<string, any>): VideoResult[] => {
    const now = new Date();
    return videos.map(v => {
      const stats = v.statistics || {};
      const viewCount = parseInt(stats.viewCount) || 0;
      
      if (viewCount < minViews) return null;

      const publishedAt = new Date(v.snippet.publishedAt);
      const hoursSince = Math.max(0.1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
      const viewsPerHour = viewCount / hoursSince;

      if (viewsPerHour < minViewsPerHour) return null;

      const channelStats = channelMap[v.snippet.channelId] || {};
      const subscriberCount = parseInt(channelStats.subscriberCount) || 0;
      const viewSubRatio = subscriberCount > 0 ? (viewCount / subscriberCount) * 100 : 0;

      const durMatch = (v.contentDetails.duration || '').match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      let durationStr = "00:00";
      let durationSec = 0;
      if (durMatch) {
         const h = parseInt(durMatch[1] || '0');
         const m = parseInt(durMatch[2] || '0');
         const s = parseInt(durMatch[3] || '0');
         durationSec = h * 3600 + m * 60 + s;
         const hh = h > 0 ? h.toString().padStart(2, '0') + ':' : '';
         const mm = m.toString().padStart(2, '0');
         const ss = s.toString().padStart(2, '0');
         durationStr = `${hh}${mm}:${ss}`;
      }

      if (minDurationMin !== '' && durationSec < Number(minDurationMin) * 60) return null;
      if (maxDurationMin !== '' && durationSec > Number(maxDurationMin) * 60) return null;

      return {
        id: v.id,
        thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        viewCount,
        viewsPerHour,
        likeCount: parseInt(stats.likeCount) || 0,
        subscriberCount,
        viewSubRatio,
        duration: durationStr,
        durationSec,
        publishedAt: v.snippet.publishedAt,
        link: `https://www.youtube.com/watch?v=${v.id}`
      } as VideoResult;
    }).filter((item): item is VideoResult => item !== null);
  };

  const handleStart = async () => {
    if (apiKeys.length === 0) {
      alert('API Key를 최소 하나 이상 등록해주세요.');
      return;
    }
    
    const currentInputText = searchMode === 'keyword' ? keywordInput : channelInput;
    const inputs = currentInputText.split('\n').map(s => s.trim()).filter(Boolean);
    
    if (inputs.length === 0) {
      alert('검색어/채널명을 입력해주세요.');
      return;
    }

    // Reset current results for new search
    setResults([]);
    setActiveHistoryId(null);
    setLoading(true);
    setCurrentView('search');

    addLog('[시작] 실행 중...', 'info');
    addLog(`[설정] ${apiKeys.filter(k => k.status !== 'invalid' && k.status !== 'quota').length}개의 사용 가능 키 대기 중.`, 'info');
    
    const typeLabel = searchMode === 'channel' ? '채널' : '키워드';
    addLog(`[${typeLabel}] ${inputs.length}개 ${typeLabel} 처리 시작`, 'info');

    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);
    const publishedAfterISO = publishedAfter.toISOString();
    
    let processedCount = 0;
    
    // Use a local variable to accumulate results for this specific session
    let sessionResults: VideoResult[] = [];
    
    try {
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const currentNum = i + 1;
        const prefix = `[${typeLabel} ${currentNum}/${inputs.length}] '${input}'`;
        
        let videoIds: string[] = [];
        let logStatus: 'success' | 'warn' | 'error' = 'success';
        let logMessage = '';

        try {
            if (searchMode === 'keyword') {
              const params: any = {
                part: 'snippet',
                q: input,
                type: 'video',
                maxResults: 50,
                publishedAfter: publishedAfterISO,
                order: 'viewCount',
                regionCode: regionCode,
                relevanceLanguage: lang
              };
              if (duration !== 'any') params.videoDuration = duration;
              
              const data = await apiCall('search', params);
              videoIds = data.items.map((item: any) => item.id.videoId);
            } else {
              const channelParams = { part: 'snippet', q: input, type: 'channel', maxResults: 1 };
              const cData = await apiCall('search', channelParams);
              const channelId = cData.items[0]?.snippet?.channelId;
              
              if (channelId) {
                 const vParams: any = {
                   part: 'snippet',
                   channelId: channelId,
                   type: 'video',
                   maxResults: 50,
                   publishedAfter: publishedAfterISO,
                   order: 'date'
                 };
                 if (duration !== 'any') vParams.videoDuration = duration;
                 
                 const vData = await apiCall('search', vParams);
                 videoIds = vData.items.map((item: any) => item.id.videoId);
              } else {
                logStatus = 'warn';
                logMessage = `${prefix} - 채널을 찾을 수 없습니다.`;
              }
            }

            if (logStatus !== 'warn') {
                if (videoIds.length > 0) {
                  const vParams = { part: 'snippet,statistics,contentDetails', id: videoIds.join(',') };
                  const vData = await apiCall('videos', vParams);
                  const videos = vData.items;

                  const channelIds = [...new Set(videos.map((v: any) => v.snippet.channelId))];
                  const cParams = { part: 'statistics', id: channelIds.join(',') };
                  const cRes = await apiCall('channels', cParams);
                  const channelMap: Record<string, any> = {};
                  cRes.items.forEach((c: any) => channelMap[c.id] = c.statistics);

                  const processed = processData(videos, channelMap);
                  
                  // Accumulate to session
                  sessionResults = [...sessionResults, ...processed];
                  
                  // Update UI in real-time
                  setResults(sessionResults);
                  
                  if (processed.length > 0) {
                      logStatus = 'success';
                      logMessage = `${prefix} - ${processed.length}개 영상 수집 완료`;
                  } else {
                      logStatus = 'warn';
                      logMessage = `${prefix} - 조건에 맞는 최근 영상이 없습니다.`;
                  }
                } else {
                  logStatus = 'warn';
                  logMessage = `${prefix} - 최근 영상이 없습니다.`;
                }
            }

        } catch (innerE: any) {
            if (innerE.message.includes("All Quota Exceeded")) {
                throw innerE; // Stop loop
            }
            console.error(innerE);
            logStatus = 'error';
            logMessage = `${prefix} - 에러: ${innerE.message}`;
        }

        addLog(logMessage, logStatus);
        processedCount++;
        const percent = Math.floor((processedCount / inputs.length) * 100);
        addLog(`[진행률] ${percent}% 완료`, 'info');

        await new Promise(r => setTimeout(r, 200));
      }

      addLog(`[완료] 총 ${sessionResults.length}개 영상 수집 완료. '최종 결과값' 탭에서 확인하세요.`, 'success');

    } catch (e: any) {
      if (e.message.includes('All Quota Exceeded')) {
         addLog(`[중요] 등록된 모든 API 키의 쿼터가 소진되어 작업을 중단합니다.`, 'error');
         addLog(`[부분 완료] ${processedCount}/${inputs.length}개 처리됨`, 'warn');
         alert("⚠️ 모든 YouTube API 키 할당량이 소진되었습니다.");
      } else {
         addLog(`치명적 에러 발생: ${e.message}`, 'error');
      }
    } finally {
      setLoading(false);
      
      // Save to History
      if (sessionResults.length > 0) {
          const timestamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
          const firstKey = inputs[0].length > 8 ? inputs[0].substring(0,8)+'...' : inputs[0];
          const summary = `${firstKey} ${inputs.length > 1 ? `외 ${inputs.length-1}건` : ''}`;
          
          const historyItem: SearchHistoryItem = {
              id: Date.now(),
              timestamp,
              keywordSummary: summary,
              totalResults: sessionResults.length,
              data: sessionResults
          };
          
          setSearchHistory(prev => {
              const newHistory = [historyItem, ...prev];
              return newHistory.slice(0, 10); // LIMIT INCREASED TO 10
          });
          setActiveHistoryId(historyItem.id);
      }
    }
  };

  const handleHistoryClick = (item: SearchHistoryItem) => {
      setActiveHistoryId(item.id);
      setResults(item.data);
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); // Stop tab click event
      setSearchHistory(prev => prev.filter(item => item.id !== id));
      if (activeHistoryId === id) {
          setResults([]);
          setActiveHistoryId(null);
      }
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const headers = ['제목', '채널명', '조회수', '시간당 조회수', '좋아요', '구독자 수', '조회/구독(%)', '길이', '게시일', '링크'];
    let csv = "\uFEFF" + headers.join(',') + '\n';

    results.forEach(row => {
      const line = [
        `"${row.title.replace(/"/g, '""')}"`,
        `"${row.channelTitle.replace(/"/g, '""')}"`,
        row.viewCount,
        Math.round(row.viewsPerHour),
        row.likeCount,
        row.subscriberCount,
        row.viewSubRatio.toFixed(2),
        row.duration,
        row.publishedAt.split('T')[0],
        row.link
      ].join(',');
      csv += line + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `yt_analysis_${Date.now()}.csv`;
    link.click();
    addLog('CSV 다운로드 완료', 'success');
  };

  const handleSort = (col: keyof VideoResult) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(false); // desc by default for new col
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB as string).toLowerCase();
    }
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const renderSortIcon = (col: keyof VideoResult) => {
    if (sortCol !== col) return null;
    return sortAsc ? ' ▲' : ' ▼';
  };

  const QUOTA_LIMIT = 10000;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar(sidebarOpen)}>
        <div style={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58,7.19C21.32,6.23 20.57,5.48 19.61,5.22C17.88,4.76 12,4.76 12,4.76C12,4.76 6.12,4.76 4.39,5.22C3.43,5.48 2.68,6.23 2.42,7.19C1.96,8.92 1.96,12 1.96,12C1.96,12 1.96,15.08 2.42,16.81C2.68,17.77 3.43,18.52 4.39,18.78C6.12,19.24 12,19.24 12,19.24C12,19.24 17.88,19.24 19.61,18.78C20.57,18.52 21.32,17.77 21.58,16.81C22.04,15.08 22.04,12 22.04,12C22.04,8.92 21.58,7.19M9.79,15.14V8.86L15.3,12L9.79,15.14Z" /></svg>
          YT Analytics
        </div>

        {/* API Key Manager */}
        <div style={styles.apiKeyContainer}>
            <label style={styles.label}>API Keys 관리</label>
            <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                <input 
                    type="password" 
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    placeholder="새 API Key"
                    style={{fontSize:'0.8rem', padding:'6px'}}
                />
                <button className="btn btn-sm" onClick={handleAddKey}>추가</button>
            </div>
            
            <div style={{maxHeight:'200px', overflowY:'auto'}}>
                {apiKeys.map((k, idx) => (
                    <div key={idx} style={styles.keyItem}>
                        <div style={styles.keyHeader}>
                            <div style={{display:'flex', alignItems:'center'}}>
                                <span style={styles.statusDot(k.status)}></span>
                                <span title={k.key} style={{fontFamily:'monospace', fontSize:'0.85rem'}}>
                                    {k.key.length > 10 
                                    ? `${k.key.substring(0, 4)}...${k.key.substring(k.key.length - 4)}` 
                                    : k.key}
                                </span>
                            </div>
                            <div style={{display:'flex', gap:'5px'}}>
                                <button className="btn btn-sm" style={{padding:'2px 5px', fontSize:'0.7rem'}} onClick={() => handleTestKey(idx)}>Test</button>
                                <button className="btn btn-sm btn-danger" style={{padding:'2px 5px', fontSize:'0.7rem'}} onClick={() => handleDeleteKey(k.key)}>X</button>
                            </div>
                        </div>
                        <div style={{fontSize:'0.7rem', color:'#aaa', display:'flex', justifyContent:'space-between'}}>
                           <span>사용량: {k.quotaUsed.toLocaleString()}</span>
                           <span>{Math.round((k.quotaUsed/QUOTA_LIMIT)*100)}%</span>
                        </div>
                        <div style={styles.quotaBarBg}>
                            <div style={{
                                width: `${Math.min(100, (k.quotaUsed/QUOTA_LIMIT)*100)}%`, 
                                height:'100%', 
                                backgroundColor: k.quotaUsed > 8000 ? 'var(--danger)' : 'var(--success)',
                                transition: 'width 0.3s'
                            }}></div>
                        </div>
                    </div>
                ))}
                {apiKeys.length === 0 && <div style={{fontSize:'0.8rem', color:'#666', textAlign:'center'}}>등록된 키가 없습니다.</div>}
            </div>
        </div>

        {/* Configuration Manager (Export/Import) */}
        <div style={styles.configContainer}>
             <label style={styles.label}>데이터 관리 (키, 설정, 필터)</label>
             <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                <button className="btn btn-sm" style={{flex:1}} onClick={handleExportConfig}>
                   💾 내보내기
                </button>
                <button className="btn btn-sm" style={{flex:1}} onClick={() => fileInputRef.current?.click()}>
                   📂 불러오기
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{display:'none'}} 
                    accept=".json"
                    onChange={handleImportConfig}
                />
             </div>
        </div>

        <nav>
          <div 
            style={styles.navItem(currentView === 'search' && searchMode === 'keyword')} 
            onClick={() => { setCurrentView('search'); setSearchMode('keyword'); }}
          >
             <span>🔍</span> 키워드 검색
          </div>
          <div 
            style={styles.navItem(currentView === 'search' && searchMode === 'channel')} 
            onClick={() => { setCurrentView('search'); setSearchMode('channel'); }}
          >
             <span>📺</span> 채널 핸들명 검색
          </div>
          <div 
            style={styles.navItem(currentView === 'results')} 
            onClick={() => setCurrentView('results')}
          >
             <span>📊</span> 최종 결과값 ({results.length})
          </div>
        </nav>

        <div style={{marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
          Quota 비용 안내<br/>Search: 100 point<br/>Video/Channel: 1 point
        </div>
      </aside>

      <main style={styles.mainContent}>
        {/* Toggle Button */}
        <button 
          style={styles.toggleButton} 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        
        {/* VIEW 1: Search Panel */}
        {currentView === 'search' && (
          <div style={{...styles.searchContainer, marginLeft: sidebarOpen ? '0' : '40px'}}>
             <div style={styles.panel}>
                <h3 style={{margin:'0 0 10px 0', color:'var(--text-main)'}}>
                    {searchMode === 'keyword' ? '키워드 분석 설정' : '채널 상세 분석 설정'}
                </h3>
                
                <div style={styles.filterGrid}>
                    <div>
                    <label style={styles.label}>검색 기간 (최근 일수)</label>
                    <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min="1"/>
                    </div>
                    <div>
                    <label style={styles.label}>영상 길이</label>
                    <div style={{display:'flex', gap:'5px', alignItems: 'center'}}>
                        <select 
                        value={duration} 
                        onChange={e => setDuration(e.target.value)}
                        style={{flex: 1, minWidth: '100px'}}
                        >
                        <option value="any">전체</option>
                        <option value="short">숏츠 (4분↓)</option>
                        <option value="medium">중간 (4~20분)</option>
                        <option value="long">롱폼 (20분↑)</option>
                        </select>
                        <input 
                        type="number" 
                        value={minDurationMin} 
                        onChange={e => setMinDurationMin(e.target.value === '' ? '' : Number(e.target.value))} 
                        placeholder="최소(분)" 
                        min="0"
                        style={{flex: 1, minWidth: '70px'}}
                        />
                        <input 
                        type="number" 
                        value={maxDurationMin} 
                        onChange={e => setMaxDurationMin(e.target.value === '' ? '' : Number(e.target.value))} 
                        placeholder="최대(분)" 
                        min="0"
                        style={{flex: 1, minWidth: '70px'}}
                        />
                    </div>
                    </div>
                    <div>
                    <label style={styles.label}>최소 조회수 / 시간당 조회수</label>
                    <div style={{display:'flex', gap:'5px'}}>
                        <input type="number" value={minViews} onChange={e => setMinViews(Number(e.target.value))} step="1000" placeholder="Total"/>
                        <input type="number" value={minViewsPerHour} onChange={e => setMinViewsPerHour(Number(e.target.value))} step="100" placeholder="Per Hour"/>
                    </div>
                    </div>
                    <div>
                    <label style={styles.label}>국가 / 언어</label>
                    <div style={{display:'flex', gap:'5px'}}>
                        <input type="text" value={regionCode} onChange={e => setRegionCode(e.target.value)} placeholder="KR"/>
                        <input type="text" value={lang} onChange={e => setLang(e.target.value)} placeholder="ko"/>
                    </div>
                    </div>
                </div>

                <div>
                    <label style={styles.label}>
                    {searchMode === 'keyword' ? '키워드 입력 (한 줄에 하나씩)' : '채널 핸들명 입력 (@핸들명, 한 줄에 하나씩)'}
                    </label>
                    <textarea 
                    value={searchMode === 'keyword' ? keywordInput : channelInput}
                    onChange={e => searchMode === 'keyword' ? setKeywordInput(e.target.value) : setChannelInput(e.target.value)}
                    placeholder={searchMode === 'keyword' ? "검색할 키워드를 입력하세요..." : "@channelName\n@anotherChannel"}
                    style={{width: '100%', height: '120px', resize: 'vertical', fontFamily: 'monospace'}}
                    />
                </div>
                
                <div style={{display:'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button className="btn" onClick={handleStart} disabled={loading}>
                    {loading ? '분석 중...' : '분석 시작'}
                    </button>
                    <button className="btn btn-danger" onClick={handleClear} disabled={loading}>
                    결과 초기화
                    </button>
                </div>
             </div>

             <div style={styles.logContainer}>
                {logs.length === 0 && <div style={{color:'#666', textAlign:'center', marginTop:'20px'}}>대기 중...</div>}
                {logs.map((log, i) => (
                    <div key={i} style={{marginBottom: '4px', color: log.type === 'error' ? '#ff5555' : log.type === 'success' ? '#43b581' : log.type === 'warn' ? '#ffaa00' : '#55ffff'}}>
                    [{log.time}] {log.message}
                    </div>
                ))}
                <div ref={logEndRef} />
             </div>
          </div>
        )}

        {/* VIEW 2: Results Table */}
        {currentView === 'results' && (
             <div style={{...styles.resultsContainer, marginLeft: sidebarOpen ? '0' : '40px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                    <h2 style={{margin:0, color:'var(--text-main)'}}>최종 결과값 ({results.length})</h2>
                    <button className="btn btn-success" onClick={handleExport} disabled={results.length === 0}>
                    Excel(CSV) 저장
                    </button>
                </div>

                {/* Search History Tabs */}
                <div style={styles.tabBar}>
                    {searchHistory.length === 0 && <div style={{padding:'10px', color:'#666', fontSize:'0.8rem'}}>저장된 검색 기록이 없습니다.</div>}
                    {searchHistory.map(item => (
                        <div 
                            key={item.id} 
                            style={styles.tab(activeHistoryId === item.id)}
                            onClick={() => handleHistoryClick(item)}
                            title="클릭하여 결과 보기"
                        >
                            <button 
                                style={styles.tabCloseBtn}
                                onClick={(e) => handleDeleteHistory(e, item.id)}
                                title="이 기록 삭제"
                            >
                                &#10005;
                            </button>
                            <div style={{fontSize:'0.7rem', color:'var(--accent-color)'}}>{item.timestamp}</div>
                            <div style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%'}}>
                                {item.keywordSummary}
                            </div>
                            <div style={{fontSize:'0.7rem', color:'#aaa'}}>{item.totalResults}개 결과</div>
                        </div>
                    ))}
                </div>
                
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th} onClick={() => handleSort('viewCount')}>#</th>
                            <th style={styles.th}>썸네일</th>
                            <th style={styles.th} onClick={() => handleSort('title')}>제목{renderSortIcon('title')}</th>
                            <th style={styles.th} onClick={() => handleSort('channelTitle')}>채널명{renderSortIcon('channelTitle')}</th>
                            <th style={styles.th} onClick={() => handleSort('viewCount')}>조회수{renderSortIcon('viewCount')}</th>
                            <th style={styles.th} onClick={() => handleSort('viewsPerHour')}>시간당 조회수{renderSortIcon('viewsPerHour')}</th>
                            <th style={styles.th} onClick={() => handleSort('likeCount')}>좋아요{renderSortIcon('likeCount')}</th>
                            <th style={styles.th} onClick={() => handleSort('subscriberCount')}>구독자{renderSortIcon('subscriberCount')}</th>
                            <th style={styles.th} onClick={() => handleSort('viewSubRatio')}>조회/구독(%){renderSortIcon('viewSubRatio')}</th>
                            <th style={styles.th} onClick={() => handleSort('durationSec')}>길이{renderSortIcon('durationSec')}</th>
                            <th style={styles.th} onClick={() => handleSort('publishedAt')}>게시일{renderSortIcon('publishedAt')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {results.length === 0 ? (
                            <tr>
                            <td colSpan={11} style={{textAlign: 'center', padding: '50px', color: 'var(--text-muted)'}}>
                                데이터가 없습니다. 검색을 수행해주세요.
                            </td>
                            </tr>
                        ) : (
                            sortedResults.map((row, i) => (
                            <tr key={row.id} style={{backgroundColor: 'transparent', borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s'}}>
                                <td style={{...styles.td, textAlign: 'center'}}>{i + 1}</td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                <img src={row.thumbnail} style={styles.thumbnail} loading="lazy" alt="thumb"/>
                                </td>
                                <td style={styles.td}>
                                <a href={row.link} target="_blank" rel="noreferrer" style={{color: 'var(--text-main)', textDecoration: 'none', display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    {row.title}
                                </a>
                                </td>
                                <td style={styles.td}>{row.channelTitle}</td>
                                <td style={{...styles.td, textAlign: 'right'}}>{row.viewCount.toLocaleString()}</td>
                                <td style={{...styles.td, textAlign: 'right', color: 'var(--success)', fontWeight: 'bold'}}>{Math.round(row.viewsPerHour).toLocaleString()}</td>
                                <td style={{...styles.td, textAlign: 'right'}}>{row.likeCount.toLocaleString()}</td>
                                <td style={{...styles.td, textAlign: 'right'}}>{row.subscriberCount > 0 ? row.subscriberCount.toLocaleString() : '비공개'}</td>
                                <td style={{...styles.td, textAlign: 'right'}}>{row.viewSubRatio.toFixed(1)}%</td>
                                <td style={{...styles.td, textAlign: 'center'}}><span className="badge">{row.duration}</span></td>
                                <td style={{...styles.td, textAlign: 'center'}}>{new Date(row.publishedAt).toLocaleDateString()}</td>
                            </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

      </main>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);