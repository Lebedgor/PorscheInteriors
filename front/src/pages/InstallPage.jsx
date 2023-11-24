import React from 'react'
import axios from '../axios'


const InstallPage = () => {

  const getInstall = async() => {
    await axios.get('/install');
  }

  React.useEffect(() => {
    getInstall()
  }, [])

  return (
    <div>InstallPage</div>
  )
}

export default InstallPage