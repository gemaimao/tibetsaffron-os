// DeepSeek Harness (dsh) plugin: BCOS JEV 决策层。
// 把 Brand Content OS 的三原语决策能力（Choice / Noul / Score）注册为
// DSH 会话的一等工具：GUI 会话、微信 BOT 会话、Paseo 拉起的 DSH 会话
// 都能在每次请求中看到工具 schema（无触发赌局）。
//
// 架构位（V3.0 双系统）：Jev 专职决策，CAP 协议固化主权，大模型仅作表达。
// 加载方式：cordis.patch.yml 的 insert 行（见 package.json dsh.bundle 清单）。
// 凭据：TYPESAFE_API_KEY（环境变量或 ~/.dsh/.credentials.yaml 共享保险柜）。

import { defineJevTools } from '../lib/tools.js';

export const name = 'jev-decision-layer';
export const inject = ['tools'];

export function apply(ctx, config = {}) {
  for (const tool of defineJevTools(config)) {
    ctx.tools.register(tool);
  }
}
