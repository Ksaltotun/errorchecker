export default async function handler(req, res) {
  // Просто возвращаем то, что получили
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const body = Buffer.concat(buffers).toString();
  
  res.status(200).json({ 
    message: 'Working!',
    body: body,
    method: req.method 
  });
}
