import os
import sys
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.agents.copilot_agent import UdyamAICopilotAgent
from demo_data import get_initial_demo_data

def run_tests():
    provider_env = os.getenv("LLM_PROVIDER", "ollama").lower().strip()
    model_env = os.getenv("MODEL_NAME", "llama3.2:3b")
    
    agent = UdyamAICopilotAgent(provider_name=provider_env, model_name=model_env)
    demo_data = get_initial_demo_data()
    
    queries = [
        "Agale 30 din mein kaunse products ka stock badhana chahiye?",
        "Mere business ki sales kyu gir rahi hain?",
        "Kaunse products mein sabse zyada profit margin hai?",
        "Meri GST compliance situation kya hai?",
        "Mere business ke liye kaunse growth opportunities relevant hain?",
        "Mere business ka current financial health kya hai?",
        "Mere business ki sales pichhle 3 mahine se kam ho rahi hain, mujhe kya check karna chahiye?",
        "Agle mahine stockout risk kitna hai aur kya reorder karein?",
        "What is the weather today in New Delhi?"
    ]
    
    print("=" * 60)
    print(f"        COPILOT PIPELINE 9-QUERY TEST SUITE ({provider_env.upper()} - {model_env})")
    print("=" * 60)
    
    all_pass = True
    for idx, q in enumerate(queries, 1):
        res = agent.process_query(q, demo_data)
        
        has_answer = bool(res.get("direct_answer"))
        has_summary = bool(res.get("metrics_summary"))
        has_table = bool(res.get("structured_table"))
        has_why = bool(res.get("why_recommendation"))
        has_actions = bool(res.get("actions"))
        llm_success = (res.get("llm_status") == "REAL_INFERENCE_SUCCESS")
        
        status = "PASS" if (has_answer and has_summary and has_table and has_why and has_actions and llm_success) else "FAIL"
        if status == "FAIL":
            all_pass = False
            
        ans_str = res.get('direct_answer', '').encode('ascii', 'ignore').decode('ascii')[:120]
        
        print(f"[Query #{idx}]: {q}")
        print(f"Status: {status} | Intent: {res.get('category')} | LLM Status: {res.get('llm_status')}")
        print(f"Direct Answer: {ans_str}...")
        print("-" * 60)

    print(f"FINAL SUITE RESULT: {'PASS' if all_pass else 'VERIFICATION FAILED'}")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
