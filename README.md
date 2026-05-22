# Audit-Core V2.1: Enterprise AI Governance Agent

**Track 1: Agent Security & AI Governance (VIA)** | *Built for the Transforming Enterprise Through AI Hackathon with Google DeepMind*

### The Problem
Enterprises are racing to deploy multi-agent systems, but lack the observability required to do so safely. When an autonomous agent makes a biased decision or hallucinates a non-compliant workflow, companies face massive regulatory liability under frameworks like the **EU AI Act** and **GDPR**. Industry guardrails haven't kept up with agentic autonomy.

### The Solution
Audit-Core V2.1 is an algorithmic fault-tracing framework. It acts as an immutable governance node that sits between reasoning agents and enterprise execution environments. 

Instead of simple text moderation, Audit-Core intercepts complex "Execution Payloads" from primary agents, deconstructs their algorithmic logic, and maps potential failures directly to EU AI Act risk classifications (e.g., Unacceptable Risk, High Risk). If a violation is detected, it blocks execution and generates a strict, step-by-step JSON fault trace explaining the exact proxy variables or logical leaps that caused the failure.

### Core Features
* **Dynamic Explainability:** Translates complex agent decisions into readable, step-by-step audit logs for CISOs and regulators.
* **EU AI Act Alignment:** Pre-configured to detect high-risk use cases (e.g., employment sorting, critical infrastructure) and enforce strict data governance.
* **Deterministic Output:** Uses strictly enforced JSON schemas to ensure audit trails are programmable and machine-readable.

### Tech Stack
* **Intelligence:** Meta Llama 3 (70B) via Groq LPU Inference Engine (for sub-second latency)
* **Frontend Visualization:** React, TypeScript, Vite, Tailwind CSS, Motion
* **Architecture Concept:** Designed to integrate with VIA's **LobsterTrap** deep prompt inspection proxy to form a complete "Trust Layer" for multi-agent permission frameworks.

### Live Demo
Link:https://ai-governance-agent-arthimic.vercel.app/


### How to Run Locally
1. Clone the repository: 
   ```bash
   git clone [https://github.com/Udayrohith-R/AI-Governance-Agent.git](https://github.com/Udayrohith-R/AI-Governance-Agent.git)
