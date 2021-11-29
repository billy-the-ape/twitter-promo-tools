import { Campaign } from '@/types';
import { calculatePercentOff } from '@/util';
import { Box, Tooltip } from '@material-ui/core';
import GaugeChart from 'react-gauge-chart';
import { useTranslation } from 'react-i18next';

export type CampaignProgressGaugeProps = {
  campaign: Campaign;
};

const CampaignProgressGauge: React.FC<CampaignProgressGaugeProps> = ({
  campaign,
}) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('chart_explanation') as string}>
      <Box mb={-1} ml={-1.5}>
        <GaugeChart
          hideText
          id={`chart-${campaign._id}`}
          style={{ width: 80 }}
          percent={calculatePercentOff(campaign)}
        />
      </Box>
    </Tooltip>
  );
};

export default CampaignProgressGauge;
