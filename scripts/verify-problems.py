"""Python half of `npm run verify:problems` (called by verify-problems.cjs with a JSON file of cases)."""
import ast
import json
import sys

# Same imports the in-browser Pyodide runner provides.
PRELUDE = (
    "import json, sys\nsys.setrecursionlimit(10000)\nfrom typing import *\n"
    "import collections, heapq, math, itertools, functools, bisect\n"
    "from collections import *\nfrom heapq import *\nfrom functools import *\n"
)


def norm(v):
    # JavaScript has one number type, so 2.0 and 2 are the same value.
    if isinstance(v, float) and v.is_integer():
        return int(v)
    if isinstance(v, list):
        return [norm(x) for x in v]
    return v


def canon(v, mode):
    v = norm(v)
    if mode == "unordered" and isinstance(v, list):
        return sorted(json.dumps(x, separators=(",", ":")) for x in v)
    if mode == "unordered-nested" and isinstance(v, list):
        return sorted(json.dumps(sorted(x) if isinstance(x, list) else x) for x in v)
    if mode == "float" and isinstance(v, (int, float)) and not isinstance(v, bool):
        return "%.5f" % v
    return json.dumps(v)


def main():
    data = json.load(open(sys.argv[1], encoding="utf8"))
    bad = 0
    for c in data["cases"]:
        try:
            ast.parse(c["starter"])
        except SyntaxError as e:
            bad += 1
            print("starter (py) does not parse", c["id"], e)
        g = {}
        exec(PRELUDE, g)
        exec(data["helpers"], g)
        try:
            exec(c["code"], g)
        except Exception as e:  # noqa: BLE001
            bad += 1
            print("solution (py) does not run", c["id"], repr(e))
            continue
        for i, t in enumerate(c["tests"]):
            try:
                args = g["__in"](json.loads(json.dumps(t["args"])), c["io"])
                got = json.loads(json.dumps(g["__out"](g[c["fn"]](*args), c["io"])))
            except Exception as e:  # noqa: BLE001
                bad += 1
                print("py threw", c["id"], "test", i, repr(e))
                continue
            if canon(got, c["compare"]) != canon(t["expected"], c["compare"]):
                bad += 1
                print("py wrong answer", c["id"], "test", i, got, "expected", t["expected"])
    print(f"Python: {len(data['cases'])} problems checked, {bad} problem(s) found")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
