import React from 'react';
import axios from 'axios';
import { Layout, Image, Form, Button, Alert, Typography } from 'antd';
import './App.css';
import logo from '../../logo.png';
import avatar from '../../avatar.webp';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

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
  const imageField = React.useRef({});
  const resetError = () => setError({});

  const onChangeImage = ({ target }) => {
    const [file] = target.files;
    if (!file) {
      return;
    }

    setCelebrities([]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      const [ext] = file.name.match(/jpe?g|png|bmp/) || [];
      if (!ext) {
        return setError({ message: 'Supported images are jpg,png and bmp.' });
      }

      setImage({ base64: reader.result, ext });
    });

    reader.addEventListener('error', () => setError(reader.error));
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

      const { data: dataUpload } = await axiosInstance.post(`/${process.env.REACT_APP_ENVIRONMENT}/users/image/${image.ext}`, JSON.stringify({ image: base64 }));

      if (!dataUpload.success) {
        setFetching(false);
        return setError(dataUpload.message);
      }

      const { id, ext } = dataUpload.data;
      const { data: dataCelebrities } = await axiosInstance.get(`${process.env.REACT_APP_ENVIRONMENT}/users/image/${ext}/${id}`);
      if (!dataCelebrities.success) {
        setFetching(false);
        return setError(dataCelebrities.message);
      }

      setImage({ ...image, ...dataUpload.data });
      setCelebrities(dataCelebrities.data);
      setFetching(false);
    } catch (e) {
      setFetching(false);
      return setError({ message: e.message });
    }
  };

  return (
    <Layout>
      <Layout.Header id="header">
        <a href="https://blog.mariossimou.dev/" target="_blank" rel="noreferrer" aria-label="logo">
          <img src={logo} title="logo" alt="logo" className="logo" />
        </a>
      </Layout.Header>
      <Layout.Content id="content">
        {error.message && <Alert message="Error" description={error.message} type="error" showIcon onClose={resetError} closable />}
        <div className="content-container">
          <div className="left">
            <Image src={image.base64 ? image.base64 : avatar} alt="user-avatar" style={{ width: '100%' }} />
            <Form className="form">
              <input accept="image/*" id="image" multiple type="file" onChange={onChangeImage} style={{ display: 'none' }} ref={imageField} />
              <Button type="primary" size="large" block onClick={() => imageField.current.click()}>
                Upload Image
              </Button>
              <Button type="primary" size="large" onClick={onClickSubmit} disabled={!image.base64 || celebrities.length > 0} loading={fetching} block>
                Find my celebrity
              </Button>
            </Form>
          </div>
          <div className="right">
            {celebrities.length === 0 && image.id && <Typography.Text>No match</Typography.Text>}
            {celebrities.length > 0 &&
              celebrities.map((celebrity) => {
                return <JSONPretty key={celebrity.Name} className="celebrity-json" onJSONPrettyError={(e) => setError({ message: e.message })} data={celebrity}></JSONPretty>;
              })}
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default App;
