import time
import logging
from typing import Dict, Any, List
from models.agent import AgentResponse, RouterDecision
from agents.router_agent import router_agent
from agents.knowledge_agent import knowledge_agent
from agents.customer_agent import customer_agent
from agents.operations_agent import operations_agent
from agents.escalation_agent import escalation_agent

from services.memory_service import memory_service
from api.escalations import register_escalation

logger = logging.getLogger(__name__)


class MultiAgentOrchestrator:
    """State Graph Orchestrator routing user messages from Supervisor -> Specialist Agent Node -> Tools -> Response."""

    def __init__(self):
        self.agent_map = {
            "knowledge": knowledge_agent,
            "customer": customer_agent,
            "operations": operations_agent,
            "escalation": escalation_agent,
        }

    async def process_user_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        customer_id: str = "cust_1001",
        conversation_id: str = "conv_default",
    ) -> AgentResponse:
        start_time = time.time()

        # Step 0: Save user message & retrieve short-term memory history
        memory_service.add_message(conversation_id, "user", user_message)
        active_history = conversation_history or memory_service.get_history(conversation_id)

        # Step 1: Supervisor Router Node decision
        router_decision: RouterDecision = await router_agent.route(user_message, active_history)
        selected_name = router_decision.selected_agent
        logger.info(f"Supervisor Router -> '{selected_name}' (intent={router_decision.intent}, urgency={router_decision.urgency})")

        # Step 2: Route to Specialist Agent Node
        agent = self.agent_map.get(selected_name, knowledge_agent)
        context = {
            "customer_id": customer_id,
            "conversation_id": conversation_id,
            "router_decision": router_decision.model_dump(),
        }

        # Step 3: Agent Node processing & tool execution
        response: AgentResponse = await agent.process(user_message, active_history, context)

        # Step 4: Auto-escalate if agent flagged high-risk or tool failure
        if response.escalate_to_human:
            logger.warning(f"Specialist agent '{selected_name}' triggered escalation: {response.escalation_reason}")
            esc_context = {
                "customer_id": customer_id,
                "conversation_id": conversation_id,
                "escalation_reason": response.escalation_reason or "Human agent requested",
            }
            esc_response = await escalation_agent.process(user_message, active_history, esc_context)

            # Register official escalation dossier
            register_escalation(
                conversation_id=conversation_id,
                customer_id=customer_id,
                reason=response.escalation_reason or "Customer requested human escalation",
                intent=router_decision.intent,
                transcript=active_history,
                actions_performed=response.tool_calls,
            )

            # Combine agent response text with handoff summary
            final_response = AgentResponse(
                agent_name="escalation_agent",
                content=esc_response.content,
                tool_calls=response.tool_calls,
                tool_results=response.tool_results,
                escalate_to_human=True,
                escalation_reason=response.escalation_reason,
                handoff_summary=esc_response.handoff_summary,
            )
            memory_service.add_message(conversation_id, "assistant", final_response.content)
            return final_response

        # Save assistant response to memory
        memory_service.add_message(conversation_id, "assistant", response.content)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(f"MultiAgentOrchestrator completed request in {elapsed_ms}ms via agent '{response.agent_name}'")
        return response



orchestrator = MultiAgentOrchestrator()
