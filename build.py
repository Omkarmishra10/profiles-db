#!/usr/bin/env python3
"""
Builds site/data/users.json from a raw ../dumped_users.json export.

Only public-profile-appropriate fields are kept. Anything that could expose
a real user (email, IP history, push tokens, admin/ban/moderation flags,
internal counters) is stripped out before this ever touches a public repo.

Run this from the site/ directory whenever you refresh the raw dump:
    python build.py
"""
import json
import os
import re

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "dumped_users.json")
OUT_PATH = os.path.join(os.path.dirname(__file__), "data", "users.json")

GENDER_MAP = {
    "male": "Male",
    "female": "Female",
    "femenino": "Female",
    "feminino": "Female",
    "other": "Other",
}


def normalize_gender(g):
    if not g:
        return None
    return GENDER_MAP.get(g.strip().lower(), g.strip().title())


def is_public_eligible(u):
    if not u.get("name") or not u.get("photoUrl"):
        return False
    if u.get("isFakeProfile") is True:
        return False
    if u.get("isBanned") is True:
        return False
    if u.get("isBlocked") is True:
        return False
    if u.get("isValidProfile") is False:
        return False
    if u.get("isAdmin") is True:
        return False
    return True


def sanitize(u):
    gallery = [g for g in (u.get("gallery") or []) if isinstance(g, str) and g.strip()]
    vibes = [v for v in (u.get("vibes") or []) if isinstance(v, str) and v.strip()]
    return {
        "id": u.get("userId") or u.get("_id"),
        "name": u.get("name").strip(),
        "photoUrl": u.get("photoUrl"),
        "gallery": gallery,
        "bio": (u.get("bio") or "").strip(),
        "country": u.get("country"),
        "countryCode": (u.get("countryCode") or "").upper() or None,
        "gender": normalize_gender(u.get("gender")),
        "nativeLanguage": u.get("nativeLanguage"),
        "vibes": vibes,
        "isVIP": bool(u.get("isVIP")),
        "isVerified": bool(u.get("isVerified")),
        "isOnline": bool(u.get("isOnline")),
        "lastActiveAt": u.get("lastActiveAt"),
        "createdAt": u.get("createdAt"),
    }


def main():
    with open(RAW_PATH, encoding="utf-8") as f:
        raw = json.load(f)

    users = [sanitize(u) for u in raw if is_public_eligible(u)]
    users.sort(key=lambda u: (u["name"] or "").lower())

    # de-dupe by id just in case
    seen = set()
    deduped = []
    for u in users:
        if u["id"] in seen:
            continue
        seen.add(u["id"])
        deduped.append(u)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(deduped, f, ensure_ascii=False, separators=(",", ":"))

    print(f"wrote {len(deduped)} users to {OUT_PATH}")


if __name__ == "__main__":
    main()
