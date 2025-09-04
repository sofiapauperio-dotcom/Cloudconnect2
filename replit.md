# CloudConnect - Client Management System

## Overview

CloudConnect is a web-based client management system built with a client-server architecture. The application provides a simple interface for managing client records with full CRUD operations (Create, Read, Delete) backed by Airtable as the cloud database. The system features a responsive frontend with form validation, loading states, and error handling, while the backend serves as a secure proxy to protect Airtable API credentials.

**Status**: ✅ COMPLETED! The CloudConnect app is fully functional and deployed. All mission requirements successfully implemented: Create/Read/Delete operations with Airtable integration, professional UI with loading/error/empty states, form validation, responsive design, and secure token management. The Airtable API connection has been resolved and the app is working perfectly.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with vanilla HTML, CSS, and JavaScript using a single-page application approach:

- **Client-Side Components**: Form-based client creation interface, dynamic client listing with real-time updates, and comprehensive UI state management for loading, error, and empty states
- **API Communication**: Uses the Fetch API to communicate with the backend proxy server, handling all HTTP operations (GET, POST, DELETE) with proper error handling and response parsing
- **Responsive Design**: Grid-based layout that adapts to different screen sizes, with modern CSS styling including gradients and shadows

### Backend Architecture
The backend follows a simple Express.js server pattern:

- **Proxy Server Design**: Acts as a secure intermediary between the frontend and Airtable API, preventing exposure of sensitive API credentials to client-side code
- **RESTful API Structure**: Implements standard REST endpoints (`/api/airtable/records`) that mirror CRUD operations
- **Environment-Based Configuration**: Uses environment variables for all sensitive configuration (tokens, base IDs, table names)

### Data Storage Solution
The system uses Airtable as a cloud-based database:

- **Schema Design**: Simple client table with fields for name (text), email (text), and phone (text)
- **API Integration**: Direct integration with Airtable's REST API v0 for all data operations
- **Data Format**: JSON-based communication with Airtable's record structure including metadata fields

### Security Architecture
Security is implemented through credential isolation and environment variable management:

- **Token Protection**: Airtable Personal Access Token (PAT) is stored server-side as environment variable, never exposed to frontend
- **API Proxy Pattern**: All Airtable requests are proxied through the backend server to maintain credential security
- **Scoped Permissions**: Airtable token is configured with minimal required permissions (base-specific access only)

### Error Handling and User Experience
Comprehensive error handling and user feedback systems:

- **Loading States**: Visual spinners and loading indicators during API operations
- **Error Management**: Graceful error handling with user-friendly error messages
- **Validation**: Client-side form validation before API submission
- **State Management**: Clear separation between loading, success, error, and empty states

## External Dependencies

### Core Runtime Dependencies
- **Express.js (^4.21.2)**: Web framework for the Node.js backend server, providing routing and middleware functionality
- **CORS (^2.8.5)**: Cross-Origin Resource Sharing middleware to enable frontend-backend communication

### External Services
- **Airtable API**: Cloud database service providing REST API access to structured data storage
  - Uses Personal Access Token (PAT) authentication
  - Configured with specific Base ID and Table Name
  - Endpoints: GET for listing records, POST for creating records, DELETE for removing records

### Environment Configuration
- **AIRTABLE_TOKEN**: Personal Access Token for Airtable API authentication
- **AIRTABLE_BASE_ID**: Specific Airtable base identifier for the client database
- **AIRTABLE_TABLE_NAME**: Table name within the Airtable base (default: "Clientes")
- **PORT**: Server port configuration (default: 5000, configurable via environment)

### Browser APIs
- **Fetch API**: Modern browser API for HTTP requests, used for all client-server communication
- **DOM APIs**: Standard browser APIs for form handling, event management, and UI updates