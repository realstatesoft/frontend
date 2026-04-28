import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { i18n, initializeI18n } from './i18n'
import './styles/main.scss';
import { BrowserRouter } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = createRoot(document.getElementById('root'));

void initializeI18n().finally(() => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </I18nextProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});
