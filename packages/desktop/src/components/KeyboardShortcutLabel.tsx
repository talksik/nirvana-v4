import React from 'react';
import { Box, styled, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

const StyledBox = styled(Box)(({ theme }) => ({
  px: theme.spacing(1),
  py: theme.spacing(0.5),
  border: `1px solid`,
  borderColor: blueGrey[50],
}));

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
