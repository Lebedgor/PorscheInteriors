import React, { useEffect, useState } from 'react'
import Dropzone from '../components/Dropzone'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { useDispatch, useSelector } from 'react-redux'
import { getImages, deleteImage, showMoreImages, getInterior } from '../redux/slices/imageSlice'
import { useSwipeable } from 'react-swipeable';

const InteriorImages = (props) => {

  const [interiorId, setInteriorId] = useState(0)
  const [editFlag, setEditFlag] = useState(false)
  const [page, setPage] = useState(1)
  const [currentImage, setCurrentImage] = useState({img: '', i: 0})
  const columnsCountBreakPoints = { 350: 1, 750: 2, 900: 3, 1920: 4 };

  const dispatch = useDispatch()

  const interior = useSelector(state => state.interiorImages.interiorInfo)

  const images = useSelector(state => state.interiorImages.images)

  const pages = useSelector(state => state.interiorImages.pages)

  const auth = !!useSelector(state => state.auth.data)

  useEffect(() => {
    let idData = window.location.href.split('/')
    let id = idData[idData.length - 1]
    setInteriorId(id)
    dispatch(getInterior(id))
    dispatch(getImages(id))
  }, [editFlag])

  const changeFlag = () => {
    setEditFlag(!editFlag)
  }

  const removeImage = async(url, id) => {
    dispatch(deleteImage({url: url, id: id}))
    changeFlag()
  }

  const openGallery = (img, i) => {
    document.body.classList.toggle('modal-open');
    setCurrentImage({img, i})
  }

  const actionGallery = (action) => {

    if (action === 'next'){
      let i = currentImage.i + 1
      let size = images.length - 1
      if(i > size){
        i = 0
      }
      let img = images[i].link
      setCurrentImage({img, i})
    }
    if (action === 'prev'){
      let i = currentImage.i - 1
      if(i < 0){
        i = images.length - 1
      }
      let img = images[i].link
      setCurrentImage({img, i})
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => actionGallery('next'),
    onSwipedRight: () => actionGallery('prev'),
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const showMore = () => {
    setPage(state => state + 1)
    dispatch(showMoreImages(interiorId, page))
  }
  

  return (
    <div className="main-container">


      { currentImage.img ? 
       <div className="gallery-container">
        <div className="gallery-image-box" {...handlers}>
        <button className="btn-mate btn-gallery-close" type="button" onClick={()=> openGallery('', 0)}>
            <svg className="svg-close-gallery">
              <use xlinkHref="#svg-plus"></use>
            </svg>
          </button>
          <button className="btn-mate gallery-nav-btn prev-btn" type="button" onClick={()=> actionGallery('prev')}>
            <svg className="svg-angle angle-left">
              <use xlinkHref="#svg-angle"></use>
            </svg>
          </button>
          
            <img src={`https://back.porschednipro.com.ua${currentImage.img}`} alt={interior.name}/>
          
          <button className="btn-mate gallery-nav-btn next-btn" type="button" onClick={()=> actionGallery('next')}>
            <svg className="svg-angle">
              <use xlinkHref="#svg-angle"></use>
            </svg>
          </button>
        </div>
       </div>
       :
       null 
      }
      

      <div className="page-title">{ (typeof images !== 'undefined' && images.length > 0) ? 'Фото салону' : 'Додати фото'}</div>
      <div className="interior-photos-container">
      {images ? 
            <ResponsiveMasonry columnsCountBreakPoints={columnsCountBreakPoints}>
            <Masonry>
              {images.map((image, i) => (
                  <div className="image-container" key={image.image_id}>
                    <div className="edit-container">
                      <button type="button" className="btn-mate" onClick={() => removeImage(image.link, image.image_id)}>
                        <svg className="svg-remove-card">
                          <use xlinkHref="#svg-trash"></use>
                        </svg>
                      </button>
                    </div>
                    <img src={`https://back.porschednipro.com.ua${image.link}`} onClick={()=> openGallery(image.link, i)} alt={interior.name} />
                  </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
          :
          null
          }

      </div>
        { pages > page ? 
        <div className="show-more-block"><button type="button" onClick={() => showMore()}>Показать еще</button></div>
        : null
        }
      

      { auth ? 
        <div className="dropzone-container">
          <Dropzone editFlag={editFlag} setEditFlag={setEditFlag} interiorId={interiorId} interior={interior}/>
        </div>
          :
          null}

    </div>
  )
}

export default InteriorImages