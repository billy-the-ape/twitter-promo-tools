import { useMediaQuery, useTheme } from '@material-ui/core';
import type { Breakpoint } from '@material-ui/core/styles/createBreakpoints';

export type UseIsMobileProps = {
  defaultMatches?: boolean;
  breakpoint?: number | Breakpoint;
};

export const useIsMobile = ({
  breakpoint = 'xs',
  defaultMatches = false,
}: UseIsMobileProps = {}) => {
  const { breakpoints } = useTheme();
  return useMediaQuery(breakpoints.down(breakpoint), { defaultMatches });
};
