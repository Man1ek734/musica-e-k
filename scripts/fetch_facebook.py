#!/usr/bin/env python3

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path


API_VERSION = "v26.0"

PAGE_ID = "100063806301540"

TOKEN = os.getenv(
    "FACEBOOK_PAGE_ACCESS_TOKEN",
    ""
).strip()

OUTPUT = Path("aktualnosci.json")

LIMIT = 12


if not TOKEN:

    print(
        "Brak FACEBOOK_PAGE_ACCESS_TOKEN.",
        file=sys.stderr
    )

    sys.exit(1)


params = urllib.parse.urlencode({

    "fields":
        "id,message,created_time,"
        "permalink_url,full_picture",

    "limit": LIMIT,

    "access_token": TOKEN

})


url = (
    f"https://graph.facebook.com/"
    f"{API_VERSION}/"
    f"{PAGE_ID}/posts?"
    f"{params}"
)


request = urllib.request.Request(

    url,

    headers={
        "User-Agent":
        "MUSICA-Website-NewsSync/1.0"
    }

)


try:

    with urllib.request.urlopen(
        request,
        timeout=30
    ) as response:

        raw = json.loads(
            response
            .read()
            .decode("utf-8")
        )


except Exception as exc:

    print(
        f"Błąd pobierania z Facebooka: {exc}",
        file=sys.stderr
    )

    sys.exit(1)


if "error" in raw:

    print(

        json.dumps(
            raw["error"],
            ensure_ascii=False,
            indent=2
        ),

        file=sys.stderr

    )

    sys.exit(1)


posts = []


for item in raw.get("data", []):

    posts.append({

        "id":
            item.get("id", ""),

        "message":
            item.get("message", ""),

        "created_time":
            item.get("created_time", ""),

        "permalink_url":
            item.get("permalink_url", ""),

        "image":
            item.get("full_picture", "")

    })


new_payload = {

    "posts": posts

}


old_payload = None


if OUTPUT.exists():

    try:

        old_payload = json.loads(
            OUTPUT.read_text(
                encoding="utf-8"
            )
        )

    except Exception:

        old_payload = None


if old_payload == new_payload:

    print(
        "Brak nowych zmian."
    )

    sys.exit(0)


OUTPUT.write_text(

    json.dumps(
        new_payload,
        ensure_ascii=False,
        indent=2
    ) + "\n",

    encoding="utf-8"

)


print(
    f"Zapisano {len(posts)} postów "
    f"do {OUTPUT}."
)
