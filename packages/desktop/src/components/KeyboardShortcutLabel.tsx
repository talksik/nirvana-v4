import { Box, Paper, Typography } from '@mui/material';

import { KeyboardShortcuts } from '../util/keyboard';
import React from 'react';
import { blueGrey } from '@mui/material/colors';

export default function KeyboardShortcutLabel({
  label,
}: {
  label: keyof typeof KeyboardShortcuts;
}) {
  return (
    <Paper
      elevation={0}
      variant={'outlined'}
      sx={{
        px: 1,
        py: 0.25,
        bgcolor: blueGrey[50],
        color: blueGrey[300],
        border: 'none',
      }}
    >
      <Typography variant="caption">{label}</Typography>
    </Paper>
  );
}
