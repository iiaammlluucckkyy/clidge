import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { LocationProvider } from './context/LocationContext';
import { AttendanceProvider } from './context/AttendanceContext';
import './assets/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <EventProvider>
            <AttendanceProvider>
              <App />
            </AttendanceProvider>
          </EventProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
