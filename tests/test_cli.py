from __future__ import annotations

import unittest

from agent_runbook_orchestrator.cli import run


class CliTests(unittest.TestCase):
    def test_summary(self) -> None:
        output = run(["summary"])
        self.assertIn("Agent Runbook Orchestrator", output)
        self.assertIn("Operational workflows break when LLM agents lack state, retry logic, and human checkpoints.", output)

    def test_capabilities(self) -> None:
        output = run(["capabilities"])
        self.assertIn("Core capabilities:", output)
        self.assertIn("Define runbooks as step graphs", output)

    def test_roadmap(self) -> None:
        output = run(["roadmap"])
        self.assertIn("# Roadmap", output)
        self.assertIn("## Phase 1", output)


if __name__ == "__main__":
    unittest.main()
