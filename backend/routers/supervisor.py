
from fastapi import APIRouter
from pydantic import BaseModel
from services.firebase_service import db
from datetime import datetime

router = APIRouter()

class SupervisorResponseModel(BaseModel):
    answer: str
    id: str
    question: str
    request_id: str

# @router.post("/supervisor_response")
# def supervisor_response(data: SupervisorResponseModel):
#     # Update supervisor_response collection
#     sup_doc = db.collection("supervisor_response").document(data.id)
#     sup_doc.set({
#         "answer": data.answer,
#         "id": data.id,
#         "question": data.question,
#         "request_id": data.request_id,
#         "responded_at": datetime.now()
#     })
#     # Update help_request status
#     help_ref = db.collection("help_request").document(data.request_id)
#     help_ref.update({"status": "resolved"})
#     # Push to knowledge_base
#     know_doc = db.collection("knowledge_base").document(data.id)
#     know_doc.set({
#         "id": data.id,
#         "question": data.question,
#         "answer": data.answer
#     })
#     return {"msg": "Supervisor response and knowledge base updated"}

@router.post("/supervisor_response")
def supervisor_response(data: SupervisorResponseModel):
    # Update supervisor_response collection
    sup_doc = db.collection("supervisor_response").document(data.id)
    sup_doc.set({
        "answer": data.answer,
        "id": data.id,
        "question": data.question,
        "request_id": data.request_id,
        "responded_at": datetime.now()
    })
    # Update help_request status to resolved
    help_ref = db.collection("help_request").document(data.request_id)
    help_ref.update({"status": "resolved"})

    # Push to knowledge_base as before
    know_doc = db.collection("knowledge_base").document(data.id)
    know_doc.set({
        "id": data.id,
        "question": data.question,
        "answer": data.answer
    })

    # Add or update the help_request_history collection
    history_doc = db.collection("help_request_history").document(data.request_id)
    history_doc.set({
        "id": data.request_id,
        "question": data.question,
        "answer": data.answer,
        "customerId": "",  
        "request_id": data.request_id,
        "status": "resolved",
        "timestamp": datetime.now()
    })

    return {"msg": "Supervisor response, knowledge base, and history updated"}
