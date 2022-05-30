import React, { useCallback } from 'react';
import { Container, Dialog, IconButton } from '@mui/material';
import { FiX } from 'react-icons/fi';

export default function NewConversationDialog({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const handleSubmit = useCallback(() => {
    try {
    } catch (error) {
      //
    }

    handleClose();
  }, []);

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          background: 'white',
          position: 'relative',
        }}
      >
        <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} onClick={handleClose}>
          <FiX />
        </IconButton>
      </Container>
    </Dialog>
  );
}
