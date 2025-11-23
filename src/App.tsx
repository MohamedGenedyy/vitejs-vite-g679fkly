import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Activity, Calendar, Dumbbell, Plus, Trash2, Save, 
  Sparkles, MessageSquare, Utensils, Clock, AlertCircle, Send, 
  Edit2, X, Check, GripVertical 
} from 'lucide-react';

// --- API Configuration ---
const apiKey = ""; // API Key injected by environment

// --- Type Definitions ---
type ExerciseDetail = {
  id: string;
  name: string;
  sets: string;
  reps: string;
};

type WorkoutDay = {
  day: string;
  focus: string;
  exercises: ExerciseDetail[];
};

type LogEntry = {
  id: string;
  date: string;
  exercise: string;
  weight: number;
};

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

// --- Default Data Generators ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultWeek1: WorkoutDay[] = [
  { 
    day: 'Day 1', 
    focus: 'Anterior (Front)', 
    exercises: [
      { id: '1', name: 'Bench Press', sets: '3', reps: '8-12' },
      { id: '2', name: 'Squats', sets: '3', reps: '8-10' },
      { id: '3', name: 'Overhead Press', sets: '3', reps: '10-12' },
      { id: '4', name: 'Leg Extensions', sets: '3', reps: '12-15' },
      { id: '5', name: 'Plank', sets: '3', reps: '60s' }
    ] 
  },
  { 
    day: 'Day 2', 
    focus: 'Posterior (Back)', 
    exercises: [
      { id: '6', name: 'Deadlift', sets: '3', reps: '5-8' },
      { id: '7', name: 'Pull Ups', sets: '3', reps: 'Failure' },
      { id: '8', name: 'Barbell Rows', sets: '3', reps: '8-12' },
      { id: '9', name: 'Hamstring Curls', sets: '3', reps: '12-15' },
      { id: '10', name: 'Face Pulls', sets: '3', reps: '15-20' }
    ] 
  },
  { 
    day: 'Day 3', 
    focus: 'Active Rest', 
    exercises: [
      { id: '11', name: 'Boxing / Bag Work', sets: '5', reps: '3 mins' },
      { id: '12', name: 'Light Cardio', sets: '1', reps: '30 mins' }
    ] 
  },
  { 
    day: 'Day 4', 
    focus: 'Arnold - Chest & Back', 
    exercises: [
      { id: '13', name: 'Incline Bench', sets: '3', reps: '8-12' },
      { id: '14', name: 'T-Bar Row', sets: '3', reps: '10-12' },
      { id: '15', name: 'Dumbbell Flys', sets: '3', reps: '12-15' },
      { id: '16', name: 'Lat Pulldowns', sets: '3', reps: '10-12' }
    ] 
  },
  { 
    day: 'Day 5', 
    focus: 'Arnold - Shoulders & Arms', 
    exercises: [
      { id: '17', name: 'Arnold Press', sets: '3', reps: '10-12' },
      { id: '18', name: 'Lateral Raises', sets: '4', reps: '15' },
      { id: '19', name: 'Barbell Curls', sets: '3', reps: '10-12' },
      { id: '20', name: 'Skullcrushers', sets: '3', reps: '10-12' }
    ] 
  },
  { 
    day: 'Day 6', 
    focus: 'Arnold - Legs', 
    exercises: [
      { id: '21', name: 'Front Squat', sets: '3', reps: '8-10' },
      { id: '22', name: 'Lunges', sets: '3', reps: '12/leg' },
      { id: '23', name: 'Calf Raises', sets: '4', reps: '15-20' }
    ] 
  },
  { 
    day: 'Day 7', 
    focus: 'Rest', 
    exercises: [
      { id: '24', name: 'Stretching / Mobility', sets: '1', reps: '20 mins' }
    ] 
  },
];

