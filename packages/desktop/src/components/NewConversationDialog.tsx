import React, { HTMLAttributes, useCallback, useState } from 'react';
import {
  Autocomplete,
  AutocompleteRenderOptionState,
  Container,
  Dialog,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  Select,
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

  const handleSelectUser = useCallback((event, newValue: User[]) => {
    setSelectedUsers(newValue);
  }, []);

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
      <Typography>{option.email}</Typography>
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

        <Container maxWidth="sm">
          <Autocomplete
            multiple
            loading={searching}
            includeInputInList
            id="tags-outlined"
            autoHighlight
            onInputChange={handleChangeSearchInput}
            options={searchUsersResults}
            // renderOption={renderOption}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.displayName)}
            value={selectedUsers}
            onChange={handleSelectUser}
            filterSelectedOptions
            inputValue={searchVal}
            renderInput={(params) => (
              <TextField
                fullWidth
                label="Search by name or email"
                {...params}
                placeholder="Favorites"
              />
            )}
          />
        </Container>
      </Container>
    </Dialog>
  );
}
