import {
  Outlet
} from "react-router";

import "./app.css";
import Header from "./components/header/Header";
import { Box, Container, CssBaseline, styled, ThemeProvider } from "@mui/material";


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