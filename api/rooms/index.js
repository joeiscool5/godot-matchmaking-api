// api/rooms/index.js
// Simple in-memory storage (resets on deployment, good for development)
let rooms = {};

// Clean up old rooms (older than 1 hour)
function cleanupRooms() {
  const now = Date.now();
  for (const [code, room] of Object.entries(rooms)) {
    if (now - room.created_at > 3600000) { // 1 hour
      delete rooms[code];
    }
  }
}

export default async function handler(req, res) {
  // Enable CORS for Godot
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  cleanupRooms();
  
  if (req.method === 'POST') {
    const { room_code, host_ip, host_port, host_name, max_players } = req.body;
    
    // Validate room code
    if (!room_code || room_code.length !== 6) {
      return res.status(400).json({ error: 'Invalid room code' });
    }
    
    // Check if room already exists
    if (rooms[room_code]) {
      return res.status(409).json({ error: 'Room already exists' });
    }
    
    // Create room
    rooms[room_code] = {
      host_ip: host_ip || '127.0.0.1',
      host_port: host_port || 7777,
      host_name: host_name || 'Unknown',
      max_players: max_players || 4,
      created_at: Date.now()
    };
    
    console.log(`Room created: ${room_code}`);
    res.json({ success: true, room_code });
  }
  
  else if (req.method === 'GET') {
    // Return all active rooms (optional, for debugging)
    res.json({ 
      rooms: Object.keys(rooms).map(code => ({
        code,
        host_name: rooms[code].host_name,
        created_at: rooms[code].created_at
      }))
    });
  }
  
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
