import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useSwipeable } from 'react-swipeable'
import PopupAddModel from '../components/PopupAddModel'
import PopupEditImage from '../components/PopupEditImage'
import Dropzone from '../components/Dropzone'
import { deleteCategory, getCategoryTree, getRootCategories } from '../redux/slices/categorySlice'
import { deleteImage, getImages, showMoreImages } from '../redux/slices/imageSlice'
import axios, { getImageUrl, placeholderImage } from '../axios'
import { getCachedImagePath } from '../imageSettings'

const isVideoMedia = (mediaType, link) => {
  if (String(mediaType || '').trim().toLowerCase() === 'video') {
    return true
  }

  return /\.(mp4|webm|ogg|mov)$/i.test(String(link || ''))
}

const getYouTubeVideoId = (value) => {
  const normalizedValue = String(value || '').trim()

  if (!normalizedValue) {
    return ''
  }

  try {
    const parsedUrl = new URL(normalizedValue)
    const host = parsedUrl.hostname.replace(/^www\./i, '').toLowerCase()

    if (host === 'youtu.be') {
      return parsedUrl.pathname.replace(/^\/+/, '').split('/')[0] || ''
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v') || ''
      }

      const pathParts = parsedUrl.pathname.replace(/^\/+/, '').split('/')

      if (['embed', 'shorts', 'live'].includes(pathParts[0])) {
        return pathParts[1] || ''
      }
    }
  } catch (error) {
    return ''
  }

  return ''
}

const isYoutubeMedia = (mediaType, link) => {
  if (String(mediaType || '').trim().toLowerCase() === 'youtube') {
    return true
  }

  return !!getYouTubeVideoId(link)
}

const getYouTubeEmbedUrl = (value) => {
  const videoId = getYouTubeVideoId(value)

  if (!videoId) {
    return ''
  }

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
}

const defaultSeoDescription = 'Porsche центр Дніпро. Галерея інтерʼєрів.'
const defaultSeoTitle = 'PORSCHE Дніпро'

const setMetaContent = (attributeName, attributeValue, content) => {
  const normalizedContent = String(content || '').trim()
  let tag = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attributeName, attributeValue)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', normalizedContent)
}

