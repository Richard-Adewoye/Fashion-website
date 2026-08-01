import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Truck,
  Ruler,
  Bot
} from 'lucide-react';
import { Product, CartItem, ChatMessage, ProductColor } from '../types';

interface ChatBotDrawerProps {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
  onOpenCheckout: () => void;
}

export const ChatBotDrawer: React.FC<ChatBotDrawerProps> = ({
  products,
  cartItems,
  onAddToCart,
  onSelectProduct,
  onOpenCheckout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: "Bonjour! I am your ÉLAN AI Studio Concierge. Ask me anything about our collections, sizing, or tell me what piece you'd like to order today!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Handle Quick Topic Prompt
  const handleQuickPrompt = (promptText: string) => {
    setInputMessage(promptText);
    handleSendMessage(promptText);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          cartItems: cartItems.map((ci) => ({
            product: { id: ci.product.id, name: ci.product.name, price: ci.product.price },
            selectedSize: ci.selectedSize,
            selectedColor: ci.selectedColor.name,
            quantity: ci.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Find matching products for recommendations
        let matchedProducts: Product[] = [];
        if (data.productIds && Array.isArray(data.productIds)) {
          matchedProducts = products.filter((p) => data.productIds.includes(p.id));
        }

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          products: matchedProducts.length > 0 ? matchedProducts : undefined,
          action: data.actionType !== 'NONE' ? {
            type: data.actionType,
            productIds: data.productIds,
            suggestedItems: data.suggestedItems,
            orderSummary: data.orderSummary,
          } : undefined,
          orderConfirmation: data.orderSummary || undefined,
        };

        setMessages((prev) => [...prev, botMsg]);

        // Auto add to cart if action requested ADD_TO_CART
        if (data.actionType === 'ADD_TO_CART' && data.suggestedItems && data.suggestedItems.length > 0) {
          data.suggestedItems.forEach((item: any) => {
            const p = products.find((prod) => prod.id === item.productId);
            if (p) {
              const size = item.size || p.sizes[0];
              const color = p.colors.find((c) => c.name === item.colorName) || p.colors[0];
              onAddToCart(p, size, color, item.quantity || 1);
            }
          });
        }
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (error) {
      console.error('Concierge Error:', error);
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "I apologize for the momentary connection pause. Our Paris atelier is standing by. How can I assist with your order or collection questions?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          id="chatbot-trigger-button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-neutral-900 border border-amber-400/40 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:bg-neutral-800 hover:border-amber-400 transition-all duration-300"
          title="Open AI Concierge & Order Assistant"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Bot className="w-4 h-4" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            )}
          </div>

          <div className="hidden sm:block text-left">
            <span className="block text-[10px] font-mono uppercase text-amber-300 tracking-wider font-semibold">
              AI Concierge
            </span>
            <span className="block text-xs font-serif text-white">Ask Questions & Order</span>
          </div>

          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse ml-1" />
        </button>
      )}

      {/* Floating Chatbot Popup Modal */}
      {isOpen && (
        <div
          id="chatbot-drawer-container"
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[88vh] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
        >
          {/* Header */}
          <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-neutral-900" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider">
                    ÉLAN Concierge
                  </h3>
                  <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400">
                  Atelier Assistant & Instant Orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'bot',
                      text: "Conversation reset. How can I help you with our luxury garments or order placement today?",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-neutral-500">
                  <span>{msg.sender === 'user' ? 'You' : 'ÉLAN Advisor'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                      : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Order Confirmation Card */}
                  {msg.orderConfirmation && (
                    <div className="mt-3 p-3 bg-neutral-950 border border-amber-400/40 rounded-xl text-white space-y-2">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px] font-bold">
                          <PackageCheck className="w-4 h-4 text-amber-400" />
                          <span>Order Registered #{msg.orderConfirmation.orderId}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                          Confirmed
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-neutral-300 space-y-1">
                        {msg.orderConfirmation.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.quantity}x {it.productName} ({it.size})</span>
                            <span className="font-bold text-amber-300">${it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs font-mono">
                        <span className="text-neutral-400">Total Charged:</span>
                        <span className="text-amber-300 font-bold">${msg.orderConfirmation.totalAmount}</span>
                      </div>

                      <div className="text-[10px] font-mono text-neutral-400 pt-1">
                        Est. Delivery: {msg.orderConfirmation.estimatedDelivery}
                      </div>

                      <button
                        onClick={onOpenCheckout}
                        className="w-full mt-2 py-2 bg-amber-400 text-neutral-950 font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-amber-300 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> View Full Order Receipt
                      </button>
                    </div>
                  )}

                  {/* Product Recommendations List inside Chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-neutral-800/80">
                      <span className="text-[10px] font-mono uppercase text-amber-300 tracking-wider block">
                        Recommended Atelier Garments:
                      </span>
                      <div className="space-y-2">
                        {msg.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2 bg-neutral-950 rounded-xl border border-neutral-800 flex gap-3 items-center"
                          >
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-14 object-cover rounded-lg bg-neutral-900 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-serif font-bold text-white truncate">
                                {prod.name}
                              </h4>
                              <p className="text-[10px] font-mono text-amber-300 font-semibold">
                                ${prod.price}
                              </p>
                              <div className="flex gap-2 mt-1.5">
                                <button
                                  onClick={() => onSelectProduct(prod)}
                                  className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
                                >
                                  Quick View
                                </button>
                                <button
                                  onClick={() =>
                                    onAddToCart(prod, prod.sizes[0], prod.colors[0], 1)
                                  }
                                  className="text-[10px] font-mono bg-amber-400 text-neutral-950 font-bold px-2 py-0.5 rounded hover:bg-amber-300 flex items-center gap-1"
                                >
                                  <ShoppingBag className="w-2.5 h-2.5" /> + Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] font-mono text-neutral-500">ÉLAN Advisor is typing...</span>
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-xs font-mono text-neutral-400">Consulting Paris Atelier...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Topic Pills */}
          <div className="px-3 py-2 bg-neutral-900/60 border-t border-neutral-800/80 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            <button
              onClick={() => handleQuickPrompt('I want to order the Cashmere Mock-Neck Knit')}
              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-full text-[10px] font-mono text-amber-300 whitespace-nowrap flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3" /> Quick Order
            </button>
            <button
              onClick={() => handleQuickPrompt('What is your shipping and return policy?')}
              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-full text-[10px] font-mono text-neutral-300 whitespace-nowrap flex items-center gap-1"
            >
              <Truck className="w-3 h-3 text-neutral-400" /> Shipping Policy
            </button>
            <button
              onClick={() => handleQuickPrompt('How do your sizes fit for outerwear and suits?')}
              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-full text-[10px] font-mono text-neutral-300 whitespace-nowrap flex items-center gap-1"
            >
              <Ruler className="w-3 h-3 text-neutral-400" /> Size Help
            </button>
            <button
              onClick={() => handleQuickPrompt('Show me bestselling coats and trench coats')}
              className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-full text-[10px] font-mono text-neutral-300 whitespace-nowrap"
            >
              🧥 Bestsellers
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question or request an order..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-amber-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-neutral-950 rounded-xl font-bold transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