const defaultWeek2: WorkoutDay[] = [
  { 
    day: 'Day 1', 
    focus: 'Anterior (Front)', 
    exercises: [
      { id: 'w2-1', name: 'Dumbbell Press', sets: '3', reps: '8-12' },
      { id: 'w2-2', name: 'Leg Press', sets: '3', reps: '10-12' },
      { id: 'w2-3', name: 'Military Press', sets: '3', reps: '8-10' }
    ] 
  },
  { 
    day: 'Day 2', 
    focus: 'Posterior (Back)', 
    exercises: [
      { id: 'w2-4', name: 'Rack Pulls', sets: '3', reps: '6-8' },
      { id: 'w2-5', name: 'Chin Ups', sets: '3', reps: 'Failure' },
      { id: 'w2-6', name: 'Glute Bridges', sets: '3', reps: '12' }
    ] 
  },
  { 
    day: 'Day 3', 
    focus: 'Active Rest', 
    exercises: [
      { id: 'w2-7', name: 'Cardio & Boxing', sets: '1', reps: '45 mins' }
    ] 
  },
  { 
    day: 'Day 4', 
    focus: 'Push', 
    exercises: [
      { id: 'w2-8', name: 'Bench Press', sets: '3', reps: '5-8' },
      { id: 'w2-9', name: 'Dumbbell Shoulder Press', sets: '3', reps: '8-12' },
      { id: 'w2-10', name: 'Tricep Pushdowns', sets: '3', reps: '12-15' }
    ] 
  },
  { 
    day: 'Day 5', 
    focus: 'Pull', 
    exercises: [
      { id: 'w2-11', name: 'Deadlift', sets: '3', reps: '5' },
      { id: 'w2-12', name: 'Lat Pulldown', sets: '3', reps: '10-12' },
      { id: 'w2-13', name: 'Hammer Curls', sets: '3', reps: '12' }
    ] 
  },
  { 
    day: 'Day 6', 
    focus: 'Legs', 
    exercises: [
      { id: 'w2-14', name: 'Squat', sets: '3', reps: '5-8' },
      { id: 'w2-15', name: 'RDL', sets: '3', reps: '8-10' },
      { id: 'w2-16', name: 'Leg Extensions', sets: '3', reps: '15' }
    ] 
  },
  { 
    day: 'Day 7', 
    focus: 'Rest', 
    exercises: [
      { id: 'w2-17', name: 'Full Recovery', sets: '-', reps: '-' }
    ] 
  },
];

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Custom SVG Line Chart
const ProgressChart = ({ data }) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        Add at least 2 logs for this exercise to see a graph
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const minWeight = Math.min(...sortedData.map(d => d.weight)) * 0.9;
  const maxWeight = Math.max(...sortedData.map(d => d.weight)) * 1.1;
  const weightRange = maxWeight - minWeight || 10;
  const padding = 40;
  const width = 600;
  const height = 300;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = sortedData.map((d, i) => {
    const x = padding + (i / (sortedData.length - 1)) * innerWidth;
    const y = height - padding - ((d.weight - minWeight) / weightRange) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="2" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
        {sortedData.map((d, i) => {
          const x = padding + (i / (sortedData.length - 1)) * innerWidth;
          const y = height - padding - ((d.weight - minWeight) / weightRange) * innerHeight;
          return (
            <g key={d.id}>
              <circle cx={x} cy={y} r="5" fill="white" stroke="#2563eb" strokeWidth="2" />
              <text x={x} y={y - 15} textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="bold">{d.weight}kg</text>
              <text x={x} y={height - padding + 20} textAnchor="middle" fill="#64748b" fontSize="10">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function GymTracker() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Schedule State
  const [week1, setWeek1] = useState<WorkoutDay[]>(defaultWeek1);
  const [week2, setWeek2] = useState<WorkoutDay[]>(defaultWeek2);
  
  // Editing State
  const [editingDay, setEditingDay] = useState<{ week: 1 | 2, dayIndex: number } | null>(null);
  const [editFormDay, setEditFormDay] = useState<WorkoutDay | null>(null);

  // Tracker State
  const [exerciseInput, setExerciseInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [selectedExerciseForGraph, setSelectedExerciseForGraph] = useState('All');

  // AI State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ role: 'model', text: 'Hi! I am your AI Gym Coach. How can I help you with your workout today?' }]);
  const [userQuery, setUserQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Initial Data Load ---
  useEffect(() => {
    const savedLogs = localStorage.getItem('gymLogs');
    const savedWeek1 = localStorage.getItem('gymWeek1');
    const savedWeek2 = localStorage.getItem('gymWeek2');

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedWeek1) setWeek1(JSON.parse(savedWeek1));
    if (savedWeek2) setWeek2(JSON.parse(savedWeek2));
  }, []);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('gymLogs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('gymWeek1', JSON.stringify(week1));
  }, [week1]);

  useEffect(() => {
    localStorage.setItem('gymWeek2', JSON.stringify(week2));
  }, [week2]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  // --- Schedule Editing Logic ---
  const handleEditClick = (weekNum: 1 | 2, dayIndex: number) => {
    const dayData = weekNum === 1 ? week1[dayIndex] : week2[dayIndex];
    setEditingDay({ week: weekNum, dayIndex });
    setEditFormDay(JSON.parse(JSON.stringify(dayData))); // Deep copy
  };

  const handleUpdateExercise = (exId: string, field: keyof ExerciseDetail, value: string) => {
    if (!editFormDay) return;
    const updatedExercises = editFormDay.exercises.map(ex => 
      ex.id === exId ? { ...ex, [field]: value } : ex
    );
    setEditFormDay({ ...editFormDay, exercises: updatedExercises });
  };

  const handleAddExerciseToForm = () => {
    if (!editFormDay) return;
    const newEx: ExerciseDetail = { id: generateId(), name: '', sets: '3', reps: '10' };
    setEditFormDay({ ...editFormDay, exercises: [...editFormDay.exercises, newEx] });
  };

  const handleRemoveExerciseFromForm = (exId: string) => {
    if (!editFormDay) return;
    setEditFormDay({ ...editFormDay, exercises: editFormDay.exercises.filter(ex => ex.id !== exId) });
  };

  const handleSaveDay = () => {
    if (!editingDay || !editFormDay) return;
    
    if (editingDay.week === 1) {
      const newWeek = [...week1];
      newWeek[editingDay.dayIndex] = editFormDay;
      setWeek1(newWeek);
    } else {
      const newWeek = [...week2];
      newWeek[editingDay.dayIndex] = editFormDay;
      setWeek2(newWeek);
    }
    setEditingDay(null);
    setEditFormDay(null);
  };

  // --- Tracker Logic ---
  const handleAddLog = (e) => {
    e.preventDefault();
    if (!exerciseInput || !weightInput || !dateInput) return;

    const newLog = {
      id: Date.now().toString(),
      date: dateInput,
      exercise: exerciseInput,
      weight: parseFloat(weightInput)
    };

    setLogs([newLog, ...logs]);
    setWeightInput('');
  };

  const handleDeleteLog = (id) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const uniqueExercises = useMemo(() => {
    // Collect exercises from logs AND schedule
    const logExercises = logs.map(l => l.exercise);
    const w1Exercises = week1.flatMap(d => d.exercises.map(e => e.name));
    const w2Exercises = week2.flatMap(d => d.exercises.map(e => e.name));
    
    const all = new Set([...logExercises, ...w1Exercises, ...w2Exercises]);
    // Filter out empty strings
    return Array.from(all).filter(Boolean).sort();
  }, [logs, week1, week2]);

  const filteredLogsForGraph = useMemo(() => {
    if (selectedExerciseForGraph === 'All') return [];
    return logs.filter(l => l.exercise === selectedExerciseForGraph);
  }, [logs, selectedExerciseForGraph]);

  // --- Gemini API Logic ---
  const callGemini = async (prompt: string, contextType: 'general' | 'logs' = 'general') => {
    setIsAiLoading(true);
    const newHistory = [...chatHistory, { role: 'user', text: prompt }];
    setChatHistory(newHistory);
    setUserQuery('');

    try {
      let systemContext = `You are an expert fitness coach. 
      Current User Schedule Week 1: ${JSON.stringify(week1.map(d => ({ day: d.day, focus: d.focus, exercises: d.exercises.map(e => e.name).join(', ') })))}
      Current User Schedule Week 2: ${JSON.stringify(week2.map(d => ({ day: d.day, focus: d.focus, exercises: d.exercises.map(e => e.name).join(', ') })))}
      `;

      if (contextType === 'logs') {
        const recentLogs = logs.slice(0, 20).map(l => `${l.date}: ${l.exercise} @ ${l.weight}kg`).join('\n');
        systemContext += `\n\nUser logs:\n${recentLogs}`;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `System Context: ${systemContext}\n\nUser Question: ${prompt}` }] }]
        })
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Connection error. Please try again.";
      setChatHistory([...newHistory, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: 'model', text: "Error connecting to AI service." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickPrompt = (type: string) => {
    let prompt = "";
    switch(type) {
      case 'analyze': prompt = "Analyze my recent lifting logs. Am I being consistent? Do you see any progress trends?"; callGemini(prompt, 'logs'); return;
      case 'meal': prompt = "Suggest a high-protein post-workout meal based on my most recent workout focus."; break;
      case 'shorten': prompt = "I have only 30 mins today. Modify today's scheduled workout to be shorter but intense."; break;
      case 'form': prompt = "Give me form tips for the main compound movement in today's workout."; break;
    }
    callGemini(prompt, 'general');
  };

  const renderScheduleWeek = (weekData: WorkoutDay[], weekNum: 1 | 2) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {weekData.map((day, idx) => (
        <Card key={idx} className="flex flex-col h-full hover:border-blue-300 transition-colors group relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${weekNum === 1 ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {day.day}
              </span>
              <h3 className="font-bold text-slate-800 mt-2">{day.focus}</h3>
            </div>
            <button 
              onClick={() => handleEditClick(weekNum, idx)}
              className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
              title="Edit Exercises"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 space-y-2 mt-2">
            {day.exercises.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No exercises added.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {day.exercises.map((ex) => (
                  <li key={ex.id} className="flex justify-between items-center text-slate-600 border-b border-slate-50 pb-1 last:border-0">
                    <span className="truncate flex-1 font-medium">{ex.name}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2 bg-slate-50 px-1.5 py-0.5 rounded">
                      {ex.sets} x {ex.reps}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Edit Modal */}
      <Modal 
        isOpen={!!editingDay} 
        onClose={() => { setEditingDay(null); setEditFormDay(null); }}
        title={editFormDay ? `Edit ${editFormDay.day}: ${editFormDay.focus}` : 'Edit Workout'}
      >
        {editFormDay && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Focus Area</label>
              <input 
                type="text" 
                value={editFormDay.focus}
                onChange={(e) => setEditFormDay({ ...editFormDay, focus: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Exercises</label>
                <div className="flex gap-4 text-xs font-semibold text-slate-400 mr-8">
                  <span className="w-12 text-center">Sets</span>
                  <span className="w-12 text-center">Reps</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {editFormDay.exercises.map((ex) => (
                  <div key={ex.id} className="flex gap-2 items-center group">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />
                    <input 
                      type="text"
                      placeholder="Exercise Name"
                      value={ex.name}
                      onChange={(e) => handleUpdateExercise(ex.id, 'name', e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded focus:border-blue-500 outline-none text-sm"
                    />
                    <input 
                      type="text"
                      placeholder="3"
                      value={ex.sets}
                      onChange={(e) => handleUpdateExercise(ex.id, 'sets', e.target.value)}
                      className="w-14 p-2 border border-slate-200 rounded focus:border-blue-500 outline-none text-sm text-center"
                    />
                    <input 
                      type="text"
                      placeholder="10"
                      value={ex.reps}
                      onChange={(e) => handleUpdateExercise(ex.id, 'reps', e.target.value)}
                      className="w-14 p-2 border border-slate-200 rounded focus:border-blue-500 outline-none text-sm text-center"
                    />
                    <button 
                      onClick={() => handleRemoveExerciseFromForm(ex.id)}
                      className="text-red-300 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleAddExerciseToForm}
                className="mt-3 w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Exercise
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => { setEditingDay(null); setEditFormDay(null); }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDay}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Dumbbell className="w-8 h-8" />
              Gym Tracker
            </h1>
            <p className="text-blue-100 text-sm mt-1 hidden sm:block">Anterior/Posterior + Arnold/PPL Split</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 mt-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 sticky top-24 z-10 bg-slate-50/80 backdrop-blur-sm p-2 rounded-xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'schedule' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" /> Schedule
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'tracker' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" /> Log Weights
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'progress' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" /> Graph
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ring-2 ring-indigo-400 ${
              activeTab === 'coach' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Coach
          </button>
        </div>

        {/* SCHEDULE VIEW */}
        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Week 1</span>
                Anterior/Posterior + Arnold Split
              </h2>
              {renderScheduleWeek(week1, 1)}
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">Week 2</span>
                Anterior/Posterior + PPL Split
              </h2>
              {renderScheduleWeek(week2, 2)}
            </section>
          </div>
        )}

        {/* TRACKER VIEW */}
        {activeTab === 'tracker' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Input Form */}
            <div className="md:col-span-1">
              <Card className="sticky top-28">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" /> Add Entry
                </h3>
                <form onSubmit={handleAddLog} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Exercise Name</label>
                    <input 
                      type="text" 
                      required
                      list="exercises-list"
                      placeholder="e.g. Bench Press"
                      value={exerciseInput}
                      onChange={(e) => setExerciseInput(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <datalist id="exercises-list">
                      {uniqueExercises.map(ex => <option key={ex} value={ex} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Weight (kg/lbs)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="0.0"
                      step="0.5"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Log
                  </button>
                </form>
              </Card>
            </div>

            {/* History Table */}
            <div className="md:col-span-2">
              <Card>
                <h3 className="text-lg font-bold mb-4 text-slate-800">Recent History</h3>
                {logs.length === 0 ? (
                  <p className="text-slate-400 text-center py-8 italic">No logs yet. Start training!</p>
                ) : (
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 sticky top-0">
                        <tr>
                          <th className="p-3 border-b">Date</th>
                          <th className="p-3 border-b">Exercise</th>
                          <th className="p-3 border-b">Weight</th>
                          <th className="p-3 border-b text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                          <tr key={log.id} className="group hover:bg-slate-50">
                            <td className="p-3 text-slate-500">
                              {new Date(log.date).toLocaleDateString()}
                            </td>
                            <td className="p-3 font-medium text-slate-900">{log.exercise}</td>
                            <td className="p-3 font-bold text-blue-600">{log.weight}</td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* PROGRESS GRAPH VIEW */}
        {activeTab === 'progress' && (
          <div className="animate-in fade-in duration-300">
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">Progress Visualization</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-500">Select Exercise:</label>
                  <select 
                    value={selectedExerciseForGraph}
                    onChange={(e) => setSelectedExerciseForGraph(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="All" disabled>Select an exercise...</option>
                    {uniqueExercises.length === 0 && <option disabled>No data available</option>}
                    {uniqueExercises.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {selectedExerciseForGraph === 'All' ? (
                 <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                   <LineChart className="w-12 h-12 mb-2 text-slate-300" />
                   <p>Select an exercise above to see your progress curve.</p>
                 </div>
              ) : (
                <ProgressChart data={filteredLogsForGraph} />
              )}
            </Card>
          </div>
        )}

        {/* AI COACH VIEW */}
        {activeTab === 'coach' && (
          <div className="animate-in fade-in duration-300 h-[600px] flex flex-col md:flex-row gap-4">
             {/* Left Panel: Quick Actions */}
             <div className="md:w-1/3 space-y-4">
               <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                 <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                   <Sparkles className="w-5 h-5" /> AI Coach
                 </h2>
                 <p className="text-indigo-100 text-sm">
                   Powered by Gemini ✨. <br/> Ask me about your routine, nutrition, or form!
                 </p>
               </Card>
               
               <div className="grid grid-cols-1 gap-2">
                 <button 
                  onClick={() => handleQuickPrompt('shorten')}
                  className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-left transition-all flex items-center gap-3 group"
                 >
                   <div className="bg-orange-100 p-2 rounded-lg text-orange-600 group-hover:scale-110 transition-transform"><Clock className="w-5 h-5"/></div>
                   <div>
                     <div className="font-semibold text-slate-700">Time Crunch?</div>
                     <div className="text-xs text-slate-500">Shorten today's workout</div>
                   </div>
                 </button>

                 <button 
                   onClick={() => handleQuickPrompt('meal')}
                   className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-left transition-all flex items-center gap-3 group"
                 >
                   <div className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:scale-110 transition-transform"><Utensils className="w-5 h-5"/></div>
                   <div>
                     <div className="font-semibold text-slate-700">Fuel Up</div>
                     <div className="text-xs text-slate-500">Post-workout meal idea</div>
                   </div>
                 </button>

                 <button 
                   onClick={() => handleQuickPrompt('analyze')}
                   className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-left transition-all flex items-center gap-3 group"
                 >
                   <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:scale-110 transition-transform"><Activity className="w-5 h-5"/></div>
                   <div>
                     <div className="font-semibold text-slate-700">Progress Check</div>
                     <div className="text-xs text-slate-500">Analyze my log history</div>
                   </div>
                 </button>
                 
                 <button 
                   onClick={() => handleQuickPrompt('form')}
                   className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-left transition-all flex items-center gap-3 group"
                 >
                   <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:scale-110 transition-transform"><AlertCircle className="w-5 h-5"/></div>
                   <div>
                     <div className="font-semibold text-slate-700">Form Tips</div>
                     <div className="text-xs text-slate-500">Avoid injury & lift better</div>
                   </div>
                 </button>
               </div>
             </div>

             {/* Right Panel: Chat Interface */}
             <Card className="flex-1 flex flex-col h-full md:h-auto overflow-hidden">
                <div className="flex-1 overflow-y-auto p-2 space-y-4">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                        {msg.text.split('\n').map((line, l) => <p key={l} className="mb-1">{line}</p>)}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && callGemini(userQuery)}
                    placeholder="Ask your coach anything..."
                    className="flex-1 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => callGemini(userQuery)}
                    disabled={isAiLoading || !userQuery.trim()}
                    className="bg-indigo-600 disabled:bg-indigo-300 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
             </Card>
          </div>
        )}

      </main>
    </div>
  );
}