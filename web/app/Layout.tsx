import {
  Outlet
} from "react-router";

import "./app.css";
import Header from "./components/header/Header";
import { Box, Container, CssBaseline, styled, ThemeProvider } from "@mui/material";
import { useSelector } from 'react-redux';
import { useLocation, Navigate } from 'react-router';
import { $currentUser } from "~/store/user";


const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
}));

export default function Layout(props:any) {
  const user = useSelector($currentUser);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (!user && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  return (<>
          <MainWrapper className="mainwrapper">
              <PageWrapper className="page-wrapper">
                <Header/>
                    <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
                      {props.children ?? null}
                      <Outlet/>
                    </Box>
              </PageWrapper>
          </MainWrapper>
        </>
  );
}