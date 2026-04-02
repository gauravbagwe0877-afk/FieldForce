const http = require('http');

function post(url, body, token) {
  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  if (token) options.headers['Authorization'] = 'Bearer ' + token;

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error(data || 'Request Failed'));
        }
      });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function reset() {
  try {
    const { token } = await post('http://localhost:8081/api/auth/login', { email: 'admin@fieldforce.org', password: 'admin123' });
    if (!token) throw new Error("No token");
    
    await post('http://localhost:8081/api/admin/reset', null, token);
    console.log("SUCCESS: Dummy data cleared.");
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
}

reset();
