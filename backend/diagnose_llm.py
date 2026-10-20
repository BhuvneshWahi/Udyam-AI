"""
UDYAM AI — LLM Diagnostic and Verification Script.
Tests LLM Provider configuration, credentials status, connectivity, real inference call, and Copilot pipeline integration.
NEVER prints secret API keys. Never fakes PASS.
"""

import os
import sys
import json
from pydantic import BaseModel

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.llm.factory import get_llm_provider
from ai.agents.copilot_agent import UdyamAICopilotAgent
from demo_data import get_initial_demo_data

class DiagnosticSchema(BaseModel):
    status: str
    message: str
    test_id: int

def run_diagnostic():
    provider_env = os.getenv("LLM_PROVIDER", "ollama").lower().strip()
    model_env = os.getenv("MODEL_NAME", "llama3.2:3b")
    
    agent = UdyamAICopilotAgent(provider_name=provider_env, model_name=model_env)
    provider_instance = agent.llm
    provider_name = provider_instance.__class__.__name__.replace("Provider", "")
    model_name = provider_instance.model_name
    has_creds = provider_instance.has_credentials
    
    is_ollama = (provider_name == "Ollama")
    creds_str = "NOT REQUIRED" if is_ollama else ("SET" if has_creds else "NOT SET")
    
    print("=" * 45)
    print("        UDYAM AI LLM DIAGNOSTIC")
    print("=" * 45)
    print(f"Provider: {provider_name}")
    print(f"Model: {model_name}")
    print(f"Credentials: {creds_str}")
    
    if not is_ollama and not has_creds:
        print("Connectivity: NOT TESTED")
        print("Inference: NOT TESTED")
        print("Structured Output: NOT TESTED")
        print("Copilot Integration: NOT TESTED")
        print("Status: CONFIGURATION REQUIRED")
        print("-" * 45)
        print(f"Note: To enable live inference for {provider_name}, set environment variable:")
        if provider_name == "OpenAI":
            print("  $env:OPENAI_API_KEY=\"sk-your-openai-key\"")
        elif provider_name in ["Gemini", "Google"]:
            print("  $env:GEMINI_API_KEY=\"your-gemini-key\"")
        elif provider_name in ["Claude", "Anthropic"]:
            print("  $env:ANTHROPIC_API_KEY=\"sk-ant-your-claude-key\"")
        print("=" * 45)
        return False

    # Perform real inference test
    connectivity = "FAIL"
    inference = "FAIL"
    structured_out = "FAIL"
    copilot_integration = "FAIL"
    
    try:
        raw_res = provider_instance.generate("Respond with the exact word: OK", temperature=0.0)
        if raw_res and len(raw_res.strip()) > 0:
            connectivity = "PASS"
            inference = "PASS"
    except Exception as e:
        print(f"Inference Error: {e}")

    try:
        test_obj = provider_instance.structured_generate(
            prompt="Return test_id 101, status PASS, and message Local inference working",
            response_schema=DiagnosticSchema
        )
        if isinstance(test_obj, DiagnosticSchema) and test_obj.status == "PASS":
            structured_out = "PASS"
    except Exception as e:
        print(f"Structured Output Error: {e}")

    try:
        demo_data = get_initial_demo_data()
        copilot_res = agent.process_query("Agle mahine kaunse products ka stock badhana chahiye?", demo_data)
        if copilot_res.get("llm_status") == "REAL_INFERENCE_SUCCESS":
            copilot_integration = "PASS"
        else:
            print("Copilot LLM Status Note:", copilot_res.get("llm_status"), copilot_res.get("direct_answer"))
    except Exception as e:
        print(f"Copilot Integration Error: {e}")

    print(f"Connectivity: {connectivity}")
    print(f"Inference: {inference}")
    print(f"Structured Output: {structured_out}")
    print(f"Copilot Integration: {copilot_integration}")
    
    all_pass = (connectivity == "PASS" and inference == "PASS" and structured_out == "PASS" and copilot_integration == "PASS")
    print(f"Status: {'PASS' if all_pass else 'VERIFICATION FAILED'}")
    print("=" * 45)
    return all_pass

if __name__ == "__main__":
    run_diagnostic()
