import { Link, useSearchParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
import PopupAddInterior from '../components/PopupAddInterior';
import { useDispatch, useSelector } from 'react-redux';
import { deleteInterior, getInteriors } from '../redux/slices/interiorSlice';

const InteriorColors = () => {

  const dispatch = useDispatch()
  const [popupState, setPopupState] = useState(false)
  const [editFlag, setEditFlag] = useState(false)
  const [modelId, setModelId] = useState(false)
  const [params, setParams] = useState({name: '', image: '', sort: '', interior_id:'', model_id: '', model_name: ''})
  const interiors = useSelector(selector => selector.carInterior.interiors)
  const auth = !!useSelector(state => state.auth.data)
  const sortedInteriors = [ ...interiors ].sort((a, b) => a.sort - b.sort)

  const handleParams = (event) => {
    let data = { ...params }
    data[event.target.name] = event.target.value
    setParams(data)
  }

  const handleImage = (href) => {
    let data = { ...params }
    data['image'] = href
    setParams(data)
  }

  const popupToggle = (interior) => {
    setParams({name: '', image: '', sort: '', interior_id:'', model_id: '', model_name: ''})
    if(interior){
      setParams({name: interior.name, image: interior.image, sort: interior.sort, interior_id: interior.interior_id, model_id: modelId, model_name: interior.model_name})
    }
    setPopupState(!popupState)
  }

  const changeFlag = () => {
    setEditFlag(!editFlag)
  }

  const removeInterior = async(id) => {
    const deleted = await dispatch(deleteInterior(id))
    changeFlag()
    console.log(deleted)
  }

  useEffect(() => {
    let idData = window.location.href.split('/')
    let id = idData[idData.length - 1]
    setModelId(id)
    dispatch(getInteriors(id))
  }, [editFlag])

  return (
    <div className="main-container">
      <PopupAddInterior popupToggle={popupToggle} popupState={popupState} changeFlag={changeFlag} handleParams={handleParams} handleImage={handleImage} params={params}/>
      <div className="page-title">Варiанти кольору салона</div>
      <div className="interior-colors-container">
        {interiors.length ? sortedInteriors.map(color => 
          <div className="interior-color-card" key={color.interior_id}>
            <div className="interior-color-card-inner">
              <div className="interior-color-image">
              <div className="edit-container">
                  <button type="button" onClick={() => popupToggle(color)}>
                    <svg className="svg-edit-card">
                      <use xlinkHref="#svg-pencyl"></use>
                    </svg>
                  </button>
                  <button type="button" onClick={() => removeInterior(color.interior_id)}>
                    <svg className="svg-remove-card">
                      <use xlinkHref="#svg-trash"></use>
                    </svg>
                  </button>
                </div>
                <Link to={`/interior/${color.interior_id}`}>
                  <img src={`https://back.porschednipro.com.ua${ color.image }`} alt={color.name} />
                </Link>
              </div> 
              <div className="interior-color-name"><Link to={`/interior/${color.interior_id}`}>{color.name}</Link></div>
            </div>
          </div>
          ) : ''}

        { auth ? 
        <div className="interior-color-card">
          <div className="add-color-card-inner" onClick={popupToggle}>
            <svg className="svg-plus">
              <use xlinkHref="#svg-plus"></use>
            </svg>
          </div>
        </div>
        :
        null }




      </div>
    </div>
  )
}

export default InteriorColors