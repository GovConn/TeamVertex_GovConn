from workflow.agents.govconn_agent import kickoff_Agent

def run_agent(thread_id: int, user_input: str):
    """Kickoff function to start the agent with a thread ID and user input.
    Args:

        thread_id (int): The ID of the thread to be processed.
        user_input (str): The input provided by the user to the agent.
    Returns:
        None
    """
    try:
        response = kickoff_Agent(thread_id, user_input)
        return response
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    