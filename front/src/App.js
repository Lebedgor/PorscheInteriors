import './scss/app.scss';
import Header from './components/Header';
import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import InteriorColors from './pages/InteriorColors';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { useDispatch } from 'react-redux';
import { fetchAuthMe } from './redux/slices/authSlice';
import React from 'react';
import InteriorImages from './pages/InteriorImages';
import InstallPage from './pages/InstallPage';
import AdminPage from './pages/AdminPage';

function App() {

  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(fetchAuthMe())
  }, [])

  return (
    <div className="app-wrapper">
      <Header />
      <div className="router-content">
        <Routes>
          <Route path="/" element={<MainPage />}></Route>
          <Route path="/model/:id" element={<InteriorColors />}></Route>
          <Route path="/interior/:id" element={<InteriorImages />}></Route>
          <Route path="/register" element={<RegisterPage />}></Route>
          <Route path="/settings" element={<AdminPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/install" element={<InstallPage />}></Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
