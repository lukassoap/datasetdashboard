//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
//import './App.css'
import {Grid} from '@mui/material'
import HeaderUI from './assets/HeaderUI'
function App() {
  //const [count, setCount] = useState(0)

  return (
    <Grid container justifyContent="center" alignItems="center" spacing={5}>
      {/*encabezado */}
      <Grid size = {{xs: 12, md: 12}}>
        <HeaderUI />
      </Grid>
      {/*akertas */}
      <Grid size = {{xs: 12, md: 12}}>akertas</Grid>

      {/*sekector */}
      <Grid size = {{xs: 12, md: 12}}>sekector</Grid>

      {/*indicadores */}
      <Grid size = {{xs: 12, md: 12}}>indicadores</Grid>


      
    </Grid>
  );

}

export default App
