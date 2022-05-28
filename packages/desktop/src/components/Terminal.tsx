import React, { useCallback, useRef } from 'react';

import { Container } from '@mui/system';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Grid,
  Input,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material';
import NirvanaLogo from './NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
import { FiActivity, FiInbox, FiSearch } from 'react-icons/fi';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { useSnackbar } from 'notistack';
import { useKey } from 'react-use';
import NirvanaAvatar from './NirvanaAvatar';

export default function Terminal() {
  const { enqueueSnackbar } = useSnackbar();

  const searchRef = useRef<HTMLInputElement>(null);

  const onSearch = useCallback(() => {
    enqueueSnackbar('search focused');
    if (searchRef?.current) searchRef.current.focus();
  }, []);

  useKey('Tab', onSearch);

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

            <Input placeholder={'Find or start a conversation'} inputRef={searchRef} />

            <KeyboardShortcutLabel label="tab" />
          </Stack>

          <List
            sx={{
              pt: 2,
            }}
            subheader={
              <ListSubheader>
                <FiActivity />
                <Typography variant="subtitle2"> Priority</Typography>
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemAvatar>
                <Avatar alt={'Arjun Patel'} src="https://mui.com/static/images/avatar/2.jpg" />
              </ListItemAvatar>

              <ListItemText
                primary="Viet"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Ali Connors
                    </Typography>
                    {" — I'll be in your neighborhood doing errands this…"}
                  </React.Fragment>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemAvatar>
                <NirvanaAvatar
                  avatars={[
                    { alt: 'Arjun Patel', src: 'https://mui.com/static/images/avatar/3.jpg' },
                  ]}
                />
              </ListItemAvatar>

              <ListItemText
                primary="Agnes"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      to Scott, Alex, Jennifer
                    </Typography>
                    {" — Wish I could come, but I'm out of town this…"}
                  </React.Fragment>
                }
              />
            </ListItem>
          </List>

          <Divider />

          <List
            sx={{
              pt: 2,
            }}
            subheader={
              <ListSubheader>
                <FiInbox />
                <Typography variant="subtitle2"> Inbox</Typography>
              </ListSubheader>
            }
          >
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  sx={{ height: 25, width: 25 }}
                  alt={'Arjun Patel'}
                  src="https://mui.com/static/images/avatar/5.jpg"
                />
              </ListItemAvatar>

              <ListItemText primary="James Lin" />

              <Badge color="primary" badgeContent=" " variant="dot"></Badge>
            </ListItem>

            <ListItem>
              <ListItemAvatar>
                <Avatar
                  sx={{ height: 25, width: 25 }}
                  alt={'Arjun Patel'}
                  src="https://mui.com/static/images/avatar/4.jpg"
                />
              </ListItemAvatar>

              <ListItemText primary="Janet" />

              <Typography variant={'caption'}>2 hours ago</Typography>
            </ListItem>
          </List>
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
