const localData = require('./accommodationData.json');
const express = require('express');


const app = express();
const port = process.env.PORT || 2003;

app.get('/', (req, res) => {
  res.json(localData);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});