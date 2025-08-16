# GovConn — Unified Government Services Platform

**GovConn** is a complete digital ecosystem that unifies government services for citizens, offices, and administrators. Built by **Team Vertex**, GovConn provides a seamless, secure, and interactive experience via a mobile app, citizen portal, office interface, and AI-powered assistant.

---

## Vision
To transform citizen–government interaction by providing a single, intuitive, and secure platform for accessing, managing, and tracking all government services digitally.  

---

## Repositories

* [GovConn Mobile App](https://github.com/GovConn/mobile-app) – Flutter-based mobile application for citizens.  
* [GovConn Backend](https://github.com/GovConn/backend) – FastAPI backend managing services, citizens, appointments, documents, and AI integration.  
* [GovConn GovPortal](https://github.com/GovConn/GovPortal) – Web portal for citizens and government office staff.  
* [GovConn Frontend](https://github.com/GovConn/frontend) – Next.js frontend connecting with backend and AI assistant.  
* [GovConn AI Assistant](https://github.com/GovConn/AI-assistant) – AI-powered assistant providing smart guidance to citizens.  


## ✨ Key Features

### 1.GovConn Citizen Mobile App
- **Unified Access:** Healthcare, licensing, civil registrations, taxes, and more in one app.  
- **Digital Workflows:** Step-by-step guides for each service with required documents.  
- **Document Management:** Upload once; reuse across services securely.  
- **Appointment Booking:** Reserve slots without waiting in queues.  
- **Real-Time Tracking:** Monitor progress and receive instant notifications.  
- **Feedback & Ratings:** Submit reviews to improve accountability.  

### 2. GovConn Web Portal

#### Citizen Portal
- Access government services online.  
- Track requests, appointments, and service status in real time.  
- Manage documents securely and reuse them across multiple services.  

#### Office Interface
- Government staff can manage workflows and approve citizen requests.  
- Generate reports and monitor performance metrics.  
- Node-Based Routing: Automated coordination between government authorities.  
- Analytics & Dashboards: Monitor service performance and optimize resource allocation.  
 

### 3. AI Assistant
- **Smart Support:** Provides answers, guidance, and service suggestions to citizens.  
- **Integration:** Connected with backend services for up-to-date information.  
- **Deployment:** Runs as a dedicated service, accessible via mobile or web portals.  

### 4. Backend Services
- **Responsibilities:**  
  - Central hub for all GovConn operations, managing citizens, services, appointments, documents, notifications, and AI requests.  
  - Provides APIs consumed by the mobile app, citizen portal, office interface, and AI assistant.  
- **Integration:**   
  - Interfaces with web and mobile frontends via REST endpoints.  
  - Node-based routing for government office workflows.  
- **Security & Authentication:**  
  - JWT-based authentication for citizens and staff.  
  - Multi-level authorization and fraud prevention.  
  - Secure handling of documents and sensitive data.  



## 🛠️ Tech Stack
| Component | Stack / Packages |
|-----------|-----------------|
| Mobile App | Flutter, Provider, http file_picker, flutter_secure_storage |
| Web Frontend | Next.js (React/TS), TailwindCSS, Axios |
| Backend | Python 3.10+, FastAPI, SQLAlchemy, Pydantic |
| AI Assistant | FastAPI, OpenAI APIs (optional) |
| Database | Supabase (PostgreSQL) |
| Containerization | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed
- Node.js & npm (for frontend builds if needed)
- Flutter SDK (for mobile app)
- Supabase/PostgreSQL database URL

### Clone and Run
``` bash
git clone https://github.com/your-username/govconn.git
cd govconn
docker-compose up --build
```

### Access URLs

* **Backend API:** `http://localhost:8000`
* **AI Assistant:** `http://localhost:8100`
* **Next.js Frontend:** `http://localhost:3000`
* **GovPortal Web:** `http://localhost:3001`

---


## 📚 API Documentation

* **Swagger UI:** `http://localhost:8000/docs`
* **Redoc:** `http://localhost:8000/redoc`

Endpoints include:

* `/api/v1/citizens` – manage citizen profiles
* `/api/v1/blob` – upload and download files or documents
* `/api/v1/gov/services` – create, update, rate government services
* `/api/v1/appointments` – schedule and track bookings
* `/api/v1/documents` – upload and manage citizen documents
* `/api/v1/notifications` – create and list notifications
* `/api/v1/gov` – manage government nodes and offices
* `/api/v1/gov_service_ratings` – create and retrieve ratings/feedback for services
* `/api/v1/analytics` – retrieve analytics on citizen usage and service metrics
---

## 🏗️ Architecture Overview

```
+----------------+          +------------------+
|  Mobile App    | <------> |   AI Assistant   |
+----------------+          +------------------+
        |                           ^
        v                           |
+----------------+                   |
| Web Frontend   | ------------------+
| And Portal     |
+----------------+
        |
        v
+----------------+
|   Backend API  |
|   (FastAPI)    |
+----------------+
        |
        v
+----------------+
|   Database     |
| (Supabase/PG)  |
+----------------+
```

## 📄 License

This project is licensed under the MIT License. 
