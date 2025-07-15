// api/rooms/[code].js
// Note: This needs to share the same rooms object as index.js
// In production, you'd use a real database
let rooms = {};

function cleanupRooms() {
  const now = Date.now();
  for (const [code, room] of Object.entries(rooms)) {
    if (now - room.created_at > 3600000) {
      delete rooms[code];
    }
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { code } = req.query;
  cleanupRooms();
  
  if (req.method === 'GET') {
    const room = rooms[code];
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  }
  
  else if (req.method === 'DELETE') {
    if (rooms[code]) {
      delete rooms[code];
      console.log(`Room deleted: ${code}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
