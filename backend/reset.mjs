import fetch from 'node-fetch'

async function reset() {
  try {
    const loginRes = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fieldforce.org', password: 'admin123' })
    });
    
    if (!loginRes.ok) throw new Error("Login failed");
    const { token } = await loginRes.json();
    
    const resetRes = await fetch('http://localhost:8081/api/admin/reset', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (resetRes.ok) {
      console.log("SUCCESS: Dummy data cleared and system reset.");
    } else {
      console.log("FAILED: " + await resetRes.text());
    }
  } catch (err) {
    console.error("ERROR: " + err.message);
  }
}

reset();
