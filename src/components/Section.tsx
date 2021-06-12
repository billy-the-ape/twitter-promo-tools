import {
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Badge,
  Box,
  Paper,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactNode, useState } from 'react';

export type SectionProps = AccordionProps & {
  title: ReactNode;
  titleAdornment?: ReactNode;
  className?: string;
  badgeNumber?: number;
  expandDisabled?: boolean;
};

const Section: React.FC<SectionProps> = ({
  className,
  title,
  titleAdornment,
  children,
  badgeNumber = 0,
  ...rest
}) => {
  return (
    <Paper className={className}>
      <Box p={2} width="100%" display="flex" justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        <Box flex="1">{titleAdornment}</Box>
      </Box>
      <Box p={2}>{children}</Box>
    </Paper>
  );
};
export default Section;
