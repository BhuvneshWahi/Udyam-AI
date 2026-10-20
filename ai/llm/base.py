from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class LLMProvider(ABC):
    """
    Abstract LLM Provider interface for UDYAM AI.
    Ensures provider-agnostic hot-swapping between OpenAI, Gemini, Claude, Llama, Ollama, etc.
    """
    
    def __init__(self, model_name: str, config: Optional[Dict[str, Any]] = None):
        self.model_name = model_name
        self.config = config or {}

    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> str:
        """Generate free-form text response."""
        pass

    @abstractmethod
    def structured_generate(self, prompt: str, response_schema: type[BaseModel], system_prompt: Optional[str] = None) -> BaseModel:
        """Generate structured JSON response conforming strictly to a Pydantic schema."""
        pass

    @abstractmethod
    def tool_call(self, prompt: str, tools: List[Dict[str, Any]], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Process query against available function/tool signatures."""
        pass

    @abstractmethod
    def classify(self, text: str, categories: List[str]) -> str:
        """Classify text into one of the specified categories."""
        pass

    @abstractmethod
    def summarize(self, text: str, max_words: int = 100) -> str:
        """Summarize long text or document snippet."""
        pass

    @abstractmethod
    def extract(self, text: str, schema: type[BaseModel]) -> BaseModel:
        """Extract structured entities from unstructured text."""
        pass
