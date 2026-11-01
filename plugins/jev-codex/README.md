# Jev Codex 本地插件

为 Codex 桌面端、Codex CLI 和使用同一 Codex 插件运行时的本地集成提供一致的前置路由。模型与数据路径：

1. 规则跳过简单短请求，避免增加本地推理延迟。
2. 需要实际工作的请求先由本机 Ollama `gemma2:2b` 做窄范围分类。
3. 只有本地把握不足或判断到高影响风险时，才尝试 TypeSafe Jev；无 Jev 凭据或远端故障时升级给 Codex。
4. Codex 仍负责代码、长内容、多步推理和实际核验。

插件另提供三个只读 MCP 工具：`jev_route_work`、`jev_prune_context`、`jev_check_completion`。上下文筛选只返回建议，始终保护传入的 `protectedIds`，不删改任何会话原文。

## 配置 Jev 凭据

可从本地剪贴板把密钥写入 macOS 钥匙串；脚本不会把密钥输出到终端：

```bash
swift scripts/store-typesafe-key.swift
```

也支持进程环境变量 `TYPESAFE_API_KEY`，以及现有 DSH 凭据文件 `~/.dsh/.credentials.yaml`。插件不会把密钥写进仓库、插件清单或 MCP 工具结果。

## 本地模型

默认调用 `http://127.0.0.1:11434/v1/chat/completions`，模型名为 `gemma2:2b`。可通过 `OLLAMA_HOST` 和 `OLLAMA_MODEL` 覆盖。Ollama 暂不可用时，用户请求照常交给 Codex；上下文筛选工具会保留全部片段。

## 安装到 Codex 桌面端和 CLI

插件使用 Codex 本地插件目录。将 `jev-codex` 放到 `~/plugins/jev-codex`，并在 `~/.agents/plugins/marketplace.json` 以 `./plugins/jev-codex` 登记。安装后，在 Codex 桌面端的 Plugins Directory 安装插件；CLI 从同一用户级插件配置加载它。打开 `/hooks` 检查并信任 `UserPromptSubmit` 钩子后，新会话即可使用。

Codex 桌面端和 CLI 的本地插件可共用；Paseo 是否继承取决于它是否调用本机同一 Codex 运行时和配置。远程容器或不同主机不会自动访问本机 Ollama / 钥匙串。
