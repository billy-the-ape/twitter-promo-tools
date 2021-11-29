import { Campaign } from '@/types';
import { CircularProgress, Grid, makeStyles } from '@material-ui/core';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Waypoint } from 'react-waypoint';

import CampaignListItem from './CampaignListItem';

const useStyles = makeStyles({
  item: {
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:empty': {
      padding: 0,
    },
  },
});

export type CampaignListViewProps = {
  data: Campaign[][] | undefined;
  size: number;
  setSize: (
    size: number | ((size: number) => number)
  ) => Promise<Campaign[][] | undefined>;
  setDeleteCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
  setEditCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>;
  mutate: () => void;
};

const CampaignListView: React.FC<CampaignListViewProps> = ({
  data,
  size,
  setSize,
  setDeleteCampaign,
  setEditCampaign,
  mutate,
}) => {
  const { t } = useTranslation();
  const lastPage = (data?.length ?? 1) - 1;
  const classes = useStyles();

  return (
    <Grid container direction="column" spacing={2}>
      {!data ? (
        <CircularProgress style={{ margin: '12px auto' }} />
      ) : data[0].length === 0 ? (
        t('no_campaigns')
      ) : (
        data.map((campaigns, pageIndex) => {
          const isLastPage = lastPage === pageIndex && campaigns.length === 10;
          return campaigns.map((campaign, index) => {
            return (
              <Fragment key={String(campaign._id)}>
                {isLastPage && index === 9 && (
                  <Waypoint
                    onEnter={() => setSize(Math.max(size, pageIndex + 2))}
                  />
                )}
                <Grid item className={classes.item}>
                  <CampaignListItem
                    campaign={campaign}
                    mutate={mutate}
                    setDeleteCampaign={setDeleteCampaign}
                    setEditCampaign={setEditCampaign}
                  />
                </Grid>
              </Fragment>
            );
          });
        })
      )}
    </Grid>
  );
};

export default CampaignListView;
