from pydantic import BaseModel

class ResponseMsg(BaseModel):
    message: str
