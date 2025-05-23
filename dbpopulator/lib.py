import json
from datetime import datetime, timezone

def log(msg):
    print(json.dumps({
        "timestamp": datetime.now(tz = timezone.utc).isoformat(),
        "msg": msg
    }))
