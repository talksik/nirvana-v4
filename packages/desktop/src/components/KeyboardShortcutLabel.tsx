import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

export default function KeyboardShortcutLabel({ label }: { label: string }) {
  return (
    <Paper
      elevation={0}
      variant={'outlined'}
      sx={{
        px: 1,
        py: 0.25,
        border: `1px solid`,
        bgcolor: blueGrey[50],
        color: blueGrey[300],
      }}
    >
      <Typography variant="caption">{label}</Typography>
    </Paper>
  );
}
