---
name: jev-routing
description: Use local Gemma and TypeSafe Jev to route substantial Codex requests, preserve useful context, and check completion with evidence.
---

# Jev 路由与 Codex 协作

Codex 桌面端和 CLI 共用此插件。用户提示钩子会先以本地 Ollama Gemma 2 2B 对较长或包含实际工作的请求做窄范围预判；优先使用钩子给出的简短路由结果，不要再重复调用 `jev_route_work`。简单问候、短事实问题和单步请求不会触发前置推理。

## 分工

- Gemma：本地快速分流、上下文相关性批量筛选、基于现有证据的完成度初判。
- TypeSafe Jev：仅在本地判定不确定或可能造成高影响后果时升级；单次请求合并独立的类型化判断。
- Codex：生成和修改代码、长文、多步推理、外部资料核验和最终交付。

## 使用规则

- `jev_route_work` 用于有实际工作量且没有自动预判结果的请求。`LOCAL_QUICK` 表示尽量直接完成并简短作答；`CODEX_DEEP_WORK` 表示 Codex 执行，合并独立读取与检查，减少往返；`ASK_ONE_BLOCKER` 只在缺失信息会改变结果且无法安全假设时询问一个关键问题。
- `jev_prune_context` 只用于整理长会话候选片段。把明确要求、已确认决定、关键证据、当前任务状态和未解决阻塞项列入 `protectedIds`。工具只建议保留或归档，不会删除会话原文。
- `jev_check_completion` 仅在存在清楚的验收条件和可观察证据时使用。判定是提示，不替代实际核验，也不能单凭概率宣布交付完成。
- 对安全、隐私、财务、法律、健康和不可逆操作保持保守。Jev/Gemma 的判断不能授予权限，也不能替代用户批准。
- 不要把 API Key、访问令牌或其他秘密放入判断输入。默认优先本地处理；不得为了“调用 Jev”把整个会话历史发送到远端。
- 本地模型和远程服务故障时继续由 Codex 安全处理；不要因判定不可用而编造结论、丢弃上下文或停住无风险任务。
- 对用户只汇报必要的结果，不展示内部路由过程，避免增加对话负担。
