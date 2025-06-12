/**
 * 新兴前端技术与趋势
 * 
 * 本文件展示了当前和未来的前端技术趋势
 * 包括 Web3、AI集成、边缘计算、PWA等新兴技术
 */

// 1. Web3 与区块链集成

class Web3Integration {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.contract = null;
  }
  
  // 连接钱包
  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // 请求账户访问
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        this.account = accounts[0];
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          this.account = accounts[0] || null;
          this.onAccountChanged(this.account);
        });
        
        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
          this.onNetworkChanged(chainId);
        });
        
        console.log('钱包连接成功:', this.account);
        return this.account;
        
      } catch (error) {
        console.error('连接钱包失败:', error);
        throw error;
      }
    } else {
      throw new Error('请安装 MetaMask 或其他 Web3 钱包');
    }
  }
  
  // 获取余额
  async getBalance(address = this.account) {
    if (!address) throw new Error('地址不能为空');
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // 转换为 ETH
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      return ethBalance;
    } catch (error) {
      console.error('获取余额失败:', error);
      throw error;
    }
  }
  
  // 发送交易
  async sendTransaction(to, value, data = '0x') {
    if (!this.account) throw new Error('请先连接钱包');
    
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.account,
          to,
          value: '0x' + (value * Math.pow(10, 18)).toString(16),
          data
        }]
      });
      
      console.log('交易发送成功:', txHash);
      return txHash;
    } catch (error) {
      console.error('发送交易失败:', error);
      throw error;
    }
  }
  
  // 智能合约交互
  async interactWithContract(contractAddress, abi, methodName, params = []) {
    try {
      // 这里需要使用 web3.js 或 ethers.js
      // 示例使用 ethers.js
      const { ethers } = window;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const result = await contract[methodName](...params);
      return result;
    } catch (error) {
      console.error('合约交互失败:', error);
      throw error;
    }
  }
  
  // 事件回调
  onAccountChanged(account) {
    console.log('账户已切换:', account);
    // 更新 UI
  }
  
  onNetworkChanged(chainId) {
    console.log('网络已切换:', chainId);
    // 更新 UI
  }
}

// 2. AI 集成与机器学习

class AIIntegration {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }
  
  // 加载 TensorFlow.js 模型
  async loadModel(modelUrl) {
    try {
      // 需要引入 @tensorflow/tfjs
      const tf = window.tf;
      this.model = await tf.loadLayersModel(modelUrl);
      this.isModelLoaded = true;
      console.log('模型加载成功');
      return this.model;
    } catch (error) {
      console.error('模型加载失败:', error);
      throw error;
    }
  }
  
  // 图像分类
  async classifyImage(imageElement) {
    if (!this.isModelLoaded) {
      throw new Error('模型尚未加载');
    }
    
    try {
      const tf = window.tf;
      
      // 预处理图像
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims();
      
      // 进行预测
      const predictions = await this.model.predict(tensor).data();
      
      // 清理张量
      tensor.dispose();
      
      return Array.from(predictions);
    } catch (error) {
      console.error('图像分类失败:', error);
      throw error;
    }
  }
  
  // 文本情感分析
  async analyzeSentiment(text) {
    try {
      // 使用预训练的情感分析模型
      const response = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('情感分析失败:', error);
      throw error;
    }
  }
  
  // 语音识别
  async startSpeechRecognition() {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('浏览器不支持语音识别'));
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'zh-CN';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      recognition.onerror = (event) => {
        reject(new Error(`语音识别错误: ${event.error}`));
      };
      
      recognition.start();
    });
  }
  
  // 文本转语音
  async textToSpeech(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('浏览器不支持语音合成'));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置选项
      utterance.lang = options.lang || 'zh-CN';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`语音合成错误: ${event.error}`));
      
      speechSynthesis.speak(utterance);
    });
  }
}

// 3. 边缘计算与 Service Worker

class EdgeComputing {
  constructor() {
    this.serviceWorker = null;
    this.isRegistered = false;
  }
  
