import './scss/app.scss';
import Header from './components/Header';
import { Route, Routes } from 'react-router-dom';
import Category from './pages/Category';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { useDispatch } from 'react-redux';
import { fetchAuthMe } from './redux/slices/authSlice';
import { fetchSiteSettings } from './redux/slices/siteSettingsSlice';
import React from 'react';
import InstallPage from './pages/InstallPage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';

function App() {

  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(fetchAuthMe())
    dispatch(fetchSiteSettings())
  }, [])

  return (
    <div className="app-wrapper">
      <Header />
      <div className="router-content">
        <Routes>
          <Route path="/" element={<Category />}></Route>
          <Route path="/category/:id" element={<Category />}></Route>
          <Route path="/model/:id" element={<Category />}></Route>
          <Route path="/interior/:id" element={<Category />}></Route>
          <Route path="/register" element={<RegisterPage />}></Route>
          <Route path="/settings" element={<AdminPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/install" element={<InstallPage />}></Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
