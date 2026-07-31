import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { ref, onValue, push, set, off } from 'firebase/database';
import { database } from '../config/firebase';

export default function ChatModal({ isOpen, onClose, rideId, activoId, user, conductorNombre }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const effectiveRideId = rideId || '';
  const effectiveActivoId = activoId || rideId || '';

  useEffect(() => {
    if (!isOpen || (!effectiveRideId && !effectiveActivoId)) return;

    const unsubs = [];
    const messageMap = new Map();

    const handleMessagesSnapshot = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach((key) => {
          const m = data[key];
          if (m && typeof m === 'object') {
            messageMap.set(key, {
              id: key,
              ...m
            });
          }
        });
        const list = Array.from(messageMap.values());
        list.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
        setMessages(list);
      }
    };

    // Chat paths exactos usados en Flutter (mensajes/$chatId y chats/$chatId/mensajes)
    const chatIds = [
      `microservicio_${effectiveActivoId}`,
      `microservicio_${effectiveRideId}`,
      effectiveActivoId,
      effectiveRideId
    ].filter(Boolean);

    const uniqueChatIds = [...new Set(chatIds)];

    uniqueChatIds.forEach((cId) => {
      // 1. Flutter path principal: mensajes/{chatId}
      const msgRef1 = ref(database, `mensajes/${cId}`);
      onValue(msgRef1, handleMessagesSnapshot);
      unsubs.push(msgRef1);

      // 2. Path secundario: chats/{chatId}/mensajes
      const msgRef2 = ref(database, `chats/${cId}/mensajes`);
      onValue(msgRef2, handleMessagesSnapshot);
      unsubs.push(msgRef2);
    });

    return () => {
      unsubs.forEach((r) => off(r));
    };
  }, [isOpen, effectiveRideId, effectiveActivoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const now = Date.now();
      const clientName = user.displayName || user.name || user.email || 'Cliente';
      const senderId = user.uid;

      const cId = `microservicio_${effectiveActivoId || effectiveRideId}`;

      // 1. Escribir en mensajes/{chatId} (Flutter FirebaseChatService)
      const mainRef = push(ref(database, `mensajes/${cId}`));
      const messageId = mainRef.key;

      const msgData = {
        id: messageId,
        chatId: cId,
        chat_id: cId,
        senderId: senderId,
        sender_id: senderId,
        senderName: clientName,
        sender_name: clientName,
        message: textToSend,
        messageType: 'text',
        message_type: 'text',
        timestamp: now,
        read: false
      };

      await set(mainRef, msgData);

      // 2. Escribir copia en chats/{chatId}/mensajes
      await set(ref(database, `chats/${cId}/mensajes/${messageId}`), msgData);

      // 3. Actualizar resumen ultimo mensaje en chats/{chatId}
      await set(ref(database, `chats/${cId}/ultimo_mensaje`), textToSend);
      await set(ref(database, `chats/${cId}/ultimo_mensaje_timestamp`), now);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 4000,
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="flutter-sheet animate-sheet-up" style={{
        width: '100%',
        maxWidth: '420px',
        height: '80vh',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
      }}>
        {/* Header Chat */}
        <div style={{
          padding: '16px 20px',
          background: '#0F172A',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '14px'
            }}>
              {conductorNombre ? conductorNombre.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>
                Chat con {conductorNombre || 'Conductor'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700 }}>
                ● En línea
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message List */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: '#0A0E1A'
        }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              Inicia la conversación con tu conductor.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = (msg.sender_id === user?.uid) || (msg.senderId === user?.uid);
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isMe ? 'var(--primary-gradient)' : '#1E293B',
                    color: '#FFF',
                    padding: '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                >
                  <div>{msg.message}</div>
                  <div style={{
                    fontSize: '9px',
                    opacity: 0.7,
                    textAlign: 'right',
                    marginTop: '4px'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSendMessage} style={{
          padding: '12px 16px',
          background: '#0F172A',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input
            type="text"
            className="flutter-input"
            placeholder="Escribe un mensaje al conductor..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ borderRadius: '20px', padding: '10px 16px', fontSize: '13px' }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--primary-gradient)',
              border: 'none',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
