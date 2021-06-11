import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  Badge,
  Box,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactNode, useState } from 'react';

export type SectionProps = AccordionProps & {
  title: ReactNode;
  titleAdornment?: ReactNode;
  className?: string;
  badgeNumber?: number;
};

const Section: React.FC<SectionProps> = ({
  className,
  title,
  titleAdornment,
  children,
  badgeNumber = 0,
  ...rest
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Accordion
      defaultExpanded
      {...rest}
      onChange={(_, expanded) => {
        setIsExpanded(expanded);
        rest.onChange && rest.onChange(_, expanded);
      }}
      className={className}
    >
      <AccordionSummary
        expandIcon={
          <Badge
            badgeContent={badgeNumber}
            color="secondary"
            invisible={isExpanded || badgeNumber === 0}
          >
            <ExpandMoreIcon />
          </Badge>
        }
      >
        <Box width="100%" display="flex" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          {isExpanded && titleAdornment}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
export default Section;
