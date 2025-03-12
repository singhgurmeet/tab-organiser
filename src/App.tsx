import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import TabList from './components/TabList';
import GroupControls from './components/GroupControls';
import SessionControls from './components/SessionControls';
import { Tab, ViewMode, Session } from './types';

const STORAGE_KEY = 'tabOrganizerSessions';
const AUTO_BACKUP_KEY = 'tabOrganizerAutoBackup';
const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1a1a',
      paper: '#242424'
    },
    primary: {
      main: '#4f46e5'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        variant: 'body2',
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  },
});

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    // Load saved sessions
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    // Setup auto-backup
    const lastBackup = localStorage.getItem(AUTO_BACKUP_KEY);
    if (!lastBackup || Date.now() - Number(lastBackup) > AUTO_BACKUP_INTERVAL) {
      handleAutoBackup();
    }
  }, []);

  const loadTabs = async () => {
    try {
      const [tabs, groups] = await Promise.all([
        chrome.tabs.query({ currentWindow: true }),
        chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT })
      ]);

      // Create a map of group IDs to their details
      const groupDetails = new Map(groups.map(group => [
        group.id,
        { title: group.title || 'Untitled Group', color: group.color }
      ]));

      setTabs(tabs.map(tab => ({
        id: tab.id!,
        title: tab.title || '',
        url: tab.url || '',
        groupId: tab.groupId,
        favIconUrl: tab.favIconUrl,
        groupTitle: tab.groupId !== -1 ? groupDetails.get(tab.groupId)?.title || '' : ''
      })));
    } catch (error) {
      console.error('Error loading tabs:', error);
    }
  };

  useEffect(() => {
    loadTabs();
    
    // Listen for tab updates
    const handleTabUpdate = (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, _tab: chrome.tabs.Tab) => {
      loadTabs();
    };
    
    const handleGroupUpdate = (_group: chrome.tabGroups.TabGroup) => {
      loadTabs();
    };

    // Add listeners
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    chrome.tabs.onRemoved.addListener(loadTabs);
    chrome.tabs.onMoved.addListener(loadTabs);
    chrome.tabGroups.onUpdated.addListener(handleGroupUpdate);
    chrome.tabGroups.onRemoved.addListener(loadTabs);
    chrome.tabGroups.onMoved.addListener(loadTabs);

    return () => {
      // Clean up listeners
      chrome.tabs.onUpdated.removeListener(handleTabUpdate);
      chrome.tabs.onRemoved.removeListener(loadTabs);
      chrome.tabs.onMoved.removeListener(loadTabs);
      chrome.tabGroups.onUpdated.removeListener(handleGroupUpdate);
      chrome.tabGroups.onRemoved.removeListener(loadTabs);
      chrome.tabGroups.onMoved.removeListener(loadTabs);
    };
  }, []);

  const handleTabSelect = (tabId: number) => {
    setSelectedTabs(prev => 
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const formatGroupTitle = (title: string): string => {
    // Convert to title case and trim
    const formattedTitle = title
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
    
    // Remove any extra spaces
    return formattedTitle.replace(/\s+/g, ' ');
  };

  const handleCreateGroup = async (groupName: string) => {
    if (selectedTabs.length < 2) return;
    
    try {
      const existingGroupId = tabs.find(tab => 
        selectedTabs.includes(tab.id) && tab.groupId !== -1
      )?.groupId;

      let groupId: number;
      
      if (existingGroupId !== undefined && existingGroupId !== -1) {
        groupId = existingGroupId;
        await chrome.tabs.group({ 
          tabIds: selectedTabs.filter(id => 
            tabs.find(tab => tab.id === id)?.groupId !== existingGroupId
          ),
          groupId 
        });
      } else {
        groupId = await chrome.tabs.group({ tabIds: selectedTabs });
      }

      await chrome.tabGroups.update(groupId, { 
        title: formatGroupTitle(groupName),
        color: 'blue'  // Use a consistent color for a modern look
      });
      
      setSelectedTabs([]);
      loadTabs();
    } catch (error) {
      console.error('Error creating/updating group:', error);
    }
  };

  const handleSaveSession = async (name?: string) => {
    const currentGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    const allTabs = await chrome.tabs.query({ currentWindow: true });
    
    const session: Session = {
      id: Date.now().toString(),
      name: name || sessionName,
      createdAt: Date.now(),
      lastModified: Date.now(),
      groups: await Promise.all(currentGroups.map(async group => {
        const groupTabs = allTabs.filter(tab => tab.groupId === group.id);
        return {
          title: group.title || '',
          tabs: groupTabs.map(tab => ({
            url: tab.url || '',
            title: tab.title || '',
            favIconUrl: tab.favIconUrl
          }))
        };
      })),
      ungroupedTabs: allTabs
        .filter(tab => tab.groupId === -1)
        .map(tab => ({
          url: tab.url || '',
          title: tab.title || '',
          favIconUrl: tab.favIconUrl
        }))
    };

    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    setSessionName('');
  };

  const handleRestoreSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      // Get current window
      const currentWindow = await chrome.windows.getCurrent();
      if (!currentWindow.id) throw new Error('Failed to get current window');

      // Create all tabs first and keep track of their IDs for grouping
      const groupTabsMap = new Map<string, number[]>();

      // Create ungrouped tabs
      await Promise.all(
        session.ungroupedTabs.map(tab => 
          chrome.tabs.create({ 
            url: tab.url,
            windowId: currentWindow.id,
            active: false // Keep the current tab focused
          })
        )
      );

      // Create and track grouped tabs
      for (const [groupIndex, group] of session.groups.entries()) {
        const createdTabs = await Promise.all(
          group.tabs.map(tab => 
            chrome.tabs.create({ 
              url: tab.url,
              windowId: currentWindow.id,
              active: false // Keep the current tab focused
            })
          )
        );
        
        const tabIds = createdTabs.map(tab => tab.id!);
        groupTabsMap.set(group.title, tabIds);

        // Create group immediately after creating its tabs
        const groupId = await chrome.tabs.group({ 
          tabIds,
          createProperties: { windowId: currentWindow.id }
        });

        // Update group title and collapse state
        await chrome.tabGroups.update(groupId, { 
          title: formatGroupTitle(group.title),
          collapsed: true,
          color: 'blue'  // Use a consistent color for a modern look
        });

        // Small delay between groups to ensure proper ordering
        if (groupIndex < session.groups.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      loadTabs();
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  };

  const handleAutoBackup = async () => {
    const timestamp = new Date().toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    await handleSaveSession(`Auto Backup - ${timestamp}`);
    localStorage.setItem(AUTO_BACKUP_KEY, Date.now().toString());
  };

  // Group tabs by their groupId
  const groupedTabs = tabs.reduce((acc, tab) => {
    if (tab.groupId !== -1) {
      if (!acc[tab.groupId]) {
        acc[tab.groupId] = [];
      }
      acc[tab.groupId].push(tab);
    }
    return acc;
  }, {} as Record<number, Tab[]>);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        width: viewMode === 'detailed' ? 500 : 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease-in-out',
        bgcolor: 'background.default'
      }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <GroupControls 
            selectedCount={selectedTabs.length}
            onCreateGroup={handleCreateGroup}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            groupedTabsCount={Object.values(groupedTabs).flat().length}
          />
        </Box>
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          px: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
          }
        }}>
          <TabList 
            tabs={tabs}
            selectedTabs={selectedTabs}
            onTabSelect={handleTabSelect}
            viewMode={viewMode}
            searchTerm={searchTerm}
            groupedTabs={groupedTabs}
          />
          <SessionControls
            onSaveSession={handleSaveSession}
            onRestoreSession={handleRestoreSession}
            onDeleteSession={handleDeleteSession}
            sessions={sessions}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App; 