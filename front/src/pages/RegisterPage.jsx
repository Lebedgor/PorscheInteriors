import React, { useState, useEffect } from 'react'
import { addRegister } from '../redux/slices/registerSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RegisterPage = () => {

  const [registerParams, setRegisterParams] = useState({email: '', name: '', password: ''});

  const { data, status } = useSelector(state => state.registerSlice)

  const dispatch = useDispatch();

  const getRegister = () => {
    dispatch(addRegister(registerParams))
  }

  useEffect(() => {
    console.log(registerParams)
  }, [registerParams])

  const changeRegisterParams = (event) => {
    let data = { ...registerParams };
    data[event.target.name] = event.target.value;
    setRegisterParams(data)
  }

  return (
    <div className="auth-page-container">
      <div className="page-title">Регистрация</div>
      <div className="auth-form">
        <div className="text-field-container"><input type="text" placeholder='Емейл' name="email" 
        value={registerParams.email} onChange={(event) =>changeRegisterParams(event)} /></div>
        <div className="text-field-container"><input type="text" placeholder="Имя" name="name" 
        value={registerParams.name} onChange={(event) =>changeRegisterParams(event)} /></div>
        <div className="text-field-container"><input type="text" placeholder="Пароль" name="password" 
        value={registerParams.password} onChange={(event) =>changeRegisterParams(event)} /></div>
        <button onClick={getRegister} className="auth-btn">Зарегистрироваться</button>
      </div>
    </div>
  )
}

export default RegisterPage