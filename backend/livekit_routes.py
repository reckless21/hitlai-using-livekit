from fastapi import APIRouter, Query
from livekit import api
import os

router = APIRouter()

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

@router.get('/token')
async def get_livekit_token(user_id: str = Query(..., description="User ID for LiveKit token")):
    token = (
        api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(user_id)
        .with_grants(api.VideoGrants(room_join=True, room="support-room"))
        .to_jwt()
    )
    return {'token': token, 'url': LIVEKIT_URL}



