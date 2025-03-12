import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { ShareableGroup } from '../types';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  group: ShareableGroup | null;
}

export default function ShareDialog({ open, onClose, group }: ShareDialogProps) {
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleShare = async () => {
    if (!group) return;

    const shareData = {
      ...group,
      description,
      createdAt: Date.now()
    };

    try {
      // Convert the data to a base64 string
      const encodedData = btoa(JSON.stringify(shareData));
      const url = `${window.location.origin}/share?data=${encodedData}`;
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share URL:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Share Tab Group: {group?.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
          <TextField
            label="Add a description (optional)"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this collection about?"
          />
          
          <Typography variant="body2" color="text.secondary">
            This group contains {group?.tabs.length} tabs
          </Typography>

          {shareUrl && (
            <Box sx={{ 
              mt: 2,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              position: 'relative'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all',
                  pr: 4
                }}
              >
                {shareUrl}
              </Typography>
              <IconButton 
                sx={{ 
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
                onClick={handleCopy}
                color={copied ? 'success' : 'default'}
              >
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {!shareUrl && (
          <Button 
            onClick={handleShare}
            variant="contained"
            disabled={!group}
          >
            Generate Link
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 