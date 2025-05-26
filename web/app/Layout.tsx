import {
  createBrowserRouter,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  RouterProvider,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import "./app.css";
import Header from "./components/header/Header";
import { useEffect, useState } from "react";

import { Box, Container, CssBaseline, styled, ThemeProvider } from "@mui/material";
import Home from "./routes/home";
import Game from "./routes/game";
import http from "./utils/axios";
import { setUser } from "./store/user";
import { useDispatch } from "react-redux";


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
  const { user } = useLoaderData();
  const dispatch = useDispatch();

  useEffect(()=>{
    if(user) dispatch(setUser(user));
  },[user])

  return (<>
          <MainWrapper className="mainwrapper">
              <PageWrapper className="page-wrapper">
                <Header toggleMobileSidebar={()=>null}/>
                    <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
                      {props.children ?? null}
                      <Outlet/>
                    </Box>
              </PageWrapper>
          </MainWrapper>
        </>
  );
}