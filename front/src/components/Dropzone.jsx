import axios from '../axios';
import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { useRef } from 'react';
import imageCompression from 'browser-image-compression';

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box',
  position: 'relative'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
  position: 'relative'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
}


function Previews(props) {
  const [files, setFiles] = useState([]);
  const dispatch = useDispatch()

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'image/*': []
    },
    maxFiles: 10,
    maxSize: { fileSize: 10 * 1024 * 1024 }, // 10MB

    onDrop: acceptedFiles => {

      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        loaded: false
      })));

      let items = 0

      acceptedFiles.forEach(async(file) => {
          let compressedFile = await imageCompression(file, options);
          console.log(file)
          console.log(compressedFile)
          const formData = new FormData()
          formData.append('id', props.interiorId)
          formData.append('folder', `${props.interior.name}-${props.interiorId}`)
          formData.append('originalName', file.name)
          formData.append('image', compressedFile)
          await axios.post('/upload_image', formData).then(res => {
            if(res.data.saved){
              console.log("Файл " + res.data.name + " успешно загружен")
              items++;
              if(items === acceptedFiles.length){
                uploadDone()
              }
            }
          })

          setFiles(acceptedFiles.map(img => img.name === file.name ? (Object.assign(img, {
            loaded: true,
          })) : img));


      })

      

    }
  });

  const uploadDone = () => {
    console.log('Все файлы успешно загружены')
    props.setEditFlag(!props.editFlag)
  }

  
  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        { file.loaded ? 
        <div className="preview-check-container"><svg className ="svg-loaded"><use xlinkHref="#svg-check"></use></svg></div>
        :
        null
        }
        <img
          src={file.preview}
          style={img}
          alt={file.name}
          
          // Revoke data uri after image is loaded
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Перенесите файлы сюда, или нажмите</p>
        <svg className="svg-photo-drop"><use xlinkHref="#svg-photo"></use></svg>
      </div>
      <aside style={thumbsContainer}>
        {thumbs}
      </aside>
    </section>
  );
}

export default Previews