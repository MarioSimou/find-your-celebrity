import React from 'react';
import axios from 'axios';
import logo from '../../logo.png';
import avatar from '../../avatar.webp';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import { Image, Button, Box, Text, LinkBox, SimpleGrid, Stack, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton } from '@chakra-ui/react';

const imageInitialState = {
  base64: null,
  ext: null,
};

const initialCelebrityState = [
  {
    Id: 'A unique identifier of the celebrity',
    Name: 'The celebrity name',
    Urls: 'A list of links related to the celebrity',
    Face: 'Information about your facial characteristics',
    MatchConfidence: 'A percentage of confidence that there is a match',
  },
];

const axiosInstance = axios.create({
  timeout: 10000,
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const App = () => {
  const [image, setImage] = React.useState(imageInitialState);
  const [fetching, setFetching] = React.useState(false);
  const [celebrities, setCelebrities] = React.useState(initialCelebrityState);
  const [error, setError] = React.useState({});
  const imageField = React.useRef({});
  const resetError = () => setError({});

  const onChangeImage = ({ target }) => {
    const [file] = target.files;
    if (!file) {
      return;
    }

    setCelebrities(initialCelebrityState);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      const [ext] = file.name.match(/jpeg|jpg|png|bmp/) || [];
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

  console.log('ERROR: ', error);
  return (
    <Box textAlign="start" fontSize="xl" w="100%" background="#323232" minHeight="100vh">
      <Box id="header" bg="#0a0b0c" as="nav">
        <LinkBox href="https://blog.mariossimou.dev/" rel="noreferrer" aria-label="logo" padding="8px 0 8px 16px">
          <Image src={logo} w={10} h={10} title="logo" alt="logo" />
        </LinkBox>
      </Box>
      {error.message && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" onClick={resetError} />
        </Alert>
      )}
      <Box textAlign="center" padding="20px">
        <SimpleGrid templateColumns="1fr 1f" autoFlow={{ base: 'row', lg: 'column' }} spacing={8}>
          <Box textAlign="right" as="div">
            <Image src={image.base64 ? image.base64 : avatar} alt="user-avatar" w="100%" maxW="calc(100vw - 40px)" />
            <Box as="form" display="flex" flexDirection="column">
              <input accept="image/*" id="image" multiple type="file" onChange={onChangeImage} style={{ display: 'none' }} ref={imageField} />
              <Stack direction="column" marginTop={2} maxW="calc(100vw - 40px)">
                <Button variant="outline" colorScheme="yellow" onClick={() => imageField.current.click()}>
                  Upload Image
                </Button>
                <Button
                  margin="0"
                  variant="outline"
                  colorScheme="yellow"
                  onClick={onClickSubmit}
                  isDisabled={!image.base64 || celebrities.length === 0 || (image.base64 && celebrities.length > 0 && celebrities[0] !== initialCelebrityState[0])}
                  isLoading={fetching}
                >
                  Find my celebrity
                </Button>
              </Stack>
            </Box>
          </Box>
          <Box as="div" textAlign="left">
            {celebrities.length === 0 && image.id && <Text>No match</Text>}
            {celebrities.length > 0 &&
              celebrities.map((celebrity) => {
                return (
                  <Box textAlign="start" maxW="calc(100vw - 40px)" overflow="auto">
                    <JSONPretty key={celebrity.Name} className="celebrity-json" onJSONPrettyError={(e) => setError({ message: e.message })} data={celebrity}></JSONPretty>
                  </Box>
                );
              })}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default App;
