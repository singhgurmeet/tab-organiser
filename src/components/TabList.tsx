import { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import { TabListProps, Tab } from '../types';
import ShareDialog from './ShareDialog';

export default function TabList({ 
  tabs, 
  selectedTabs, 
  onTabSelect,
  viewMode,
  searchTerm,
  groupedTabs
}: TabListProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleShare = (groupId: number) => {
    setSelectedGroupId(groupId);
    setShareDialogOpen(true);
  };

  const getShareableGroup = () => {
    if (!selectedGroupId) return null;
    const groupTabs = groupedTabs[selectedGroupId] || [];
    return {
      title: groupTabs[0]?.title || 'Untitled Group',
      tabs: groupTabs.map(tab => ({
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl
      })),
      createdAt: Date.now()
    };
  };

  // Filter tabs based on search term
  const filterTabs = (tabsToFilter: Tab[]) => {
    if (!searchTerm) return tabsToFilter;
    const term = searchTerm.toLowerCase();
    return tabsToFilter.filter(tab => 
      tab.title.toLowerCase().includes(term) || 
      tab.url.toLowerCase().includes(term)
    );
  };

  const ungroupedTabs = tabs.filter(tab => tab.groupId === -1);
  const filteredUngroupedTabs = filterTabs(ungroupedTabs);

  return (
    <Stack spacing={1}>
      {/* Ungrouped Tabs Section */}
      {filteredUngroupedTabs.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Ungrouped Tabs ({filteredUngroupedTabs.length})
          </Typography>
          {viewMode === 'detailed' ? (
            <Grid container spacing={1}>
              {filteredUngroupedTabs.map((tab: Tab) => (
                <Grid item xs={12} key={tab.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      py: '8px !important'
                    }}>
                      <Checkbox
                        checked={selectedTabs.includes(tab.id)}
                        onChange={() => onTabSelect(tab.id)}
                        size="small"
                      />
                      {tab.favIconUrl && (
                        <Box 
                          component="img" 
                          src={tab.favIconUrl}
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            mr: 1,
                            objectFit: 'contain'
                          }}
                        />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {tab.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'block',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tab.url}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <List dense disablePadding>
              {filteredUngroupedTabs.map((tab: Tab) => (
                <ListItem 
                  key={tab.id}
                  dense
                  disableGutters
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      checked={selectedTabs.includes(tab.id)}
                      onChange={() => onTabSelect(tab.id)}
                      size="small"
                    />
                  </ListItemIcon>
                  {tab.favIconUrl && (
                    <Box 
                      component="img" 
                      src={tab.favIconUrl}
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        mr: 1,
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  <ListItemText 
                    primary={tab.title}
                    primaryTypographyProps={{
                      noWrap: true
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Divider when both sections are present */}
      {filteredUngroupedTabs.length > 0 && Object.keys(groupedTabs).length > 0 && (
        <Box 
          sx={{ 
            height: 1, 
            bgcolor: 'divider',
            mx: -2,
          }} 
        />
      )}

      {/* Grouped Tabs Section */}
      {Object.keys(groupedTabs).length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Grouped Tabs
          </Typography>
          <Stack spacing={1}>
            {Object.entries(groupedTabs).map(([groupId, groupTabs]) => {
              const filteredTabs = filterTabs(groupTabs);
              if (filteredTabs.length === 0) return null;

              const groupTitle = groupTabs[0]?.groupTitle || 'Untitled Group';

              return (
                <Box key={groupId}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1 
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {groupTitle} ({filteredTabs.length} tabs)
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleShare(Number(groupId))}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {viewMode === 'detailed' ? (
                    <Grid container spacing={1}>
                      {filteredTabs.map((tab: Tab) => (
                        <Grid item xs={12} key={tab.id}>
                          <Card variant="outlined">
                            <CardContent sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              py: '8px !important'
                            }}>
                              <Checkbox
                                checked={selectedTabs.includes(tab.id)}
                                onChange={() => onTabSelect(tab.id)}
                                size="small"
                              />
                              {tab.favIconUrl && (
                                <Box 
                                  component="img" 
                                  src={tab.favIconUrl}
                                  sx={{ 
                                    width: 16, 
                                    height: 16, 
                                    mr: 1,
                                    objectFit: 'contain'
                                  }}
                                />
                              )}
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" noWrap>
                                  {tab.title}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ 
                                    display: 'block',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {tab.url}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <List dense disablePadding>
                      {filteredTabs.map((tab: Tab) => (
                        <ListItem 
                          key={tab.id}
                          dense
                          disableGutters
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Checkbox
                              edge="start"
                              checked={selectedTabs.includes(tab.id)}
                              onChange={() => onTabSelect(tab.id)}
                              size="small"
                            />
                          </ListItemIcon>
                          {tab.favIconUrl && (
                            <Box 
                              component="img" 
                              src={tab.favIconUrl}
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                mr: 1,
                                objectFit: 'contain'
                              }}
                            />
                          )}
                          <ListItemText 
                            primary={tab.title}
                            primaryTypographyProps={{
                              noWrap: true
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setSelectedGroupId(null);
        }}
        group={getShareableGroup()}
      />
    </Stack>
  );
} 