"""Force Racing - Android runtime entry point (Chaquopy).

Runs the bundled Flask application straight from Chaquopy's extracted assets
and keeps all writable state (SQLite database, uploads, exports) in the app's
private storage.
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


def _log(message):
    try:
        with open(os.path.join(_home(), "fr-boot.log"), "a") as fh:
            fh.write(str(message) + "\n")
    except Exception:
        pass
    print(message)


def prepare():
    """Point the app at writable storage and return its code directory."""
    app_dir = os.path.join(_here(), "appsrc")
    home = _home()

    db_path = os.path.join(home, "forceracing.db")
    if not os.path.exists(db_path):
        shutil.copyfile(os.path.join(app_dir, "forceracing_app.db"), db_path)

    data_dir = os.path.join(home, "fr-data")
    uploads = os.path.join(home, "fr-uploads")
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(uploads, exist_ok=True)

    os.environ["DATABASE_PATH"] = db_path
    os.environ["DATA_DIR"] = data_dir
    os.environ["UPLOAD_FOLDER"] = uploads

    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)

    _log("prepare: code=%s db=%s" % (app_dir, db_path))
    return app_dir


def start_server():
    """Start Flask on 127.0.0.1 and return the bound port."""
    try:
        return _start_server()
    except Exception:
        _log(traceback.format_exc())
        raise


def _start_server():
    app_dir = prepare()

    import config as config_module
    config_module.Config.UPLOAD_FOLDER = os.environ["UPLOAD_FOLDER"]
    os.makedirs(config_module.Config.UPLOAD_FOLDER, exist_ok=True)

    import database

    _log("boot: init_db")
    database.init_db()

    _log("boot: seed_db")
    database.seed_db()

    from app import create_app

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
