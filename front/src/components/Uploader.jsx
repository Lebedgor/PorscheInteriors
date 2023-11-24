import React from 'react'
import axios from '../axios.js'
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'

const Uploader = (props) => {

    // specify upload params and url for your files
    const getUploadParams = ({ meta }) => { return { url: 'http://localhost:4444/upload_image' } }
  
    // called every time a file's `status` changes
    const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }
    
    // receives array of files that are done uploading when submit button is clicked
    const handleSubmit = (files, allFiles) => {

      

      // const formData = new FormData();

      // formData.append('id', props.interiorId)

      // files.map(file => {
      //   // if(typeof file === 'undefined') return false
      //   // formData.append('file', file)


      //   const formData = new FormData()
      //   formData.append('id', props.interiorId)
      //   formData.append('image', file)
      //   axios.post('/upload_image', formData).then(res => {
      //     console.log(res.data)
      //     if(res.data.saved){
      //       console.log("Файл " + res.data.name + " успешно загружен")
      //     }
          
          
      //   })


      // })

      //console.log(files.map(f => f.meta))

      allFiles.forEach(f => f.remove())
    }

  return (
    <Dropzone 
      getUploadParams={getUploadParams}
      onChangeStatus={handleChangeStatus}
      onSubmit={handleSubmit}
      accept="image/*, video/*"
    />
  )
}

export default Uploader