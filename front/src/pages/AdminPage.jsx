import React from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { edit, getAllUsers, activate } from '../redux/slices/userSlice';
import { useState } from 'react';

const AdminPage = () => {
  
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  const { users, settings } = useSelector(state => state.userSlice);

  const current_user = useSelector(state => state.auth.data);

  const editUserInfo = async() => {
    if(input.password.length > 5 && input.password === input.confirmPassword) {
      const answer = await dispatch(edit(input));
      if(answer.payload.token){
        setInput({
          currentPassword: '',
          password: '',
          confirmPassword: ''
        });
        return alert(answer.payload.message);
      } else {
        return alert(answer.payload.message);
      }
    } else {
      if(input.password.length < 5) {
        return alert("Пароль должен быть более 5 символов");
      } else {
        return alert("Подтверждение пароля не совпадает");
      }
    }
  }

  const toggleActivate = async(user_id, activ) => {
    let activated = await dispatch(activate({user_id: user_id, activate: activ ? 0 : 1}));
    console.log(activated.data);
    dispatch(getAllUsers());
  }

  useEffect(() => {
    dispatch(getAllUsers());
  }, [])

  const changeRegisterParams = (event) => {
    let data = { ...input };
    data[event.target.name] = event.target.value;
    setInput(data)
  }

  return (
    <div className="auth-page-container">
      <div className="page-title">Настройки</div>
      {current_user ? 
      <div className="user-page-content">
            <div className="user-info-block">
            <div className="user-info-row">
              <div className="user-info-name">email</div>
              <div className="user-info-value">{current_user.userData['email']}</div>
            </div>
            <div className="user-info-row">
              <div className="user-info-name">name</div>
              <div className="user-info-value">{current_user.userData['name']}</div>
            </div>
        </div>

      <div className="auth-form">
        <div className="text-field-container">
          <span>Текущий пароль</span>
          <input type="text" placeholder="Текущий пароль" name="currentPassword" 
          value={input.currentPassword} onChange={(event) =>changeRegisterParams(event)} />
        </div>
        <div className="text-field-container">
          <span>Новый пароль</span>
          <input type="text" placeholder="Новый пароль" name="password" 
          value={input.password} onChange={(event) =>changeRegisterParams(event)} />
        </div>
        <div className="text-field-container">
          <span>Подтвердите пароль</span>
          <input type="text" placeholder="Подтвердите пароль" name="confirmPassword" 
          value={input.confirmPassword} onChange={(event) =>changeRegisterParams(event)} />
        </div>
        <button onClick={editUserInfo} className="auth-btn">Сохранить</button>

        { users.length > 1 ? 
        <div className="users-block">
        <div className="user-title">Администраторы</div>
        <div className="users-query">
          <div className="user-row">
              <div className="user-id">ID</div>
              <div className="user-name">Имя</div>
              <div className="user-email">Эмейл</div>
              <div className="user-activate">Активирован</div>
            </div>
          {users.map(user => current_user.userData['user_id'] !== user.user_id ?
            <div className="user-row" key={user.user_id}>
              <div className="user-id">{user.user_id}</div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-activate">
                <button type="button" className={user.activate ? 'active' : ''}
                onClick={() => toggleActivate(user.user_id, user.activate)}>{user.activate ? "Да" : "Нет"}</button>
                </div>
            </div>
            :
            null
            )}
        </div>
      </div>
      :
      null
      }
      </div>
      </div>
      : null}
    </div>
  )
}

export default AdminPage