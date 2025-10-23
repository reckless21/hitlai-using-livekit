
from fastapi import APIRouter
from pydantic import BaseModel
from services.firebase_service import db
from datetime import datetime

router = APIRouter()

class HelpRequestModel(BaseModel):
    question: str
    request_id: str

class KnowledgeBaseModel(BaseModel):
    question: str
    answer: str
    learnedDate: str

@router.post("/knowledge_base")
def add_knowledge_base_entry(entry: KnowledgeBaseModel):
    doc_ref = db.collection("knowledge_base").document()  
    doc_ref.set({
        "question": entry.question,
        "answer": entry.answer,
        "learnedDate": entry.learnedDate
    })
    return {"msg": "Knowledge base entry added", "id": doc_ref.id}


@router.post("/help_requests")
def create_help_request(request: HelpRequestModel):
    doc_ref = db.collection("help_request").document(request.request_id)
    doc_ref.set({
        "created_at": datetime.now(),
        "question": request.question,
        "request_id": request.request_id,
        "status": "pending"
    })

    history_ref = db.collection("help_request_history").document(request.request_id)
    history_ref.set({
        "id": request.request_id,
        "question": request.question,
        "answer": "",  
        "request_id": request.request_id,
        "status": "unresolved",
        "timestamp": datetime.now()
    })

    return {"msg": "Help request created", "id": request.request_id}

@router.get("/help_requests")
def get_help_requests():
    docs = db.collection("help_request").stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        results.append(data)
    return results

# New endpoint for help_request_history
@router.get("/help_request_history")
def get_help_request_history():
    docs = db.collection("help_request_history").stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        results.append(data)
    return results

# New endpoint for knowledge_base GET requests
@router.get("/knowledge_base")
def get_knowledge_base():
    docs = db.collection("knowledge_base").stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        results.append(data)
    return results