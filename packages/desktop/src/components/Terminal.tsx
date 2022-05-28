import React from 'react';

import { Container } from '@mui/system';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Grid,
  InputBase,
  Paper,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import NirvanaLogo from './NirvanaLogo';

export default function Terminal() {
  return (
    <Grid container spacing={0}>
      <Grid
        item
        xs={4}
        sx={{ backgroundColor: '#f3f4f6', boxShadow: 3, borderRight: '1px solid lightgray' }}
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

          <Box sx={{ position: 'relative', backgroundColor: 'gray' }}></Box>
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
