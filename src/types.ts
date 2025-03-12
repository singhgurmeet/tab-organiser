export interface Tab {
  id: number;
  title: string;
  url: string;
  groupId: number;
  favIconUrl?: string;
  groupTitle?: string;
}

export interface TabGroup {
  id: number;
  tabs: Tab[];
  title: string;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  groups: {
    title: string;
    tabs: {
      url: string;
      title: string;
      favIconUrl?: string;
    }[];
  }[];
  ungroupedTabs: {
    url: string;
    title: string;
    favIconUrl?: string;
  }[];
}

export interface TabListProps {
  tabs: Tab[];
  selectedTabs: number[];
  onTabSelect: (tabId: number) => void;
  viewMode: ViewMode;
  searchTerm: string;
  groupedTabs: Record<number, Tab[]>;
  onShareGroup?: (groupId: number) => void;
}

export interface GroupControlsProps {
  selectedCount: number;
  onCreateGroup: (groupName: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange: (term: string) => void;
  searchTerm: string;
  groupedTabsCount: number;
}

export interface SessionControlsProps {
  onSaveSession: (sessionName: string) => void;
  onRestoreSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  sessions: Session[];
}

export interface GroupData {
  name: string;
  emoji: string;
}

export type ViewMode = 'compact' | 'detailed';

export interface ShareableGroup {
  title: string;
  tabs: {
    url: string;
    title: string;
    favIconUrl?: string;
  }[];
  createdAt: number;
  creator?: string;
  description?: string;
} 