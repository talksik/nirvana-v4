import { Grid, Container, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import React from 'react';
import useAuth from '../providers/AuthProvider';
import ConversationDetails from './ConversationDetails';
import useTerminal from './Terminal';

export default function MainPanel() {
  const { user } = useAuth();
  const { selectedConversation } = useTerminal();

  // if selected conversation, show details
  // do all fetching necessary to paint things here
  // join the call so to speak

  // show who is

  return (
    <Grid
      item
      xs={8}
      sx={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100vh',
      }}
    >
      {selectedConversation ? (
        <ConversationDetails />
      ) : (
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            background: blueGrey[50],
          }}
        >
          <Typography variant="h6">{`Hi ${
            user.displayName?.split(' ')[0] ?? 'there'
          }!`}</Typography>
          <Typography variant="caption">Take a deep breath in.</Typography>
        </Container>
      )}
    </Grid>
  );
}
