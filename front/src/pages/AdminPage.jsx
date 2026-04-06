import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios, { getImageUrl, placeholderImage } from '../axios'
import { fetchAuthMe } from '../redux/slices/authSlice'
import { activate, createUser, edit, getAllUsers, removeUser } from '../redux/slices/userSlice'
import { fetchSiteSettings, homeSeoDefaults, updateHomeSeoSettings, updateImageSettings } from '../redux/slices/siteSettingsSlice'
import {
  formatImageBeforeUpload,
  imageFormatOptions,
  imageSettingsDefaults,
  normalizeImageSettings
} from '../imageSettings'

const AdminPage = () => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('profile')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [imageSettingsForm, setImageSettingsForm] = useState(imageSettingsDefaults)
  const [seoHomeForm, setSeoHomeForm] = useState(homeSeoDefaults)
  const [cacheJob, setCacheJob] = useState(null)
  const [cacheActionLoading, setCacheActionLoading] = useState(false)

  const { users, status } = useSelector((state) => state.userSlice)
  const currentUserState = useSelector((state) => state.auth.data)
  const { imageSettings, homeSeo, saveStatus } = useSelector((state) => state.siteSettings)
  const currentUser = currentUserState?.userData || null
  const tabs = [
    { id: 'profile', label: 'Профіль', description: 'Поточний користувач і пароль' },
    { id: 'users', label: 'Користувачі', description: 'Створення і керування доступом' },
    { id: 'seo', label: 'SEO', description: 'Title, Description, H1 головної' },
    { id: 'media', label: 'Медіа', description: 'Параметри обробки зображень' }
  ]

  useEffect(() => {
    dispatch(getAllUsers())
    dispatch(fetchSiteSettings())
  }, [dispatch])

  useEffect(() => {
    setImageSettingsForm(imageSettings)
  }, [imageSettings])

  useEffect(() => {
    setSeoHomeForm(homeSeo)
  }, [homeSeo])

  useEffect(() => {
    if (activeTab !== 'media' || !currentUser) {
      return undefined
    }

    let isUnmounted = false

    const loadCacheStatus = async () => {
      try {
        const { data } = await axios.get('/cache/generate/status')

        if (!isUnmounted) {
          setCacheJob(data?.job || null)
        }
      } catch (error) {
        if (!isUnmounted) {
          setCacheJob(null)
        }
      }
    }

    loadCacheStatus()
    const intervalId = window.setInterval(loadCacheStatus, 1200)

    return () => {
      isUnmounted = true
      window.clearInterval(intervalId)
    }
  }, [activeTab, currentUser])

  const changePasswordField = (event) => {
    setPasswordForm((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value
    }))
  }

  const changeNewUserField = (event) => {
    setNewUserForm((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value
    }))
  }

  const changeImageSettingsField = (event) => {
    setImageSettingsForm((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value
    }))
  }

  const changeSeoHomeField = (event) => {
    setSeoHomeForm((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value
    }))
  }

  const editUserInfo = async() => {
    if (passwordForm.password.length < 5) {
      alert('Пароль має містити щонайменше 5 символів')
      return
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      alert('Підтвердження пароля не збігається')
      return
    }

    const answer = await dispatch(edit(passwordForm))
    const payload = answer.payload

    if (answer.meta.requestStatus === 'fulfilled' && payload?.token) {
      window.localStorage.setItem('token', payload.token)
      await dispatch(fetchAuthMe())
      setPasswordForm({
        currentPassword: '',
        password: '',
        confirmPassword: ''
      })
      alert(payload.message || 'Пароль успішно змінено')
      return
    }

    alert(payload?.message || 'Не вдалося змінити пароль')
  }

  const handleCreateUser = async() => {
    if (newUserForm.name.trim().length < 3) {
      alert('Імʼя має містити щонайменше 3 символи')
      return
    }

    if (newUserForm.password.length < 5) {
      alert('Пароль має містити щонайменше 5 символів')
      return
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      alert('Підтвердження пароля не збігається')
      return
    }

    const created = await dispatch(createUser({
      name: newUserForm.name.trim(),
      email: newUserForm.email.trim(),
      password: newUserForm.password
    }))

    if (created.meta.requestStatus === 'fulfilled') {
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
      alert(created.payload?.message || 'Користувача успішно створено')
      return
    }

    alert(created.payload?.message || 'Не вдалося створити користувача')
  }

  const handleRemoveUser = async(user) => {
    if (!window.confirm(`Видалити користувача ${user.name}?`)) {
      return
    }

    const removed = await dispatch(removeUser(user.user_id))

    if (removed.meta.requestStatus === 'fulfilled') {
      alert(removed.payload?.message || 'Користувача успішно видалено')
      return
    }

    alert(removed.payload?.message || 'Не вдалося видалити користувача')
  }

  const toggleActivate = async(user_id, activateValue) => {
    const activated = await dispatch(activate({
      user_id,
      activate: activateValue ? 0 : 1
    }))

    if (activated.meta.requestStatus !== 'fulfilled') {
      alert(activated.payload?.message || 'Не вдалося змінити статус користувача')
    }
  }

  const handleSaveImageSettings = () => {
    const normalizedSettings = normalizeImageSettings(imageSettingsForm)

    dispatch(updateImageSettings(normalizedSettings)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        alert(result.payload?.message || 'Налаштування форматування збережено')
        return
      }

      alert(result.payload?.message || 'Не вдалося зберегти налаштування форматування')
    })
  }

  const handleResetImageSettings = () => {
    setImageSettingsForm(imageSettingsDefaults)
  }

  const handleSaveHomeSeo = () => {
    dispatch(updateHomeSeoSettings(seoHomeForm)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        alert(result.payload?.message || 'SEO налаштування головної сторінки збережено')
        return
      }

      alert(result.payload?.message || 'Не вдалося зберегти SEO налаштування головної сторінки')
    })
  }

  const handleResetHomeSeo = () => {
    setSeoHomeForm(homeSeoDefaults)
  }

  const handleResetImageCache = async () => {
    const accepted = window.confirm('Скинути кеш зображень?')

    if (!accepted) {
      return
    }

    try {
      setCacheActionLoading(true)
      const { data } = await axios.post('/cache/reset')
      alert(data?.message || 'Кеш зображень очищено')

      const statusResponse = await axios.get('/cache/generate/status')
      setCacheJob(statusResponse?.data?.job || null)
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося скинути кеш зображень')
    } finally {
      setCacheActionLoading(false)
    }
  }

  const handleStartCacheGeneration = async () => {
    try {
      setCacheActionLoading(true)
      const { data } = await axios.post('/cache/generate/start')
      setCacheJob(data?.job || null)
      alert(data?.message || 'Генерацію кешу запущено')
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося запустити генерацію кешу')
    } finally {
      setCacheActionLoading(false)
    }
  }

  const handleCancelCacheGeneration = async () => {
    try {
      setCacheActionLoading(true)
      const { data } = await axios.post('/cache/generate/cancel')
      setCacheJob(data?.job || null)
      alert(data?.message || 'Скасування генерації заплановано')
    } catch (error) {
      alert(error?.response?.data?.message || 'Не вдалося скасувати генерацію кешу')
    } finally {
      setCacheActionLoading(false)
    }
  }

  const handleChangeHomeOgImage = async (event) => {
    try {
      const file = event.target.files[0]

      if (!file) {
        return
      }

      const formattedFile = await formatImageBeforeUpload(file, imageSettings)
      const formData = new FormData()
      formData.append('name', 'home_og_image')
      formData.append('originalName', formattedFile.name)
      formData.append('image', formattedFile)
      const { data } = await axios.post('/upload_image', formData)

      setSeoHomeForm((prevState) => ({
        ...prevState,
        og_image: data.url || ''
      }))
    } catch (error) {
      alert('Не вдалося завантажити OG зображення')
    } finally {
      event.target.value = ''
    }
  }

  const homeOgPreviewImage = getImageUrl(seoHomeForm.og_image || placeholderImage)
  const cacheJobStatus = String(cacheJob?.status || 'idle')
  const cacheProgressPercent = Number(cacheJob?.progressPercent) > 0 ? Number(cacheJob?.progressPercent) : 0
  const cacheIsRunning = cacheJob?.isRunning === true || cacheJobStatus === 'running'

  return (
    <div className="auth-page-container">
      <div className="page-title">Налаштування</div>
      {currentUser ?
        <div className="user-page-content">
          <div className="settings-tabs-nav" role="tablist" aria-label="Розділи налаштувань">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'settings-tab-btn active' : 'settings-tab-btn'}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`settings-panel-${tab.id}`}
                id={`settings-tab-${tab.id}`}
              >
                <span>{tab.label}</span>
                <small>{tab.description}</small>
              </button>
            ))}
          </div>

          <div className="settings-content">
            <div
              className={activeTab === 'profile' ? 'settings-tab-panel active' : 'settings-tab-panel'}
              role="tabpanel"
              id="settings-panel-profile"
              aria-labelledby="settings-tab-profile"
            >
              <div className="user-info-block">
                <div className="user-info-row">
                  <div className="user-info-name">email</div>
                  <div className="user-info-value">{currentUser.email}</div>
                </div>
                <div className="user-info-row">
                  <div className="user-info-name">name</div>
                  <div className="user-info-value">{currentUser.name}</div>
                </div>
                <div className="user-info-row">
                  <div className="user-info-name">ID</div>
                  <div className="user-info-value">{currentUser.user_id}</div>
                </div>
              </div>

              <div className="auth-form">
                <div className="user-title">Зміна пароля</div>
                <div className="text-field-container">
                  <span>Поточний пароль</span>
                  <input type="password" placeholder="Поточний пароль" name="currentPassword" value={passwordForm.currentPassword} onChange={changePasswordField} />
                </div>
                <div className="text-field-container">
                  <span>Новий пароль</span>
                  <input type="password" placeholder="Новий пароль" name="password" value={passwordForm.password} onChange={changePasswordField} />
                </div>
                <div className="text-field-container">
                  <span>Підтвердження пароля</span>
                  <input type="password" placeholder="Підтвердження пароля" name="confirmPassword" value={passwordForm.confirmPassword} onChange={changePasswordField} />
                </div>
                <button type="button" onClick={editUserInfo}>Зберегти пароль</button>
              </div>
            </div>

            <div
              className={activeTab === 'users' ? 'settings-tab-panel active' : 'settings-tab-panel'}
              role="tabpanel"
              id="settings-panel-users"
              aria-labelledby="settings-tab-users"
            >
              <div className="auth-form">
                <div className="user-title">Новий користувач</div>
                <div className="text-field-container">
                  <span>Імʼя</span>
                  <input type="text" placeholder="Імʼя" name="name" value={newUserForm.name} onChange={changeNewUserField} />
                </div>
                <div className="text-field-container">
                  <span>Email</span>
                  <input type="email" placeholder="Email" name="email" value={newUserForm.email} onChange={changeNewUserField} />
                </div>
                <div className="text-field-container">
                  <span>Пароль</span>
                  <input type="password" placeholder="Пароль" name="password" value={newUserForm.password} onChange={changeNewUserField} />
                </div>
                <div className="text-field-container">
                  <span>Підтвердження пароля</span>
                  <input type="password" placeholder="Підтвердження пароля" name="confirmPassword" value={newUserForm.confirmPassword} onChange={changeNewUserField} />
                </div>
                <button type="button" onClick={handleCreateUser}>Додати користувача</button>
              </div>

              <div className="users-block">
                <div className="user-title">Користувачі</div>
                <div className="user-row">
                  <div className="user-id">ID</div>
                  <div className="user-name">Імʼя</div>
                  <div className="user-email">Email</div>
                  <div className="user-activate">Активний</div>
                </div>
                {users.map((user) => {
                  const isCurrentUser = currentUser.user_id === user.user_id

                  return (
                    <div className="user-row" key={user.user_id}>
                      <div className="user-id">{user.user_id}</div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-activate">
                        <button type="button" className={user.activate ? 'active' : ''} onClick={() => toggleActivate(user.user_id, user.activate)}>
                          {user.activate ? 'Так' : 'Ні'}
                        </button>
                      </div>
                      <div>
                        {isCurrentUser ?
                          <span>Поточний</span>
                          :
                          <button type="button" onClick={() => handleRemoveUser(user)}>Видалити</button>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              className={activeTab === 'seo' ? 'settings-tab-panel active' : 'settings-tab-panel'}
              role="tabpanel"
              id="settings-panel-seo"
              aria-labelledby="settings-tab-seo"
            >
              <div className="auth-form">
                <div className="user-title">SEO головної сторінки</div>
                <div className="text-field-container">
                  <span>Title</span>
                  <input type="text" placeholder="Title головної сторінки" name="title" value={seoHomeForm.title} onChange={changeSeoHomeField} />
                </div>
                <div className="text-field-container">
                  <span>Description</span>
                  <textarea placeholder="Description головної сторінки" name="description" value={seoHomeForm.description} onChange={changeSeoHomeField} />
                </div>
                <div className="text-field-container">
                  <span>H1</span>
                  <input type="text" placeholder="H1 головної сторінки" name="h1" value={seoHomeForm.h1} onChange={changeSeoHomeField} />
                </div>
                <div className="text-field-container">
                  <span>OG Title</span>
                  <input type="text" placeholder="OG Title (за замовчуванням = Title)" name="og_title" value={seoHomeForm.og_title} onChange={changeSeoHomeField} />
                </div>
                <div className="text-field-container">
                  <span>OG Description</span>
                  <textarea placeholder="OG Description (за замовчуванням = Description)" name="og_description" value={seoHomeForm.og_description} onChange={changeSeoHomeField} />
                </div>
                <div className="text-field-container">
                  <span>OG Image</span>
                  <input type="file" accept="image/*" onChange={handleChangeHomeOgImage} />
                </div>
                <div className="text-field-container">
                  <span>Шлях OG Image</span>
                  <input type="text" placeholder="/uploads/..." name="og_image" value={seoHomeForm.og_image} onChange={changeSeoHomeField} />
                </div>
                <div className="text-field-container">
                  <span>Превʼю OG зображення</span>
                  <img src={homeOgPreviewImage} alt="OG Preview" />
                </div>
                <button type="button" onClick={handleSaveHomeSeo}>Зберегти SEO</button>
                <button type="button" onClick={handleResetHomeSeo}>Скинути форму</button>
                <div className="settings-meta-status">{saveStatus === 'loading' ? 'Збереження...' : 'Налаштування зберігаються у структурі site_settings.seo.home'}</div>
              </div>
            </div>

            <div
              className={activeTab === 'media' ? 'settings-tab-panel active' : 'settings-tab-panel'}
              role="tabpanel"
              id="settings-panel-media"
              aria-labelledby="settings-tab-media"
            >
              <div className="auth-form">
                <div className="user-title">Форматування при завантаженні</div>
                <div className="text-field-container">
                  <span>Ширина, px</span>
                  <input type="number" min="100" max="6000" name="uploadWidth" value={imageSettingsForm.uploadWidth} onChange={changeImageSettingsField} />
                </div>
                <div className="text-field-container">
                  <span>Висота, px</span>
                  <input type="number" min="100" max="6000" name="uploadHeight" value={imageSettingsForm.uploadHeight} onChange={changeImageSettingsField} />
                </div>
                <div className="text-field-container">
                  <span>Якість, %</span>
                  <input type="number" min="10" max="100" name="uploadQuality" value={imageSettingsForm.uploadQuality} onChange={changeImageSettingsField} />
                </div>
                <div className="user-title">Мініатюри</div>
                <div className="text-field-container">
                  <span>Ширина, px</span>
                  <input type="number" min="80" max="2000" name="thumbnailWidth" value={imageSettingsForm.thumbnailWidth} onChange={changeImageSettingsField} />
                </div>
                <div className="text-field-container">
                  <span>Висота, px</span>
                  <input type="number" min="80" max="2000" name="thumbnailHeight" value={imageSettingsForm.thumbnailHeight} onChange={changeImageSettingsField} />
                </div>
                <div className="text-field-container">
                  <span>Формат</span>
                  <select name="thumbnailFormat" value={imageSettingsForm.thumbnailFormat} onChange={changeImageSettingsField}>
                    {imageFormatOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="user-title">Спливаюче зображення</div>
                <div className="text-field-container">
                  <span>Макс. ширина, px</span>
                  <input type="number" min="200" max="4000" name="popupWidth" value={imageSettingsForm.popupWidth} onChange={changeImageSettingsField} />
                </div>
                <div className="text-field-container">
                  <span>Макс. висота, px</span>
                  <input type="number" min="200" max="4000" name="popupHeight" value={imageSettingsForm.popupHeight} onChange={changeImageSettingsField} />
                </div>
                <div className="text-field-container">
                  <span>Формат</span>
                  <select name="popupFormat" value={imageSettingsForm.popupFormat} onChange={changeImageSettingsField}>
                    {imageFormatOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={handleSaveImageSettings}>Зберегти форматування</button>
                <button type="button" onClick={handleResetImageSettings}>Скинути форму</button>
                <div className="user-title">Кеш зображень магазину</div>
                <button type="button" disabled={cacheActionLoading || cacheIsRunning} onClick={handleResetImageCache}>Скинути кеш зображень</button>
                <button type="button" disabled={cacheActionLoading || cacheIsRunning} onClick={handleStartCacheGeneration}>Згенерувати кеш для всіх сторінок</button>
                {cacheIsRunning ?
                  <button type="button" disabled={cacheActionLoading} onClick={handleCancelCacheGeneration}>Скасувати генерацію</button>
                  : null}
                <div className="cache-progress-block">
                  <div className="cache-progress-header">
                    <span>Прогрес генерації</span>
                    <strong>{cacheProgressPercent}%</strong>
                  </div>
                  <div className="cache-progress-track">
                    <div className="cache-progress-fill" style={{ width: `${cacheProgressPercent}%` }} />
                  </div>
                  <div className="cache-progress-stats">
                    {`Маршрути: ${Number(cacheJob?.routesProcessed || 0)} / ${Number(cacheJob?.routesTotal || 0)}`}
                  </div>
                  <div className="cache-progress-stats">
                    {`Кеші: ${Number(cacheJob?.imagesProcessed || 0)} / ${Number(cacheJob?.imagesTotal || 0)}`}
                  </div>
                  <div className="cache-progress-stats">
                    {`Згенеровано: ${Number(cacheJob?.generated || 0)} · Пропущено: ${Number(cacheJob?.skipped || 0)} · Помилки: ${Number(cacheJob?.failed || 0)}`}
                  </div>
                  <div className="cache-progress-stats">
                    {`Статус: ${cacheJobStatus}`}
                  </div>
                </div>
                <div className="settings-meta-status">{saveStatus === 'loading' ? 'Збереження...' : 'Налаштування зберігаються у структурі site_settings.images.formatting'}</div>
              </div>

            </div>
          </div>

          {status === 'loading' ? <div>Завантаження...</div> : null}
        </div>
        : null}
    </div>
  )
}

export default AdminPage
