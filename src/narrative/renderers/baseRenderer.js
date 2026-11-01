/**
 * 统一渲染器抽象基类 (Universal Renderer Contract)
 * 严格遵从 ARCH-001 规范定义的介质解耦接口
 */

export class BaseRenderer {
  constructor(rendererType, rendererId) {
    if (!rendererType || !rendererId) {
      throw new Error('BaseRenderer requires rendererType and rendererId');
    }
    this.rendererType = rendererType; // 'AUDIO' | 'VIDEO' | 'TEXT' | 'COMPOSITE'
    this.rendererId = rendererId;
    this.isInitialized = false;
    this.renderedArtifacts = [];
  }

  async initialize(config = {}) {
    this.config = config;
    this.isInitialized = true;
  }

  /**
   * 渲染场景切片 (由子类实现具体介质映射)
   */
  async renderScene(scene) {
    throw new Error('renderScene() must be implemented by subclass');
  }

  /**
   * 渲染单轮对话
   */
  async renderTurn(turn) {
    throw new Error('renderTurn() must be implemented by subclass');
  }

  /**
   * 解释介质无关呈现意图 (PresentationIntent)
   */
  async handlePresentationIntent(intent) {
    throw new Error('handlePresentationIntent() must be implemented by subclass');
  }

  /**
   * 极速物理打断 (Barge-in L1 秒停)
   */
  async interrupt() {
    throw new Error('interrupt() must be implemented by subclass');
  }

  async dispose() {
    this.isInitialized = false;
  }
}
