import {Button, Stack} from '@mui/material'
import axios from 'axios';
import JSZip from 'jszip';
import JsZipUtils from './JsZipUtils';

interface IDownloadProps {
  fileName?: string;
  url?: string;
  data?: string | Blob;
  urlInp?: string;
}

const download = ({ fileName, data, urlInp }: IDownloadProps) => {
  const aTag = document.createElement('a');
  let url = '';
  if (urlInp) {
    url = urlInp;
  } else if (data) {
    if (!fileName) return;
    if (typeof data === 'string') {
      url = URL.createObjectURL(new Blob([data]));
    } else {
      url = URL.createObjectURL(data);
    }
  } else return;
  aTag.setAttribute('href', url);
  aTag.setAttribute('download', fileName || '');
  aTag.click();
  URL.revokeObjectURL(url);
};

const downloadPng = async ({ fileName, url }: IDownloadProps) => {
  await axios({
    url: `${url}`,
    method: 'GET',
    responseType: 'blob',
    withCredentials: false,
  }).then(({ data }) => {
    download({ fileName: fileName, data });
  });
};

function urlToPromise(url: string): Promise<Blob> {
  return new Promise(function(resolve, reject) {
      JsZipUtils.getBinaryContent(url, function (err: any, data: any) {
          if(err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });}

function App() {
  let zip = new JSZip();
  const data:string[] = [
    'https://picsum.photos/seed/picsum/300',
    'https://picsum.photos/seed/test/300',
    'https://picsum.photos/seed/hello/300',
    'https://picsum.photos/seed/world/300',
    'https://picsum.photos/seed/bluearchive/300',
  ]
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={async () => {
        for (const i in data){
          await downloadPng({fileName: `test_${i}.jpg`, url: data[i]});
        }
      }}>Download Image files</Button>
      <Button variant="contained" onClick={async () => {
        let urls:string[] = [];
        for (const i in data) {
          await axios({
            url: `${data[i]}`,
            method: 'GET',
            responseType: 'blob',
            withCredentials: false,
          }).then(async ({ data }) => {
            const imageUrl = URL.createObjectURL(new Blob([(data)], {type: "image/jpeg"}));
            urls.push(imageUrl);
          });
        }
        urls.forEach(async (url, index) => {
          const filename = "test" + index + ".jpg";
          console.log(`${index}번째: ${url}`);
          zip.file(filename, urlToPromise(url), {binary: true});
        });
        zip.generateAsync({type:'blob'}).then((content) => {
          console.log(`${content}`);
          download({fileName:`test_download.zip`, data:content});
        });
      }}>Download Zip file</Button>
    </Stack>
  );
}

export default App;
