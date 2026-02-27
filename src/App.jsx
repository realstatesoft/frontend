import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/propiedades" element={<PropertiesPage />} />
      <Route path="/create-property" element={<CreateProperty />} />
    </Routes>
  );
}

export default App;
