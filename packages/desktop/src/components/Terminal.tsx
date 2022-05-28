import React from 'react';

import { Container } from '@mui/system';
import { Avatar, Box, Grid, Input, Stack, Typography } from '@mui/material';
import NirvanaLogo from './NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
import { FiSearch } from 'react-icons/fi';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { useSnackbar } from 'notistack';

export default function Terminal() {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Grid container spacing={0}>
      <Grid
        item
        xs={4}
        sx={{ backgroundColor: blueGrey[50], boxShadow: 3, borderRight: `1px solid ${blueGrey}` }}
      >
        <Stack
          direction={'column'}
          spacing={1}
          sx={{
            padding: 2,
            height: 'inherit',
          }}
        >
          <Stack direction="row" justifyContent={'flex-start'} alignItems={'center'}>
            <NirvanaLogo />

            <Typography variant="overline" sx={{ m: 'auto', fontWeight: 'semi-bold' }}>
              Conversations
            </Typography>

            <Avatar
              sizes={''}
              alt={'Arjun Patel'}
              src="https://lh3.googleusercontent.com/ogw/ADea4I6TRqnIptWNP25-iXdusoAHafj-cUPYkO53xKT2_H0=s64-c-mo"
            />
          </Stack>

          <Stack
            direction={'row'}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'row',
              bgcolor: blueGrey[100],
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
            alignItems={'center'}
            spacing={1}
          >
            <FiSearch style={{ color: blueGrey[500] }} />

            <Input placeholder={'Find or start a conversation'} />

            <KeyboardShortcutLabel label="tab" />
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={8} sx={{ backgroundColor: 'white', padding: 1 }}>
        <Container disableGutters>
          <Typography variant="h6">Canvas</Typography>
        </Container>
      </Grid>
    </Grid>
  );
}
