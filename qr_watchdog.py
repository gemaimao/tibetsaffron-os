# -*- coding: utf-8 -*-
"""握手监督器：保持 iLink 扫码流程常驻，
二维码每次刷新都自动渲染 PNG 并弹到屏幕（Preview），确认成功后发系统通知并退出。"""
import json
import os
import subprocess
import sys
import time

WS = os.path.dirname(os.path.abspath(__file__))
STATUS = os.path.join(WS, "qr_status.json")
DONE = os.path.join(WS, "qr_done.json")
PNG = os.path.join(WS, "微信握手扫码-hermes.png")
VENV_PY = os.path.expanduser("~/.hermes/hermes-agent/venv/bin/python")
LOGIN_PY = os.path.join(WS, "hermes_qr_login.py")

sys.path.insert(0, os.path.join(WS, "pylibs"))


def render(qr_data):
    import qrcode
    from PIL import Image
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    m = qr.get_matrix()
    n, s = len(m), 10
    img = Image.new("RGB", (n * s, n * s), "white")
    px = img.load()
    for y in range(n):
        for x in range(n):
            if m[y][x]:
                for dy in range(s):
                    for dx in range(s):
                        px[x * s + dx, y * s + dy] = (0, 0, 0)
    img.save(PNG)


def show():
    subprocess.run(["open", PNG], check=False)


def notify(text):
    subprocess.run(["osascript", "-e",
                    f'display notification "{text}" with title "DSH ⇄ 微信握手"'], check=False)


def start_login():
    return subprocess.Popen([VENV_PY, LOGIN_PY],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_status():
    try:
        return json.load(open(STATUS))
    except Exception:
        return {}


def main():
    if os.path.exists(DONE):
        os.remove(DONE)
    proc = start_login()
    restarts = 6
    last_qr = None
    while True:
        time.sleep(3)
        d = read_status()
        st, qr = d.get("stage"), d.get("qr")
        if st == "confirmed":
            notify("握手成功 ✅ 正在重启网关…")
            json.dump({"stage": "done", "account_id": d.get("account_id", "")},
                      open(DONE, "w"))
            break
        if qr and qr != last_qr:
            last_qr = qr
            try:
                render(qr)
                show()
                notify("新握手码已弹出，请用微信扫码（1 分钟内有效）")
            except Exception as e:
                print("render fail:", e, flush=True)
        if st == "failed":
            restarts -= 1
            if restarts <= 0:
                notify("多次失败已停止，请在 DSH 里查看")
                break
            proc = start_login()


if __name__ == "__main__":
    main()
