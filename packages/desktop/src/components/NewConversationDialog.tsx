import React, { HTMLAttributes, useCallback, useState } from 'react';
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
import { useDebounce } from 'react-use';
import { searchUsers } from '../firebase/firestore';
import { User } from '@nirvana/core/src/models/user.model';
import useAuth from '../providers/AuthProvider';
import UserDetailRow from '../subcomponents/UserDetailRow';

export default function NewConversationDialog({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [searchVal, setSearchVal] = useState<string>('');
  const [searchUsersResults, setSearchUsersResults] = useState<User[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleChangeSelections = useCallback(
    (e: React.SyntheticEvent<Element, Event>, value: User[], reason: AutocompleteChangeReason) => {
      const newUsers: User[] = [];

      value.forEach((val) => {
        if (typeof val !== 'string') return;

        newUsers.push(val);
      });

      console.log(value);

      console.log(newUsers);

      setSelectedUsers(newUsers);
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

  const handleSubmit = useCallback(() => {
    try {
      //
    } catch (error) {
      //
    }

    handleClose();
  }, [handleClose]);

  const renderOption = useCallback(
    (props: HTMLAttributes<HTMLLIElement>, option: User, state: AutocompleteRenderOptionState) => (
      <ListItem {...props}>
        <UserDetailRow user={option} />
      </ListItem>
    ),
    [],
  );

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
            gap: 2,
          }}
        >
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
            filterOptions={(options) => options}
            inputValue={searchVal}
            renderInput={(params) => (
              <TextField
                fullWidth
                label="People"
                {...params}
                placeholder="Search by name or email"
              />
            )}
          />

          <TextField
            fullWidth
            label="Name (optional)"
            placeholder="Channel, subject line, whatever..."
          />

          <Stack justifyContent={'flex-end'} direction={'row'} spacing={2}>
            <Button variant={'text'}>Cancel</Button>
            <Button variant={'contained'} color="primary">
              Connect
            </Button>
          </Stack>
        </Container>
      </Container>
    </Dialog>
  );
}
