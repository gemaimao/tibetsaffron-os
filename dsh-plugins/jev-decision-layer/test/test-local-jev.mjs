import { evaluateLocal } from '../lib/local-jev-adapter.js';

console.log('--- 测试本地 Gemma 2B 驱动 JEV 红线检测 ---');

const claim = "天旺藏红花采用航天级智能控环，服用后能根治高血压、糖尿病，实现绝对零农残！";
const questions = {
  has_unverified_medical_claim: {
    type: 'noul',
    question: '声明中是否含有未获批的根治疾病或药物级疗效宣称？'
  },
  violates_causal_decoupling: {
    type: 'noul',
    question: '声明是否由“采用某技术”直接跃迁断言“终末结果必然完美（绝对零农残）”？'
  }
};

try {
  const start = Date.now();
  const res = await evaluateLocal(claim, questions);
  console.log(`⏱️ 本地执行耗时: ${(Date.now() - start)} ms`);
  console.log('🤖 返回模型:', res.model);
  console.log('📊 判定结果:\n', JSON.stringify(res.answers, null, 2));
} catch (err) {
  console.error('❌ 执行失败:', err);
}
