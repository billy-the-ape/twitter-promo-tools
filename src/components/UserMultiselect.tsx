import { useState } from 'react';
import { Avatar, Box, Chip, Grid, TextField } from '@material-ui/core';

import { User } from '@/types';
import { fetchJson, noop } from '@/util';

export type TwitterAdderProps = {
  label: string;
  users?: User[];
  onUsersSelected: (users: User[]) => void;
};

const UserMultiselect: React.FC<TwitterAdderProps> = ({
  label,
  users = [],
  onUsersSelected,
}) => {
  const [text, setText] = useState('');
  const [fullUsers, setFullUsers] = useState<User[]>(users);
  const [handles, setHandles] = useState<string[]>(
    users.map(({ screenName }) => screenName!)
  );
  const [missingHandles, setMissingHandles] = useState<string[]>([]);

  const addHandles = async () => {
    if (!text) {
      return;
    }

    const invalidHandles: string[] = [];
    const newHandles = text.split(' ').reduce<string[]>((acc, s) => {
      const trimmed = s
        .replace('@', '')
        .replace(/(https?:\/\/)?twitter.com\//, '');
      // Todo check if it's a valid (looking) twitter handle
      if (!trimmed || handles.includes(trimmed) || acc.includes(trimmed)) {
        return acc;
      }
      if (!/^(\w){1,15}$/.test(trimmed)) {
        invalidHandles.push(trimmed);
        return acc;
      }
      return [...acc, trimmed];
    }, []);

    setHandles([...handles, ...newHandles, ...invalidHandles]);
    setText('');

    const newTwitterUsers = await fetchJson<User[]>(
      `/api/twitter/${newHandles.join()}`
    );
    const allUsers = [...fullUsers, ...newTwitterUsers];
    setFullUsers(allUsers);

    const newMissing = newHandles.filter(
      (h) =>
        !newTwitterUsers.find(
          ({ screenName }) =>
            screenName?.toLocaleLowerCase() === h.toLocaleLowerCase()
        )
    );

    if (newMissing.length) {
      setMissingHandles([...missingHandles, ...newMissing, ...invalidHandles]);
    }

    if (missingHandles.length < handles.length || handles.length === 0) {
      onUsersSelected(allUsers);
    }
  };

  const removeHandle = (str: string) => {
    console.log(`remove handle ${str}`);
    const allUsers = fullUsers.filter(({ screenName }) => screenName !== str);
    setFullUsers(allUsers);
    setHandles(handles.filter((s) => s !== str));
    setMissingHandles(missingHandles.filter((s) => s !== str));
    onUsersSelected(allUsers);
  };

  return (
    <Box width="100%">
      <TextField
        label={label}
        error={!!missingHandles.length}
        value={text}
        onChange={({ target: { value } }) => setText(value)}
        onBlur={addHandles}
        onKeyPress={({ key }) => key === 'Enter' && addHandles()}
      />
      <Box mt={2}>
        <Grid container spacing={1}>
          {handles.map((str) => {
            const twitterUser = fullUsers.find(
              ({ screenName }) =>
                screenName?.toLocaleLowerCase() === str.toLocaleLowerCase()
            );
            const name = twitterUser?.screenName ?? str;
            return (
              <Grid item key={str}>
                <Chip
                  avatar={
                    twitterUser && (
                      <Avatar src={twitterUser.image!}>
                        {str.substring(0, 1).toLocaleUpperCase()}
                      </Avatar>
                    )
                  }
                  label={`@${name}`}
                  onDelete={() => removeHandle(str)}
                  {...(missingHandles.includes(str) && {
                    variant: 'outlined',
                    color: 'secondary',
                  })}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default UserMultiselect;
