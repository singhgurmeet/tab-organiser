import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import { SessionControlsProps } from '../types';

export default function SessionControls({ 
  onSaveSession, 
  onRestoreSession, 
  onDeleteSession,
  sessions 
}: SessionControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [mode, setMode] = useState<'save' | 'restore'>('save');

  const handleSave = () => {
    if (!sessionName.trim()) return;
    onSaveSession(sessionName.trim());
    setIsDialogOpen(false);
    setSessionName('');
  };

  const handleRestore = (sessionId: string) => {
    onRestoreSession(sessionId);
    setIsDialogOpen(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex',
        gap: 1,
        mt: 2,
        mb: 3,
        borderTop: 1,
        borderColor: 'divider',
        pt: 2
      }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SaveIcon />}
          onClick={() => {
            setMode('save');
            setSessionName('');
            setIsDialogOpen(true);
          }}
          sx={{ 
            flex: 1,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          Save Session
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestoreIcon />}
          onClick={() => {
            setMode('restore');
            setIsDialogOpen(true);
          }}
          disabled={sessions.length === 0}
          sx={{ 
            flex: 1,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          Restore Session
        </Button>
      </Box>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {mode === 'save' ? 'Save Current Session' : 'Restore Session'}
        </DialogTitle>
        <DialogContent>
          {mode === 'save' ? (
            <TextField
              autoFocus
              margin="dense"
              label="Session Name"
              fullWidth
              variant="outlined"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Work Research, Shopping List"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && sessionName.trim()) {
                  handleSave();
                }
              }}
            />
          ) : (
            <List>
              {sessions.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No saved sessions found
                </Typography>
              ) : (
                sessions.map((session) => (
                  <ListItem 
                    key={session.id}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={session.name}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption" component="span">
                            Created: {formatDate(session.createdAt)}
                          </Typography>
                          <Typography variant="caption" component="span">
                            •
                          </Typography>
                          <Typography variant="caption" component="span">
                            {session.groups.length} groups, {
                              session.groups.reduce((acc, group) => acc + group.tabs.length, 0) + 
                              session.ungroupedTabs.length
                            } tabs
                          </Typography>
                        </Box>
                      }
                      onClick={() => handleRestore(session.id)}
                      sx={{ cursor: 'pointer' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDeleteSession(session.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          {mode === 'save' && (
            <Button 
              onClick={handleSave}
              disabled={!sessionName.trim()}
              variant="contained"
            >
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
} 