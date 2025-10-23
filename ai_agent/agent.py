from dotenv import load_dotenv
import httpx
from datetime import datetime
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, ChatContext, ChatMessage
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv(".env")

# FastAPI backend base URL
BACKEND_URL = "http://localhost:8000/api"  


class KnowledgeBaseAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are a helpful voice AI assistant for customer support.
            You eagerly assist users with their questions by providing information.
            Your responses are concise, to the point, and without any complex formatting or punctuation.
            When you have verified information from the knowledge base, speak it naturally.
            When escalating to a supervisor, be polite and reassuring.""",
        )

    async def on_user_turn_completed(
        self, turn_ctx: ChatContext, new_message: ChatMessage
    ) -> None:
        """Called after user finishes speaking, before LLM generates response"""
        
        user_question = new_message.text_content
        print(f"[Agent] User asked: {user_question}")
        
        # Query knowledge base via FastAPI endpoint
        answer = await self._search_knowledge_base(user_question)
        
        if answer:
            print(f"[Agent] Found answer in knowledge base: {answer}")
            turn_ctx.add_message(
                role="assistant",
                content=f"Here is the verified answer from our knowledge base: {answer}"
            )
        else:
            print(f"[Agent] No answer found, escalating to supervisor")
            await self._create_help_request(user_question)
            turn_ctx.add_message(
                role="assistant",
                content="I don't have that information in my knowledge base. I'm escalating your question to a human supervisor who will assist you shortly."
            )
    
    async def _search_knowledge_base(self, question: str) -> str | None:
        """Search knowledge base via FastAPI endpoint"""
        try:
            async with httpx.AsyncClient() as client:
                # Get all knowledge base entries
                response = await client.get(f"{BACKEND_URL}/knowledge_base")
                response.raise_for_status()
                kb_entries = response.json()
                
                # Find matching question (exact match for now, can enhance with fuzzy search)
                for entry in kb_entries:
                    if entry.get("question") == question:
                        return entry.get("answer")
                
                return None
        except Exception as e:
            print(f"[Error] Failed to query knowledge base: {e}")
            return None
    
    async def _create_help_request(self, question: str) -> None:
        """Create a help request via FastAPI endpoint"""
        try:
            async with httpx.AsyncClient() as client:
                # Generate unique request ID
                request_id = f"req_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                payload = {
                    "question": question,
                    "request_id": request_id
                }
                
                response = await client.post(
                    f"{BACKEND_URL}/help_requests",
                    json=payload
                )
                response.raise_for_status()
                print(f"[Agent] Created help request: {request_id}")
                
        except Exception as e:
            print(f"[Error] Failed to create help request: {e}")


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4o-mini",
        tts="cartesia/sonic-2:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=KnowledgeBaseAssistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(), 
        ),
    )

    await session.generate_reply(
        instructions="Greet the user warmly and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
