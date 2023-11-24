import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addCarModel, updateCarModel } from '../redux/slices/carModelSlice'
import axios from '../axios'

const PopupAddModel = (props) => {
  
  const imageInput = React.useRef();

  const dispatch = useDispatch()

  const addModel = async() => {

    let savedModel = false

    if(!props.params.model_id){
      savedModel = await dispatch(addCarModel(props.params))
    } else {
      savedModel = await dispatch(updateCarModel(props.params))
    }

    if(savedModel){
      props.changeFlag()
      props.popupToggle()
    }

  }

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData()
      formData.append('folder', 'models')
      const file = event.target.files[0]
      formData.append('image', file)
      const { data } = await axios.post('/upload_image', formData)
      props.handleImage(data.url)
    } catch (error) {
      alert('Ошибка при загрузке изображения')
    }
  }

  const removeImage = async () => {
    try {
      const delFile = await axios.post('/remove', {'url' : props.params.image})
      if(delFile){
        props.handleImage('')
      }
    } catch (error) {
      
    }
  }

  return (
    <div className={props.popupState ? "popup-container active" : "popup-container"}>
      <div className="popup-inner-container">
        <div className="popup-title-container">
          <div className="popup-title">Добавление модели авто</div>
          <button type="button" className="popup-close" onClick={props.popupToggle}>
          <svg xmlns="http://www.w3.org/2000/svg" className="svg-close" viewBox="0 0 24 24" fill="none">
            <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"/>
          </svg>
          </button>
        </div>
        <div className="popup-body">
          <div className="model-form">
            <div className="text-field-container"><input type="text" placeholder="Имя" name="name" 
            value={props.params.name ? props.params.name : ''} onChange={props.handleParams} /></div>
            <div className="text-field-container"><input type="file" placeholder="Изображение" name="image" 
            value='' ref={imageInput} onChange={handleChangeFile} hidden /></div>
            <div className="text-field-container">
            <input type="text" placeholder="Сортировка" name="sort" 
            value={props.params.sort ? props.params.sort : ''} onChange={props.handleParams} /></div>
            { props.params.image ? 
              <div className="upload-image-container">
                <img src={`http://localhost:4444${ props.params.image }`} alt="" />
                <button type="button" onClick={() => removeImage()} className="image-delete-btn">Удалить</button>
              </div>
              :
              <button type="button" className="add-image-btn" onClick={() => imageInput.current.click()} >Выбрать изображение</button>
            }
            <button onClick={addModel} className="auth-btn">Сохранить</button>
          </div>
        </div>
        <div className="popup-footer"></div>
      </div>
    </div>
  )
}

export default PopupAddModel