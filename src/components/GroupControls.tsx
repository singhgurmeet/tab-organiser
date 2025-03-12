import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import { GroupControlsProps, ViewMode } from '../types';

const SUGGESTED_NAMES = [
  '📚 Reading',
  '💼 Work',
  '🛍️ Shopping',
  '✨ Important',
  '🎵 Media',
  '📝 Research'
];

export default function GroupControls({ 
  selectedCount, 
  onCreateGroup, 
  viewMode, 
  onViewModeChange,
  onSearchChange,
  searchTerm,
  groupedTabsCount
}: GroupControlsProps) {
  const [groupName, setGroupName] = useState('');
  const [isNaming, setIsNaming] = useState(false);

  const handleCreateGroup = (name: string) => {
    onCreateGroup(name);
    setGroupName('');
    setIsNaming(false);
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: 2,
      mb: 2
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1.5
      }}>
        <TextField
          size="small"
          placeholder="Search tabs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ 
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 1,
              px: 1.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }
            }
          }}
        >
          <ToggleButton value="compact" aria-label="compact view">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="detailed" aria-label="detailed view">
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}>
          <Typography 
            variant="body2" 
            color={selectedCount < 2 ? "text.secondary" : "text.primary"}
            sx={{ fontWeight: 500 }}
          >
            {selectedCount === 0 
              ? "Select tabs to group them" 
              : selectedCount === 1 
                ? "Select at least one more tab" 
                : `${selectedCount} tabs selected`}
          </Typography>
          {groupedTabsCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {groupedTabsCount} tabs in groups
            </Typography>
          )}
        </Box>

        {!isNaming ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<GroupWorkIcon />}
            onClick={() => setIsNaming(true)}
            disabled={selectedCount < 2}
            fullWidth
            sx={{
              py: 1,
              bgcolor: selectedCount < 2 ? 'action.disabledBackground' : 'primary.main'
            }}
          >
            {selectedCount < 2 ? "Create Group" : `Group ${selectedCount} tabs`}
          </Button>
        ) : (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'background.paper',
              borderColor: 'divider'
            }}
          >
            <TextField
              size="small"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter' && groupName.trim()) {
                  handleCreateGroup(groupName);
                } else if (e.key === 'Escape') {
                  setIsNaming(false);
                }
              }}
              InputProps={{
                endAdornment: groupName && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setGroupName('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.75,
              mx: -0.5
            }}>
              {SUGGESTED_NAMES.map((name) => (
                <Button
                  key={name}
                  size="small"
                  variant="outlined"
                  onClick={() => handleCreateGroup(name)}
                  sx={{ 
                    minWidth: 0,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {name}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleCreateGroup(groupName || 'New Group')}
                disabled={!groupName.trim()}
                fullWidth
                sx={{ py: 1 }}
              >
                Create Group
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsNaming(false)}
                sx={{ 
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
} 