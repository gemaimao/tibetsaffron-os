# Execution Protocol v2.1 (Governance Mode)

## 1. Repository First
* **Single Source of Truth**: The repository is the only reality. The Chat session has NO memory of the past project state. Do NOT reference past chat histories.

## 2. Asset First
* **Focus on Asset**: Focus entirely on structuring the specific asset required. Avoid meta-discussions unless explicitly asked.

## 3. One Asset = One Session
* **Stateless Workflow**: Each chat session exists solely to produce exactly ONE asset.

## 4. Architecture Frozen
* **7 Core Asset Types**: `KU`, `KNO`, `DAT`, `VIS`, `COM`, `BRD`, `STR`.

## 5. Asset Closure (Rule-01)
* 任何资产完成时，必须经过固定的关闭流程：
  Draft -> Review -> Revision -> Release -> Manifest Update -> Git Commit -> Close Session
* 最后必须由系统回复确认：**Asset Closed**。

## 6. One Asset = One Commit (Rule-02)
* 以后 Git Commit 必须规范为：`feat({type}): release {ASSET-ID} {description}`
* 不要再出现无意义的 `update`, `modify`, `fix`。

## 7. Release Milestone (Rule-03)
* 建立正式 Release 节点控制进度。
* 每完成一个 KU，封版一个 Release（如 `KU-1000` = `Release v0.1`）。

## 8. Naming Rules
* Follow the `{PREFIX}-{ID}` format (e.g., `VIS-5100`, `DAT-3100`).
