const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
// Configure CORS to allow only localhost:5173
app.use(cors({
  origin: ['https://teal-beignet-986b62.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// In-memory data store (replace with database in production)
let contacts = [
  // Your contacts data will be loaded here
  // For now, this will be initialized from the JSON file
];

// Load contacts data
const loadContacts = () => {
  // In production, load from database
  // For demo, you can require the JSON file or load it
  contacts = require('./contacts.json');
};

// Initialize data
loadContacts();

// API Routes

/**
 * GET /api/contacts
 * Get all contacts
 */
app.get('/api/contacts', (req, res) => {
  try {
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
});

/**
 * GET /api/contacts/favourites
 * Get only favourite contacts
 */
app.get('/api/contacts/favourites', (req, res) => {
  try {
    const favourites = contacts.filter(contact => contact.is_favourite === true);
    res.json({
      success: true,
      count: favourites.length,
      data: favourites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching favourite contacts',
      error: error.message
    });
  }
});

/**
 * GET /api/contacts/search?name=<search_term>
 * Search contacts by name (case-insensitive)
 */
app.get('/api/contacts/search', (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name query parameter'
      });
    }

    const searchTerm = name.toLowerCase();
    const results = contacts.filter(contact => 
      contact.full_name.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      count: results.length,
      searchTerm: name,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching contacts',
      error: error.message
    });
  }
});

/**
 * PATCH /api/contacts/:id/favourite
 * Toggle favourite status of a contact
 */
app.patch('/api/contacts/:id/favourite', (req, res) => {
  try {
    const { id } = req.params;
    
    const contactIndex = contacts.findIndex(
      contact => contact.id.$oid === id
    );

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Toggle favourite status
    contacts[contactIndex].is_favourite = !contacts[contactIndex].is_favourite;

    res.json({
      success: true,
      message: 'Favourite status updated',
      data: contacts[contactIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating favourite status',
      error: error.message
    });
  }
});

/**
 * GET /api/contacts/:id
 * Get a single contact by ID
 */
app.get('/api/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = contacts.find(
      contact => contact.id.$oid === id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    totalContacts: contacts.length
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Total contacts loaded: ${contacts.length}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/contacts                  - Get all contacts`);
  console.log(`  GET    /api/contacts/favourites       - Get favourite contacts`);
  console.log(`  GET    /api/contacts/search?name=...  - Search by name`);
  console.log(`  GET    /api/contacts/:id              - Get single contact`);
  console.log(`  PATCH  /api/contacts/:id/favourite    - Toggle favourite`);
});

module.exports = app;
