const express = require('express');
const multer = require('multer');
const { spawn,exec } = require('child_process');
const path = require('path');
const fs = require('fs')
const axios = require('axios');
const cors = require('cors');

const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT ||8000;
const BASE_URL = process.env.BASE_URL || "http://localhost:8000"

// Set up multer for handling multipart/form-data (file uploads)
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to upload base image
app.post('/upload_base_image', upload.single('base'), (req, res) => {
  console.log('Uploaded file:', req.file); // Log the uploaded file object
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const newPath = "./uploads/base.jpeg";
  console.log('New path:', newPath); // Log the new path
  fs.rename(req.file.path, newPath, err => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).json({ error: 'Failed to save file' });
    }
    res.json({ message: `Base image uploaded successfully` });
  });
});

// Route to upload furniture images
app.post('/upload_furniture', upload.single('furniture' ), (req, res) => {
  furniturePath="./uploads/furniture.jpeg"
  fs.rename(req.file.path, furniturePath, err => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).json({ error: 'Failed to save file' })
    }
  });
  res.json({ message: 'Mask and furniture images uploaded successfully' });
});

app.post('/upload_base_url', async (req, res) => {
  const baseUrl = req.body.baseUrl;

  if (!baseUrl) {
    return res.status(400).json({ error: 'URL not provided' });
  }

  try {
    const response = await axios.get(baseUrl, { responseType: 'arraybuffer' });
    if (!response.headers['content-type'].startsWith('image/')) {
      return res.status(400).json({ error: 'Provided URL is not an image' });
    }

    const contentType = response.headers['content-type'];
    MaskPath="./uploads/base.jpeg"

    fs.writeFileSync(MaskPath, Buffer.from(response.data));
    
    res.json({ message: 'Image uploaded successfully', filename: MaskPath });
  } catch (error) {
    console.error('Error downloading image:', error.message);
    res.status(500).json({ error: 'Failed to upload image' });
  }
  });

  app.post('/upload_furniture_url', async (req, res) => {
    const furnitureUrl = req.body.furnitureUrl;
  
    if (!furnitureUrl) {
      return res.status(400).json({ error: 'URL not provided' });
    }
  
    try {
      const response = await axios.get(furnitureUrl, { responseType: 'arraybuffer' });
      if (!response.headers['content-type'].startsWith('image/')) {
        return res.status(400).json({ error: 'Provided URL is not an image' });
      }
  
      const contentType = response.headers['content-type'];
      furniturePath="./uploads/furniture.jpeg"
  
      fs.writeFileSync(furniturePath, Buffer.from(response.data));
      
      res.json({ message: 'Image uploaded successfully', filename: MaskPath });
    } catch (error) {
      console.error('Error downloading image:', error.message);
      res.status(500).json({ error: 'Failed to upload image' });
    }
    });


// Route to upload mask furniture images
app.post('/upload_mask', upload.single('mask' ), (req, res) => {
  MaskPath="./uploads/mask.jpeg"
  fs.rename(req.file.path, MaskPath, err => {
    if (err) {
      console.error('Error renaming file:', err);
      return res.status(500).json({ error: 'Failed to save file' })
    }
  });
    res.json({ message: 'Mask and furniture images uploaded successfully' });
  });


  app.post('/upload_mask_url', async (req, res) => {
    const maskUrl = req.body.url;
    // res.send(imageUrl);
    // console.log(imageUrl);
  
    if (!maskUrl) {
      return res.status(400).json({ error: 'URL not provided' });
    }
  
    try {
      const response = await axios.get(maskUrl, { responseType: 'arraybuffer' });
      if (!response.headers['content-type'].startsWith('image/')) {
        return res.status(400).json({ error: 'Provided URL is not an image' });
      }
  
      const contentType = response.headers['content-type'];
      MaskPath="./uploads/mask.jpeg"
  
      fs.writeFileSync(MaskPath, Buffer.from(response.data));
      
      res.json({ message: 'Image uploaded successfully', filename: MaskPath });
    } catch (error) {
      console.error('Error downloading image:', error.message);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  
  
    // fs.rename(req.file.path, MaskPath, err => {
    //   if (err) {
    //     console.error('Error renaming file:', err);
    //     return res.status(500).json({ error: 'Failed to save file' })
    //   }
    // });
      // res.json({ message: 'Mask and furniture images uploaded successfully' });
    });
// Route to process images
app.get('/process_images', async (req, res) => {
  try {
    const pythonProcess = spawn('python', ['./pythonscript.py']);
    pythonProcess.stdout.on('data', async (data) => {
      console.log(data);
      const filePath = path.join(__dirname, '/uploads/final.png');
      // res.send(filePath)
      res.send(`${BASE_URL}/uploads/final.png`)
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Error from Python script:', data.toString());
      res.status(500).json({ error: 'Error processing images' });
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process closed with code ${code}`);
    });
  } catch (error) {
    console.error('Error executing Python script:', error.message);
    res.status(500).json({ error: 'Error processing images' });
  }
});

app.get('/uploads/final.png', async (req, res) => {
  const file = path.join(__dirname,"uploads/final.png")
  res.sendFile(file)
});
app.get('/',  (req, res) => {
  res.send("<h1>Hello Nirwana</h1>")
});

app.listen(port, () => {
  exec('python -V', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing Python module: ${error.message}`);
    }
    if (stderr) {
      console.error(`Error installing Python module: ${stderr}`);
    }
    console.log(`Python module installed: ${stdout}`);
  });
  console.log(`Server is running on ${BASE_URL}`);
});