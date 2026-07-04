import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import PortfolioApp from './PortfolioApp.tsx';
import 'lenis/dist/lenis.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioApp />
  </StrictMode>,
);
