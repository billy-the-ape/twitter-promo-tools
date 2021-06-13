import { Box, Paper, Typography, makeStyles } from '@material-ui/core';
import { ReactNode } from 'react';

export type SectionProps = {
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
}) => {
  return (
    <Paper className={className}>
      <Box p={2} width="100%" display="flex" justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        {titleAdornment}
      </Box>
      <Box p={2}>{children}</Box>
    </Paper>
  );
};
export default Section;
