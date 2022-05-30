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
import { FiHeadphones, FiLogOut, FiMonitor, FiSearch, FiUsers, FiWind } from 'react-icons/fi';
import React, { useCallback, useRef } from 'react';
import { useKeyPressEvent, useRendersCount } from 'react-use';

import KeyboardShortcutLabel from './KeyboardShortcutLabel';
import { KeyboardShortcuts } from '../util/keyboard';
import MenuItem from '@mui/material/MenuItem';
import NirvanaLogo from './NirvanaLogo';
import { blueGrey } from '@mui/material/colors';
import useAuth from '../providers/AuthProvider';
import { useSnackbar } from 'notistack';
import useTerminal from './Terminal';

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
    if (searchRef?.current) searchRef.current.focus();
  }, [searchRef]);

  useKeyPressEvent(KeyboardShortcuts.search.shortcutKey, onSearchFocus);

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

        {searchVal ? (
          <KeyboardShortcutLabel label={KeyboardShortcuts.escape.label} />
        ) : (
          <KeyboardShortcutLabel label={KeyboardShortcuts.search.label} />
        )}
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
