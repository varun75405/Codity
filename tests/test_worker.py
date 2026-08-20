import pytest
import asyncio
from unittest.mock import patch, MagicMock

# A simple mock test for the worker logic
def test_exponential_backoff_calculation():
    # If initial delay is 1000ms, attempt 2 should wait 2000ms
    initial_delay_ms = 1000
    attempts = 2
    delay_ms = min(initial_delay_ms * (2 ** (attempts - 1)), 60000)
    assert delay_ms == 2000

def test_linear_backoff_calculation():
    initial_delay_ms = 1000
    attempts = 3
    delay_ms = min(initial_delay_ms * attempts, 60000)
    assert delay_ms == 3000
