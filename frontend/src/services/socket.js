import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Market data subscriptions
  subscribeToMarketData(symbols, callback) {
    if (!this.socket) this.connect();
    
    this.socket.emit('subscribe_market', symbols);
    this.socket.on('market_data', callback);
  }

  unsubscribeFromMarketData(symbols) {
    if (this.socket) {
      this.socket.emit('unsubscribe_market', symbols);
      this.socket.off('market_data');
    }
  }

  // Order management
  placeOrder(orderData, callback) {
    if (!this.socket) this.connect();
    
    this.socket.emit('place_order', orderData);
    this.socket.on('order_response', callback);
    this.socket.on('order_error', (error) => {
      console.error('Order error:', error);
      callback({ error: error.error });
    });
  }

  // Generic event listeners
  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;