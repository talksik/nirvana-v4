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
  TextField,
  Typography,
  styled,
} from '@mui/material';
import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { useDebounce, useKeyPressEvent, useToggle } from 'react-use';

import CircularProgress from '@mui/material/CircularProgress';
import { FiX } from 'react-icons/fi';
import { NirvanaRules } from '../util/rules';
import { User } from '@nirvana/core/src/models/user.model';
import UserDetailRow from '../subcomponents/UserDetailRow';
import { blueGrey } from '@mui/material/colors';
import { searchUsers } from '../firebase/firestore';
import useAuth from '../providers/AuthProvider';
import useSearch from '../providers/SearchProvider';
import { useSnackbar } from 'notistack';

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

  const { userResults, searchQuery, searchUsers, isSearching } = useSearch();

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleChangeSelections = useCallback(
    (e: React.SyntheticEvent<Element, Event>, value: User[], reason: AutocompleteChangeReason) => {
      setSelectedUsers(value);
    },
    [],
  );

  const handleChangeSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
      searchUsers(newValue);
    },
    [searchUsers],
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
      enqueueSnackbar('Must select a person!', { variant: 'error' });
      return;
    }

    if (selectedUsers.length + 1 >= NirvanaRules.maxMembersPerConversation) {
      enqueueSnackbar('A group can only have 8 people including you!', { variant: 'error' });
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
          background: blueGrey[50],
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
            loading={isSearching}
            includeInputInList
            id="tags-outlined"
            autoHighlight
            onInputChange={handleChangeSearchInput}
            options={userResults}
            renderOption={renderOption}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.displayName)}
            value={selectedUsers}
            onChange={handleChangeSelections}
            filterSelectedOptions
            isOptionEqualToValue={(optionUser, valueUser) => optionUser.id === valueUser.id}
            filterOptions={(options) => options}
            inputValue={searchQuery}
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
