import React from "react";
import { Provider } from "react-redux";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import createStore from "./store";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Wrapper from "./components/Wrapper";
import Metrics from "./Features/Metrics/Metrics";
import { ToastContainer } from "react-toastify";


const store = createStore();
const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(39,49,66)",
    },
    secondary: {
      main: "rgb(197,208,222)",
    },
    background: {
      default: "rgb(226,231,238)",
    },
  },
});

const App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Provider store={store}>
      <Wrapper>
        <Header />
        <Metrics />
        <ToastContainer />
      </Wrapper>
    </Provider>
  </MuiThemeProvider>
);

export default App;
