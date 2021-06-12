import { IconButton, Menu, MenuItem, MenuProps } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/MoreHoriz';
import { ReactNode, useState } from 'react';

export type MenuWithTriggerProps = Omit<MenuProps, 'open'> & {
  id: string;
  trigger?: ReactNode;
  children: ReactNode[];
};

export type MenuWithTriggerType = React.FC<MenuWithTriggerProps> & {
  Item: typeof MenuIcon;
};

const MenuWithTrigger: React.FC<MenuWithTriggerProps> = ({
  id,
  trigger = <MenuIcon />,
  children,
  ...menuProps
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (
    event: any,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    event.stopPropagation();
    setAnchorEl(null);
    menuProps.onClose && menuProps.onClose(event, reason);
  };

  return (
    <>
      <IconButton
        id={id}
        aria-controls={id + '-menu'}
        aria-haspopup="true"
        onClick={handleClick}
      >
        {trigger}
      </IconButton>
      <Menu
        {...menuProps}
        id={id + '-menu'}
        anchorEl={anchorEl}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};

(MenuWithTrigger as any).Item = MenuItem;

export default MenuWithTrigger as MenuWithTriggerType;
