const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/properties?page=1&limit=12');
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
test();
