import { Campaign } from '@/types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Divider,
  Hidden,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import { AvatarGroup } from '@material-ui/lab';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '@/util';
import { useIsMobile } from '@/hooks/useIsMobile';

const useStyles = makeStyles(({ spacing, palette }) => ({
  campaignItemRoot: {
    backgroundColor: palette.background.default,
  },
  spaced: {
    margin: spacing(0, 1),
  },
  summaryContent: {
    maxWidth: 'calc(100% - 36px)',
  },
}));

export type CampaignListItemProps = {
  campaign: Campaign;
  setEditCampaign?: (c: Campaign) => void;
  setDeleteCampaign?: (c: Campaign) => void;
};

const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  setEditCampaign,
  setDeleteCampaign,
}) => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Accordion
      disabled={!campaign.description}
      className={classes.campaignItemRoot}
      onChange={(_, expanded) => setIsExpanded(expanded)}
    >
      <AccordionSummary
        classes={{ content: classes.summaryContent }}
        expandIcon={campaign.description && <ExpandMoreIcon />}
      >
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box
            maxWidth={isMobile ? '60%' : '50%'}
            display="flex"
            alignItems="center"
          >
            {(!isExpanded || !isMobile) && (
              <Typography className={classes.spaced} variant="body1" noWrap>
                {campaign.name}
              </Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center">
            <Hidden smDown>
              <Box display="flex" alignItems="center" mr={1}>
                {campaign.tweetCount && (
                  <Typography variant="caption">
                    {campaign.tweetCount} Tweets
                  </Typography>
                )}
                {(campaign.startDate || campaign.endDate) && (
                  <Box>
                    <Typography className={classes.spaced} variant="caption">
                      {formatDate(campaign.startDate)}
                    </Typography>
                    -
                    <Typography className={classes.spaced} variant="caption">
                      {formatDate(campaign.endDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Hidden>
            {campaign.influencers && !!campaign.influencers.length && (
              <Hidden xsDown>
                <AvatarGroup spacing="small" max={5}>
                  {campaign.influencers.map(({ screenName, image }) => (
                    <Avatar key={screenName} src={image!}>
                      {screenName?.substring(0, 1).toLocaleUpperCase()}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Hidden>
            )}
            <Divider orientation="vertical" />
            {setEditCampaign && campaign.permissions?.canEdit && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditCampaign(campaign);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {setDeleteCampaign && campaign.permissions?.canDelete && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteCampaign(campaign);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </AccordionSummary>
      {campaign.description && (
        // ACCORDION DETAILS!!
        <AccordionDetails>
          <Box
            display="flex"
            width="100%"
            flexDirection="column"
            maxHeight="300px"
            overflow="auto"
          >
            {isMobile && (
              <>
                <Typography variant="body1">{campaign.name}</Typography>
                <Divider />
              </>
            )}
            <Hidden mdUp>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-around"
              >
                {campaign.tweetCount && (
                  <Typography variant="caption">
                    {campaign.tweetCount} Tweets
                  </Typography>
                )}
                {(campaign.startDate || campaign.endDate) && (
                  <div>
                    <Typography className={classes.spaced} variant="caption">
                      {formatDate(campaign.startDate)}
                    </Typography>
                    -
                    <Typography className={classes.spaced} variant="caption">
                      {formatDate(campaign.endDate)}
                    </Typography>
                  </div>
                )}
                {campaign.influencers && campaign.influencers.length && (
                  <Hidden smUp>
                    <AvatarGroup spacing="small" max={3}>
                      {campaign.influencers.map(({ screenName, image }) => (
                        <Avatar key={screenName} src={image!}>
                          {screenName?.substring(0, 1).toLocaleUpperCase()}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Hidden>
                )}
              </Box>
              <Divider />
            </Hidden>
            {campaign.description.split('\n').map((desc) => (
              <ReactMarkdown>{desc}</ReactMarkdown>
            ))}
          </Box>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default CampaignListItem;
