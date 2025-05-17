import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import { basedarkTheme } from "./themes.tsx";
import { Layout } from './Layout.tsx'
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import routes from './routes.ts';
import NotFound from './routes/404.tsx';
import Loader from './loader.ts'
export const router = createBrowserRouter([{
  path: "/",
	Component: Layout,
  loader: Loader,
  children: routes
}, {path: "*", element: <Layout><NotFound/></Layout>}
  ], {basename: import.meta.env.BASE_URL});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={basedarkTheme}>
    <CssBaseline />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    </ThemeProvider>
  </StrictMode>,
)
