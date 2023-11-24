import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { isAuthInfo, logout } from '../redux/slices/authSlice'

const Header = () => {

  const dispatch = useDispatch()
  const isAuth = useSelector(isAuthInfo);

  const getLogout = () => {
    if (window.confirm('Вы действительно хотите выйти?')){
      dispatch(logout())
    }

  }

  return (
    <div className="header-container">
      <div className="header">
        <div className="header-title">
         <Link to="/">PORSCHE</Link>
        </div>
      </div>
      <div className="menu-container">
        <div className="autorization-container">
          <div className="login-block">
            { isAuth ? <div className="user-settings-block"><Link to="/settings">Настройки</Link><button onClick={getLogout}>Выйти</button></div> : <Link to="/login">Войти</Link> }
          </div>
            { !isAuth ? 
              <div className="register-block">
                <Link to="/register">Зарегистрироваться</Link>
              </div> : ''}
        </div>
      </div>
      <div className="svg-images-container" style={{position: 'absolute',	left: '-9999px'}}>
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <symbol id="svg-trash" viewBox="0 0 24 24" fill="none">
            <path d="M9.1709 4C9.58273 2.83481 10.694 2 12.0002 2C13.3064 2 14.4177 2.83481 14.8295 4" stroke="inherit" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M20.5001 6H3.5" stroke="inherit" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="inherit" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9.5 11L10 16" stroke="inherit" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14.5 11L14 16" stroke="inherit" strokeWidth="1.5" strokeLinecap="round"/>
          </symbol>
          <symbol id="svg-pencyl" viewBox="0 0 512 512">
            <path className="st0" d="M497.209,88.393l-73.626-73.6c-19.721-19.712-51.656-19.729-71.376-0.017L304.473,62.51L71.218,295.816
              c-9.671,9.662-17.066,21.341-21.695,34.193L2.238,461.6c-4.93,13.73-1.492,29.064,8.818,39.372
              c10.318,10.317,25.659,13.739,39.39,8.801l131.565-47.286c12.851-4.628,24.539-12.032,34.201-21.694l220.801-220.817l0.017,0.017
              l12.481-12.498l47.699-47.725l0.026-0.018C516.861,140.039,516.939,108.14,497.209,88.393z M170.064,429.26l-83.822,30.133
              l-33.606-33.607l30.116-83.831c0.224-0.604,0.517-1.19,0.758-1.792l88.339,88.339C171.245,428.752,170.676,429.036,170.064,429.26z
              M191.242,415.831c-1.19,1.19-2.457,2.284-3.741,3.362l-94.674-94.674c1.069-1.276,2.163-2.552,3.352-3.741L327.685,89.22
              l95.079,95.08L191.242,415.831z M472.247,134.808l-35.235,35.244l-1.767,1.767l-95.08-95.079l37.003-37.003
              c5.921-5.896,15.506-5.905,21.454,0.017l73.625,73.609c5.921,5.904,5.93,15.489-0.026,21.47L472.247,134.808z"/>
          </symbol>
          <symbol id="svg-plus" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" fill="transparent"/>
            <path d="M12 6V18" stroke="#000000" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 12H18" stroke="#000000" strokeLinecap="round" strokeLinejoin="round"/>
          </symbol>
          <symbol id="svg-angle" viewBox="-12 0 32 32">
            <path d="M0.88 23.28c-0.2 0-0.44-0.080-0.6-0.24-0.32-0.32-0.32-0.84 0-1.2l5.76-5.84-5.8-5.84c-0.32-0.32-0.32-0.84 0-1.2 0.32-0.32 0.84-0.32 1.2 0l6.44 6.44c0.16 0.16 0.24 0.36 0.24 0.6s-0.080 0.44-0.24 0.6l-6.4 6.44c-0.2 0.16-0.4 0.24-0.6 0.24z"/>
          </symbol>
          <symbol id="svg-check" viewBox="0 0 16 16"><path d="M14.78 4.28a.75.75 0 00-1.06-1.06l-7.97 7.97-3.47-3.47a.75.75 0 00-1.06 1.06l4 4a.75.75 0 001.06 0l8.5-8.5z"/>
          </symbol>
          <symbol id="svg-photo" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 18C14.7614 18 17 15.7614 17 13C17 10.2386 14.7614 8 12 8C9.23858 8 7 10.2386 7 13C7 15.7614 9.23858 18 12 18ZM12 16.0071C10.3392 16.0071 8.9929 14.6608 8.9929 13C8.9929 11.3392 10.3392 9.9929 12 9.9929C13.6608 9.9929 15.0071 11.3392 15.0071 13C15.0071 14.6608 13.6608 16.0071 12 16.0071Z" fill="#0F0F0F"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M9.56155 2C8.18495 2 6.985 2.93689 6.65112 4.27239L6.21922 6H4C2.34315 6 1 7.34315 1 9V19C1 20.6569 2.34315 22 4 22H20C21.6569 22 23 20.6569 23 19V9C23 7.34315 21.6569 6 20 6H17.7808L17.3489 4.27239C17.015 2.93689 15.8151 2 14.4384 2H9.56155ZM8.59141 4.75746C8.7027 4.3123 9.10268 4 9.56155 4H14.4384C14.8973 4 15.2973 4.3123 15.4086 4.75746L15.8405 6.48507C16.0631 7.37541 16.863 8 17.7808 8H20C20.5523 8 21 8.44772 21 9V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V9C3 8.44772 3.44772 8 4 8H6.21922C7.13696 8 7.93692 7.37541 8.15951 6.48507L8.59141 4.75746Z" fill="#0F0F0F"/>
          </symbol>
        </svg>
      </div>
    </div>
  )
}

export default Header