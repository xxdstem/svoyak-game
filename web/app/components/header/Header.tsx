import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button, Typography } from '@mui/material';

import PropTypes from 'prop-types';
import { Link } from 'react-router';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Logo from "../../../assets/logo.svg"
import { $currentUser, clearUser } from '~/store/user';
import { useDispatch, useSelector } from 'react-redux';
import type { User } from '~/types';
import http from '~/utils/axios';
interface ItemType {
  toggleMobileSidebar:  (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({toggleMobileSidebar}: ItemType) => {
  const dispatch = useDispatch();

  const logout = ()=>{
    http.post("/logout")
    dispatch(clearUser());
  }
  const currentUser: User = useSelector($currentUser);
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    // opacity: 0.8,
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <MenuIcon width="20" height="20" />
        </IconButton>
        <Link to="/"><img height={'52'} src={Logo}></img></Link>
          
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
            {!currentUser ? <Button variant="contained" component={Link} to="/"   disableElevation color="primary" >
            Login
          </Button>
          : <>
          <Typography>{currentUser.UserName}</Typography>
          <IconButton
            onClick={()=>logout()}
            sx={{marginLeft: '8px'}}
            size="large"
            aria-label="show 11 new notifications"
            color="inherit"
            aria-controls="msgs-menu"
            aria-haspopup="true"
          >
            <ExitToAppIcon width="20" height="20" />
          </IconButton>
          </>}
          
          {/* <Profile /> */}
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;

