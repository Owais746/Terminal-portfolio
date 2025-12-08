import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { processCommand } from '../utils/commandHandler';
import { personalInfo } from '../data/portfolioData';
import { stripHtml } from '../utils/stripHtml';
import { useFileSystem } from '../hooks/useFileSystem';

// Custom typing effect component
const TypingText = ({ text, speed = 20, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <div className="whitespace-pre-wrap break-words">{displayedText}</div>;
};

const Terminal = () => {
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState(() => {
    const saved = localStorage.getItem('terminal_command_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentInput, setCurrentInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('terminal_theme') || 'default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('terminal_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Boot sequence
    setTimeout(() => {
      setIsBooting(false);
      setShowWelcome(true);
    }, 2000);

    // Focus input on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Persist command history
  useEffect(() => {
    localStorage.setItem('terminal_command_history', JSON.stringify(commandHistory));
  }, [commandHistory]);

  // Keep focus on input when not typing
  useEffect(() => {
    if (!isTyping && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  // Auto-scroll during typing animation
  useEffect(() => {
    if (isTyping && outputRef.current) {
      const scrollInterval = setInterval(() => {
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }, 50);
      return () => clearInterval(scrollInterval);
    }
  }, [isTyping]);

  // File System integration
  const fs = useFileSystem();

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = currentInput.trim();

      if (input === '') return;
      if (isTyping) return; // Prevent new commands while typing

      // Add to command history
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);

      // Process command
      const result = processCommand(input, { fs, setTheme });

      if (result.type === 'clear') {
        setHistory([]);
        setShowWelcome(false);
      } else if (result.type === 'banner') {
        setShowWelcome(true);
      } else if (result.type === 'cd') {
        // cd command doesn't output anything usually, but we record the command entry
        setHistory(prev => [...prev, {
          command: input,
          output: '',
          type: 'cd',
          path: fs.pwd(), // Store path at time of execution if needed, or just current
          isTyping: false
        }]);
      } else {
        // Add command with typing animation
        setIsTyping(true);
        setHistory(prev => [...prev, {
          command: input,
          output: result.content,
          type: result.type,
          isTyping: true,
          path: fs.pwd() // Store context path
        }]);
      }

      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const input = currentInput;
      const parts = input.split(' ');

      if (parts.length === 1) {
        // Command autocomplete
        const commands = ['help', 'about', 'skills', 'projects', 'experience', 'contact', 'clear', 'ls', 'cd', 'cat', 'pwd', 'whoami', 'date', 'theme', 'sudo', 'hack'];
        const matches = commands.filter(cmd => cmd.startsWith(parts[0]));
        if (matches.length === 1) {
          setCurrentInput(matches[0] + ' ');
        }
      } else {
        // File/Argument autocomplete
        const cmd = parts[0];
        const partial = parts[parts.length - 1];
        // Only autocomplete for file-aware commands
        if (['cd', 'cat', 'ls'].includes(cmd)) {
          const matches = fs.getCompletions(partial);
          if (matches.length === 1) {
            const newParts = [...parts];
            newParts[newParts.length - 1] = matches[0];
            setCurrentInput(newParts.join(' '));
          } else if (matches.length > 1) {
            // Show options? For now just don't complete to avoid complexity
          }
        }
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([]);
      setShowWelcome(false);
    }
  };

  const handleClickAnywhere = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const HelpModal = () => (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="fixed bottom-8 right-8 z-50 w-80"
    >

    </motion.div>
  );

  const ASCIIBanner = () => (
    <pre className="text-terminal-cyan text-glow font-mono text-xs sm:text-sm md:text-base">
      {`   ____                  _     
  / __ \\                (_)    
 | |  | |_      ____ _   _ ___ 
 | |  | \\ \\ /\\ / / _\` | | / __|
 | |__| |\\ V  V / (_| | | \\__ \\
  \\____/  \\_/\\_/ \\__,_|_|_|___/
                                
  ╔═══════════════════════════════════════╗
  ║   Welcome to Owais's Dev Terminal     ║
  ║   Portfolio Terminal v2.0.25          ║
  ╚═══════════════════════════════════════╝
`}
    </pre>
  );

  const BootSequence = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-2 font-mono text-sm"
    >
      <p className="text-terminal-cyan">[<span className="text-terminal-yellow">BOOT</span>] Initializing Portfolio OS...</p>
      <p className="text-terminal-text">[<span className="text-terminal-cyan"> OK </span>] Loaded profile.conf</p>
      <p className="text-terminal-text">[<span className="text-terminal-cyan"> OK </span>] Loaded skills.db</p>
      <p className="text-terminal-text">[<span className="text-terminal-cyan"> OK </span>] Loaded projects.json</p>
      <p className="text-terminal-text">[<span className="text-terminal-cyan"> OK </span>] Loaded experience.log</p>
      <p className="text-terminal-text">[<span className="text-terminal-cyan"> OK </span>] Services initialized</p>
      <p className="text-terminal-cyan mt-4">System ready. Connection established to <span className="text-terminal-yellow">portfolio.dev</span></p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-2 sm:p-4 md:p-8" onClick={handleClickAnywhere}>

      {/* CRT Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-terminal-text/5 to-transparent opacity-10 scanline"></div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && <HelpModal />}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-black/90 rounded-lg terminal-glow overflow-hidden shadow-2xl border border-terminal-text/30"
      >
        {/* Portfolio Buttons - Top */}
        <div className="bg-terminal-text/10 px-4 py-2 border-b border-terminal-text/30">
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://i-portfolio-sandy-theta.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-terminal-cyan/10 hover:bg-terminal-cyan/20 text-terminal-cyan rounded transition-colors border border-terminal-cyan/30 text-xs font-mono"
            >
              Beautiful Portfolio: HTML
            </a>
            <a
              href="https://new-portfolio-on-next-js.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-terminal-blue/10 hover:bg-terminal-blue/20 text-terminal-blue rounded transition-colors border border-terminal-blue/30 text-xs font-mono"
            >
              Simple Portfolio: Next.js
            </a>
          </div>
        </div>

        {/* Terminal Header */}
        <div className="bg-terminal-text/10 px-4 py-2 border-b border-terminal-text/30">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-terminal-text text-xs sm:text-sm font-mono flex-1 text-center">
              <span className="text-terminal-yellow">visitor</span>@<span className="text-terminal-cyan">owais-portfolio</span>:~$
            </div>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={outputRef}
          className="p-4 sm:p-6 h-[calc(100vh-260px)] sm:h-[calc(100vh-220px)] overflow-y-auto font-mono text-xs sm:text-sm custom-scrollbar"
        >
          {/* Boot Sequence */}
          <AnimatePresence>
            {isBooting && <BootSequence />}
          </AnimatePresence>

          {/* Welcome Banner */}
          {!isBooting && showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <ASCIIBanner />
              <div className="mt-4 space-y-2">
                <TypeAnimation
                  sequence={[
                    500,
                    `Hello! I'm ${personalInfo.name}`,
                    1000,
                    `${personalInfo.role}`,
                  ]}
                  wrapper="p"
                  speed={50}
                  className="text-terminal-text text-sm sm:text-base"
                  cursor={true}
                />
                <p className="text-gray-400 mt-2">Type <span className="text-terminal-cyan">'help'</span> to see available commands</p>
              </div>
            </motion.div>
          )}

          {/* Command History */}
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-terminal-yellow">visitor</span>
                <span className="text-terminal-text/50">@</span>
                <span className="text-terminal-cyan">owais</span>
                <span className="text-terminal-text/50">:</span>
                <span className="text-terminal-blue">~</span>
                <span className="text-terminal-text/50">$</span>
                <span className="text-terminal-text">{item.command}</span>
              </div>
              {item.isTyping ? (
                <div className="text-terminal-text pl-4 typing-text">
                  <TypingText
                    text={stripHtml(item.output)}
                    speed={6.67}
                    onComplete={() => {
                      setIsTyping(false);
                      setHistory(prev => prev.map((h, idx) =>
                        idx === prev.length - 1 ? { ...h, isTyping: false } : h
                      ));
                    }}
                  />
                </div>
              ) : (
                <div
                  className="text-terminal-text pl-4 whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: item.output }}
                />
              )}
            </motion.div>
          ))}

          {/* Input Line */}
          {!isBooting && (
            <div className="flex items-center space-x-2">
              <span className="text-terminal-yellow">visitor</span>
              <span className="text-terminal-text/50">@</span>
              <span className="text-terminal-cyan">owais</span>
              <span className="text-terminal-text/50">:</span>
              <span className="text-terminal-blue">{fs.pwd()}</span>
              <span className="text-terminal-text/50">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleCommand}
                className="flex-1 bg-transparent outline-none text-terminal-text caret-terminal-text font-mono"
                style={{ color: '#00ff99', fontSize: 'inherit' }}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal Input"
                disabled={isTyping}
              />
              {!isTyping && <span className="cursor-blink text-terminal-text">▋</span>}
              {isTyping && <span className="text-terminal-yellow text-xs">⏳ Processing...</span>}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-terminal-text/5 px-4 py-2 border-t border-terminal-text/30 text-center text-xs text-gray-500">
          <span className="hidden sm:inline">Type '<span className="text-terminal-cyan">help</span>' for available commands | </span>
          <span className="text-terminal-yellow">Muhammad Owais Anwer</span> - Full Stack Developer
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 255, 153, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 153, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 153, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Terminal;
