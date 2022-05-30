import React from 'react';

import { Avatar, Box, Stack, Typography } from '@mui/material';
import { User } from '@nirvana/core/src/models/user.model';

export default function UserDetailRow({
  user,
  rightContent,
}: {
  user: User;
  rightContent?: React.ReactNode;
}) {
  return (
    <Stack
      direction={'row'}
      alignItems="center"
      spacing={1}
      sx={{
        px: 1,
      }}
    >
      <Avatar src={user.photoUrl} alt={user.displayName} />

      <Stack>
        <Typography variant="subtitle2" color="info">
          {user.displayName}
        </Typography>
        <Typography variant={'overline'}>{user.email}</Typography>
      </Stack>

      <Box
        sx={{
          ml: 'auto',
        }}
      >
        {rightContent}
      </Box>
    </Stack>
  );
}
