import axios from '../axios';
import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import {useDropzone} from 'react-dropzone';
import { formatImageBeforeUpload } from '../imageSettings'

const isVideoFile = (file) => String(file?.type || '').toLowerCase().startsWith('video/')

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  flexDirection: 'column',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  width: '100%',
  height: 92,
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

function Previews(props) {
  const [files, setFiles] = useState([]);
  const imageSettings = useSelector((state) => state.siteSettings.imageSettings)
  const getUploadErrorMessage = (error) => {
    if (error?.code === 'ERR_CONNECTION_RESET' || error?.code === 'ECONNRESET') {
      return 'Сервер розірвав з’єднання під час завантаження. Перезапустіть backend і спробуйте ще раз.'
    }

    if (error?.code === 'ERR_NETWORK' && !error?.response) {
      return 'Не вдалося зв’язатися з сервером завантаження'
    }

    return error?.response?.data?.message || error?.message || 'Не вдалося завантажити файл'
  }
  const getRejectedFileMessage = (fileRejection) => fileRejection?.errors?.[0]?.message || 'Файл не пройшов перевірку'

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024,

    onDrop: async (acceptedFiles, fileRejections) => {
      const filesWithPreview = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        loaded: false,
        failed: false,
        errorMessage: '',
        isVideo: isVideoFile(file)
      }))
      const rejectedFiles = fileRejections.map(({ file, errors }) => ({
        name: file.name,
        preview: URL.createObjectURL(file),
        loaded: false,
        failed: true,
        errorMessage: getRejectedFileMessage({ file, errors }),
        isVideo: isVideoFile(file)
      }))

      setFiles([...filesWithPreview, ...rejectedFiles])

      let uploadedItems = 0

      for (const file of acceptedFiles) {
        try {
          const formattedFile = isVideoFile(file)
            ? file
            : await formatImageBeforeUpload(file, imageSettings)
          const formData = new FormData()
          formData.append('id', props.interiorId)
          formData.append('originalName', formattedFile.name)
          formData.append('image', formattedFile)
          formData.append('title', '')
          formData.append('alt', '')
          const { data } = await axios.post('/upload_image', formData)

          if (data?.saved) {
            uploadedItems += 1
          }

          setFiles((currentFiles) => currentFiles.map((img) => img.name === file.name ? (Object.assign(img, {
            loaded: true,
            failed: false,
            errorMessage: ''
          })) : img))
        } catch (error) {
          console.warn(error)
          setFiles((currentFiles) => currentFiles.map((img) => img.name === file.name ? (Object.assign(img, {
            loaded: false,
            failed: true,
            errorMessage: getUploadErrorMessage(error)
          })) : img))
        }
      }

      if (uploadedItems > 0) {
        uploadDone()
      }
    }
  });

  const uploadDone = () => {
    props.setEditFlag(!props.editFlag)
  }

  
  const thumbs = files.map(file => (
    <div style={thumb} key={`${file.name}-${file.preview}`}>
      <div style={thumbInner}>
        { file.loaded ? 
        <div className="preview-check-container"><svg className ="svg-loaded"><use xlinkHref="#svg-check"></use></svg></div>
        :
        null
        }
        { file.failed ?
        <div className="preview-check-container"><div className="dropzone-preview-badge error">!</div></div>
        :
        null
        }
        {file.isVideo ?
          <video
            src={file.preview}
            style={img}
            muted
            playsInline
            preload="metadata"
            onLoadedData={() => { URL.revokeObjectURL(file.preview) }}
          />
          :
          <img
            src={file.preview}
            style={img}
            alt={file.name}
            onLoad={() => { URL.revokeObjectURL(file.preview) }}
          />
        }
      </div>
      <div className={`dropzone-preview-name ${file.failed ? 'error' : ''}`}>{file.name}</div>
      {file.errorMessage ? <div className="dropzone-preview-error">{file.errorMessage}</div> : null}
    </div>
  ));

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Перетягніть фото або відео сюди, або натисніть</p>
        <svg className="svg-photo-drop"><use xlinkHref="#svg-photo"></use></svg>
      </div>
      <aside style={thumbsContainer}>
        {thumbs}
      </aside>
    </section>
  );
}

export default Previews
