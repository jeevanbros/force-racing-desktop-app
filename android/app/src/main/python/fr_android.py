"""Force Racing - Android runtime entry point (Chaquopy).

Extracts the bundled Flask application to the app's private storage, starts
the Pit Wall server on the loopback interface, and returns the port so the
native WebView can load the real in-app experience.
"""

import os
import shutil
import sys
import threading
import traceback

BUNDLE_VERSION = "2.5.0"


def _here():
    return os.path.dirname(os.path.abspath(__file__))


def _home():
    home = os.environ.get("HOME")
    if home and os.path.isdir(home):
        return home
    return _here()


def prepare():
    """Copy the bundled app into writable storage and return its path."""
    src = os.path.join(_here(), "appsrc")
    dst = os.path.join(_home(), "forceracing")

    keep_db = os.path.exists(os.path.join(dst, "forceracing_app.db"))
    ignore = shutil.ignore_patterns("forceracing_app.db", "__pycache__", "*.pyc") if keep_db else \
        shutil.ignore_patterns("__pycache__", "*.pyc")

    os.makedirs(dst, exist_ok=True)
    shutil.copytree(src, dst, dirs_exist_ok=True, ignore=ignore)

    for sub in ("data", os.path.join("static", "uploads", "cad")):
        os.makedirs(os.path.join(dst, sub), exist_ok=True)

    if dst not in sys.path:
        sys.path.insert(0, dst)

    try:
        with open(os.path.join(dst, ".bundle-version"), "w") as fh:
            fh.write(BUNDLE_VERSION)
    except Exception:
        pass

    return dst


def _log(message):
    try:
        path = os.path.join(_home(), "fr-boot.log")
        with open(path, "a") as fh:
            fh.write(str(message) + "\n")
    except Exception:
        pass
    print(message)


def start_server():
    """Start Flask on 127.0.0.1 and return the bound port."""
    try:
        return _start_server()
    except Exception:
        _log(traceback.format_exc())
        raise


def _start_server():
    _log("boot: prepare")
    app_dir = prepare()
    _log("boot: prepared " + app_dir)
    os.chdir(app_dir)

    import database
    from app import create_app

    _log("boot: init_db")
    database.init_db()
    _log("boot: seed_db")
    database.seed_db()

    _log("boot: create_app")
    application = create_app()

    from werkzeug.serving import make_server

    server = make_server("127.0.0.1", 0, application, threaded=True)
    port = int(server.server_port)

    worker = threading.Thread(
        target=server.serve_forever,
        kwargs={"poll_interval": 0.2},
        name="fr-flask",
        daemon=True,
    )
    worker.start()

    _log("Force Racing pit wall listening on 127.0.0.1:%d" % port)
    return port


def diagnostics():
    """Return a short traceback string, used by the native error screen."""
    return traceback.format_exc()
