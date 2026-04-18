'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  MousePointer2, Pencil, Eraser, Type, MessageSquare, Hexagon,
  Image as ImageIcon, Undo2, Redo2, Trash2, Copy, FlipHorizontal,
  FlipVertical, BringToFront, SendToBack, Lock, Unlock, XCircle,
  Layout, Download, Film, Play, Upload, Paintbrush, Circle, 
  Triangle, Minus, Search, Columns, RefreshCw, Wrench, Package, PictureInPicture, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Consts
const ET_IMAGE = '/et.png';
const spriteData: Record<string, string[]> = {
  '👽 ET / Personagem': [ET_IMAGE],
  '😊 Personagens': ['👦','👧','👨','👩','👴','👵','🧒','🧑','🧔','👸','🤴','🦸','🦹','🧙','🧜','🧝','🧞','🧟','🧛','🧚'],
  '😀 Emoções': ['😀','😂','🤣','😭','😡','🤯','😱','😎','🥳','🤔','😏','🙄','😴','🤢','🤮','😤','🥺','😍','🤩','😬'],
  '⚡ Ação': ['💥','⚡','🔥','❄️','💫','✨','🌪️','🌊','💨','🌈','☄️','💢','‼️','⁉️','❗','❓','🔔','📣','💬','💭'],
  '🐾 Animais': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐸','🦁','🐯','🦝','🦄','🐲','🦖','🦕','🦋','🐝','🐛','🦎'],
  '🏠 Cenários': ['🏠','🏢','🏰','⛪','🏗️','🏙️','🌆','🌃','🌉','🌌','🏔️','🌋','🗻','🏕️','🏖️','🏜️','🌲','🌴','🌵','⛺'],
  '🚗 Objetos': ['🚀','🚗','✈️','⚔️','🛡️','🔫','🪄','💎','👑','🗝️','📱','💻','📚','🎮','🎸','🎨','🎭','🎪','🎠','🎢'],
  '💥 Efeitos': ['💥','🔥','💫','⭐','🌟','✨','💧','🩸','💀','☠️','👻','👽','🤖','👾','🎯','🎱','🔮','⚡','🌀','💣'],
};

const palette = ['#1a1a2e','#e63946','#f4a261','#ffd60a','#2a9d8f','#457b9d','#a8dadc','#ffffff','#e63946','#6a0572','#00b4d8','#90e0ef','#588157','#a3b18a','#3a5a40','#dad7cd','#e9c46a','#f4a261','#e76f51','#264653'];
const bgColors = ['#ffffff','#fff9f0','#f0e6d3','#ffd60a','#e63946','#2a9d8f','#1a1a2e','#0a0a0a','#f5f5dc','#fffde7','#e8f5e9','#e3f2fd','#fce4ec','#f3e5f5','#e8eaf6'];
const onomatopeias = ['POW!','BAM!','BOOM!','ZAP!','CRASH!','SPLASH!','WHACK!','WHAM!','KA-POW!','BZZT!','THUD!','OUCH!','HA-HA!','WOW!','UGH!','ARGH!'];

