import React, { HTMLAttributes, useCallback, useState, useEffect } from 'react';
import {
  Autocomplete,
  AutocompleteChangeReason,
  AutocompleteRenderOptionState,
  Button,
  Container,
  Dialog,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  ListItem,
  Select,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { FiX } from 'react-icons/fi';
import { blueGrey } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { useDebounce, useKeyPressEvent, useToggle } from 'react-use';
import { searchUsers } from '../firebase/firestore';
import { User } from '@nirvana/core/src/models/user.model';
import useAuth from '../providers/AuthProvider';
import UserDetailRow from '../subcomponents/UserDetailRow';
import CircularProgress from '@mui/material/CircularProgress';

export default function NewConversationDialog({
  open,
  handleClose,
  handleSubmit,
}: {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (selectedUsers: User[], conversationName?: string) => Promise<void>;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [searchVal, setSearchVal] = useState<string>('');
  const [searchUsersResults, setSearchUsersResults] = useState<User[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleChangeSelections = useCallback(
    (e: React.SyntheticEvent<Element, Event>, value: User[], reason: AutocompleteChangeReason) => {
      setSelectedUsers(value);
    },
    [],
  );

  const [, cancel] = useDebounce(
    async () => {
      if (searchVal) {
        enqueueSnackbar('searching...', { variant: 'info' });

        let results = await searchUsers(searchVal);
        results = results.filter((userResult) => userResult.id !== user.uid);
        setSearchUsersResults(results);

        console.warn('searched users', results);
      }

      setSearching(false);
    },
    1000,
    [searchVal, enqueueSnackbar, setSearchUsersResults, user],
  );

  const handleChangeSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
      setSearching(true);
      setSearchVal(newValue);
    },
    [setSearching, setSearchVal],
  );

  const renderOption = useCallback(
    (props: HTMLAttributes<HTMLLIElement>, option: User, state: AutocompleteRenderOptionState) => (
      <ListItem {...props}>
        <UserDetailRow user={option} />
      </ListItem>
    ),
    [],
  );

  const [conversationName, setConversationName] = useState<string>('');

  useEffect(() => {
    if (selectedUsers.length < 2) {
      setConversationName('');
    }
  }, [selectedUsers, setConversationName]);

  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConversationName(e.target.value);
    },
    [setConversationName],
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitLocal = useCallback(async () => {
    if (selectedUsers.length === 0) {
      enqueueSnackbar('Must a person!', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    await handleSubmit(selectedUsers, conversationName);

    // clear form for next time
    setSelectedUsers([]);
    setConversationName('');

    setIsSubmitting(false);
  }, [
    selectedUsers,
    setConversationName,
    conversationName,
    enqueueSnackbar,
    handleSubmit,
    setSelectedUsers,
    setIsSubmitting,
  ]);

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          background: blueGrey[100],
          position: 'relative',
        }}
      >
        <IconButton sx={{ position: 'absolute', top: 10, right: 10 }} onClick={handleClose}>
          <FiX />
        </IconButton>

        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <Typography variant="h4">Start a Conversation</Typography>

          <Autocomplete
            multiple
            loading={searching}
            includeInputInList
            id="tags-outlined"
            autoHighlight
            onInputChange={handleChangeSearchInput}
            options={searchUsersResults}
            renderOption={renderOption}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.displayName)}
            value={selectedUsers}
            onChange={handleChangeSelections}
            filterSelectedOptions
            isOptionEqualToValue={(optionUser, valueUser) => optionUser.id === valueUser.id}
            filterOptions={(options) => options}
            inputValue={searchVal}
            renderInput={(params) => (
              <TextField
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                fullWidth
                label="People"
                {...params}
                placeholder="Search by name or email"
              />
            )}
          />

          {selectedUsers.length > 1 && (
            <TextField
              value={conversationName}
              onChange={handleChangeName}
              fullWidth
              label="Name (optional)"
              placeholder="Channel, subject line, whatever..."
            />
          )}

          <Stack justifyContent={'flex-end'} direction={'row'} spacing={2}>
            <Button onClick={handleClose} variant={'text'}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitLocal}
              disabled={selectedUsers.length === 0 || isSubmitting}
              variant={'contained'}
              color="primary"
            >
              {isSubmitting ? <CircularProgress /> : 'Connect'}
            </Button>
          </Stack>
        </Container>
      </Container>
    </Dialog>
  );
}
