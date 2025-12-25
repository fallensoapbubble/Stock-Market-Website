import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { MarketProvider } from "./context/MarketContext";
import Home from "./components/Home";
import "./index.css";

const theme = createTheme({
  palette: {
    primary: {
      main: '#4184f3',
    },
    secondary: {
      main: '#ff5722',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MarketProvider>
          <Routes>
            <Route path="/*" element={<Home />} />
          </Routes>
        </MarketProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
