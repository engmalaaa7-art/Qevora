import asyncio
import asyncpg
from config import DATABASE_URL

async def main():
    url = DATABASE_URL.split("?")[0]
    try:
        conn = await asyncpg.connect(url)
        version = await conn.fetchval('SELECT version()')
        await conn.close()
        print('DB_OK', version)
    except Exception as e:
        print('DB_ERR', repr(e))

asyncio.run(main())
