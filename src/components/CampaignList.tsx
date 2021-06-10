import {
  Avatar,
  Box,
  Button,
  Divider,
  CircularProgress,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import useSWR from 'swr'
import { useSnackbar } from 'notistack';
import { Campaign } from '@/types';
import { fetchJson } from '@/util';
import Section from './Section';

const CampaignDialog = dynamic(() => import('./CampaignDialog'), { ssr: false });
const ConfirmDialog = dynamic(() => import('./ConfirmDialog'), { ssr: false });

export type CampaignListProps = {
  className?: string;
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  title: {
    margin: spacing(0, 1),
  },
  item: {
    maxWidth: '100%',
  },
  desc: {
    flex: 1,
  },
  paper: {
    padding: spacing(1, 2),
    backgroundColor: palette.background.default,
  }
}));

const CampaignList: React.FC<CampaignListProps> = ({ className }) => {
  const classes = useStyles();
  const { data, revalidate } = useSWR<Campaign[]>('/api/campaigns', fetchJson);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<Campaign | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveCampaign = async (campaign: Campaign) => {
    setIsDialogLoading(true);

    const { ok, status } = await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });

    if (ok) {
      setShowNewDialog(false);
      setEditCampaign(null);
      enqueueSnackbar(status === 201 ? 'New campaign added.' : 'Campaign updated.', { variant: 'success' })
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar('An error occurred.', { variant: 'error' })
    }
    setIsDialogLoading(false);
  };

  const handleDeleteCampaign = async () => {
    if (!deleteRecord) {
      return;
    }
    setIsDialogLoading(true);

    const { ok } = await fetch(`/api/campaigns/${String(deleteRecord._id)}`, {
      method: 'DELETE',
    });
    if (ok) {
      setDeleteRecord(null);
      enqueueSnackbar('Campaign deleted.', { variant: 'success' })
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar('An error occurred.', { variant: 'error' })
    }
    setIsDialogLoading(false);
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
            data.length === 0 ? 'No Campaigns' : data.map((campaign) => (
              <Grid item className={classes.item} key={String(campaign._id)}>
                <Box component={Paper} className={classes.paper} display="flex" justifyContent="space-between">
                  <Box maxWidth="60%" display="flex" alignItems="center">
                    {/* <Avatar className={classes.avatar} src={image!}>{name.substring(0, 1).toLocaleUpperCase()}</Avatar> */}
                    <Typography className={classes.title} variant="body1" noWrap>{campaign.name}</Typography>
                    <Typography className={classes.desc} variant="caption" noWrap>&nbsp;&nbsp;{campaign.description}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    {campaign.influencers && !!campaign.influencers.length && (
                      <AvatarGroup spacing="small" max={5}>
                        {campaign.influencers.map(({ screenName, image }) => (
                          <Avatar key={screenName} src={image!}>{screenName?.substring(0, 1).toLocaleUpperCase()}</Avatar>
                        ))}
                      </AvatarGroup>
                    )}
                    <Divider orientation="vertical" />
                    {campaign.permissions?.canEdit && (
                      <IconButton onClick={() => setEditCampaign(campaign)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {campaign.permissions?.canDelete && (
                      <IconButton onClick={() => setDeleteRecord(campaign)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Section>
      {
        showNewDialog || editCampaign && (
          <CampaignDialog
            open
            isLoading={isDialogLoading}
            campaign={editCampaign}
            onSave={handleSaveCampaign}
            onClose={() => {
              setEditCampaign(null);
              setShowNewDialog(false);
            }}
          />
        )
      }
      {
        deleteRecord && (
          <ConfirmDialog
            open
            title={`Delete ${deleteRecord.name}`}
            subText="This cannot be undone.  Are you sure?"
            confirmText="Delete"
            onClose={() => setDeleteRecord(null)}
            onConfirm={handleDeleteCampaign}
            isLoading={isDialogLoading}
          />
        )
      }
    </>
  );
}
export default CampaignList;
