import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from './config';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      {...(PRIVY_CLIENT_ID ? { clientId: PRIVY_CLIENT_ID } : {})}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#ecc48f',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
