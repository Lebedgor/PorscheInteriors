import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { authReducer, fetchAuth, isAuthInfo } from '../redux/slices/authSlice'
import { Navigate } from 'react-router-dom'

const LoginPage = () => {

const [ email, setEmail ] = React.useState('')
const [ password, setPassword ] = React.useState('')

const { data, status } = useSelector(state => state.auth)

const dispatch = useDispatch()

const getLogin = async () => {
  const loginData = await dispatch(fetchAuth({ 'email': email, 'password': password}))
  if(!loginData.payload){
    return alert('Не удалось авторизоваться')
  }
  if('token' in loginData.payload){
    window.localStorage.setItem('token', loginData.payload.token)
    return <Navigate to="/"></Navigate>
  }
}

if(data){
  return <Navigate to="/"></Navigate>
}


  return (
    <div className="auth-page-container">
      <div className="page-title">Авторизация</div>
      <div className="auth-form">
        <div className="text-field-container"><input type="email" placeholder='Емейл' name="email" onChange={event => setEmail(event.target.value)} value={email} /></div>
        <div className="text-field-container"><input type="text" placeholder="Пароль" name="password" onChange={event => setPassword(event.target.value)} value={password} /></div>
        <button onClick={getLogin} className="auth-btn">Войти</button>
      </div>
    </div>
  )
}

export default LoginPage