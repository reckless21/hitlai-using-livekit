🚀 Overview

The system simulates an AI-powered salon receptionist using LiveKit, Firebase Firestore, and a React frontend.
When the AI doesn’t know an answer, it:

Escalates the query to a human supervisor.

Logs a help request in Firestore.

Notifies the supervisor (via simulated webhook/console log).

Waits for a response and then automatically updates the knowledge base.

Follows up with the customer instantly once resolved.

⚙️ Tech Stack

LiveKit – Real-time voice AI simulation & call handling.

Firebase Firestore – Database for help request lifecycle & knowledge base.

React.js – Supervisor admin panel (pending/resolved requests, learned answers).

Python – Backend agent logic & LiveKit integration.

Openai – For AI response generation and speech synthesis.

🧩 Core Features

📞 AI Call Handling – Receives and responds to simulated calls.

🧑‍💼 Escalation Workflow – Creates and manages human help requests.

🧠 Knowledge Base – Learns new answers from supervisor inputs.

🪄 Supervisor Dashboard – Simple UI to view, resolve, and track requests.

🔁 Lifecycle Management – Pending → Resolved / Unresolved states.


Agent Layer – Built using LiveKit SDK + Python.

Database Layer – Firestore collections for help_requests and knowledge_base.

UI Layer – React admin interface for supervisors.

Integration Layer – Livekit simulate communication loops.

🧠 Design Highlights

Modular and scalable design to support future live transfer .

Graceful timeout handling for supervisor unresponsiveness.

Clean schema design linking help requests and customer sessions.

Separation of agent logic, DB handling, and UI for clarity and testing.