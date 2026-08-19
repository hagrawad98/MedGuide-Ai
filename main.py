from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# The Connection between the site and the chatbot
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "message": "MedGuide API is running"}


class UserInput(BaseModel):
    message: str


@app.post("/api/chat")
async def chat_endpoint(data: UserInput):
  
    response_message = f"Your messege is received: {data.message}"
    return {"reply": response_message}