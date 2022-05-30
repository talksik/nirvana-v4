import React, { useRef, useCallback } from 'react';

import {
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Input,
  ListItemIcon,
  Menu,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NirvanaLogo from './NirvanaLogo';
import { FiHeadphones, FiLogOut, FiMonitor, FiSearch, FiUsers, FiWind } from 'react-icons/fi';

import MenuItem from '@mui/material/MenuItem';
import useAuth from '../providers/AuthProvider';
import { blueGrey } from '@mui/material/colors';
import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { useSnackbar } from 'notistack';
import { useKeyPressEvent, useRendersCount } from 'react-use';
import useTerminal from './Terminal';
import { KeyboardShortcuts } from '../util/keyboard';

const Navbar = ({
  handleChangeSearchInput,
  searchVal,
  isSearching,
}: {
  handleChangeSearchInput: React.ChangeEventHandler;
  searchVal: string;
  isSearching: boolean;
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { handleShowCreateConvoForm } = useTerminal();

  const searchRef = useRef<HTMLInputElement>(null);
  const onSearchFocus = useCallback(() => {
    enqueueSnackbar('search focused');
    if (searchRef?.current) searchRef.current.focus();
  }, [enqueueSnackbar, searchRef]);

  useKeyPressEvent(KeyboardShortcuts.search, onSearchFocus);

  const rendersCount = useRendersCount();
  console.warn('RENDER COUNT | NAVBAR | ', rendersCount);

  return (
    <Stack
      direction="row"
      justifyContent={'flex-start'}
      alignItems={'center'}
      spacing={2}
      sx={{
        WebkitAppRegion: 'drag',
        cursor: 'pointer',
        p: 2,
      }}
    >
      <NirvanaLogo />

      <Stack
        direction={'row'}
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          bgcolor: blueGrey[100],
          opacity: '50%',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          flex: 1,
        }}
        alignItems={'center'}
        spacing={1}
      >
        <FiSearch style={{ color: blueGrey[500] }} />

        <Input
          onChange={handleChangeSearchInput}
          value={searchVal}
          placeholder={'Find or start a conversation'}
          inputRef={searchRef}
        />

        {isSearching && <CircularProgress size={20} />}

        <KeyboardShortcutLabel label={KeyboardShortcuts.search} />
      </Stack>

      <Tooltip title={'Group conversation'}>
        <IconButton color="default" size={'small'} onClick={handleShowCreateConvoForm}>
          <FiUsers />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default Navbar;
