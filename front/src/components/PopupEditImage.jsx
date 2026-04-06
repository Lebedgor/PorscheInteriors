import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getImageUrl } from '../axios'
import { updateImage } from '../redux/slices/imageSlice'
import { getCachedImagePath } from '../imageSettings'

const isVideoMedia = (mediaType, link) => {
  if (String(mediaType || '').trim().toLowerCase() === 'video') {
    return true
  }

  return /\.(mp4|webm|ogg|mov)$/i.test(String(link || ''))
}

const isYoutubeMedia = (mediaType, link) => {
  if (String(mediaType || '').trim().toLowerCase() === 'youtube') {
    return true
  }

  return /(?:youtube\.com|youtu\.be)/i.test(String(link || ''))
}

const PopupEditImage = ({ popupState, popupToggle, changeFlag, params, handleParams }) => {
  const dispatch = useDispatch()
  const imageSettings = useSelector((state) => state.siteSettings.imageSettings)
  const isVideo = isVideoMedia(params.media_type, params.link)
  const isYoutube = isYoutubeMedia(params.media_type, params.link)

  const saveImage = async () => {
    const normalizedSort = String(params.sort ?? '').trim()
    const normalizedUrl = String(params.link ?? '').trim()

    if (!normalizedSort.length) {
      alert('Вкажіть сортування')
      return
    }

    if (isYoutube && !normalizedUrl.length) {
      alert('Вставте посилання на YouTube')
      return
    }

    const savedImage = await dispatch(updateImage({
      image_id: params.image_id,
      media_type: params.media_type || 'image',
      url: isYoutube ? normalizedUrl : undefined,
      sort: normalizedSort,
      title: params.title || '',
      alt: params.alt || ''
    }))

    if (savedImage?.meta?.requestStatus === 'fulfilled') {
      changeFlag()
      popupToggle()
      return
    }

    alert(savedImage?.payload?.message || 'Не вдалося зберегти параметри зображення')
  }

  return (
    <div className={popupState ? "popup-container active" : "popup-container"}>
      <div className="popup-inner-container">
        <div className="popup-title-container">
          <div className="popup-title">Редагування медіа</div>
          <button type="button" className="popup-close" onClick={() => popupToggle()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="svg-close" viewBox="0 0 24 24" fill="none">
              <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"/>
            </svg>
          </button>
        </div>
        <div className="popup-body">
          <div className="model-form">
            {params.link ?
              <div className="upload-image-container">
                {isVideo ?
                  <video
                    src={getImageUrl(params.link)}
                    controls
                    preload="metadata"
                    playsInline
                    title={params.title || ''}
                  />
                  : isYoutube ?
                    <img
                      src={getImageUrl(params.preview_link || '/uploads/placeholder.jpg')}
                      alt={params.alt || params.title || 'YouTube'}
                      title={params.title || ''}
                    />
                  :
                  <img
                    src={getImageUrl(getCachedImagePath(params.link, 'thumbnail', imageSettings))}
                    alt={params.alt || params.title || 'Фото'}
                    title={params.title || ''}
                  />
                }
              </div>
              : null}
            {isYoutube ?
              <div className="text-field-container">
                <input type="url" placeholder="Посилання на YouTube" name="link" value={params.link ?? ''} onChange={handleParams} />
              </div>
              : null}
            <div className="text-field-container">
              <input type="text" placeholder="Сортування" name="sort" value={params.sort ?? ''} onChange={handleParams} />
            </div>
            <div className="text-field-container">
              <input type="text" placeholder="Title" name="title" value={params.title ?? ''} onChange={handleParams} />
            </div>
            <div className="text-field-container">
              <input type="text" placeholder="Alt" name="alt" value={params.alt ?? ''} onChange={handleParams} />
            </div>
            <button type="button" onClick={saveImage} className="auth-btn">Зберегти</button>
          </div>
        </div>
        <div className="popup-footer"></div>
      </div>
    </div>
  )
}

export default PopupEditImage
