import asyncio
from worker import handle_generate_ai_site, worker_loop
from redis_manager import redis_manager

async def test():
    redis_manager.connect()
    task = redis_manager.pop_task("default", timeout_seconds=2)
    print("Popped task from Redis:", task)
    if task:
        task_id = task.get("task_id")
        payload = task.get("payload", {})
        print("Processing task:", task_id)
        await handle_generate_ai_site(task_id, payload)
        status = redis_manager.get_cache(f"task:status:{task_id}")
        print("Task status after processing:", status)

asyncio.run(test())
