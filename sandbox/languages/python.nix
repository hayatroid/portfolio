{ lib, uv, pypy311, ... }:
{
  source = "main.py";
  run = [ (lib.getExe uv) "run" "--no-project" "--python" (lib.getExe pypy311) "main.py" ];
  env = [
    "UV_OFFLINE=1"
    "UV_NO_CACHE=1"
    "UV_PYTHON_DOWNLOADS=never"
    # PyPy sizes this from /proc, which Cloudflare Containers do not let go-judge mount; 4M is PyPy's documented fallback.
    "PYPY_GC_NURSERY=4M"
  ];
}
