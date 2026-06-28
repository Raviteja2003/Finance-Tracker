import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

/**
 * The root DOM element where the React application will be mounted.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

/**
 * Creates the React root and renders the application.
 * The application is wrapped in several providers:
 * - StrictMode: Helps identify potential problems in the application.
 * - Provider: Makes the Redux store available to the entire app.
 * - ThemeProvider: Provides theme context to manage light/dark mode.
 * - BrowserRouter: Enables routing capabilities in the app.
 * Finally, the App component is rendered as the main component of the application.
 */
createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);


