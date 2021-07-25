import { useIsMobile } from '@/hooks/useIsMobile';
import { useSharedState } from '@/hooks/useSharedState';
import { ValidSort } from '@/mongo/campaignSorts';
import { Campaign } from '@/types';
import { fetchJson } from '@/util';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Tooltip,
  debounce,
  makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import SortIcon from '@material-ui/icons/Sort';
import { TFunction } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useSnackbar } from 'notistack';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Waypoint } from 'react-waypoint';
import { useSWRInfinite } from 'swr';

import CampaignListItem from './CampaignListItem';
import Menu from './MenuWithTrigger';
import Section from './Section';
import { deleteCampaigns, postUpsertCampaign } from './util/fetch';

const CampaignDialog = dynamic(() => import('./CampaignDialog'), {
  ssr: false,
});
const ConfirmDialog = dynamic(() => import('./ConfirmDialog'), { ssr: false });

export type CampaignListProps = {
  className?: string;
};

const getSortOptions = (t: TFunction) =>
  useMemo<{ text: string; value: ValidSort }[]>(
    () => [
      {
        text: t('urgency') as string,
        value: 'urgency',
      },
      {
        text: t('name') as string,
        value: 'name',
      },
      {
        text: t('date_added_ascending') as string,
        value: 'dateAddedAsc',
      },
      {
        text: t('date_added_descending') as string,
        value: 'dateAddedDesc',
      },
    ],
    [t]
  );

const useStyles = makeStyles(({ breakpoints, spacing }) => ({
  item: {
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:empty': {
      padding: 0,
    },
  },
  searchField: {
    maxWidth: '200px',
  },
  searchIcon: {
    pointerEvents: 'none',
    cursor: 'pointer',
  },
  icons: {
    [breakpoints.up('sm')]: {
      margin: spacing(0, 2),
    },
  },
}));

const CampaignList: React.FC<CampaignListProps> = ({ className }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile({ breakpoint: 'sm' });
  const [searchValue, setSearchValue] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deleteRecord, setDeleteCampaign] = useState<Campaign | null>(null);
  const [showHidden, setShowHidden] = useSharedState('showHidden');
  const [sortValue, setSortValue] = useState<ValidSort>('urgency');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const debouncedSetSearchValue = useCallback(
    debounce(setDebouncedSearchValue, 500),
    []
  );
  useEffect(() => {
    debouncedSetSearchValue(searchValue);
  }, [searchValue]);

  const getSWRKey = useCallback(
    (page: number, previousPageData: Campaign[] | null) => {
      if (previousPageData && !previousPageData.length) return null;
      return `/api/campaigns?search=${debouncedSearchValue}&sort=${sortValue}&showHidden=${showHidden}&page=${page}`;
    },
    [debouncedSearchValue, sortValue, showHidden]
  );

  const { data, revalidate, mutate, size, setSize } = useSWRInfinite<
    Campaign[]
  >(getSWRKey, fetchJson);
  const { enqueueSnackbar } = useSnackbar();
  const sortOptions = getSortOptions(t);

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

    const { ok, status } = await postUpsertCampaign(saveCampaign);

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

    const success = await deleteCampaigns([String(deleteRecord._id)]);

    if (success) {
      setDeleteCampaign(null);
      enqueueSnackbar(t('campaign_deleted'), { variant: 'success' });
      // Fetch updated campaigns
      await revalidate();
    } else {
      enqueueSnackbar(t('an_error_occurred'), { variant: 'error' });
    }
    setIsDialogLoading(false);
  };

  const lastPage = (data?.length ?? 1) - 1;

  return (
    <>
      <Section
        title={t('campaigns')}
        titleAdornment={
          <Box display="flex" justifyContent="flex-end" flexBasis="50%">
            <TextField
              variant="outlined"
              className={classes.searchField}
              onClick={(e) => e.stopPropagation()}
              size="small"
              value={searchValue}
              onChange={({ target: { value } }) => setSearchValue(value)}
              InputProps={{
                endAdornment: !searchValue ? (
                  <SearchIcon fontSize="small" className={classes.searchIcon} />
                ) : (
                  <CancelIcon
                    onClick={() => setSearchValue('')}
                    fontSize="small"
                    style={{ cursor: 'pointer' }}
                  />
                ),
              }}
            />
            <Box display="flex" className={classes.icons}>
              <Menu
                id="campaign-sort"
                trigger={
                  <Tooltip title={t('sort_campaigns') as string}>
                    <SortIcon />
                  </Tooltip>
                }
              >
                {sortOptions.map(({ text, value }) => (
                  <Menu.Item key={value} onClick={() => setSortValue(value)}>
                    {text}
                  </Menu.Item>
                ))}
              </Menu>
              <Menu
                id="campaign-settings"
                trigger={
                  <Tooltip title={t('sort_campaigns') as string}>
                    <SettingsIcon />
                  </Tooltip>
                }
              >
                <Menu.Item
                  onClick={() => {
                    setShowHidden(!showHidden);
                    mutate();
                  }}
                >
                  {showHidden
                    ? t('hide_hidden_campaigns')
                    : t('show_hidden_campaigns')}
                </Menu.Item>
              </Menu>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewDialog(true);
              }}
            >
              <AddIcon />
              {isMobile ? t('new') : t('new_campaign')}
            </Button>
          </Box>
        }
        badgeNumber={data?.length || 0}
        className={className}
      >
        <Grid container direction="column" spacing={2}>
          {!data ? (
            <CircularProgress style={{ margin: '12px auto' }} />
          ) : data[0].length === 0 ? (
            t('no_campaigns')
          ) : (
            data.map((campaigns, pageIndex) => {
              const isLastPage =
                lastPage === pageIndex && campaigns.length === 10;
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
