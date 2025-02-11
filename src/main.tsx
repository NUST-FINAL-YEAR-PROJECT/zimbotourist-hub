
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Create root with proper type assertion
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// Wrap the app in React.StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
