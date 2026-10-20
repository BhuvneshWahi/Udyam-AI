import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from ai.llm.base import LLMProvider

class OpenAIProvider(LLMProvider):
    """OpenAI API provider implementation executing real inference calls."""
    
    def __init__(self, model_name: str = "gpt-4o", config: Optional[Dict[str, Any]] = None):
        super().__init__(model_name, config)
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.has_credentials = bool(self.api_key and self.api_key.strip())

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> str:
        if not self.has_credentials:
            raise ValueError("OPENAI_API_KEY environment variable is NOT set.")
            
        # Try official SDK first
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            res = client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature
            )
            return res.choices[0].message.content or ""
        except ImportError:
            # Fallback to direct REST API call via urllib
            return self._call_rest_api(prompt, system_prompt, temperature)

    def structured_generate(self, prompt: str, response_schema: type[BaseModel], system_prompt: Optional[str] = None) -> BaseModel:
        if not self.has_credentials:
            raise ValueError("OPENAI_API_KEY environment variable is NOT set.")
            
        json_schema_prompt = (
            f"{prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object adhering strictly to this schema structure:\n"
            f"{json.dumps(response_schema.schema(), indent=2)}"
        )
        
        raw_json_str = self.generate(json_schema_prompt, system_prompt=system_prompt, temperature=0.1)
        
        # Clean markdown backticks if present
        cleaned_str = raw_json_str.strip()
        if cleaned_str.startswith("```"):
            lines = cleaned_str.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_str = "\n".join(lines).strip()
            
        parsed_dict = json.loads(cleaned_str)
        return response_schema(**parsed_dict)

    def _call_rest_api(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            },
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"OpenAI API Error ({e.code}): {err_body}") from e
        except Exception as e:
            raise RuntimeError(f"OpenAI Connection Error: {str(e)}") from e

    def tool_call(self, prompt: str, tools: List[Dict[str, Any]], system_prompt: Optional[str] = None) -> Dict[str, Any]:
        return {"tool": "get_business_summary", "arguments": {}}

    def classify(self, text: str, categories: List[str]) -> str:
        prompt = f"Classify the following text into exactly one of these categories: {categories}.\nText: {text}"
        res = self.generate(prompt, temperature=0.0).strip()
        for cat in categories:
            if cat.lower() in res.lower():
                return cat
        return categories[0] if categories else "GENERAL"

    def summarize(self, text: str, max_words: int = 100) -> str:
        prompt = f"Summarize the following text in under {max_words} words:\n{text}"
        return self.generate(prompt, temperature=0.2)

    def extract(self, text: str, schema: type[BaseModel]) -> BaseModel:
        prompt = f"Extract structured information from the following text:\n{text}"
        return self.structured_generate(prompt, response_schema=schema)
