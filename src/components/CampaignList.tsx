import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import useSWR from 'swr'
import { useSnackbar } from 'notistack';
import { Campaign } from 'types';
import { fetcher } from '@/util';
import Section from './Section';

const CampaignDialog = dynamic(() => import('./CampaignDialog'), { ssr: false });

export type CampaignListProps = {
  className?: string;
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  avatar: {
    width: spacing(3),
    height: spacing(3),
    marginRight: spacing(1),
  },
  paper: {
    padding: spacing(1),
    backgroundColor: palette.background.paper,
  }
}));

const CampaignList: React.FC<CampaignListProps> = ({ className }) => {
  const classes = useStyles();
  const { data, revalidate } = useSWR<Campaign[]>('/api/campaigns', fetcher);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleNewCampaign = async (campaign: Campaign) => {
    setIsDialogLoading(true);
    const result = await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
    if (result.status === 201) {
      setIsDialogLoading(false);
      setShowNewDialog(false);
      enqueueSnackbar('New campaign added.', { variant: 'success' })
      // Fetch updated campaigns
      await revalidate();
    } else {
      setIsDialogLoading(false);
      enqueueSnackbar('An error occurred.', { variant: 'error' })
    }
  };

  return (
    <>
      <Section
        title="Campaigns"
        titleAdornment={(
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewDialog(true)
            }}
          >
            <AddIcon />New Campaign
          </Button>
        )}
        badgeNumber={data?.length || 0}
        className={className}
      >
        <Grid container direction="column" spacing={2}>
          {!data ? <CircularProgress style={{ margin: 'auto' }} /> : (
            data.length === 0 ? 'No Campaigns' : data.map(({ image, name, description }) => (
              <Grid item>
                <Box component={Paper} className={classes.paper} display="flex" alignItems="center">
                  <Avatar className={classes.avatar} src={image}>{name.substring(0, 1).toLocaleUpperCase()}</Avatar>
                  <Typography variant="body1">{name}</Typography>
                  <Typography variant="caption" noWrap>&nbsp;&nbsp;{description}</Typography>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Section>
      {
        showNewDialog && (
          <CampaignDialog
            open
            isLoading={isDialogLoading}
            onSave={handleNewCampaign}
            onClose={() => setShowNewDialog(false)}
          />
        )
      }
    </>
  );
}
export default CampaignList;
