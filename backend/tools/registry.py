import time
import logging

from typing import Dict, List, Any, Optional
from tools.base import BaseTool
from tools.crm_tool import GetCustomerTool
from tools.order_tool import GetOrderTool
from tools.refund_tool import RequestRefundTool
from tools.ticket_tool import CreateTicketTool
from models.tools import ToolExecutionLog

logger = logging.getLogger(__name__)


class ToolRegistry:
    """Centralized Registry for Agent Tools managing schemas, input validation, logging, and permissions."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self.execution_logs: List[ToolExecutionLog] = []

        # Register default operational tools
        self.register_tool(GetCustomerTool())
        self.register_tool(GetOrderTool())
        self.register_tool(RequestRefundTool())
        self.register_tool(CreateTicketTool())

    def register_tool(self, tool: BaseTool):
        self._tools[tool.name] = tool
        logger.info(f"Registered agent tool: '{tool.name}' (is_write={tool.is_write_operation})")

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def get_openai_tools(self, tool_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Returns OpenAI function tool schemas for specified tools or all registered tools."""
        if tool_names is None:
            return [tool.to_openai_tool() for tool in self._tools.values()]
        return [self._tools[name].to_openai_tool() for name in tool_names if name in self._tools]

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Executes a tool with strict validation, error handling, and latency logging."""
        tool = self.get_tool(tool_name)
        if not tool:
            err_msg = f"Tool '{tool_name}' is not registered in the system registry."
            logger.error(err_msg)
            return {"error": True, "message": err_msg}

        start_time = time.time()
        try:
            result = await tool.execute(**arguments)
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            log_entry = ToolExecutionLog(
                tool_name=tool_name,
                arguments=arguments,
                result=result,
                execution_ms=elapsed_ms,
                is_write=tool.is_write_operation,
                status="success",
            )
            self.execution_logs.append(log_entry)
            logger.info(f"Executed tool '{tool_name}' in {elapsed_ms}ms (write={tool.is_write_operation})")
            return result
        except Exception as e:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            err_res = {"error": True, "message": f"Execution error in tool '{tool_name}': {str(e)}"}
            log_entry = ToolExecutionLog(
                tool_name=tool_name,
                arguments=arguments,
                result=err_res,
                execution_ms=elapsed_ms,
                is_write=tool.is_write_operation,
                status="error",
            )
            self.execution_logs.append(log_entry)
            return err_res


tool_registry = ToolRegistry()
