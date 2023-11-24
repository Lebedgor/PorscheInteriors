import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import PopupAddModel from '../components/PopupAddModel';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCarModel, getCarModels } from '../redux/slices/carModelSlice';

const MainPage = () => {

  const [popupState, setPopupState] = useState(false)
  const [editFlag, setEditFlag] = useState(false)
  const [params, setParams] = useState({name: '', image: '', sort: '', model_id:''})

  const dispatch = useDispatch()

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

  const models = useSelector(state => state.carModel.models)
  const auth = !!useSelector(state => state.auth.data)

  // const [models, setModels] = React.useState([
  //   { 'id': 1, 'name': '718 Бокстер', 'image': '/images/car-models/718.jpg'},
  //   { 'id': 2, 'name': '718 Кайман', 'image': '/images/car-models/718.jpg'},
  //   { 'id': 3, 'name': '911', 'image': '/images/car-models/911.jpg'},
  //   { 'id': 4, 'name': 'Тайкан', 'image': '/images/car-models/Taycan.jpg'},
  //   { 'id': 6, 'name': 'Макан', 'image': '/images/car-models/Macan.jpg'},
  //   { 'id': 7, 'name': 'Панамера', 'image': '/images/car-models/Panamera.jpg'},
  //   { 'id': 8, 'name': 'Кайен', 'image': '/images/car-models/Cayenne.jpg'}

  // ]);

  React.useEffect(() => {
    dispatch(getCarModels())
  }, [editFlag])



  const popupToggle = (model) => {
    setParams({name: '', image: '', sort: '', model_id:''})
    if(model){
      setParams({name: model.name, image: model.image, sort: model.sort, model_id: model.model_id})
    }
    setPopupState(!popupState)
  }

  const changeFlag = () => {
    setEditFlag(!editFlag)
  }

  const deleteModel = async(id) => {
    const deleted = await dispatch(deleteCarModel(id))
    changeFlag()
  }

  const sortModels = [ ...models ].sort((a, b) => a.sort > b.sort ? 1:-1)

  return (
    <div className="main-container">
      <PopupAddModel popupToggle={popupToggle} popupState={popupState} changeFlag={changeFlag} handleParams={handleParams} handleImage={handleImage} params={params}/>
      <div className="page-title">Продукцiя</div>
      <div className="models-container">
        { sortModels.map(model => 
          <div className="model-card" key={model.model_id}>
            <div className="model-card-inner">

              <div className="model-image-container">
                <Link to={`model/${model.model_id}`}>
                  <img src={`https://back.porschednipro.com.ua${model.image}`} alt={model.name} />
                </Link>
                <div className="edit-container">
                  <button type="button" onClick={() => popupToggle(model)}>
                    <svg className="svg-edit-card">
                      <use xlinkHref="#svg-pencyl"></use>
                    </svg>
                  </button>
                  <button type="button" onClick={() => deleteModel(model.model_id)}>
                    <svg className="svg-remove-card">
                      <use xlinkHref="#svg-trash"></use>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="model-name">
                <Link to={`model/${model.model_id}`}>{model.name}</Link>
              </div>
            </div>
          </div>
          )}
          { auth ? 
            <div className="model-card">
              <div className="add-card-inner" onClick={popupToggle}>
                <svg className="svg-plus">
                  <use xlinkHref="#svg-plus"></use>
                </svg>
              </div>
            </div>
              :
            null}
      </div>
    </div>
  )
}

export default MainPage