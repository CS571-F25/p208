import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { HomeStateProvider } from './HomeStateContext.jsx';

createRoot(document.getElementById('root')).render(
  <HashRouter>
      <HomeStateProvider>
        <App />
      </HomeStateProvider>
  </HashRouter>
);