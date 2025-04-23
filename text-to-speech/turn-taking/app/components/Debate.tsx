'use client';
 
import { useState, useRef, useEffect } from 'react';
import { mastraClient } from '@/lib/mastra-client';
 
export default function DebateInterface() {
  const [topic, setTopic] = useState('');
  const [turns, setTurns] = useState(3);
  const [isDebating, setIsDebating] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const responseRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Reset response refs when responses change
  useEffect(() => {
    responseRefs.current = responses.map(() => null);
  }, [responses.length]);
  
  // Auto-scroll to the currently playing response
  useEffect(() => {
    if (currentPlayingIndex !== null && responseRefs.current[currentPlayingIndex]) {
      responseRefs.current[currentPlayingIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentPlayingIndex]);

  // Function to start the debate
  const startDebate = async () => {
    if (!topic) return;
    
    setIsDebating(true);
    setResponses([]);
    
    try {
      const optimist = mastraClient.getAgent('optimistAgent');
      const skeptic = mastraClient.getAgent('skepticAgent');
      
      const newResponses = [];
      let optimistResponse = "";
      let skepticResponse = "";
      
      for (let turn = 1; turn <= turns; turn++) {
        // Optimist's turn
        let prompt;
        if (turn === 1) {
          prompt = `Discuss this topic: ${topic}. Introduce your perspective on it.`;
        } else {
          prompt = `The topic is: ${topic}. Skeptic just said: "${skepticResponse}". Respond to their points.`;
        }
        
        const optimistResult = await optimist.generate({
          messages: [{ role: 'user', content: prompt }],
        });
        
        optimistResponse = optimistResult.text;
        newResponses.push({
          agent: 'Optimist',
          text: optimistResponse
        });
        
        // Update UI after each response
        setResponses([...newResponses]);
        
        // Skeptic's turn
        prompt = `The topic is: ${topic}. Optimist just said: "${optimistResponse}". Respond to their points.`;
        
        const skepticResult = await skeptic.generate({
          messages: [{ role: 'user', content: prompt }],
        });
        
        skepticResponse = skepticResult.text;
        newResponses.push({
          agent: 'Skeptic',
          text: skepticResponse
        });
        
        // Update UI after each response
        setResponses([...newResponses]);
      }
    } catch (error) {
      console.error('Error starting debate:', error);
    } finally {
      setIsDebating(false);
    }
  };
 
  // Function to play audio for a specific response
  const playAudio = async (text: string, agent: string, index: number) => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      setCurrentPlayingIndex(index);
      const agentClient = mastraClient.getAgent(agent === 'Optimist' ? 'optimistAgent' : 'skepticAgent');
      
      const audioResponse = await agentClient.voice.speak(text, {
        speaker: agent === 'Optimist' ? 'alloy' : 'echo',
        speakerId: agent === 'Optimist' ? 'alloy' : 'echo',
      });
      
      if (!audioResponse.body) {
        throw new Error('No audio stream received');
      }
      
      const blob = await readStream(audioResponse.body);
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        console.log('Playing audio:', url);
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentPlayingIndex(null);
          URL.revokeObjectURL(url);
        };
        audioRef.current.onerror = (error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
          setCurrentPlayingIndex(null);
        };
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
    }
  };

  // Function to play the entire debate
  const playEntireDebate = async () => {
    if (isPlaying || responses.length === 0) return;
    
    // Start with the first response
    playNextResponse(0);
  };

  // Function to play responses sequentially
  const playNextResponse = async (index: number) => {
    if (index >= responses.length) {
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
      return;
    }

    const response = responses[index];
    
    try {
      setIsPlaying(true);
      setCurrentPlayingIndex(index);
      const agentClient = mastraClient.getAgent(response.agent === 'Optimist' ? 'optimistAgent' : 'skepticAgent');
      
      const audioResponse = await agentClient.voice.speak(response.text, {
        speaker: response.agent === 'Optimist' ? 'alloy' : 'echo',
        speakerId: response.agent === 'Optimist' ? 'alloy' : 'echo',
      });
      
      if (!audioResponse.body) {
        throw new Error('No audio stream received');
      }
      
      const blob = await readStream(audioResponse.body);
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          URL.revokeObjectURL(url);
          // Play the next response when this one ends
          playNextResponse(index + 1);
        };
        audioRef.current.onerror = (error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
          setCurrentPlayingIndex(null);
        };
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 relative">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-amber-900 mb-2">The Great Debate</h1>
          <div className="w-24 h-1 bg-amber-700 mx-auto mb-4"></div>
          <p className="text-amber-800 italic">Where ideas are challenged and perspectives collide</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-8 mb-10 border border-amber-200">
          <div className="mb-8">
            <label className="block text-amber-900 font-serif text-xl mb-3">Debate Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-4 border-2 border-amber-300 rounded-lg bg-amber-50 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="What shall we debate today?"
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-amber-900 font-serif text-xl mb-3">Number of Exchanges</label>
            <input
              type="number"
              value={turns}
              onChange={(e) => setTurns(parseInt(e.target.value))}
              min={1}
              max={10}
              className="w-full p-4 border-2 border-amber-300 rounded-lg bg-amber-50 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button
            onClick={startDebate}
            disabled={isDebating || !topic}
            className="w-full py-4 bg-amber-800 text-amber-50 rounded-lg font-serif text-xl hover:bg-amber-900 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isDebating ? 'The Debate is Underway...' : 'Commence the Debate'}
          </button>
        </div>
        
        <audio ref={audioRef} className="hidden" />
        
        {responses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-center mb-10">
              <div className="h-px bg-amber-700 flex-grow"></div>
              <h2 className="text-3xl font-serif font-bold text-amber-900 px-6">Transcript</h2>
              <div className="h-px bg-amber-700 flex-grow"></div>
            </div>
            
            <div className="space-y-8">
              {responses.map((response, index) => {
                const isOptimist = response.agent === 'Optimist';
                const isCurrentlyPlaying = currentPlayingIndex === index;
                
                return (
                  <div 
                    key={index}
                    ref={el => {
                      responseRefs.current[index] = el
                    }}
                    className={`relative ${isOptimist ? 'pl-8 pr-4' : 'pr-8 pl-4'} transition-all duration-300`}
                  >
                    <div className={`rounded-xl overflow-hidden shadow-lg border ${
                      isOptimist 
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' 
                        : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                    } ${isCurrentlyPlaying ? 'ring-2 ring-offset-2 ' + (isOptimist ? 'ring-blue-500' : 'ring-amber-500') : ''}`}>
                      <div className={`py-3 px-6 font-serif font-bold text-xl ${
                        isOptimist ? 'bg-blue-700 text-white' : 'bg-amber-700 text-white'
                      } flex justify-between items-center`}>
                        <span>{response.agent}</span>
                        {isCurrentlyPlaying && (
                          <span className="flex items-center text-sm font-normal animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Speaking...
                          </span>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{response.text}</p>
                      </div>
                    </div>
                    
                    <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                      isOptimist ? 'left-0' : 'right-0'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isOptimist ? 'bg-blue-700' : 'bg-amber-700'
                      } text-white font-bold shadow-md ${isCurrentlyPlaying ? 'animate-pulse' : ''}`}>
                        {isOptimist ? 'O' : 'S'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="text-center text-amber-700 text-sm mt-12">
          <p>© {new Date().getFullYear()} The Great Debate Series</p>
        </div>
      </div>
      
      {/* Floating Action Button for playing the entire debate */}
      {responses.length > 0 && (
        <button
          onClick={playEntireDebate}
          disabled={isPlaying}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg flex items-center justify-center hover:from-amber-700 hover:to-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
          title="Listen to the entire debate"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

const readStream = async (stream: ReadableStream): Promise<Blob> => {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return new Blob(chunks, { type: 'audio/mp3' });
};