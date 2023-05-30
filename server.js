const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();

let finalFileName = "";
const port = 8090; // Specify the desired port number
const localhost = "http://localhost:8090";

// Set up the storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now(); // Get the current timestamp
    const filename = `${timestamp}_${file.originalname}`; // Append the timestamp to the original filename
    finalFileName = filename;
    cb(null, filename);
  },
});

// Create the multer middleware using the storage configuration
const upload = multer({ storage });

// Define the route for file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(req.file.originalname);

  res.status(200).json({
    data: { 
      filename: finalFileName,
      download_url: localhost + "/download/" + finalFileName,
      view_url: localhost + "/view/" + finalFileName
    }
  });
});

app.get('/download/:filename', (req, res) => {
  const filePath = `uploads/${req.params.filename}`;
  console.log("Download Called");

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Stream the file for download
  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  });
});

// Define the route for viewing files
app.get('/view/:filename', (req, res) => {
  const filePath = `uploads/${req.params.filename}`;
  console.log("View Called");
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log("File noto found");
    return res.status(404).json({ error: 'File not found' });
  }

  // Read the file and send it as a response
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read file' });
    } else {
      console.log("File found");
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(data);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});