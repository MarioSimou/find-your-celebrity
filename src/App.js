import React from 'react';
import axios from 'axios';

const imageInitialState = {
  base64: null,
  ext: null,
};

const axiosInstance = axios.create({
  timeout: 10000,
  baseURL: 'https://dgyye4xp4e.execute-api.eu-west-1.amazonaws.com',
});

const App = () => {
  const [image, setImage] = React.useState(imageInitialState);
  const [fetching, setFetching] = React.useState(false);
  const [celebrities, setCelebrities] = React.useState([]);
  const [error, setError] = React.useState({});

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
        return setError({ message: 'Supported images are jpg,png and bmp' });
      }

      const [, base64] = reader.result.match(/base64,(.+)/) || [];
      if (!base64) {
        return setError({ message: 'Image cannot be loaded' });
      }

      setImage({ base64, ext });
    });
    reader.addEventListener('error', () => {
      setFetching(false);
      setError(reader.error);
    });
  };

  const onClickSubmit = async () => {
    try {
      if (!image.base64 || !image.ext) {
        return setError({ message: 'No image has been uploaded' });
      }
      setFetching(true);

      const { data: dataUpload } = await axiosInstance.post(`/stage/users/image/${image.ext}`, JSON.stringify({ image: image.base64 }));

      if (!dataUpload.success) {
        setFetching(false);
        return setError(dataUpload.message);
      }

      const { id, ext } = dataUpload.data;
      const { data: dataCelebrities } = await axiosInstance.get(`stage/users/image/${ext}/${id}`);
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
    <div>
      <h1>Welcome</h1>
      {fetching && <div>Loading....</div>}
      {error.message && <div>Error: ${error.message}</div>}
      <div>
        <form>
          <input type="file" name="userImage" id="userImage" onChange={onChangeImage} />
          <input type="button" value="Submit" onClick={onClickSubmit} />
        </form>
        <div>
          {celebrities.length === 0 && image.id && <div>Celebrity not found</div>}
          {celebrities.length > 0 &&
            celebrities.map((celebrity) => {
              return <div key={celebrity.Id}>{JSON.stringify(celebrity, null, 4)}</div>;
            })}
        </div>
      </div>
    </div>
  );
};

export default App;
