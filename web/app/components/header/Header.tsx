import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button, Typography } from '@mui/material';

import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Logo from "../../../assets/logo.svg"
import { $currentUser, clearUser } from '~/store/user';
import { useDispatch, useSelector } from 'react-redux';
import type { User } from '~/types';
import http from '~/utils/axios';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = ()=>{
    http.post("/logout")
    dispatch(clearUser());
    navigate("/")
  }
  const currentUser = useSelector($currentUser);
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.background.paper,
    justifyContent: 'center',
    opacity: 0.8,
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
        
        <Link to="/"><img height={'52'} src={Logo}></img></Link>
          
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
            {!currentUser ? <Button variant="contained" component={Link} to="/"   disableElevation color="primary" >
            Login
          </Button>
          : <>
          <Typography>{currentUser.username}</Typography>
          <IconButton
            onClick={()=>logout()}
            sx={{marginLeft: '8px'}}
            size="large"
            color="inherit"
          >
            <ExitToAppIcon width="20" height="20" />
          </IconButton>
          </>}
          
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;

