import os
from typing import Optional, Dict, Any
from ai.llm.base import LLMProvider
from ai.llm.openai_provider import OpenAIProvider
from ai.llm.gemini_provider import GeminiProvider
from ai.llm.claude_provider import ClaudeProvider
from ai.llm.ollama_provider import OllamaProvider

def get_llm_provider(
    provider_name: Optional[str] = None,
    model_name: Optional[str] = None,
    config: Optional[Dict[str, Any]] = None
) -> LLMProvider:
    """
    Factory method to instantiate configured LLM Provider.
    Reads defaults from environment variables LLM_PROVIDER and MODEL_NAME.
    """
    provider = (provider_name or os.getenv("LLM_PROVIDER", "ollama")).lower().strip()
    model = model_name or os.getenv("MODEL_NAME")

    if provider in ["ollama", "local", "llama", "mistral"]:
        return OllamaProvider(model_name=model or "llama3.2:3b", config=config)
    elif provider == "openai":
        return OpenAIProvider(model_name=model or "gpt-4o", config=config)
    elif provider in ["gemini", "google"]:
        return GeminiProvider(model_name=model or "gemini-1.5-pro", config=config)
    elif provider in ["claude", "anthropic"]:
        return ClaudeProvider(model_name=model or "claude-3-5-sonnet-20240620", config=config)
    else:
        # Fallback to local Ollama provider first
        return OllamaProvider(model_name=model or "llama3.2:3b", config=config)
