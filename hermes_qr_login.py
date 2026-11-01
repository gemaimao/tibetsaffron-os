# -*- coding: utf-8 -*-
"""桥接脚本：调用 hermes 的 iLink qr_login，
把微信握手二维码内容写入状态文件供 DSH 渲染；确认成功后自动更新 ~/.hermes/.env"""
import asyncio
import json
import os
import sys
import types

HERMES_HOME = os.path.expanduser("~/.hermes")
PROJECT = os.path.join(HERMES_HOME, "hermes-agent")
STATUS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr_status.json")
sys.path.insert(0, PROJECT)

captured = []


def _write_status(**kw):
    tmp = STATUS + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(kw, f, ensure_ascii=False)
    os.replace(tmp, STATUS)


# 劫持 qrcode 包：捕获 iLink 下发的二维码内容（完整可扫 URL），不打印 ASCII
fake = types.ModuleType("qrcode")


class _QR:
    def __init__(self, *a, **k):
        pass

    def add_data(self, data, *a, **k):
        captured.append(str(data))
        _write_status(stage="waiting", qr=str(data), detail="请用微信扫码并在手机上确认")

    def make(self, *a, **k):
        pass

    def print_ascii(self, *a, **k):
        pass


fake.QRCode = _QR
sys.modules["qrcode"] = fake

from gateway.platforms.weixin import qr_login  # noqa: E402


def update_env(creds):
    env_path = os.path.join(HERMES_HOME, ".env")
    lines = open(env_path, encoding="utf-8").read().splitlines()
    drop = {"WEIXIN_ACCOUNT_ID", "WEIXIN_TOKEN", "WEIXIN_BASE_URL"}
    out = [l for l in lines if (l.split("=", 1)[0].strip() not in drop) or ("=" not in l)]
    out.append("WEIXIN_ACCOUNT_ID=" + creds["account_id"])
    out.append("WEIXIN_TOKEN=" + creds["token"])
    if creds.get("base_url"):
        out.append("WEIXIN_BASE_URL=" + creds["base_url"])
    with open(env_path, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


def main():
    _write_status(stage="starting", detail="正在向 iLink 请求二维码…")
    try:
        creds = asyncio.run(qr_login(HERMES_HOME))
    except Exception as e:
        _write_status(stage="failed", detail=str(e))
        return
    if not creds:
        _write_status(stage="failed", detail="登录未完成或二维码超时，请重跑")
        return
    try:
        update_env(creds)
    except Exception as e:
        _write_status(stage="confirmed_env_failed", account_id=creds.get("account_id", ""), detail=str(e))
        return
    _write_status(stage="confirmed", account_id=creds.get("account_id", ""),
                  user_id=creds.get("user_id", ""), detail="微信连接成功，凭据已写入 .env")


if __name__ == "__main__":
    main()
