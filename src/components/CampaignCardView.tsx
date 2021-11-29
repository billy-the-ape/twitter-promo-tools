import { useSharedState } from '@/hooks/useSharedState';
import { CircularProgress, Grid } from '@material-ui/core';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Waypoint } from 'react-waypoint';

import CampaignCardItem from './CampaignCardItem';
import { CampaignListViewProps } from './CampaignListView';

const CampaignCardView: React.FC<CampaignListViewProps> = ({
  data,
  size,
  mutate,
  setSize,
  setDeleteCampaign,
  setEditCampaign,
}) => {
  const { t } = useTranslation();
  const lastPage = (data?.length ?? 1) - 1;
  const [showHidden] = useSharedState('showHidden');

  return !data ? (
    <CircularProgress style={{ margin: '12px auto' }} />
  ) : data[0].length === 0 ? (
    t('no_campaigns')
  ) : (
    <Grid container spacing={2}>
      {data.map((campaigns, pageIndex) => {
        const isLastPage = lastPage === pageIndex && campaigns.length === 10;
        return campaigns.map((campaign, index) => {
          if (!showHidden && campaign.hidden) {
            return null;
          }
          return (
            <Fragment key={String(campaign._id)}>
              {isLastPage && index === 9 && (
                <Waypoint
                  onEnter={() => setSize(Math.max(size, pageIndex + 2))}
                />
              )}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CampaignCardItem
                  mutate={mutate}
                  setDeleteCampaign={setDeleteCampaign}
                  setEditCampaign={setEditCampaign}
                  campaign={campaign}
                />
              </Grid>
            </Fragment>
          );
        });
      })}
    </Grid>
  );
};

export default CampaignCardView;
