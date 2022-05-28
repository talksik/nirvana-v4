import React from 'react';
import { Box, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

export default function KeyboardShortcutLabel({ label }: { label: string }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        border: `1px solid`,
        bgcolor: blueGrey[50],
        boxShadow: 1,
        color: blueGrey[300],
      }}
    >
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}
