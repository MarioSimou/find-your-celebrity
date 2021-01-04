import React from 'react';
import axios from 'axios';
import {
  Paper,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Snackbar,
  Slide,
  IconButton,
  Card,
  CardActionArea,
  CardMedia,
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert';
import makeStyles from '@material-ui/styles/makeStyles'
import logo from '../logo.png'
import avatar from '../avatar.jpeg'


function TransitionLeft(props) {
  return <Slide {...props} direction="left" />;
}

const imageInitialState = {
  base64: null,
  ext: null,
};

const axiosInstance = axios.create({
  timeout: 10000,
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

const App = () => {
  const [image, setImage] = React.useState(imageInitialState);
  const [fetching, setFetching] = React.useState(false);
  const [celebrities, setCelebrities] = React.useState([]);
  const [error, setError] = React.useState({});
  const classes = useStyles()
  const resetError = () => setError({})

  const onChangeImage = ({ target }) => {
    const [file] = target.files;
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      setFetching(false);
      const [ext] = file.name.match(/jpe?g|png|bmp/) || [];
      if (!ext) {
        return setError({ message: 'Supported images are jpg,png and bmp.' });
      }

      setImage({ base64: reader.result, ext });
    });
    reader.addEventListener('error', () => {
      setFetching(false);
      setError(reader.error);
    });
  };

  const onClickSubmit = async () => {
    try {
      if (!image.base64 || !image.ext) {
        return setError({ message: 'Please upload a valid image.' });
      }
      setFetching(true);

      const [, base64] = image.base64.match(/base64,(.+)/) || [];
      
      if (!base64) {
        return setError({ message: 'Unable to load the image. Please try again.' });
      }

      const { data: dataUpload } = await axiosInstance.post(`/dev/users/image/${image.ext}`, JSON.stringify({ image: image.base64 }));

      if (!dataUpload.success) {
        setFetching(false);
        return setError(dataUpload.message);
      }
      console.log(dataUpload)
      // const { id, ext } = dataUpload.data;
      // const { data: dataCelebrities } = await axiosInstance.get(`dev/users/image/${ext}/${id}`);
      // if (!dataCelebrities.success) {
      //   setFetching(false);
      //   return setError(dataCelebrities.message);
      // }

      // setImage({ ...image, ...dataUpload.data });
      // setCelebrities(dataCelebrities.data);
      // setFetching(false);
    } catch (e) {
      setFetching(false);
      return setError({ message: e.message });
    }
  };

  return (
    <Paper className={classes.paper}>
      <AppBar position="static" >
        <Toolbar className={classes.toolbar} variant="dense">
          <IconButton>
            <img src={logo} width={30} height={30}/>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Typography component="div">
        {error.message && <Snackbar 
          open={Boolean(error.message)} 
          autoHideDuration={6000} 
          onClose={resetError}
          TransitionComponent={TransitionLeft}
          key={TransitionLeft.name}
          anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
          className={classes.snackbar}>
          <Alert onClose={resetError} severity="error" elevation={6} variant="filled" >
            <Typography component="span">
              {error.message}
            </Typography>
          </Alert>
        </Snackbar>}
        {/* {fetching && <div>Loading....</div>} */}
      </Typography>
      <Typography component="div" className={classes.container}>
        <Typography component="div" className={classes.imageContainer}>
          <img src={image.base64 || avatar}/>
          {/* <Card>
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image={avatar}
                title="user-setImage"
              />
            </CardActionArea>
          </Card> */}
          <form className={classes.form}>
              <input
                  accept="image/*"
                  id="image"
                  multiple
                  type="file"
                  onChange={onChangeImage}
                />
              <label htmlFor="image">
                <Button component="span" type="button" color="primary" variant="contained" className={classes.field} fullWidth>
                  Upload Image
                </Button>
              </label>
              <Button type="button" color="primary" variant="contained" onClick={onClickSubmit} className={classes.field} fullWidth>Find my celebrity</Button>
          </form>
        </Typography>
        <Typography component="div">
          {celebrities.length === 0 && image.id && <div>Celebrity not found</div>}
            {celebrities.length > 0 &&
              celebrities.map((celebrity) => {
                return <div key={celebrity.Id}>{JSON.stringify(celebrity, null, 4)}</div>;
              })}
        </Typography>
      </Typography>
    </Paper>
  );
};

const useStyles = makeStyles((theme) => ({
  paper: {
    minHeight: '100vh',
  },
  container: {
    padding: theme.spacing(2),
    maxWidth: 1000,
    margin: 'auto',
  },
  media: {
    minHeight: 1200,
  },
  // field: {
  //   maxWidth: 600,
  // },
  imageContainer: {
    padding: theme.spacing(2),
  },
  form: {
    '& > *:not(first-child)': {
      marginTop: theme.spacing(2),
    },
    '& #image': {
      display: 'none',
    }
  }
}))

export default App;
