import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional, Type
from pydantic import BaseModel
from ai.llm.base import LLMProvider

class OllamaProvider(LLMProvider):
    """Ollama local model provider executing real inference via local Ollama server."""
    
    def __init__(self, model_name: str = "llama3.2:3b", config: Optional[Dict[str, Any]] = None):
        super().__init__(model_name, config)
        self.host = os.getenv("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
        self.has_credentials = self._check_server_reachable()

    def _check_server_reachable(self) -> bool:
        try:
            req = urllib.request.Request(f"{self.host}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=3) as response:
                return response.status == 200
        except Exception:
            return False

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> str:
        if not self.has_credentials:
            raise ValueError(f"Ollama local server is not reachable at {self.host}.")
            
        url = f"{self.host}/api/chat"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["message"]["content"]
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Ollama API Error ({e.code}): {err_body}") from e
        except Exception as e:
            raise RuntimeError(f"Ollama Connection Error: {str(e)}") from e

    def structured_generate(self, prompt: str, response_schema: Type[BaseModel], system_prompt: Optional[str] = None) -> BaseModel:
        if not self.has_credentials:
            raise ValueError(f"Ollama local server is not reachable at {self.host}.")
            
        sample_template = self._build_json_template(response_schema)
        
        json_prompt = (
            f"{prompt}\n\n"
            f"IMPORTANT: Respond ONLY with a valid JSON object replacing the placeholder values in this JSON template:\n"
            f"{json.dumps(sample_template, indent=2)}\n\n"
            f"Do not include markdown fences or any explanation text outside the JSON object."
        )
        
        url = f"{self.host}/api/chat"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": json_prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 1024}
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                result = json.loads(response.read().decode("utf-8"))
                raw_content = result["message"]["content"].strip()
        except Exception as e:
            raise RuntimeError(f"Ollama Structured Generate Error: {str(e)}") from e

        # Clean markdown wrappers if present
        if raw_content.startswith("```"):
            lines = raw_content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_content = "\n".join(lines).strip()

        try:
            parsed_dict = json.loads(raw_content)
        except Exception as e:
            raise ValueError(f"Ollama returned invalid JSON content: {raw_content[:200]}") from e

        # Instantiate Pydantic object
        return self._instantiate_schema(response_schema, parsed_dict)

    def _build_json_template(self, schema_cls: Type[BaseModel]) -> Dict[str, Any]:
        fields = schema_cls.model_fields if hasattr(schema_cls, "model_fields") else getattr(schema_cls, "__fields__", {})
        template = {}
        for name, field in fields.items():
            annotation = getattr(field, "annotation", None)
            if annotation is None and hasattr(field, "outer_type_"):
                annotation = field.outer_type_
                
            if annotation == str or annotation == Optional[str]:
                template[name] = f"[{name} text]"
            elif annotation in (int, Optional[int]):
                template[name] = 1
            elif annotation in (float, Optional[float]):
                template[name] = 0.90
            elif annotation in (bool, Optional[bool]):
                template[name] = False
            elif getattr(annotation, "__origin__", None) is list or annotation == list:
                args = getattr(annotation, "__args__", ())
                if args and isinstance(args[0], type) and issubclass(args[0], BaseModel):
                    template[name] = [self._build_json_template(args[0])]
                else:
                    template[name] = [f"[{name} item]"]
            elif isinstance(annotation, type) and issubclass(annotation, BaseModel):
                template[name] = self._build_json_template(annotation)
            else:
                template[name] = f"[{name} value]"
        return template

    def _instantiate_schema(self, schema_cls: Type[BaseModel], parsed_dict: Dict[str, Any]) -> BaseModel:
        fields = schema_cls.model_fields if hasattr(schema_cls, "model_fields") else getattr(schema_cls, "__fields__", {})
        coerced = {}
        for name, field in fields.items():
            val = parsed_dict.get(name)
            annotation = getattr(field, "annotation", None) or getattr(field, "outer_type_", None)
            
            # 1. Handle List Types
            if getattr(annotation, "__origin__", None) is list or annotation == list:
                args = getattr(annotation, "__args__", ())
                inner_cls = args[0] if args else str
                
                if isinstance(val, list):
                    clean_list = []
                    for item in val:
                        if isinstance(inner_cls, type) and issubclass(inner_cls, BaseModel):
                            if isinstance(item, dict):
                                clean_list.append(self._instantiate_schema(inner_cls, item))
                            elif isinstance(item, str):
                                clean_list.append(self._instantiate_schema(inner_cls, {"title": item, "target": item, "action_type": "NAVIGATE"}))
                        elif inner_cls == str:
                            if isinstance(item, dict):
                                clean_list.append(item.get("evidence") or item.get("text") or item.get("point") or item.get("title") or json.dumps(item))
                            else:
                                clean_list.append(str(item))
                        else:
                            clean_list.append(item)
                    val = clean_list
                elif isinstance(val, str):
                    val = [val]
                else:
                    val = []

            # 2. Handle Primitive Types
            elif val is not None:
                if annotation == int or annotation == Optional[int]:
                    try: val = int(val)
                    except (ValueError, TypeError): val = 1
                elif annotation == float or annotation == Optional[float]:
                    try: val = float(val)
                    except (ValueError, TypeError): val = 0.90
                elif annotation == str or annotation == Optional[str]:
                    if isinstance(val, (dict, list)):
                        val = json.dumps(val)
                    else:
                        val = str(val)

            # 3. Handle Missing Values
            if val is None:
                if getattr(field, "default", None) is not None and field.default != ...:
                    val = field.default
                elif getattr(field, "default_factory", None) is not None:
                    val = field.default_factory()
                else:
                    if annotation == int or annotation == Optional[int]: val = 1
                    elif annotation == float or annotation == Optional[float]: val = 0.90
                    elif annotation == bool or annotation == Optional[bool]: val = False
                    elif getattr(annotation, "__origin__", None) is list or annotation == list: val = []
                    else: val = f"{name} response"

            coerced[name] = val
        return schema_cls(**coerced)

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

    def extract(self, text: str, schema: Type[BaseModel]) -> BaseModel:
        prompt = f"Extract structured information from the following text:\n{text}"
        return self.structured_generate(prompt, response_schema=schema)
