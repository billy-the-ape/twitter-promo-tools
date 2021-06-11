import { Campaign } from '@/types';
import { fetchJson } from '@/util';
import { Button, CircularProgress, Grid, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import dynamic from 'next/dynamic';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CampaignListItem from './CampaignListItem';
import Section from './Section';

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
    display: 'flex',
    flexDirection: 'column',
  },
});

const CampaignList: React.FC<CampaignListProps> = ({ className }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data, revalidate } = useSWR<Campaign[]>('/api/campaigns', fetchJson);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteRecord, setDeleteCampaign] = useState<Campaign | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveCampaign = async ({
    influencers,
    managers,
    ...campaign
  }: Campaign) => {
    setIsDialogLoading(true);

    const saveCampaign: Campaign = {
      ...campaign,
      influencers: influencers?.map(({ id }) => ({
        id,
      })),
      managers: managers?.map(({ id }) => ({
        id,
      })),
    };

    const { ok, status } = await fetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(saveCampaign),
    });

    if (ok) {
      setShowNewDialog(false);
      setEditCampaign(null);
      enqueueSnackbar(
        status === 201 ? t('new_campaign_added') : t('campaign_updated'),
        { variant: 'success' }
      );
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
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
      enqueueSnackbar(t('campaign_deleted'), { variant: 'success' });
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
    setIsDialogLoading(false);
  };

  return (
    <>
      <Section
        title={t('campaigns')}
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
            {t('new_campaign')}
          </Button>
        }
        badgeNumber={data?.length || 0}
        className={className}
      >
        <Grid container direction="column" spacing={2}>
          {!data ? (
            <CircularProgress style={{ margin: 'auto' }} />
          ) : data.length === 0 ? (
            t('no_campaigns')
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
          title={t('delete_name', { name: deleteRecord.name })}
          subText={t('delete_confirm')}
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