  // 注册 Service Worker
  async registerServiceWorker(scriptUrl = '/sw.js') {
    if (!('serviceWorker' in navigator)) {
      throw new Error('浏览器不支持 Service Worker');
    }
    
    try {
      const registration = await navigator.serviceWorker.register(scriptUrl);
      this.serviceWorker = registration;
      this.isRegistered = true;
      
      console.log('Service Worker 注册成功:', registration.scope);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('新版本可用，请刷新页面');
            this.onUpdateAvailable();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
      throw error;
    }
  }
  
  // 发送消息到 Service Worker
  async sendMessage(message) {
    if (!this.isRegistered) {
      throw new Error('Service Worker 尚未注册');
    }
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };
      
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  }
  
  // 缓存策略管理
  async setCacheStrategy(strategy, resources = []) {
    const message = {
      type: 'SET_CACHE_STRATEGY',
      strategy,
      resources
    };
    
    return await this.sendMessage(message);
  }
  
  // 预缓存资源
  async precacheResources(resources) {
    const message = {
      type: 'PRECACHE_RESOURCES',
      resources
    };
    
    return await this.sendMessage(message);
  }
  
  // 清理缓存
  async clearCache(cacheName) {
    const message = {
      type: 'CLEAR_CACHE',
      cacheName
    };
    
    return await this.sendMessage(message);
  }
  
  // 更新可用回调
  onUpdateAvailable() {
    // 显示更新提示
    if (confirm('发现新版本，是否立即更新？')) {
      window.location.reload();
    }
  }
}

// 4. Progressive Web App (PWA)

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }
  
  init() {
    // 监听安装提示
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
    
    // 监听应用安装
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();
      console.log('PWA 安装成功');
    });
    
    // 检查是否已安装
    this.checkInstallStatus();
  }
  
  // 检查安装状态
  checkInstallStatus() {
    // 检查是否在独立模式下运行
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
    
    // 检查是否从主屏幕启动
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
    }
  }
  
  // 显示安装按钮
  showInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.promptInstall());
    }
  }
  
  // 隐藏安装按钮
  hideInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
  
  // 提示安装
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('安装提示不可用');
      return;
    }
    
    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('用户接受了安装提示');
      } else {
        console.log('用户拒绝了安装提示');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('安装提示失败:', error);
    }
  }
  
  // 注册推送通知
  async registerPushNotifications() {
    if (!('Notification' in window)) {
      throw new Error('浏览器不支持通知');
    }
    
    if (!('serviceWorker' in navigator)) {
      throw new Error('浏览器不支持 Service Worker');
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY)
        });
        
        // 发送订阅信息到服务器
        await this.sendSubscriptionToServer(subscription);
        
        console.log('推送通知注册成功');
        return subscription;
      } else {
        throw new Error('用户拒绝了通知权限');
      }
    } catch (error) {
      console.error('推送通知注册失败:', error);
      throw error;
    }
  }
  
  // 发送订阅信息到服务器
  async sendSubscriptionToServer(subscription) {
    const response = await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    if (!response.ok) {
      throw new Error('发送订阅信息失败');
    }
  }
  
  // 工具函数：转换 VAPID 密钥
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// 5. WebRTC 实时通信

