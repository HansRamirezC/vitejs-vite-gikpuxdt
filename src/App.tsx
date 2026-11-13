// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Heart, BookOpen, Bell, UserPlus, Send, Smile, Brain, 
  Clock, CheckCircle2, Calendar, Coffee, Menu, X, BookText, BarChart, 
  AlertCircle, Settings2, RefreshCcw, Loader2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [inputText, setInputText] = useState(''); 
  const [mood, setMood] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const [citaAgendada, setCitaAgendada] = useState(false);
  const [hasStarted, setHasStarted] = useState(() => localStorage.getItem('upc_started') === 'true');
  const [isTyping, setIsTyping] = useState(false); 
  
  const messagesEndRef = useRef(null);

  const studentData = {
    nombre: 'Valery Hurtado',
    codigo: 'u20261A458',
    carrera: 'Ingeniería de Software',
    ciclo: '1er Ciclo',
    cursos: [
      { id: 1, nombre: 'Fundamentos de Programación', estado: 'Al día', promedio: '16.5', color: 'text-green-600', bg: 'bg-green-100' },
      { id: 2, nombre: 'Matemática Discreta', estado: 'Con dificultades', promedio: '11.0', color: 'text-red-600', bg: 'bg-red-100' },
      { id: 3, nombre: 'Comprensión de Lenguaje', estado: 'Al día', promedio: '15.0', color: 'text-green-600', bg: 'bg-green-100' },
      { id: 4, nombre: 'Desarrollo Personal', estado: 'Pendiente entrega', promedio: '-', color: 'text-amber-600', bg: 'bg-amber-100' }
    ]
  };

  const defaultMessages = [
    {
      id: 1,
      sender: 'bot',
      text: `¡Hola ${studentData.nombre}! 👋 Bienvenido a UpcContigo. ¿Cómo te sientes hoy? o ¿Cómo te está yendo en tus cursos en este primer ciclo?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('upc_messages');
    if (saved) return JSON.parse(saved);
    return defaultMessages;
  });

  useEffect(() => {
    localStorage.setItem('upc_messages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const resetApp = () => {
    localStorage.removeItem('upc_messages');
    localStorage.removeItem('upc_started');
    setMessages(defaultMessages);
    setMood(null);
    setCitaAgendada(false);
    setShowDebug(false);
    setHasStarted(false);
  };

  // LÓGICA DE CONEXIÓN AL BACKEND PROPIO
  const handleSendMessage = async (textParam) => {
    const textToSend = textParam || inputText;
    if (!textToSend.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const historial = messages.slice(-5).map(m => `${m.sender === 'user' ? 'Alumno' : 'UpcContigo'}: ${m.text}`).join('\n');

      const prompt = `Eres UpcContigo, un asistente psicopedagógico integrado en la plataforma web de la universidad UPC para estudiantes de primer ciclo. Tu trabajo es dar acompañamiento emocional y académico.
      
      CONOCIMIENTO DE LA INTERFAZ (ÚTILES PARA REDIRIGIR AL ALUMNO):
      1. Si el alumno pide sacar cita psicológica, NUNCA lo mandes a intranet o "Mi UPC". Dile textualmente que vaya a la pestaña "Contacto Psicopedagógico" en el menú lateral izquierdo de esta misma plataforma.
      2. Si el alumno pregunta por sus cursos o notas, TÚ SÍ TIENES ACCESO. En su registro dice que está mal en "Matemática Discreta" con promedio de 11.0, y excelente en "Fundamentos de Programación" con 16.5. Dile sus notas y pídele que vaya a la pestaña "Mis Cursos" de este menú lateral para más detalles.
      3. Si el alumno tiene problemas para estudiar, indícale que en la pestaña lateral "Técnicas de Estudio" encontrará el método Pomodoro y Feynman.
      
      REGLAS DE CONVERSACIÓN:
      - Sé sumamente cálido, empático y humano.
      - Tus respuestas deben ser CORTAS y directas (máximo 2 a 3 oraciones). No uses viñetas ni párrafos largos.
      - NUNCA resuelvas problemas matemáticos, ni escribas código, ni hagas tareas. Redirige la charla hacia métodos de estudio o bienestar emocional.

      Historial de la conversación previa:
      ${historial}

      El alumno te acaba de decir: "${textToSend}"
      Responde:`;

      // Enviar la petición a tu servidor Serverless de Vercel
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt })
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      const botResponse = data.text;

      const newBotMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error("Error conectando al backend:", error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Hubo un pequeño problema de conexión con el sistema. ¿Podrías repetirme eso?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* HEADER MÓVIL */}
      <div className="md:hidden bg-red-600 text-white p-4 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white text-red-600 font-black px-2 py-1 rounded-sm text-sm tracking-tighter leading-none">UPC</div>
          <h1 className="font-black text-xl tracking-tight uppercase">Contigo</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDebug(!showDebug)} className="p-1 opacity-50 hover:opacity-100"><Settings2 size={24} /></button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* PANEL LATERAL */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:relative top-0 left-0 w-3/4 md:w-80 h-full bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out z-10 shrink-0 shadow-2xl md:shadow-none
      `}>
        {/* CABECERA */}
        <div className="hidden md:flex flex-col p-6 border-b border-red-700 bg-red-600 text-white relative group">
          <div className="flex items-center gap-3">
            <div className="bg-white text-red-600 font-black px-3 py-1.5 rounded-sm text-2xl tracking-tighter leading-none">UPC</div>
            <h1 className="font-black text-3xl tracking-tight uppercase">Contigo</h1>
          </div>
          <p className="text-sm text-red-100 mt-2 font-medium">Acompañamiento Estudiantil</p>
          <button onClick={() => setShowDebug(!showDebug)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity">
            <Settings2 size={18} />
          </button>
        </div>

        {/* MENU DEBUG DE PRESENTADOR */}
        {showDebug && (
          <div className="bg-amber-100 text-amber-900 p-3 border-b border-amber-200 text-xs">
            <p className="font-bold mb-2">Panel Presentador (Demo AI)</p>
            <div className="flex gap-2">
              <button onClick={resetApp} className="bg-white border border-amber-300 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-amber-50">
                <RefreshCcw size={14} /> Reiniciar chat de IA
              </button>
            </div>
            <p className="mt-2 text-green-700 font-bold">🟢 Backend Conectado</p>
          </div>
        )}

        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">VH</div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 truncate">{studentData.nombre}</p>
              <p className="text-xs text-slate-500 truncate">{studentData.carrera}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button onClick={() => handleTabChange('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <MessageSquare size={18} /> Asistente UpcContigo
          </button>
          <button onClick={() => handleTabChange('cursos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cursos' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BookText size={18} /> Mis Cursos (Seguimiento)
          </button>
          <button onClick={() => handleTabChange('bienestar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bienestar' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Heart size={18} /> Mi Bienestar Hoy
          </button>
          <button onClick={() => handleTabChange('tecnicas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tecnicas' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Brain size={18} /> Técnicas de Estudio
          </button>
          <button onClick={() => handleTabChange('recordatorios')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'recordatorios' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Bell size={18} /> Recordatorios
          </button>
          <button onClick={() => handleTabChange('contacto')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'contacto' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <UserPlus size={18} /> Contacto Psicopedagógico
          </button>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-0 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen w-full relative">
        
        {/* CHAT */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full w-full bg-slate-50">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
              
              {!hasStarted && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs md:text-sm flex flex-col md:flex-row items-center gap-2 justify-center mb-4 max-w-2xl mx-auto shadow-sm">
                  <div className="flex items-center gap-2">
                    <Brain size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-center md:text-left"><strong>IA Conectada:</strong> El chat ahora responde con inteligencia artificial real. Puedes conversar libremente.</span>
                  </div>
                </div>
              )}

              <div className="max-w-3xl mx-auto space-y-6 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-red-100 p-1 rounded-full text-red-600"><Heart size={14} /></div>
                          <span className="font-bold text-xs text-slate-500">UpcContigo</span>
                        </div>
                      )}
                      <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                      <div className={`text-right mt-2 text-xs ${msg.sender === 'user' ? 'text-red-200' : 'text-slate-400'}`}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                
                {/* INDICADOR DE "ESCRIBIENDO" */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] md:max-w-[75%] rounded-2xl p-4 bg-white border border-slate-200 shadow-sm rounded-tl-sm flex items-center gap-3">
                      <Loader2 className="animate-spin text-red-500" size={18} />
                      <span className="text-sm text-slate-500 font-medium">Pensando la respuesta...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="bg-white border-t border-slate-200 p-3 md:p-4 shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide">
                  <button onClick={() => { handleSendMessage('Me siento agotado y colapsando'); setHasStarted(true); }} className="whitespace-nowrap bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-xs font-medium transition">😥 Estoy agotado</button>
                  <button onClick={() => { handleSendMessage('Tengo problemas para concentrarme al estudiar'); setHasStarted(true); }} className="whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium transition">📚 No puedo concentrarme</button>
                  <button onClick={() => { handleSendMessage('¿Cómo me va en mis cursos?'); setHasStarted(true); }} className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-medium transition">📉 Revisar cursos</button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe lo que sientes, la IA te responderá..." 
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                    disabled={isTyping}
                  />
                  <button onClick={() => { handleSendMessage(); setHasStarted(true); }} disabled={isTyping} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 rounded-lg flex items-center justify-center transition-colors">
                    <Send size={18} className="md:mr-2" /> <span className="hidden md:inline">Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MIS CURSOS */}
        {activeTab === 'cursos' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 w-full">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Verificación de Cursos</h2>
              <p className="text-slate-600 mb-6 text-sm md:text-base">Seguimiento de tu rendimiento. Si tienes problemas, avísale al asistente.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentData.cursos.map((curso) => (
                  <div key={curso.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-800 leading-tight pr-2">{curso.nombre}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${curso.bg} ${curso.color}`}>{curso.estado}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="text-sm">
                        <span className="text-slate-500">Promedio: </span>
                        <span className={`font-bold ${curso.promedio < 13 && curso.promedio !== '-' ? 'text-red-600' : 'text-slate-800'}`}>{curso.promedio}</span>
                      </div>
                      <button onClick={() => { handleTabChange('chat'); handleSendMessage(`Tengo problemas con el curso de ${curso.nombre}`); }} className="text-xs text-red-600 font-semibold hover:underline">Pedir ayuda</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TÉCNICAS */}
        {activeTab === 'tecnicas' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 w-full">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Técnicas de Estudio para la Universidad</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-red-300 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="text-red-500 shrink-0" size={24} />
                    <h3 className="font-bold text-lg">Técnica Pomodoro</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Ideal para evitar la fatiga mental. Estudia 25 minutos sin distracciones, descansa 5 minutos. Tras 4 ciclos, toma un descanso largo de 30 minutos.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="text-blue-500 shrink-0" size={24} />
                    <h3 className="font-bold text-lg">Técnica Feynman</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Intenta explicar un tema complejo usando palabras sencillas. Si te trabas, revisa tus apuntes de nuevo. La mejor forma de aprender es enseñar.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BIENESTAR */}
        {activeTab === 'bienestar' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 w-full">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Mi Bienestar Emocional</h2>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-center mt-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-6">¿Cómo te sientes en este momento?</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[{ label: 'Motivado', emoji: '🤩', color: 'bg-green-100 text-green-800' }, { label: 'Tranquilo', emoji: '😌', color: 'bg-blue-100 text-blue-800' }, { label: 'Estresado', emoji: '😥', color: 'bg-orange-100 text-orange-800' }, { label: 'Agotado', emoji: '😪', color: 'bg-red-100 text-red-800' }].map((estado) => (
                    <button key={estado.label} onClick={() => setMood(estado.label)} className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 ${estado.color} ${mood === estado.label ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}>
                      <span className="text-3xl md:text-4xl">{estado.emoji}</span>
                      <span className="font-semibold text-xs md:text-sm">{estado.label}</span>
                    </button>
                  ))}
                </div>

                {mood && (
                  <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {(mood === 'Motivado' || mood === 'Tranquilo') ? (
                      <div className="bg-green-50 border border-green-200 p-5 rounded-xl text-left">
                        <h4 className="font-bold text-green-800 text-lg mb-2">¡Qué bueno saber que te sientes así! 🌟</h4>
                        <p className="text-green-700 text-sm mb-4">Aprovecha esta energía para avanzar con tus cursos. Mantener un buen estado de ánimo es clave.</p>
                        <button onClick={() => handleTabChange('cursos')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Revisar mis cursos</button>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl text-left">
                        <h4 className="font-bold text-orange-800 text-lg mb-2">Lamento que te sientas {mood.toLowerCase()}. 🫂</h4>
                        <p className="text-orange-700 text-sm mb-4">No tienes que afrontarlo solo. Puedes hablar con el asistente para recibir consejos, o pedir ayuda profesional.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button onClick={() => { handleTabChange('chat'); handleSendMessage(`Me siento muy ${mood.toLowerCase()}`); }} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2">
                            <MessageSquare size={16} /> Hablar con el Asistente
                          </button>
                          <button onClick={() => handleTabChange('contacto')} className="bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2">
                            <Heart size={16} /> Ayuda Psicológica
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RECORDATORIOS */}
        {activeTab === 'recordatorios' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 w-full">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Seguimiento Académico</h2>
              <div className="space-y-4">
                <div className="bg-white p-4 md:p-5 rounded-xl border border-l-4 border-l-amber-500 shadow-sm flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0"><AlertCircle size={20} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800">Cuidado con Matemática Discreta</h4>
                    <p className="text-sm text-slate-600 mt-1">Tu promedio está bajo (11.0). Recuerda agendar tutoría.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACTO */}
        {activeTab === 'contacto' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 w-full">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Orientación Psicopedagógica</h2>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600"><Heart size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No estás solo en esto</h3>
                <p className="text-slate-600 mb-6 text-sm">Nuestros psicólogos están para escucharte de manera confidencial y gratuita.</p>
                
                {!citaAgendada ? (
                  <button onClick={() => setCitaAgendada(true)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto transition">Agendar Cita</button>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
                    <CheckCircle2 className="mx-auto mb-2 text-green-500" size={28} />
                    <p className="font-bold text-lg">¡Solicitud recibida!</p>
                    <p className="text-sm mt-1">Hemos enviado a tu correo los horarios disponibles.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}