// Test API route to debug App Runner routing
export default async function handler(req, res) {
  console.log('Test API route called:', req.method, req.url);
  
  res.status(200).json({ 
    message: 'API routes are working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      RETELL_API_KEY: process.env.RETELL_API_KEY ? 'Set' : 'Not set'
    }
  });
}
