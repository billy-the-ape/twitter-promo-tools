import { Button, CircularProgress, Grid, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import useSWR from 'swr';
import { useSnackbar } from 'notistack';
import { Campaign } from '@/types';
import { fetchJson } from '@/util';
import Section from './Section';
import CampaignListItem from './CampaignListItem';

const CampaignDialog = dynamic(() => import('./CampaignDialog'), {
  ssr: false,
});
const ConfirmDialog = dynamic(() => import('./ConfirmDialog'), { ssr: false });

export type CampaignListProps = {
  className?: string;
};

const useStyles = makeStyles({
  item: {
    maxWidth: '100%',
  },
});

const CampaignList: React.FC<CampaignListProps> = ({ className }) => {
  const classes = useStyles();
  const { data, revalidate } = useSWR<Campaign[]>('/api/campaigns', fetchJson);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteRecord, setDeleteCampaign] = useState<Campaign | null>(null);
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
      enqueueSnackbar(
        status === 201 ? 'New campaign added.' : 'Campaign updated.',
        { variant: 'success' }
      );
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar('An error occurred.', { variant: 'error' });
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
      setDeleteCampaign(null);
      enqueueSnackbar('Campaign deleted.', { variant: 'success' });
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar('An error occurred.', { variant: 'error' });
    }
    setIsDialogLoading(false);
  };

  return (
    <>
      <Section
        title="Campaigns"
        titleAdornment={
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewDialog(true);
            }}
          >
            <AddIcon />
            New Campaign
          </Button>
        }
        badgeNumber={data?.length || 0}
        className={className}
      >
        <Grid container direction="column" spacing={2}>
          {!data ? (
            <CircularProgress style={{ margin: 'auto' }} />
          ) : data.length === 0 ? (
            'No Campaigns'
          ) : (
            data.map((campaign) => (
              <Grid item className={classes.item} key={String(campaign._id)}>
                <CampaignListItem
                  campaign={campaign}
                  setDeleteCampaign={setDeleteCampaign}
                  setEditCampaign={setEditCampaign}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Section>
      {(showNewDialog || editCampaign) && (
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
      )}
      {deleteRecord && (
        <ConfirmDialog
          open
          title={`Delete ${deleteRecord.name}`}
          subText="This cannot be undone.  Are you sure?"
          confirmText="Delete"
          onClose={() => setDeleteCampaign(null)}
          onConfirm={handleDeleteCampaign}
          isLoading={isDialogLoading}
        />
      )}
    </>
  );
};
export default CampaignList;