class WebRTCManager {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.dataChannel = null;
    this.isConnected = false;
  }
  
  // 初始化 WebRTC
  async initWebRTC() {
    try {
      // 获取用户媒体
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // 创建 RTCPeerConnection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // 添加本地流
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      // 监听远程流
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        this.onRemoteStream(this.remoteStream);
      };
      
      // 监听 ICE 候选
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.onIceCandidate(event.candidate);
        }
      };
      
      // 创建数据通道
      this.dataChannel = this.peerConnection.createDataChannel('messages');
      this.setupDataChannel(this.dataChannel);
      
      // 监听数据通道
      this.peerConnection.ondatachannel = (event) => {
        this.setupDataChannel(event.channel);
      };
      
      console.log('WebRTC 初始化成功');
      return this.localStream;
    } catch (error) {
      console.error('WebRTC 初始化失败:', error);
      throw error;
    }
  }
  
  // 设置数据通道
  setupDataChannel(channel) {
    channel.onopen = () => {
      console.log('数据通道已打开');
      this.isConnected = true;
    };
    
    channel.onmessage = (event) => {
      this.onDataChannelMessage(event.data);
    };
    
    channel.onclose = () => {
      console.log('数据通道已关闭');
      this.isConnected = false;
    };
  }
  
  // 创建 Offer
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('创建 Offer 失败:', error);
      throw error;
    }
  }
  
  // 创建 Answer
  async createAnswer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('创建 Answer 失败:', error);
      throw error;
    }
  }
  
  // 设置远程描述
  async setRemoteDescription(answer) {
    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('设置远程描述失败:', error);
      throw error;
    }
  }
  
  // 添加 ICE 候选
  async addIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('添加 ICE 候选失败:', error);
      throw error;
    }
  }
  
  // 发送消息
  sendMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message);
    } else {
      console.error('数据通道未打开');
    }
  }
  
  // 屏幕共享
  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // 替换视频轨道
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      // 监听屏幕共享结束
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      
      return screenStream;
    } catch (error) {
      console.error('屏幕共享失败:', error);
      throw error;
    }
  }
  
  // 停止屏幕共享
  async stopScreenShare() {
    try {
      // 恢复摄像头
      const videoTrack = this.localStream.getVideoTracks()[0];
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }
    } catch (error) {
      console.error('停止屏幕共享失败:', error);
    }
  }
  
  // 关闭连接
  close() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    this.isConnected = false;
  }
  
  // 事件回调
  onRemoteStream(stream) {
    console.log('接收到远程流');
    // 在这里处理远程流，例如显示在视频元素中
  }
  
  onIceCandidate(candidate) {
    console.log('ICE 候选:', candidate);
    // 在这里发送 ICE 候选到远程端
  }
  
  onDataChannelMessage(message) {
    console.log('接收到消息:', message);
    // 在这里处理接收到的消息
  }
}

// 6. WebAssembly 与 SIMD

class SIMDProcessor {
  constructor() {
    this.wasmModule = null;
    this.simdSupported = this.checkSIMDSupport();
  }
  
  // 检查 SIMD 支持
  checkSIMDSupport() {
    try {
      // 检查 WebAssembly SIMD 支持
      return typeof WebAssembly.validate === 'function' &&
             WebAssembly.validate(new Uint8Array([
               0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
               0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
               0x03, 0x02, 0x01, 0x00,
               0x0a, 0x0a, 0x01, 0x08, 0x00, 0x41, 0x00, 0xfd, 0x0f, 0x0b
             ]));
    } catch (error) {
      return false;
    }
  }
  
  // 加载 SIMD 优化的 WASM 模块
  async loadSIMDModule(url) {
    if (!this.simdSupported) {
      console.warn('SIMD 不受支持，使用标准版本');
      url = url.replace('-simd', '');
    }
    
    try {
      const response = await fetch(url);
      const bytes = await response.arrayBuffer();
      const module = await WebAssembly.compile(bytes);
      this.wasmModule = await WebAssembly.instantiate(module);
      
      console.log('SIMD 模块加载成功');
      return this.wasmModule;
    } catch (error) {
      console.error('SIMD 模块加载失败:', error);
      throw error;
    }
  }
  
  // 向量化计算示例
  vectorAdd(a, b) {
    if (!this.wasmModule) {
      throw new Error('WASM 模块未加载');
    }
    
    // 调用 SIMD 优化的向量加法
    return this.wasmModule.exports.vector_add(a, b);
  }
  
  // 矩阵乘法（SIMD 优化）
  matrixMultiplySIMD(a, b, rows, cols) {
    if (!this.wasmModule) {
      throw new Error('WASM 模块未加载');
    }
    
    return this.wasmModule.exports.matrix_multiply_simd(a, b, rows, cols);
  }
}

// 7. 使用示例和集成

// 初始化所有新兴技术
class EmergingTechManager {
  constructor() {
    this.web3 = new Web3Integration();
    this.ai = new AIIntegration();
    this.edge = new EdgeComputing();
    this.pwa = new PWAManager();
    this.webrtc = new WebRTCManager();
    this.simd = new SIMDProcessor();
  }
  