const Category = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const currentCategoryId = Number(id || 0)
  const [popupState, setPopupState] = useState(false)
  const [editFlag, setEditFlag] = useState(false)
  const [page, setPage] = useState(1)
  const [currentImage, setCurrentImage] = useState({ img: '', i: 0 })
  const [galleryZoom, setGalleryZoom] = useState(1)
  const [galleryOffset, setGalleryOffset] = useState({ x: 0, y: 0 })
  const [isDraggingGallery, setIsDraggingGallery] = useState(false)
  const [params, setParams] = useState({ name: '', image: '', sort: '', category_id: '', parent_id: 0, seo_title: '', seo_description: '', seo_h1: '' })
  const [imagePopupState, setImagePopupState] = useState(false)
  const [imageParams, setImageParams] = useState({ image_id: '', link: '', preview_link: '', media_type: 'image', sort: '', title: '', alt: '' })
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeError, setYoutubeError] = useState('')
  const [isAddingYoutube, setIsAddingYoutube] = useState(false)
  const [loadedCategoryImages, setLoadedCategoryImages] = useState({})
  const [loadedGalleryThumbs, setLoadedGalleryThumbs] = useState({})
  const galleryDragRef = useRef({ pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false, suppressClickZoom: false })
  const galleryImageBoxRef = useRef(null)
  const galleryImageRef = useRef(null)
  const preloadedPopupImagesRef = useRef(new Set())
  const galleryZoomSteps = useMemo(() => [1, 2, 3], [])

  const categories = useSelector((state) => state.category.categories)
  const currentCategory = useSelector((state) => state.category.currentCategory)
  const breadcrumbs = useSelector((state) => state.category.breadcrumbs)
  const categoryStatus = useSelector((state) => state.category.status)
  const images = useSelector((state) => state.interiorImages.images)
  const pages = useSelector((state) => state.interiorImages.pages)
  const auth = !!useSelector((state) => state.auth.data)
  const imageSettings = useSelector((state) => state.siteSettings.imageSettings)
  const homeSeo = useSelector((state) => state.siteSettings.homeSeo)

  const interiorThumbnailStyle = useMemo(() => ({
    width: '100%',
    height: 'auto',
    display: 'block'
  }), [])
  const hasChildCategories = categories.length > 0
  const showCategoryGrid = currentCategoryId === 0 || (currentCategoryId > 0 && categoryStatus === 'loaded' && hasChildCategories)
  const showImageSection = currentCategoryId > 0
  const hasMediaContent = images.length > 0
  const activeGalleryImage = useMemo(() => {
    if (!currentImage.img) {
      return null
    }

    const imageByIndex = images[currentImage.i]

    if (imageByIndex?.link === currentImage.img) {
      return imageByIndex
    }

    return images.find((image) => image.link === currentImage.img) || null
  }, [currentImage.i, currentImage.img, images])
  const isActiveGalleryVideo = isVideoMedia(activeGalleryImage?.media_type, activeGalleryImage?.link || currentImage.img)
  const isActiveGalleryYoutube = isYoutubeMedia(activeGalleryImage?.media_type, activeGalleryImage?.link || currentImage.img)
  const canZoomActiveGallery = !isActiveGalleryVideo && !isActiveGalleryYoutube
  const activeGallerySource = isActiveGalleryVideo
    ? getImageUrl(activeGalleryImage?.link || currentImage.img)
    : isActiveGalleryYoutube
      ? getImageUrl(activeGalleryImage?.preview_link || placeholderImage)
      : getImageUrl(getCachedImagePath(activeGalleryImage?.link || currentImage.img, 'popup', imageSettings))
  const activeGalleryEmbedUrl = isActiveGalleryYoutube ? getYouTubeEmbedUrl(activeGalleryImage?.link || currentImage.img) : ''
  const activeGalleryOriginalUrl = isActiveGalleryYoutube
    ? (activeGalleryImage?.link || currentImage.img)
    : getImageUrl(activeGalleryImage?.link || currentImage.img)
  const placeholderImageUrl = getImageUrl(placeholderImage)
  const markCategoryImageLoaded = useCallback((imageKey) => {
    if (!imageKey) {
      return
    }

    setLoadedCategoryImages((previousState) => {
      if (previousState[imageKey]) {
        return previousState
      }

      return {
        ...previousState,
        [imageKey]: true
      }
    })
  }, [])
  const handleCategoryImageError = useCallback((event, imageKey) => {
    markCategoryImageLoaded(imageKey)

    if (event.currentTarget.src !== placeholderImageUrl) {
      event.currentTarget.src = placeholderImageUrl
    }
  }, [markCategoryImageLoaded, placeholderImageUrl])
  const markGalleryThumbLoaded = useCallback((imageKey) => {
    if (!imageKey) {
      return
    }

    setLoadedGalleryThumbs((previousState) => {
      if (previousState[imageKey]) {
        return previousState
      }

      return {
        ...previousState,
        [imageKey]: true
      }
    })
  }, [])
  const handleGalleryThumbError = useCallback((event, imageKey) => {
    markGalleryThumbLoaded(imageKey)

    if (event.currentTarget.src !== placeholderImageUrl) {
      event.currentTarget.src = placeholderImageUrl
    }
  }, [markGalleryThumbLoaded, placeholderImageUrl])

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => {
    const leftSort = Number(a.sort) || 0
    const rightSort = Number(b.sort) || 0

    if (leftSort !== rightSort) {
      return leftSort - rightSort
    }

    return (Number(a.category_id) || 0) - (Number(b.category_id) || 0)
  }), [categories])

  useEffect(() => {
    setLoadedCategoryImages({})
  }, [currentCategoryId, sortedCategories])

  useEffect(() => {
    setLoadedGalleryThumbs({})
  }, [currentCategoryId])

  useEffect(() => {
    setPage(1)
    setCurrentImage({ img: '', i: 0 })
    setGalleryZoom(1)
    setGalleryOffset({ x: 0, y: 0 })
    setIsDraggingGallery(false)
    setYoutubeUrl('')
    setYoutubeError('')
    setIsAddingYoutube(false)

    if (currentCategoryId > 0) {
      dispatch(getCategoryTree(currentCategoryId))
      return
    }

    dispatch(getRootCategories())
  }, [dispatch, currentCategoryId, editFlag])

  useEffect(() => {
    if (showImageSection) {
      dispatch(getImages(currentCategoryId))
    }
  }, [dispatch, currentCategoryId, showImageSection, editFlag])

  useEffect(() => {
    if (!showImageSection || !images.length) {
      return
    }

    let timeoutId = null
    let idleCallbackId = null
    let isCancelled = false

    const preloadPopupImages = () => {
      if (isCancelled) {
        return
      }

      images.forEach((image) => {
        if (isVideoMedia(image.media_type, image.link) || isYoutubeMedia(image.media_type, image.link)) {
          return
        }

        const popupImageUrl = getImageUrl(getCachedImagePath(image.link, 'popup', imageSettings))

        if (!popupImageUrl || preloadedPopupImagesRef.current.has(popupImageUrl)) {
          return
        }

        const preloadImage = new window.Image()
        preloadImage.decoding = 'async'
        preloadImage.src = popupImageUrl
        preloadedPopupImagesRef.current.add(popupImageUrl)
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(preloadPopupImages, { timeout: 1200 })
    } else {
      timeoutId = window.setTimeout(preloadPopupImages, 250)
    }

    return () => {
      isCancelled = true

      if (idleCallbackId !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleCallbackId)
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [images, imageSettings, showImageSection])

  useEffect(() => () => {
    document.body.classList.remove('modal-open')
  }, [])

  const handleParams = (event) => {
    setParams((state) => ({
      ...state,
      [event.target.name]: event.target.value
    }))
  }

  const handleImage = (href) => {
    setParams((state) => ({
      ...state,
      image: href
    }))
  }

  const handleImageParams = (event) => {
    setImageParams((state) => ({
      ...state,
      [event.target.name]: event.target.value
    }))
  }

  const handleYoutubeUrl = (event) => {
    setYoutubeUrl(event.target.value)

    if (youtubeError) {
      setYoutubeError('')
    }
  }

  const popupToggle = (category) => {
    const fallbackParentId = currentCategory?.category_id || 0

    if (category) {
      setParams({
        name: category.name || '',
        image: category.image || '',
        sort: category.sort ?? '',
        category_id: category.category_id || '',
        parent_id: Number.isFinite(Number(category.parent_id)) ? Number(category.parent_id) : fallbackParentId,
        seo_title: category.seo_title || '',
        seo_description: category.seo_description || '',
        seo_h1: category.seo_h1 || ''
      })
    } else {
      setParams({
        name: '',
        image: '',
        sort: '',
        category_id: '',
        parent_id: fallbackParentId,
        seo_title: '',
        seo_description: '',
        seo_h1: ''
      })
    }

    setPopupState((state) => !state)
  }

  const changeFlag = () => {
    setEditFlag((state) => !state)
  }

  const toggleImagePopup = (image) => {
    if (image) {
      setImageParams({
        image_id: image.image_id || '',
        link: image.link || '',
        preview_link: image.preview_link || '',
        media_type: image.media_type || 'image',
        sort: image.sort ?? '',
        title: image.title || '',
        alt: image.alt || ''
      })
      setImagePopupState(true)
      return
    }

    setImageParams({ image_id: '', link: '', preview_link: '', media_type: 'image', sort: '', title: '', alt: '' })
    setImagePopupState(false)
  }

  const removeCategory = async (categoryId) => {
    await dispatch(deleteCategory(categoryId))
    changeFlag()
  }

  const removeImage = async (url, imageId) => {
    await dispatch(deleteImage({ url, id: imageId }))
    changeFlag()
  }

  const addYoutubeVideo = async (event) => {
    event.preventDefault()

    const normalizedYoutubeUrl = youtubeUrl.trim()

    if (!normalizedYoutubeUrl || isAddingYoutube) {
      return
    }

    try {
      setIsAddingYoutube(true)
      setYoutubeError('')

      const { data } = await axios.post('/youtube_video', {
        id: currentCategoryId,
        url: normalizedYoutubeUrl
      })

      if (!data?.success) {
        throw new Error(data?.message || 'Не вдалося додати YouTube-відео')
      }

      setYoutubeUrl('')
      changeFlag()
    } catch (error) {
      setYoutubeError(error?.response?.data?.message || error?.message || 'Не вдалося додати YouTube-відео')
    } finally {
      setIsAddingYoutube(false)
    }
  }

  const openGallery = (img, i) => {
    if (img) {
      document.body.classList.add('modal-open')
      setGalleryZoom(1)
      setGalleryOffset({ x: 0, y: 0 })
      setIsDraggingGallery(false)
      setCurrentImage({ img, i })
      return
    }

    document.body.classList.remove('modal-open')
    setGalleryZoom(1)
    setGalleryOffset({ x: 0, y: 0 })
    setIsDraggingGallery(false)
    setCurrentImage({ img: '', i: 0 })
  }

  const clampGalleryOffset = useCallback((offset, zoomLevel = galleryZoom) => {
    const imageBox = galleryImageBoxRef.current
    const image = galleryImageRef.current

    if (!imageBox || !image) {
      return offset
    }

    const boxWidth = imageBox.clientWidth
    const boxHeight = imageBox.clientHeight
    const imageWidth = image.clientWidth
    const imageHeight = image.clientHeight
    const maxOffsetX = Math.max(0, ((imageWidth * zoomLevel) - boxWidth) / 2)
    const maxOffsetY = Math.max(0, ((imageHeight * zoomLevel) - boxHeight) / 2)

    return {
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, offset.x)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, offset.y))
    }
  }, [galleryZoom])

  useEffect(() => {
    if (!currentImage.img) {
      return
    }

    setGalleryOffset((currentOffset) => clampGalleryOffset(currentOffset, galleryZoom))
  }, [clampGalleryOffset, galleryZoom, currentImage.img])

  const actionGallery = (action) => {
    if (!images.length) {
      return
    }

    if (action === 'next') {
      let nextIndex = currentImage.i + 1

      if (nextIndex > images.length - 1) {
        nextIndex = 0
      }

      setGalleryZoom(1)
      setGalleryOffset({ x: 0, y: 0 })
      setIsDraggingGallery(false)
      setCurrentImage({ img: images[nextIndex].link, i: nextIndex })
    }

    if (action === 'prev') {
      let nextIndex = currentImage.i - 1

      if (nextIndex < 0) {
        nextIndex = images.length - 1
      }

      setGalleryZoom(1)
      setGalleryOffset({ x: 0, y: 0 })
      setIsDraggingGallery(false)
      setCurrentImage({ img: images[nextIndex].link, i: nextIndex })
    }
  }

  const changeGalleryZoom = (direction) => {
    setGalleryZoom((currentZoom) => {
      const currentIndex = galleryZoomSteps.findIndex((step) => step === currentZoom)
      const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0
      const normalizedZoom = direction === 'reset'
        ? galleryZoomSteps[0]
        : galleryZoomSteps[Math.min(safeCurrentIndex + 1, galleryZoomSteps.length - 1)]

      if (normalizedZoom === 1) {
        setGalleryOffset({ x: 0, y: 0 })
        setIsDraggingGallery(false)
      } else {
        setGalleryOffset((currentOffset) => clampGalleryOffset(currentOffset, normalizedZoom))
      }

      return normalizedZoom
    })
  }

  const toggleGalleryZoom = () => {
    setGalleryZoom((currentZoom) => {
      const nextZoom = currentZoom > 1 ? 1 : 2

      if (nextZoom === 1) {
        setGalleryOffset({ x: 0, y: 0 })
        setIsDraggingGallery(false)
      }

      return nextZoom
    })
  }

  const handleGalleryWheel = (event) => {
    event.preventDefault()

    if (event.deltaY < 0) {
      changeGalleryZoom('in')
      return
    }

    setGalleryZoom((currentZoom) => {
      const currentIndex = galleryZoomSteps.findIndex((step) => step === currentZoom)
      const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0
      const nextZoom = galleryZoomSteps[Math.max(safeCurrentIndex - 1, 0)]

      if (nextZoom === 1) {
        setGalleryOffset({ x: 0, y: 0 })
        setIsDraggingGallery(false)
      } else {
        setGalleryOffset((currentOffset) => clampGalleryOffset(currentOffset, nextZoom))
      }

      return nextZoom
    })
  }

  const handleGalleryPointerDown = (event) => {
    galleryDragRef.current.moved = false
    galleryDragRef.current.suppressClickZoom = false

    if (galleryZoom <= 1 || !canZoomActiveGallery) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    galleryDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: galleryOffset.x,
      originY: galleryOffset.y,
      moved: false,
      suppressClickZoom: false
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleGalleryPointerMove = (event) => {
    if (galleryDragRef.current.pointerId !== event.pointerId || galleryZoom <= 1 || !canZoomActiveGallery) {
      return
    }

    const deltaX = event.clientX - galleryDragRef.current.startX
    const deltaY = event.clientY - galleryDragRef.current.startY

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      if (!galleryDragRef.current.moved) {
        galleryDragRef.current.moved = true
        galleryDragRef.current.suppressClickZoom = true
        setIsDraggingGallery(true)
      }
    } else {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    setGalleryOffset(clampGalleryOffset({
      x: galleryDragRef.current.originX + deltaX,
      y: galleryDragRef.current.originY + deltaY
    }))
  }

  const stopGalleryDrag = (event) => {
    if (galleryDragRef.current.pointerId !== event.pointerId) {
      return
    }

    const shouldSuppressClickZoom = galleryDragRef.current.suppressClickZoom

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    galleryDragRef.current = { pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false, suppressClickZoom: shouldSuppressClickZoom }
    setIsDraggingGallery(false)
  }

  const handleGalleryImageClick = (event) => {
    if (!canZoomActiveGallery) {
      return
    }

    if (galleryDragRef.current.suppressClickZoom) {
      galleryDragRef.current.suppressClickZoom = false
      return
    }

    event.preventDefault()
    event.stopPropagation()
    toggleGalleryZoom()
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (galleryZoom === 1) {
        actionGallery('next')
      }
    },
    onSwipedRight: () => {
      if (galleryZoom === 1) {
        actionGallery('prev')
      }
    },
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true
  })

  const showMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    dispatch(showMoreImages({ id: currentCategoryId, page: nextPage }))
  }

  const renderGalleryItem = (media, index) => {
    if (isVideoMedia(media.media_type, media.link)) {
      return (
        <video
          src={getImageUrl(media.link)}
          style={interiorThumbnailStyle}
          className="gallery-media-thumb"
          muted
          playsInline
          preload="metadata"
          onClick={() => openGallery(media.link, index)}
          title={media.title || undefined}
          aria-label={media.title || pageTitle}
        />
      )
    }

    if (isYoutubeMedia(media.media_type, media.link)) {
      const thumbnailSource = getImageUrl(media.preview_link || placeholderImage)
      const thumbnailStateKey = `${media.image_id || index}-${thumbnailSource}`
      const isThumbnailLoaded = Boolean(loadedGalleryThumbs[thumbnailStateKey])

      return (
        <div className={`youtube-thumb-card gallery-thumb-skeleton ${isThumbnailLoaded ? 'is-loaded' : ''}`} onClick={() => openGallery(media.link, index)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openGallery(media.link, index) } }}>
          <img
            src={thumbnailSource}
            style={interiorThumbnailStyle}
            className={`gallery-media-thumb gallery-media-thumb-image ${isThumbnailLoaded ? 'is-loaded' : ''}`}
            alt={media.alt || media.title || pageTitle}
            title={media.title || undefined}
            onLoad={() => markGalleryThumbLoaded(thumbnailStateKey)}
            onError={(event) => handleGalleryThumbError(event, thumbnailStateKey)}
          />
          <span className="youtube-play-badge" aria-hidden="true">
            <svg className="svg-youtube-play" viewBox="0 0 68 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M66.52 7.74C65.74 4.8 63.44 2.49 60.5 1.72C55.18 0.3 34 0.3 34 0.3C34 0.3 12.82 0.3 7.5 1.72C4.56 2.49 2.26 4.8 1.48 7.74C0.06 13.05 0.06 24.12 0.06 24.12C0.06 24.12 0.06 35.19 1.48 40.5C2.26 43.44 4.56 45.75 7.5 46.52C12.82 47.94 34 47.94 34 47.94C34 47.94 55.18 47.94 60.5 46.52C63.44 45.75 65.74 43.44 66.52 40.5C67.94 35.19 67.94 24.12 67.94 24.12C67.94 24.12 67.94 13.05 66.52 7.74Z" fill="#FF0000" />
              <path d="M45 24.12L27 34.5V13.74L45 24.12Z" fill="white" />
            </svg>
          </span>
        </div>
      )
    }

    const thumbnailSource = getImageUrl(getCachedImagePath(media.link, 'thumbnail', imageSettings))
    const thumbnailStateKey = `${media.image_id || index}-${thumbnailSource}`
    const isThumbnailLoaded = Boolean(loadedGalleryThumbs[thumbnailStateKey])

    return (
      <div className={`gallery-thumb-skeleton ${isThumbnailLoaded ? 'is-loaded' : ''}`}>
        <img
          src={thumbnailSource}
          style={interiorThumbnailStyle}
          className={`gallery-media-thumb gallery-media-thumb-image ${isThumbnailLoaded ? 'is-loaded' : ''}`}
          onClick={() => openGallery(media.link, index)}
          alt={media.alt || media.title || pageTitle}
          title={media.title || undefined}
          onLoad={() => markGalleryThumbLoaded(thumbnailStateKey)}
          onError={(event) => handleGalleryThumbError(event, thumbnailStateKey)}
        />
      </div>
    )
  }

  const rawPageTitle = currentCategory?.name || 'Продукцiя'
  const pageTitle = rawPageTitle.replace(/і/g, 'i').replace(/І/g, 'I')
  const pageHeading = currentCategoryId === 0
    ? (homeSeo?.h1 || pageTitle)
    : (currentCategory?.seo_h1 || pageTitle)
  const seoTitle = currentCategoryId === 0
    ? (homeSeo?.title || pageTitle || defaultSeoTitle)
    : (currentCategory?.seo_title || pageTitle || defaultSeoTitle)
  const seoDescription = currentCategoryId === 0
    ? (homeSeo?.description || defaultSeoDescription)
    : (currentCategory?.seo_description || defaultSeoDescription)
  const ogTitle = currentCategoryId === 0
    ? (homeSeo?.og_title || seoTitle)
    : (currentCategory?.seo_title || seoTitle)
  const ogDescription = currentCategoryId === 0
    ? (homeSeo?.og_description || seoDescription)
    : (currentCategory?.seo_description || seoDescription)
  const ogImagePath = currentCategoryId === 0
    ? (homeSeo?.og_image || placeholderImage)
    : (currentCategory?.image || homeSeo?.og_image || placeholderImage)
  const ogImage = getImageUrl(ogImagePath)
  const ogUrl = window.location.href
  const popupTitle = currentCategoryId > 0 ? 'Додати підкатегорію' : 'Додати категорію'
  const visibleBreadcrumbs = breadcrumbs.length ? breadcrumbs : [{ category_id: 0, name: 'Продукцiя' }]

  useEffect(() => {
    document.title = seoTitle || defaultSeoTitle

    setMetaContent('name', 'description', seoDescription || defaultSeoDescription)
    setMetaContent('property', 'og:title', ogTitle || seoTitle || defaultSeoTitle)
    setMetaContent('property', 'og:description', ogDescription || seoDescription || defaultSeoDescription)
    setMetaContent('property', 'og:image', ogImage)
    setMetaContent('property', 'og:url', ogUrl)
    setMetaContent('property', 'og:type', 'website')
  }, [ogDescription, ogImage, ogTitle, ogUrl, seoDescription, seoTitle])

  return (
    <div className="main-container">
      <PopupAddModel
        popupToggle={popupToggle}
        popupState={popupState}
        changeFlag={changeFlag}
        handleParams={handleParams}
        handleImage={handleImage}
        params={params}
        popupTitle={popupTitle}
      />
      <PopupEditImage
        popupToggle={toggleImagePopup}
        popupState={imagePopupState}
        changeFlag={changeFlag}
        handleParams={handleImageParams}
        params={imageParams}
      />

      {currentImage.img ?
        <div className="gallery-lightbox-container" onClick={() => openGallery('', 0)}>
          <button className="btn-mate gallery-nav-btn prev-btn" type="button" onClick={(event) => { event.stopPropagation(); actionGallery('prev') }}>
            <svg className="svg-angle angle-left">
              <use xlinkHref="#svg-angle"></use>
            </svg>
          </button>
          <div className="gallery-image-box" ref={galleryImageBoxRef} {...handlers} onClick={(event) => event.stopPropagation()} onWheel={canZoomActiveGallery ? handleGalleryWheel : undefined}>
            <div className="gallery-actions">
              {canZoomActiveGallery ?
                <>
                  <button className="btn-mate btn-gallery-zoom" type="button" onClick={() => changeGalleryZoom('reset')} aria-label="Скинути масштаб">
                    <svg className="svg-gallery-zoom">
                      <use xlinkHref="#svg-zoom-out"></use>
                    </svg>
                  </button>
                  <button className="btn-mate btn-gallery-zoom" type="button" onClick={() => changeGalleryZoom('in')} aria-label="Збільшити">
                    <svg className="svg-gallery-zoom">
                      <use xlinkHref="#svg-zoom-in"></use>
                    </svg>
                  </button>
                </>
                : null}
              <a
                className="btn-mate btn-gallery-original"
                href={activeGalleryOriginalUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Відкрити оригінал"
              >
                <svg className="svg-expand">
                  <use xlinkHref="#svg-expand"></use>
                </svg>
              </a>
              <button className="btn-mate btn-gallery-close" type="button" onClick={() => openGallery('', 0)}>
                <svg className="svg-close-gallery">
                  <use xlinkHref="#svg-plus"></use>
                </svg>
              </button>
            </div>
            <div className="gallery-stage">
              {isActiveGalleryVideo ?
                <video
                  src={activeGallerySource}
                  className="gallery-video"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  title={activeGalleryImage?.title || undefined}
                  aria-label={activeGalleryImage?.title || pageTitle}
                />
                : isActiveGalleryYoutube ?
                  <iframe
                    src={activeGalleryEmbedUrl}
                    className="gallery-youtube-frame"
                    title={activeGalleryImage?.title || pageTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                :
                <img
                  ref={galleryImageRef}
                  src={activeGallerySource}
                  style={{ transform: `translate(${galleryOffset.x}px, ${galleryOffset.y}px) scale(${galleryZoom})` }}
                  className={galleryZoom > 1 ? `gallery-image zoomed ${isDraggingGallery ? 'dragging' : ''}` : 'gallery-image'}
                  onClick={handleGalleryImageClick}
                  onPointerDown={handleGalleryPointerDown}
                  onPointerMove={handleGalleryPointerMove}
                  onPointerUp={stopGalleryDrag}
                  onPointerCancel={stopGalleryDrag}
                  alt={activeGalleryImage?.alt || activeGalleryImage?.title || pageTitle}
                  title={activeGalleryImage?.title || undefined}
                />
              }
            </div>
          </div>
          <button className="btn-mate gallery-nav-btn next-btn" type="button" onClick={(event) => { event.stopPropagation(); actionGallery('next') }}>
            <svg className="svg-angle">
              <use xlinkHref="#svg-angle"></use>
            </svg>
          </button>
          <div className="gallery-mobile-nav" onClick={(event) => event.stopPropagation()}>
            <button className="btn-mate gallery-mobile-nav-btn" type="button" onClick={() => actionGallery('prev')}>
              <svg className="svg-angle angle-left">
                <use xlinkHref="#svg-angle"></use>
              </svg>
            </button>
            <button className="btn-mate gallery-mobile-nav-btn" type="button" onClick={() => actionGallery('next')}>
              <svg className="svg-angle">
                <use xlinkHref="#svg-angle"></use>
              </svg>
            </button>
          </div>
        </div>
        : null}

      {currentCategoryId > 0 ?
        <div className="breadcrumbs">
          {visibleBreadcrumbs.map((breadcrumb, index) => {
            const isLast = index === visibleBreadcrumbs.length - 1
            const breadcrumbLink = Number(breadcrumb.category_id) > 0 ? `/category/${breadcrumb.category_id}` : '/'

            return (
              <React.Fragment key={`${breadcrumb.category_id}-${index}`}>
                {isLast ? <span>{breadcrumb.name}</span> : <Link to={breadcrumbLink}>{breadcrumb.name}</Link>}
                {!isLast ? <span className="breadcrumbs-separator">/</span> : null}
              </React.Fragment>
            )
          })}
        </div>
        : null}

      <div className="page-title">
        {pageHeading}
      </div>

      {showCategoryGrid ?
        <div className="category-colors-container">
          {sortedCategories.map((category) => {
            const categoryThumbnailPath = getCachedImagePath(category.image, 'thumbnail', imageSettings)
            const categoryImageStateKey = `${category.category_id}-${categoryThumbnailPath}`
            const isCategoryImageLoaded = Boolean(loadedCategoryImages[categoryImageStateKey])

            return (
              <div className="category-color-card" key={category.category_id}>
                <div className={`category-color-card-inner ${currentCategoryId === 0 ? 'main-category' : ''}`}>
                  <div className={`category-color-image ${isCategoryImageLoaded ? 'is-loaded' : ''}`}>
                    <Link className="category-color-image-link" to={`/category/${category.category_id}`}>
                      <img
                        className={isCategoryImageLoaded ? 'is-loaded' : ''}
                        src={getImageUrl(categoryThumbnailPath)}
                        alt={category.name}
                        onLoad={() => markCategoryImageLoaded(categoryImageStateKey)}
                        onError={(event) => handleCategoryImageError(event, categoryImageStateKey)}
                      />
                    </Link>
                    {auth ?
                      <div className="edit-container">
                        <button type="button" onClick={() => popupToggle(category)}>
                          <svg className="svg-edit-card">
                            <use xlinkHref="#svg-pencyl"></use>
                          </svg>
                        </button>
                        <button type="button" onClick={() => removeCategory(category.category_id)}>
                          <svg className="svg-remove-card">
                            <use xlinkHref="#svg-trash"></use>
                          </svg>
                        </button>
                      </div>
                      : null}
                  </div>

                  <div className="category-color-name">
                    <Link to={`/category/${category.category_id}`}>{category.name}</Link>
                  </div>
                </div>
              </div>
            )
          })}

          {auth ?
            <div className="category-color-card">
              <div className="add-color-card-inner" onClick={() => popupToggle()}>
                <svg className="svg-plus">
                  <use xlinkHref="#svg-plus"></use>
                </svg>
                <div className="category-color-name">{popupTitle}</div>
              </div>
            </div>
            : null}
        </div>
        : null}

      {!showCategoryGrid && auth && showImageSection ?
        <div className="category-colors-container">
          <div className="category-color-card">
            <div className="add-color-card-inner" onClick={() => popupToggle()}>
              <svg className="svg-plus">
                <use xlinkHref="#svg-plus"></use>
              </svg>
              <div className="category-color-name">{popupTitle}</div>
            </div>
          </div>
        </div>
        : null}

      {showImageSection ?
        <>
          {hasMediaContent ?
            <div className="media-gallery-section">
              <div className="page-title">Фото та вiдео</div>
              <div className="interior-photos-container">
                <div className="gallery-container">
                  {images ? images.map((image, i) => (
                    <div className="image-container" key={image.image_id}>
                      {auth ?
                        <div className="edit-container">
                          <button type="button" className="btn-mate" onClick={() => toggleImagePopup(image)}>
                            <svg className="svg-edit-card">
                              <use xlinkHref="#svg-pencyl"></use>
                            </svg>
                          </button>
                          <button type="button" className="btn-mate" onClick={() => removeImage(image.link, image.image_id)}>
                            <svg className="svg-remove-card">
                              <use xlinkHref="#svg-trash"></use>
                            </svg>
                          </button>
                        </div>
                        : null}
                      <div className="inner-container">
                        {renderGalleryItem(image, i)}
                      </div>
                    </div>
                  )) : null}
                </div>
              </div>
            </div>
            : null}

          {hasMediaContent && pages > page ?
            <div className="show-more-block"><button type="button" onClick={showMore}>Показати більше</button></div>
            : null}

          {auth ?
            <div className="add-image-container">
              <div className="page-title">Додати фото / вiдео</div>
              <div className="dropzone-container">
                <Dropzone editFlag={editFlag} setEditFlag={setEditFlag} interiorId={currentCategoryId} interior={currentCategory} />
              </div>
              <div className="youtube-upload-container model-form">
                <div className="page-title">Додати ютуб вiдео</div>
                <form className="youtube-upload-form" onSubmit={addYoutubeVideo}>
                  <div className="text-field-container">
                    <input type="url" placeholder="Вставте посилання на YouTube" value={youtubeUrl} onChange={handleYoutubeUrl} />
                  </div>
                  <button type="submit" disabled={isAddingYoutube}>{isAddingYoutube ? 'Додаємо...' : 'Додати'}</button>
                </form>
                {youtubeError ? <div className="youtube-upload-error">{youtubeError}</div> : null}
              </div>
            </div>
            : null}
        </>
        : null}
    </div>
  )
}

export default Category
