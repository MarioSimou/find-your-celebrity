import { createMuiTheme } from '@material-ui/core'

const primary = {
    light: '#0a0b0c',
    main: '#0a0b0c',
    dark: '#0a0b0c',
    contrastText: '#fff',
}
  
const secondary = {
    light: '#fccc12',
    main: '#fccc12',
    dark: '#fccc12',
    contrastText: '#fff',
}
const error = {
    main: '#d32f2f',
    contrastText: '#fff',
}

const success = {
    main: '#43a047',
    contrastText: '#fff',
  }


export default createMuiTheme({
    palette: {
        primary,
        secondary,
        error,
        success,
    },
    typography: {
        fontSize: 16,
        fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"'].join(','),
    },
    breakpoints: {
        values: {
          xs: 480,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920,
        },
    },
})