  // 初始化所有技术
  async initAll() {
    try {
      // 注册 Service Worker
      await this.edge.registerServiceWorker();
      
      // 加载 AI 模型
      await this.ai.loadModel('/models/image-classifier.json');
      
      // 加载 SIMD 模块
      await this.simd.loadSIMDModule('/wasm/math-simd.wasm');
      
      // 注册推送通知
      await this.pwa.registerPushNotifications();
      
      console.log('所有新兴技术初始化完成');
    } catch (error) {
      console.error('技术初始化失败:', error);
    }
  }
  
  // 创建综合应用示例
  async createDemoApp() {
    // 1. Web3 钱包连接
    try {
      await this.web3.connectWallet();
      const balance = await this.web3.getBalance();
      console.log('钱包余额:', balance, 'ETH');
    } catch (error) {
      console.log('Web3 功能不可用:', error.message);
    }
    
    // 2. AI 图像识别
    const imageInput = document.getElementById('image-input');
    if (imageInput) {
      imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const img = new Image();
          img.onload = async () => {
            try {
              const predictions = await this.ai.classifyImage(img);
              console.log('图像分类结果:', predictions);
            } catch (error) {
              console.error('图像分类失败:', error);
            }
          };
          img.src = URL.createObjectURL(file);
        }
      });
    }
    
    // 3. WebRTC 视频通话
    const startCallButton = document.getElementById('start-call');
    if (startCallButton) {
      startCallButton.addEventListener('click', async () => {
        try {
          const stream = await this.webrtc.initWebRTC();
          const localVideo = document.getElementById('local-video');
          if (localVideo) {
            localVideo.srcObject = stream;
          }
        } catch (error) {
          console.error('视频通话启动失败:', error);
        }
      });
    }
    
    // 4. 语音识别
    const voiceButton = document.getElementById('voice-recognition');
    if (voiceButton) {
      voiceButton.addEventListener('click', async () => {
        try {
          const transcript = await this.ai.startSpeechRecognition();
          console.log('语音识别结果:', transcript);
          
          // 进行情感分析
          const sentiment = await this.ai.analyzeSentiment(transcript);
          console.log('情感分析结果:', sentiment);
        } catch (error) {
          console.error('语音识别失败:', error);
        }
      });
    }
  }
}

// 8. 性能监控和分析

class PerformanceAnalyzer {
  constructor() {
    this.metrics = [];
    this.observer = null;
    this.init();
  }
  
  init() {
    // 监听性能条目
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.metrics.push({
            name: entry.name,
            type: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: Date.now()
          });
        });
      });
      
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }
  
  // 测量代码执行时间
  measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    performance.mark(`${name}-start`);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    return result;
  }
  
  // 获取 Web Vitals
  getWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};
      
      // FCP (First Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.fcp = entries[0]?.startTime;
      }).observe({ entryTypes: ['paint'] });
      
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.lcp = entries[entries.length - 1]?.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.fid = entries[0]?.processingStart - entries[0]?.startTime;
      }).observe({ entryTypes: ['first-input'] });
      
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => resolve(vitals), 5000);
    });
  }
  
  // 生成性能报告
  generateReport() {
    const report = {
      metrics: this.metrics,
      summary: {
        totalMeasurements: this.metrics.length,
        averageDuration: this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / this.metrics.length,
        slowestOperation: this.metrics.reduce((max, m) => 
          (m.duration || 0) > (max.duration || 0) ? m : max, {})
      }
    };
    
    console.table(this.metrics);
    return report;
  }
}

// 导出所有类
export {
  Web3Integration,
  AIIntegration,
  EdgeComputing,
  PWAManager,
  WebRTCManager,
  SIMDProcessor,
  EmergingTechManager,
  PerformanceAnalyzer
};

/**
 * 新兴技术最佳实践：
 * 
 * 1. 渐进式增强：
 *    - 检测功能支持
 *    - 提供降级方案
 *    - 优雅的错误处理
 * 
 * 2. 性能优化：
 *    - 懒加载技术模块
 *    - 使用 Web Workers
 *    - 缓存策略
 * 
 * 3. 用户体验：
 *    - 权限请求时机
 *    - 加载状态提示
 *    - 离线功能支持
 * 
 * 4. 安全考虑：
 *    - 输入验证
 *    - 权限最小化
 *    - 数据加密
 * 
 * 5. 兼容性：
 *    - 特性检测
 *    - Polyfill 使用
 *    - 跨浏览器测试
 */