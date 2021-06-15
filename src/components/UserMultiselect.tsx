import { User } from '@/types';
import { fetchJson } from '@/util';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Chip,
  Grid,
  IconButton,
  TextField,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useState } from 'react';

export type UserMultiselectProps = {
  label: string;
  users?: User[];
  onUsersSelected: (users: User[]) => void;
};

const UserMultiselect: React.FC<UserMultiselectProps> = ({
  label,
  users = [],
  onUsersSelected,
}) => {
  const [text, setText] = useState('');
  const [fullUsers, setFullUsers] = useState<User[]>(users);
  const [handles, setHandles] = useState<string[]>(
    users.map(({ screenName } = {} as any) => screenName!)
  );
  const [missingHandles, setMissingHandles] = useState<string[]>([]);

  const addHandles = async () => {
    if (!text) {
      return;
    }

    const invalidHandles: string[] = [];
    const newHandles = text.split(/\s/).reduce<string[]>((acc, s) => {
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
      onUsersSelected(allUsers.filter((u) => !!u) as User[]);
    }
  };

  const removeHandle = (str: string) => {
    const allUsers = fullUsers.filter(({ screenName }) => screenName !== str);
    setFullUsers(allUsers);
    setHandles(handles.filter((s) => s !== str));
    setMissingHandles(missingHandles.filter((s) => s !== str));
    onUsersSelected(allUsers);
  };

  return (
    <Accordion defaultExpanded variant="outlined">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${label}-content`}
        id={`${label}-header`}
      >
        <TextField
          label={label}
          error={!!missingHandles.length}
          value={text}
          onClick={(e) => e.stopPropagation()}
          onChange={({ target: { value } }) => setText(value)}
          onBlur={addHandles}
          onKeyPress={({ key }) => key === 'Enter' && addHandles()}
          InputProps={{
            endAdornment: (
              <IconButton size="small" onClick={addHandles}>
                <AddIcon />
              </IconButton>
            ),
          }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {handles.map((str) => {
            if (!str) return null;

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
      </AccordionDetails>
    </Accordion>
  );
};

export default UserMultiselect;