export default function ComicMaker() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasState, setCanvasState] = useState<fabric.Canvas | null>(null);
  
  // States
  const [mobilePanel, setMobilePanel] = useState<'canvas' | 'assets' | 'actions'>('canvas');
  const [currentTool, setCurrentTool] = useState('select');
  const [activeTab, setActiveTab] = useState('stickers');
  const [activeSpriteCat, setActiveSpriteCat] = useState('👽 ET / Personagem');
  const [brushColor, setBrushColor] = useState('#1a1a2e');
  const [brushSize, setBrushSize] = useState(4);
  const [brushType, setBrushType] = useState('PencilBrush');
  
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState('#1a1a2e');
  const [fontFamily, setFontFamily] = useState('Comic Neue');
  const [textInput, setTextInput] = useState('');
  
  const [toastMsg, setToastMsg] = useState('');
  
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const [modal, setModal] = useState<string | null>(null);

  // Flipbook
  const [flipbookMode, setFlipbookMode] = useState(false);
  const [frames, setFrames] = useState<{data: any, thumb: string}[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(8);

  const applyLayout = (type: string) => {
    const canvas = canvasState;
    if (!canvas) return;
    
    // Deleta linhas existentes de layout
    canvas.getObjects().filter(o => (o as any).id === 'layout-line').forEach(o => canvas.remove(o));

    const lineProps = {
      stroke: '#1a1a2e',
      strokeWidth: 4,
      selectable: false,
      evented: false,
      id: 'layout-line'
    };

    if (type === 'v2') {
      canvas.add(new fabric.Line([300, 0, 300, 450], lineProps));
    } else if (type === 'h2') {
      canvas.add(new fabric.Line([0, 225, 600, 225], lineProps));
    } else if (type === 'g4') {
      canvas.add(new fabric.Line([300, 0, 300, 450], lineProps));
      canvas.add(new fabric.Line([0, 225, 600, 225], lineProps));
    } else if (type === 'v3') {
       canvas.add(new fabric.Line([200, 0, 200, 450], lineProps));
       canvas.add(new fabric.Line([400, 0, 400, 450], lineProps));
    }
    
    canvas.renderAll();
    pushUndoState(canvas);
    showToast('📐 Layout aplicado');
  };

  const saveCurrentFrame = () => {
    const canvas = canvasState;
    if (!canvas) return;
    const data = canvas.toJSON(['id', 'locked']);
    
    // Thumbnail para o preview
    const thumb = canvas.toDataURL({ format: 'png', quality: 0.8 }); // Maior qualidade para strip
    
    setFrames(prev => {
      const newFrames = [...prev];
      if (newFrames.length === 0) {
        return [{ data, thumb }];
      }
      newFrames[currentFrame] = { data, thumb };
      return newFrames;
    });
  };

  const addNewFrame = () => {
    const canvas = canvasState;
    if (!canvas) return;
    
    saveCurrentFrame();
    
    const newIdx = frames.length === 0 ? 1 : frames.length;
    
    canvas.clear();
    (canvas as any).backgroundColor = '#ffffff';
    canvas.renderAll();
    
    setFrames(prev => [...prev, { data: canvas.toJSON(['id','locked']), thumb: '' }]);
    setCurrentFrame(newIdx);
    setFlipbookMode(true);
    showToast('✨ Nova página adicionada');
  };

  const goToFrame = (index: number) => {
    const canvas = canvasState;
    if (!canvas) return;
    
    saveCurrentFrame();
    
    const target = frames[index];
    if (target && target.data) {
      canvas.loadFromJSON(target.data, () => {
        canvas.renderAll();
        setCurrentFrame(index);
      });
    }
  };

  const playFlipbook = () => {
    if (frames.length < 2) return showToast('Adicione mais páginas!');
    
    saveCurrentFrame(); // Garante o estado atual
    setIsPlaying(true);
    let idx = 0;
    
    const interval = setInterval(() => {
      const f = frames[idx];
      if (f && f.data) {
        canvasState?.loadFromJSON(f.data, () => canvasState?.renderAll());
      }
      idx++;
      if (idx >= frames.length) {
        clearInterval(interval);
        setIsPlaying(false);
        showToast('Fim da história!');
        // Volta para o frame atual
        goToFrame(currentFrame);
      }
    }, 1000 / fps);
  };

  const downloadPage = () => {
    const canvas = canvasState;
    if (!canvas) return;
    
    // Desativa seleção para o print ficar limpo
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    const link = document.createElement('a');
    link.download = `hq-pagina-${currentFrame + 1}.png`;
    link.href = dataURL;
    link.click();
    showToast('🖼 Foto da página baixada!');
  };

  const downloadProject = () => {
    saveCurrentFrame();
    const project = {
      name: 'Minha HQ',
      frames,
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'projeto-hq.json';
    link.href = url;
    link.click();
    showToast('💾 Projeto salvo!');
  };

  const downloadFullStrip = async () => {
    if (frames.length === 0) return;
    saveCurrentFrame();
    showToast('⏳ Gerando HQ completa...');

    setTimeout(async () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 600;
      tempCanvas.height = 450 * frames.length;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      for (let i = 0; i < frames.length; i++) {
        const img = new Image();
        img.src = frames[i].thumb;
        await new Promise(r => { img.onload = r; });
        ctx.drawImage(img, 0, i * 450);
      }

      const link = document.createElement('a');
      link.download = 'hq-completa-tira.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
      showToast('📜 HQ Completa pronta!');
    }, 500);
  };

  const recordVideo = async () => {
    if (frames.length < 2) return showToast('Adicione mais páginas!');
    const canvas = canvasRef.current;
    if (!canvas) return;

    saveCurrentFrame();
    showToast('🎬 Gravando vídeo...');
    
    try {
      const stream = (canvas as any).captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meu-filme-hq.webm';
        link.click();
        showToast('✅ Filme concluído!');
      };

      mediaRecorder.start();
      setIsPlaying(true);
      
      let idx = 0;
      const playInterval = setInterval(() => {
        const f = frames[idx];
        if(f) canvasState?.loadFromJSON(f.data, () => canvasState?.renderAll());
        idx++;
        if (idx >= frames.length) {
          clearInterval(playInterval);
          setTimeout(() => {
            mediaRecorder.stop();
            setIsPlaying(false);
            goToFrame(currentFrame);
          }, 1000);
        }
      }, 1000 / fps);

    } catch (err) {
      console.error(err);
      showToast('❌ Erro ao gravar vídeo');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const pushUndoState = (c: fabric.Canvas) => {
    const json = JSON.stringify(c.toJSON(['id','locked']));
    setUndoStack(prev => {
      if (prev[prev.length - 1] === json) return prev;
      const next = [...prev, json];
      if (next.length > 50) next.shift();
      return next;
    });
    setRedoStack([]);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Check if fabric is loaded (sometimes it glitches on nextjs strict mode if double initialized)
    if (canvasState) return; // already initialized

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      width: 600,
      height: 450
    });

    setCanvasState(initCanvas);

    // Initial Welcome Text
    setTimeout(() => {
      const t = new fabric.Text('POW!', { left: 60, top: 40, fontFamily: 'Bangers', fontSize: 48, fill: '#ffd60a', stroke: '#1a1a2e', strokeWidth: 2, angle: -12, selectable: true });
      const t2 = new fabric.Text('COMIC\nMAKER', { left: 160, top: 120, fontFamily: 'Bangers', fontSize: 52, fill: '#e63946', stroke: '#1a1a2e', strokeWidth: 2, angle: 5, textAlign: 'center', selectable: true });
      const t3 = new fabric.Text('Crie suas HQs! ✦', { left: 40, top: 290, fontFamily: 'Permanent Marker', fontSize: 22, fill: '#2a9d8f', selectable: true });
      initCanvas.add(t, t2, t3);
      initCanvas.renderAll();
      pushUndoState(initCanvas);
      
      // Inicializa o primeiro frame
      const data = initCanvas.toJSON(['id', 'locked']);
      const thumb = initCanvas.toDataURL({ format: 'png', quality: 0.1 });
      setFrames([{ data, thumb }]);
      
      showToast('🎉 Bem-vindo ao Comic Maker!');
    }, 400);

    return () => {
      initCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvasState) return;
    const resizeCanvas = () => {
      if (!wrapperRef.current) return;
      const padding = window.innerWidth < 768 ? 16 : 64;
      const availableWidth = wrapperRef.current.clientWidth - padding;
      const availableHeight = wrapperRef.current.clientHeight - padding;
      
      // Calculate scale to fit both width and height while maintaining aspect ratio (600x450 = 4:3)
      const scaleX = availableWidth / 600;
      const scaleY = availableHeight / 450;
      const scale = Math.min(1, Math.min(scaleX, scaleY));
      
      canvasState.setZoom(scale);
      canvasState.setWidth(600 * scale);
      canvasState.setHeight(450 * scale);
      canvasState.renderAll();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [canvasState]);

  useEffect(() => {
    const canvas = canvasState;
    if (!canvas) return;
    
    const handleAdd = () => pushUndoState(canvas);
    const handleMod = () => pushUndoState(canvas);

    canvas.on('object:added', handleAdd);
    canvas.on('object:modified', handleMod);

    return () => {
      canvas.off('object:added', handleAdd);
      canvas.off('object:modified', handleMod);
    };
  }, [canvasState]);

  const executeUndo = () => {
    const canvas = canvasState;
    if (undoStack.length < 2 || !canvas) return showToast('Nada para desfazer');
    const currentState = undoStack.pop();
    if (currentState) {
       setRedoStack(prev => [...prev, currentState]);
    }
    const previousState = undoStack[undoStack.length - 1];
    canvas.loadFromJSON(previousState, () => canvas.renderAll());
    setUndoStack([...undoStack]);
    showToast('↩ Desfeito');
  };

  const executeRedo = () => {
    const canvas = canvasState;
    if (!redoStack.length || !canvas) return showToast('Nada para refazer');
    const state = redoStack.pop();
    if (state) {
      setUndoStack(prev => [...prev, state]);
      canvas.loadFromJSON(state, () => canvas.renderAll());
    }
    setRedoStack([...redoStack]);
    showToast('↪ Refeito');
  };

  // Tools Setup
  useEffect(() => {
    const canvas = canvasState;
    if (!canvas) return;
    (canvas as any).isDrawingMode = (currentTool === 'draw' || currentTool === 'erase');
    (canvas as any).selection = (currentTool !== 'text');
    
    if (currentTool === 'draw') {
      let brush: any;
      if (brushType === 'CircleBrush') brush = new (fabric as any).CircleBrush(canvas);
      else if (brushType === 'SprayBrush') brush = new (fabric as any).SprayBrush(canvas);
      else brush = new (fabric as any).PencilBrush(canvas);
      
      brush.color = brushColor;
      brush.width = brushSize;
      (canvas as any).freeDrawingBrush = brush;
    } else if (currentTool === 'erase') {
      const brush = new (fabric as any).PencilBrush(canvas);
      brush.color = ((canvas as any).backgroundColor as string) || '#ffffff';
      brush.width = 20;
      (canvas as any).freeDrawingBrush = brush;
    }
  }, [currentTool, canvasState, brushColor, brushSize, brushType]);

  const addImageDataUrl = (url: string) => {
    const canvas = canvasState;
    if (!canvas) return;
    
    let finalUrl = url;
    // Se for URL externa, usar o proxy do Next.js apenas se não for exportação estática
    // Note: Em produção no Surge (static export), o proxy /_next/image não funciona.
    // Como baixamos o ET para o local, usaremos a URL direta.

    fabric.Image.fromURL(finalUrl, img => {
      if (!img || !(img as any).set) {
        showToast('❌ Erro ao carregar imagem');
        return;
      }
      if ((img.width || 0) > 300) img.scaleToWidth(200);
      img.set({ left: 50, top: 50, selectable: true });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setMobilePanel('canvas');
      showToast('🖼 Imagem adicionada');
    });
  };

  const addEmoji = (emoji: string) => {
    const canvas = canvasState;
    if (!canvas) return;
    // We get randomly generated coordinates outside of react component lifecycle since it's a callback
    const randL = Math.floor(Math.random() * 100);
    const randT = Math.floor(Math.random() * 100);
    const t = new fabric.Text(emoji, { left: 80 + randL, top: 80 + randT, fontSize: 48, selectable: true });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
    setMobilePanel('canvas');
    showToast('✓ ' + emoji + ' adicionado!');
  };

  const addTextToCanvas = () => {
    const canvas = canvasState;
    if (!canvas) return;
    const txt = textInput || 'Texto';
    const t = new fabric.IText(txt, { left: 50, top: 50, fontFamily, fontSize, fill: textColor, editable: true, selectable: true });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.renderAll();
    
    // Focar no texto e abrir teclado no celular
    setMobilePanel('canvas');
    setTimeout(() => {
      canvas.calcOffset();
      t.enterEditing();
      t.selectAll();
      canvas.renderAll();
    }, 300);

    setTextInput('');
    showToast('✓ Texto adicionado!');
  };

  const deleteSelected = () => {
    const canvas = canvasState;
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    if (!objs.length) return showToast('Nada selecionado');
    objs.forEach(o => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.renderAll();
    showToast('🗑 Deletado');
  };

  const clearCanvas = () => {
    const canvas = canvasState;
    if (!canvas) return;
    if (!confirm('Limpar o canvas? Esta ação não pode ser desfeita!')) return;
    canvas.clear();
    (canvas as any).backgroundColor = '#ffffff';
    canvas.renderAll();
    setUndoStack([]);
    pushUndoState(canvas);
    showToast('✕ Canvas limpo');
  };
  
  const handleObjectAction = (action: string) => {
    const canvas = canvasState;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj && action !== 'clear') return showToast('Nada selecionado');

    switch (action) {
      case 'duplicate':
        obj?.clone((clone: any) => {
          clone.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
          canvas.add(clone);
          canvas.setActiveObject(clone);
          canvas.renderAll();
        });
        showToast('⧉ Duplicado');
        break;
      case 'flipH':
        if(obj) { obj.set('flipX', !obj.flipX); canvas.renderAll(); showToast('↔ Espelhado'); }
        break;
      case 'flipV':
         if(obj) { obj.set('flipY', !obj.flipY); canvas.renderAll(); showToast('↕ Espelhado'); }
        break;
      case 'front':
        if(obj) { canvas.bringToFront(obj); canvas.renderAll(); showToast('⬆ Frente'); }
        break;
      case 'back':
        if(obj) { canvas.sendToBack(obj); canvas.renderAll(); showToast('⬇ Fundo'); }
        break;
      case 'lock':
        if (obj) {
          const locked = !(obj as any).locked;
          (obj as any).locked = locked;
          obj.selectable = !locked;
          obj.evented = !locked;
          canvas.discardActiveObject();
          canvas.renderAll();
          showToast(locked ? '🔒 Travado' : '🔓 Destravado');
        }
        break;
    }
  };

  // Bg & FX
  const setBgColor = (color: string) => {
    const canvas = canvasState;
    if (!canvas) return;
    (canvas as any).backgroundColor = color;
    canvas.renderAll();
    showToast('🎨 Fundo alterado');
  };


  // Render
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-orange-50/50">
      {/* Header */}
      <header className="flex items-center px-4 py-2 border-b-4 border-red-500 bg-slate-900 text-white shrink-0 min-h-[4rem] relative z-50">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="font-bangers text-xl sm:text-2xl md:text-3xl tracking-wide text-yellow-400 drop-shadow-[2px_2px_0_#e63946] leading-none mb-1 truncate">
            ✦ CRIADOR DE HISTÓRIAS EM QUADRINHOS
          </div>
          <div className="font-comic text-[10px] sm:text-xs text-slate-300 font-bold tracking-wider uppercase truncate">
            Escola Januário E. de Lima LPT 2026
          </div>
        </div>
        <button onClick={() => setFlipbookMode(!flipbookMode)} className="btn-comic bg-yellow-400 text-slate-900 px-3 py-1.5 text-sm rounded-md hover:-translate-y-0.5 active:translate-y-0.5 transition flex items-center gap-2 shrink-0 ml-4">
          <Film size={16} /> <span className="hidden lg:inline">Flipbook</span>
        </button>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Toolbar Left (Desktop) */}
        <div className="hidden md:flex w-14 bg-slate-900 border-r border-slate-700 flex-col items-center py-4 gap-3 shrink-0 overflow-y-auto z-10">
          {[
            { id: 'select', icon: MousePointer2, label: 'Select' },
            { id: 'draw', icon: Pencil, label: 'Draw' },
            { id: 'erase', icon: Eraser, label: 'Erase' },
            { id: 'text', icon: Type, label: 'Text' },
          ].map(t => (
            <button key={t.id} onClick={() => setCurrentTool(t.id)} 
              className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-white", currentTool === t.id ? "bg-red-500" : "hover:bg-slate-700")}
              title={t.label}>
              <t.icon size={20} />
            </button>
          ))}
          <div className="w-8 h-[1px] bg-slate-700 my-2" />
          <button onClick={executeUndo} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Undo"><Undo2 size={18} /></button>
          <button onClick={executeRedo} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Redo"><Redo2 size={18} /></button>
          <button onClick={() => handleObjectAction('duplicate')} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Duplicate"><Copy size={18} /></button>
          <button onClick={deleteSelected} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Delete"><Trash2 size={18} /></button>
          <div className="w-8 h-[1px] bg-slate-700 my-2" />
          <button onClick={() => handleObjectAction('flipH')} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Flip H"><FlipHorizontal size={18} /></button>
          <button onClick={() => handleObjectAction('flipV')} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Flip V"><FlipVertical size={18} /></button>
          <button onClick={() => handleObjectAction('front')} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Bring to Front"><BringToFront size={18} /></button>
          <button onClick={() => handleObjectAction('back')} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Send to Back"><SendToBack size={18} /></button>
          <button onClick={() => handleObjectAction('lock')} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white" title="Lock"><Lock size={18} /></button>
          <div className="flex-1" />
          <button onClick={clearCanvas} className="w-10 h-10 rounded-lg flex items-center justify-center text-orange-400 hover:bg-slate-700" title="Clear Canvas"><XCircle size={20} /></button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-stone-200 overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative" ref={wrapperRef}>
          {flipbookMode && (
             <div className="w-full max-w-2xl bg-white p-3 rounded-xl border-4 border-slate-900 shadow-[4px_4px_0_#1a1a2e] mb-4 flex gap-3 overflow-x-auto items-center shrink-0 custom-scrollbar">
                <div className="font-bangers text-xl shrink-0">🎬 PÁGINAS</div>
                <div className="flex gap-2 min-w-max">
                  {frames.map((f, i) => (
                    <button key={i} onClick={() => goToFrame(i)} className={cn(
                      "w-16 h-12 border-2 rounded overflow-hidden transition-all bg-slate-100 flex-shrink-0 relative",
                      currentFrame === i ? "border-red-500 ring-2 ring-red-200 scale-105" : "border-slate-400 opacity-70"
                    )}>
                      {f.thumb ? <img src={f.thumb} alt={`page ${i}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">{i+1}</div>}
                      <div className="absolute top-0 right-0 bg-slate-800 text-white text-[8px] px-1">{i+1}</div>
                    </button>
                  ))}
                  <button className="w-12 h-12 border-2 border-dashed border-slate-400 rounded flex items-center justify-center text-slate-400 hover:border-red-500 hover:text-red-500 flex-shrink-0" onClick={addNewFrame}>+</button>
                </div>
                
                <div className="w-px h-8 bg-slate-200 shrink-0 mx-2" />
                
                <button 
                  disabled={isPlaying}
                  onClick={playFlipbook}
                  className={cn("btn-comic px-3 py-1 rounded flex items-center gap-1 whitespace-nowrap", isPlaying ? "bg-slate-300" : "bg-orange-400 hover:bg-orange-500")}
                >
                  <Play size={14}/> {isPlaying ? 'Rodando...' : 'Play HQ'}
                </button>
                <div className="flex items-center gap-2 font-comic text-sm shrink-0">
                  <span>Velocidade:</span>
                  <input type="range" min="1" max="12" value={fps} onChange={e => setFps(Number(e.target.value))} className="w-16 sm:w-20" />
                </div>
             </div>
          )}
          
          <div className="bg-white border-[3px] border-slate-900 shadow-[4px_4px_0_#1a1a2e] md:shadow-[8px_8px_0_#1a1a2e] origin-top flex-shrink-0 touch-none" ref={containerRef}>
            <canvas ref={canvasRef} />
          </div>

          {/* Floating Mobile Draw Tools if Canvas is active */}
          {mobilePanel === 'canvas' && (
            <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 p-2 rounded-2xl flex gap-2 shadow-[4px_4px_0_#e63946] z-30">
               {[
                { id: 'select', icon: MousePointer2 },
                { id: 'draw', icon: Pencil },
                { id: 'erase', icon: Eraser },
                { id: 'text', icon: Type },
              ].map(t => (
                <button key={t.id} onClick={() => setCurrentTool(t.id)} 
                  className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-white", currentTool === t.id ? "bg-red-500" : "hover:bg-slate-700")}>
                  <t.icon size={20} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Tools (Responsive Slide-in on Mobile) */}
        <div className={cn(
          "bg-white flex flex-col shrink-0 z-40 transition-transform duration-300",
          "md:relative md:w-72 md:border-l-4 md:border-slate-900 md:translate-x-0 lg:w-80", // Desktop styles
          "absolute top-0 bottom-0 left-0 w-full border-slate-900", // Mobile full-overlay styles
          mobilePanel === 'assets' ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}>
          <div className="flex border-b-[3px] border-red-500 bg-slate-900 text-white">
            {[
              { id: 'stickers', label: '🎨 Sprites' },
              { id: 'text', label: '💬 Texto' },
              { id: 'bg', label: '🌆 Fundo' },
              { id: 'layout', label: '📐 Layout' },
              { id: 'export', label: '💾 Salvar' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                className={cn("flex-1 py-3 text-sm font-bangers tracking-wider transition-colors", activeTab === tab.id ? "bg-red-500 text-white" : "opacity-70 hover:opacity-100")}>
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <h3 className="font-bangers text-xl text-slate-900">Personagens & Objetos</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(spriteData).map(cat => (
                    <button key={cat} onClick={() => setActiveSpriteCat(cat)} 
                      className={cn("px-3 py-1.5 rounded-full text-xs font-bold font-comic border-2 border-slate-900 transition-colors", activeSpriteCat === cat ? "bg-yellow-400" : "bg-white hover:bg-slate-100")}>
                      {cat.split(' ')[0]} {cat.split(' ').slice(1).join(' ').substring(0, 8)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {spriteData[activeSpriteCat]?.map((sprite, i) => {
                    const isImage = sprite.startsWith('/') || sprite.startsWith('data:') || sprite.startsWith('http');
                    return (
                      <button key={i} onClick={() => isImage ? addImageDataUrl(sprite) : addEmoji(sprite)}
                        className="aspect-square bg-white border-2 border-slate-900 rounded-lg flex items-center justify-center text-3xl hover:-translate-y-1 hover:shadow-[2px_2px_0_#1a1a2e] transition-all overflow-hidden p-2">
                        {isImage ? <img src={sprite} alt="sprite" className="w-full h-full object-contain" /> : sprite}
                      </button>
                    );
                  })}
                </div>
                
                <div className="h-px bg-slate-200 my-4" />
                <h3 className="font-bangers text-lg text-slate-900">Upload Imagem</h3>
                <label className="btn-comic flex items-center justify-center gap-2 bg-orange-300 py-3 rounded-lg cursor-pointer w-full text-lg">
                  <Upload size={20} /> Escolher Arquivo
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => addImageDataUrl(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
                <p className="text-xs text-slate-500 font-comic text-center mt-2">Dica: Selecione {`"👽 ET / Personagem"`} para achar o ET, ou faça o upload manual.</p>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="font-bangers text-xl text-slate-900 mb-2">Adicionar Texto</h3>
                <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Digite seu texto..." className="w-full border-2 border-slate-900 rounded-lg p-3 font-comic text-sm outline-none focus:ring-2 focus:ring-red-500" />
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 font-comic mb-1 block">Fonte</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full border-2 border-slate-900 rounded-lg p-2 font-comic text-sm bg-white">
                      <option value="Comic Neue">Comic Neue</option>
                      <option value="Bangers">Bangers</option>
                      <option value="Permanent Marker">Permanente</option>
                      <option value="Special Elite">Máquina</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-slate-500 font-comic mb-1 block">Tamanho</label>
                    <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full border-2 border-slate-900 rounded-lg p-2 font-comic text-sm" />
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                   <div>
                    <label className="text-xs text-slate-500 font-comic mb-1 block">Cor</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-10 border-2 border-slate-900 rounded cursor-pointer" />
                   </div>
                </div>

                <button onClick={addTextToCanvas} className="btn-comic w-full bg-slate-900 text-white py-3 rounded-lg text-lg flex items-center justify-center gap-2">
                   <Type size={18} /> INSERIR TEXTO
                </button>

                <div className="h-px bg-slate-200 my-6" />
                <h3 className="font-bangers text-xl text-slate-900 mb-2">Onomatopeias</h3>
                <div className="flex flex-wrap gap-2">
                  {onomatopeias.map(w => (
                    <button key={w} onClick={() => {
                      const t = new fabric.Text(w, { left: 150, top: 150, fontFamily: 'Bangers', fontSize: 32, fill: '#ffd60a', stroke: '#1a1a2e', strokeWidth: 2, angle: -5 + Math.random()*10 });
                      canvasState?.add(t);
                      canvasState?.setActiveObject(t);
                      setMobilePanel('canvas');
                    }} className="btn-comic bg-red-500 text-white px-3 py-1 rounded text-sm hover:-translate-y-1 transition-transform">
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bg' && (
              <div className="space-y-4">
                <h3 className="font-bangers text-xl text-slate-900">Cor de Fundo</h3>
                <div className="flex flex-wrap gap-2">
                  {bgColors.map((c, i) => (
                    <button key={i} onClick={() => setBgColor(c)} className="w-8 h-8 rounded-full border-2 border-slate-900 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="text-xs text-slate-500 font-comic mb-1 block">Cor personalizada</label>
                  <input type="color" onChange={e => setBgColor(e.target.value)} className="w-full h-12 border-2 border-slate-900 rounded-lg cursor-pointer" />
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <h3 className="font-bangers text-xl text-slate-900 border-b-2 border-slate-100 pb-2">Layout dos Quadros</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'empty', label: 'Único', icon: <div className="w-full h-full border-2 border-slate-900 rounded" /> },
                    { id: 'v2', label: '2 Verticais', icon: <div className="w-full h-full border-2 border-slate-900 rounded flex"><div className="w-1/2 border-r-2 border-slate-900" /><div className="w-1/2" /></div> },
                    { id: 'h2', label: '2 Horizontais', icon: <div className="w-full h-full border-2 border-slate-900 rounded flex flex-col"><div className="h-1/2 border-b-2 border-slate-900" /><div className="h-1/2" /></div> },
                    { id: 'g4', label: 'Grade 4', icon: <div className="w-full h-full border-2 border-slate-900 rounded grid grid-cols-2 grid-rows-2"><div className="border-r-2 border-b-2 border-slate-900" /><div className="border-b-2 border-slate-900" /><div className="border-r-2 border-slate-900" /><div /></div> },
                    { id: 'v3', label: '3 Verticais', icon: <div className="w-full h-full border-2 border-slate-900 rounded flex"><div className="w-1/3 border-r-2 border-slate-900" /><div className="w-1/3 border-r-2 border-slate-900" /><div className="w-1/3" /></div> },
                  ].map(l => (
                    <button key={l.id} onClick={() => applyLayout(l.id)} className="group flex flex-col items-center gap-2">
                       <div className="w-full aspect-video bg-white p-2 border-4 border-slate-900 shadow-[4px_4px_0_#1a1a2e] group-hover:-translate-y-1 transition-transform">
                          {l.icon}
                       </div>
                       <span className="font-comic text-xs font-bold uppercase">{l.label}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg border-2 border-yellow-400 text-[10px] font-comic leading-tight">
                  💡 <b>Dica:</b> O layout adiciona linhas guia permanentes que dividem sua história em quadros.
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <h3 className="font-bangers text-xl text-slate-900 border-b-2 border-slate-100 pb-2">Exportar sua História</h3>
                
                <div className="space-y-3">
                  <button onClick={downloadPage} className="w-full btn-comic bg-emerald-500 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg">
                    <ImageIcon size={24} /> PÁGINA ATUAL (PNG)
                  </button>
                </div>

                <div className="space-y-3">
                  <button onClick={downloadFullStrip} className="w-full btn-comic bg-yellow-400 text-slate-900 py-4 rounded-xl flex items-center justify-center gap-3 text-lg">
                    <Columns size={24} /> HQ COMPLETA (TIRA)
                  </button>
                   <p className="text-[10px] text-slate-500 font-comic text-center">Gera uma única imagem longa com todas as suas páginas.</p>
                </div>

                <div className="space-y-3">
                  <button onClick={recordVideo} className="w-full btn-comic bg-red-500 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg">
                    <Film size={24} /> BAIXAR FILME (VIDEO)
                  </button>
                   <p className="text-[10px] text-slate-500 font-comic text-center">Transforma sua HQ em um vídeo animado (WebM).</p>
                </div>

                <div className="h-px bg-slate-200 my-2" />

                <div className="space-y-3">
                  <button onClick={downloadProject} className="w-full btn-comic bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg">
                    <Download size={24} /> SALVAR PROJETO (JSON)
                  </button>
                   <p className="text-[10px] text-slate-500 font-comic text-center">Salva o arquivo do projeto para você continuar editando depois.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                   <h4 className="font-bangers text-blue-800 text-sm mb-1">Como entregar a tarefa?</h4>
                   <p className="text-[11px] text-blue-700 font-comic leading-relaxed">
                     1. Baixe cada página da sua história usando o botão verde.<br/>
                     2. Você pode imprimir as imagens ou enviá-las para o seu professor.
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Draw Tools (Persistent inside Assets sidebar) */}
          <div className="p-4 border-t-4 border-slate-900 bg-orange-50 shrink-0">
             <h3 className="font-bangers text-lg text-slate-900 mb-2 flex items-center gap-2"><Paintbrush size={18}/> Opções de Pincel</h3>
             <div className="flex flex-wrap gap-1.5 mb-3">
                {palette.slice(0, 10).map((c, i) => (
                  <button key={i} onClick={() => setBrushColor(c)} className={cn("w-6 h-6 rounded-full border-2 transition-transform", brushColor === c ? "border-white ring-2 ring-slate-900 scale-110" : "border-slate-900 hover:scale-110")} style={{ backgroundColor: c }} />
                ))}
             </div>
             <div className="flex items-center gap-3 mb-2">
               <input type="range" min="1" max="40" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-1" />
               <span className="font-comic text-xs font-bold w-8 text-right">{brushSize}px</span>
             </div>
             <select value={brushType} onChange={e => setBrushType(e.target.value)} className="w-full border-2 border-slate-900 rounded p-1.5 font-comic text-xs">
                <option value="PencilBrush">Lápis</option>
                <option value="CircleBrush">Círculo</option>
                <option value="SprayBrush">Spray</option>
             </select>
          </div>
        </div>

        {/* Actions Drawer (Mobile Only) */}
        <div className={cn(
          "md:hidden absolute top-0 bottom-0 left-0 w-full bg-slate-900 z-40 p-6 overflow-y-auto transition-transform duration-300 text-white",
          mobilePanel === 'actions' ? "translate-x-0" : "translate-x-full"
        )}>
          <h2 className="font-bangers text-2xl text-yellow-400 mb-6 drop-shadow-[2px_2px_0_#e63946]">🛠️ Ações Gerais</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             <button onClick={executeUndo} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><Undo2 size={24} /> Desfazer</button>
             <button onClick={executeRedo} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><Redo2 size={24} /> Refazer</button>
             <button onClick={() => { handleObjectAction('duplicate'); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><Copy size={24} /> Duplicar</button>
             <button onClick={() => { deleteSelected(); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 text-red-400 hover:bg-slate-700"><Trash2 size={24} /> Deletar</button>
             <button onClick={() => { handleObjectAction('flipH'); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><FlipHorizontal size={24} /> Espelhar H</button>
             <button onClick={() => { handleObjectAction('flipV'); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><FlipVertical size={24} /> Espelhar V</button>
             <button onClick={() => { handleObjectAction('front'); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><BringToFront size={24} /> P/ Frente</button>
             <button onClick={() => { handleObjectAction('back'); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><SendToBack size={24} /> P/ Fundo</button>
             <button onClick={() => { handleObjectAction('lock'); setMobilePanel('canvas'); }} className="bg-slate-800 p-3 rounded-lg flex flex-col items-center gap-2 hover:bg-slate-700"><Lock size={24} /> Travar/Destr.</button>
          </div>

          <div className="h-px bg-slate-700 my-6" />

          <button onClick={() => { clearCanvas(); setMobilePanel('canvas'); }} className="w-full bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg flex items-center justify-center gap-2 font-bold font-bangers tracking-wider text-xl">
            <XCircle size={24} /> LIMPAR CANVAS
          </button>
        </div>
      </div>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden h-16 shrink-0 bg-slate-900 border-t-4 border-red-500 flex items-center justify-around z-50 text-white font-bangers tracking-wider text-sm w-full relative">
        <button onClick={() => setMobilePanel('canvas')} className={cn("flex flex-col items-center gap-1 w-1/3 py-2", mobilePanel === 'canvas' ? "text-yellow-400 bg-slate-800" : "")}>
          <PictureInPicture size={20} /> Tela
        </button>
        <div className="w-px h-8 bg-slate-700" />
        <button onClick={() => setMobilePanel('assets')} className={cn("flex flex-col items-center gap-1 w-1/3 py-2", mobilePanel === 'assets' ? "text-yellow-400 bg-slate-800" : "")}>
          <Package size={20} /> Recursos
        </button>
        <div className="w-px h-8 bg-slate-700" />
        <button onClick={() => setMobilePanel('actions')} className={cn("flex flex-col items-center gap-1 w-1/3 py-2", mobilePanel === 'actions' ? "text-yellow-400 bg-slate-800" : "")}>
          <Wrench size={20} /> Ações
        </button>
      </nav>

      {/* Footer */}
      <footer className="shrink-0 bg-slate-950 text-slate-400 border-t border-slate-800 py-2 px-2 text-center font-comic text-[10px] sm:text-xs z-50">
        Desenvolvido pelo Profº. Sérgio Araújo para as turmas de LPT - Literatura e Produção Textual
      </footer>

      {toastMsg && (
        <div className="fixed bottom-[4.5rem] md:bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-lg border-2 border-red-500 font-bangers tracking-wider shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-[60]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
