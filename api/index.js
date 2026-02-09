import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;
try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  db = getFirestore();
} catch (error) {
  console.error('Firebase init error:', error.message);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const body = Buffer.concat(buffers).toString();

    
    if (!db) {
      throw new Error('Firestore not initialized. Check environment variables.');
    }

    await db.collection('requests').add({
      content: body,
      timestamp: new Date().toISOString(),
      headers: {
        'content-type': req.headers['content-type'] || ''
      }
    });

    res.status(200).json({ status: 'saved', length: body.length });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}