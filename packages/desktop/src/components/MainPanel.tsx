import { Grid, Container, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import React, { useMemo } from 'react';
import useAuth from '../providers/AuthProvider';
import ConversationDetails from './ConversationDetails';
import useTerminal from './Terminal';

import { useRendersCount } from 'react-use';

export default function MainPanel() {
  const { user } = useAuth();
  const { selectedConversation } = useTerminal();

  // if selected conversation, show details
  // do all fetching necessary to paint things here
  // join the call so to speak

  // show who is

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | MAINPANEL | ', rendersCount);

  const pageContent = useMemo(() => {
    if (selectedConversation) return <ConversationDetails />;

    return (
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
        }}
      >
        <Typography variant="h6">{`Hi ${user.displayName?.split(' ')[0] ?? 'there'}!`}</Typography>
        <Typography variant="caption" align="center">
          Start a conversation with one tap <br /> or just take a breather.
        </Typography>
      </Container>
    );
  }, [selectedConversation, user]);

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
      {pageContent}
    </Grid>
  );
}