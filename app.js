// Workout Tracker App
// ACFT-focused training with set tracking, RPE scoring, and weekly adjustments

const { useState, useEffect } = React;

// LocalStorage helper (since we can't use window.storage in standalone PWA)
const storage = {
    get: (key) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Icon components using Lucide
const Icon = ({ name, size = 24, className = "" }) => {
    const iconRef = React.useRef(null);
    
    useEffect(() => {
        if (iconRef.current && window.lucide) {
            iconRef.current.innerHTML = '';
            const icon = lucide.createElement(lucide.icons[name]);
            icon.setAttribute('width', size);
            icon.setAttribute('height', size);
            if (className) {
                className.split(' ').forEach(c => icon.classList.add(c));
            }
            iconRef.current.appendChild(icon);
        }
    }, [name, size, className]);
    
    return React.createElement('span', { ref: iconRef, className: 'inline-flex items-center justify-center' });
};

// Initial workout data with individual sets
const createWorkoutPlan = (adjustments = {}) => ({
    monday: {
        am: {
            title: "Push Day",
            duration: "45 min",
            color: "emerald",
            location: "Home",
            exercises: [
                { id: "mon-1", name: "DB Bench Press", sets: 4, reps: "6-8", rest: "90s", targetWeight: adjustments["mon-1"] || 85, notes: "Heavy compound" },
                { id: "mon-2", name: "Incline DB Press", sets: 3, reps: "8-10", rest: "75s", targetWeight: adjustments["mon-2"] || 65, notes: "30° angle" },
                { id: "mon-3", name: "Cable Flyes (Low-High)", sets: 3, reps: "12-15", rest: "60s", targetWeight: adjustments["mon-3"] || 25, notes: "Squeeze at top" },
                { id: "mon-4", name: "Seated DB Shoulder Press", sets: 4, reps: "8-10", rest: "75s", targetWeight: adjustments["mon-4"] || 60, notes: "Control descent" },
                { id: "mon-5", name: "Cable Lateral Raises", sets: 3, reps: "12-15", rest: "45s", targetWeight: adjustments["mon-5"] || 15, notes: "Slow negative" },
                { id: "mon-6", name: "Cable Tricep Pushdowns", sets: 3, reps: "12-15", rest: "45s", targetWeight: adjustments["mon-6"] || 50, notes: "Rope attachment" },
                { id: "mon-7", name: "Overhead Cable Extension", sets: 2, reps: "12-15", rest: "45s", targetWeight: adjustments["mon-7"] || 40, notes: "Full stretch" }
            ]
        },
        work: {
            title: "Accessory: Biceps/Forearms/Core",
            duration: "10-15 sets",
            color: "slate",
            location: "Work",
            exercises: [
                { id: "mon-w1", name: "Dumbbell Bicep Curls", sets: 4, reps: "12-15", rest: "-", targetWeight: adjustments["mon-w1"] || 30, notes: "Alternate arms" },
                { id: "mon-w2", name: "Hammer Curls", sets: 3, reps: "12-15", rest: "-", targetWeight: adjustments["mon-w2"] || 35, notes: "Neutral grip" },
                { id: "mon-w3", name: "Wrist Curls", sets: 3, reps: "15-20", rest: "-", targetWeight: adjustments["mon-w3"] || 20, notes: "Forearm on thigh" },
                { id: "mon-w4", name: "Reverse Wrist Curls", sets: 3, reps: "15-20", rest: "-", targetWeight: adjustments["mon-w4"] || 15, notes: "Extensors" },
                { id: "mon-w5", name: "Farmer Carry Hold", sets: 2, reps: "45-60s", rest: "-", targetWeight: adjustments["mon-w5"] || 50, notes: "SDC grip prep" },
                { id: "mon-w6", name: "Standing Crunches", sets: 2, reps: "20", rest: "-", targetWeight: 0, notes: "Contract hard" }
            ]
        }
    },
    tuesday: {
        am: {
            title: "Pull Day",
            duration: "45 min",
            color: "blue",
            location: "Home",
            exercises: [
                { id: "tue-1", name: "Hex Bar Deadlift", sets: 5, reps: "5,4,3,3,2", rest: "2-3m", targetWeight: adjustments["tue-1"] || 315, notes: "Goal: 400 lbs" },
                { id: "tue-2", name: "Bent Over DB Rows", sets: 4, reps: "8-10", rest: "75s", targetWeight: adjustments["tue-2"] || 75, notes: "Each hand" },
                { id: "tue-3", name: "Cable Lat Pulldowns", sets: 3, reps: "10-12", rest: "60s", targetWeight: adjustments["tue-3"] || 120, notes: "Wide grip" },
                { id: "tue-4", name: "Seated Cable Rows", sets: 3, reps: "10-12", rest: "60s", targetWeight: adjustments["tue-4"] || 110, notes: "Squeeze blades" },
                { id: "tue-5", name: "Face Pulls", sets: 3, reps: "15-20", rest: "45s", targetWeight: adjustments["tue-5"] || 40, notes: "Rear delts" },
                { id: "tue-6", name: "Dumbbell Shrugs", sets: 3, reps: "12-15", rest: "45s", targetWeight: adjustments["tue-6"] || 80, notes: "Hold at top" },
                { id: "tue-7", name: "Dumbbell Bicep Curls", sets: 2, reps: "10-12", rest: "45s", targetWeight: adjustments["tue-7"] || 45, notes: "Finish strong" }
            ]
        },
        work: {
            title: "Accessory: Shoulders/Forearms/Legs",
            duration: "10-15 sets",
            color: "slate",
            location: "Work",
            exercises: [
                { id: "tue-w1", name: "Lateral Raises", sets: 4, reps: "15-20", rest: "-", targetWeight: adjustments["tue-w1"] || 20, notes: "Strict form" },
                { id: "tue-w2", name: "Front Raises", sets: 3, reps: "12-15", rest: "-", targetWeight: adjustments["tue-w2"] || 25, notes: "Alternating" },
                { id: "tue-w3", name: "Wrist Curls", sets: 3, reps: "15-20", rest: "-", targetWeight: adjustments["tue-w3"] || 20, notes: "Grip focus" },
                { id: "tue-w4", name: "Reverse Wrist Curls", sets: 2, reps: "15-20", rest: "-", targetWeight: adjustments["tue-w4"] || 15, notes: "Extensors" },
                { id: "tue-w5", name: "Goblet Squats", sets: 3, reps: "15-20", rest: "-", targetWeight: adjustments["tue-w5"] || 45, notes: "Light pump" },
                { id: "tue-w6", name: "Dumbbell RDLs", sets: 2, reps: "12-15", rest: "-", targetWeight: adjustments["tue-w6"] || 40, notes: "Each hand" }
            ]
        }
    },
    wednesday: {
        am: {
            title: "Legs + ACFT",
            duration: "45 min",
            color: "purple",
            location: "Home",
            exercises: [
                { id: "wed-1", name: "Squat Machine", sets: 4, reps: "8-10", rest: "90s", targetWeight: adjustments["wed-1"] || 225, notes: "Full depth" },
                { id: "wed-2", name: "Hex Bar Deadlift (Speed)", sets: 3, reps: "3-5", rest: "90s", targetWeight: adjustments["wed-2"] || 225, notes: "Explosive" },
                { id: "wed-3", name: "DB Lateral Lunges", sets: 3, reps: "10 each", rest: "60s", targetWeight: adjustments["wed-3"] || 40, notes: "SDC transfer" },
                { id: "wed-4", name: "Leg Extensions", sets: 3, reps: "12-15", rest: "60s", targetWeight: adjustments["wed-4"] || 100, notes: "Squeeze top" },
                { id: "wed-5", name: "Leg Curls", sets: 3, reps: "12-15", rest: "60s", targetWeight: adjustments["wed-5"] || 80, notes: "Control neg" },
                { id: "wed-6", name: "Calf Raises", sets: 4, reps: "15-20", rest: "45s", targetWeight: adjustments["wed-6"] || 150, notes: "Full ROM" },
                { id: "wed-7", name: "Plank Hold", sets: 2, reps: "90-120s", rest: "60s", targetWeight: 0, notes: "Goal: 4:00" },
                { id: "wed-8", name: "Hand Release Push-Ups", sets: 2, reps: "Max", rest: "60s", targetWeight: 0, notes: "ACFT form" }
            ]
        },
        work: {
            title: "Accessory: Arms/Core/Grip",
            duration: "10-15 sets",
            color: "slate",
            location: "Work",
            exercises: [
                { id: "wed-w1", name: "Concentration Curls", sets: 3, reps: "12-15", rest: "-", targetWeight: adjustments["wed-w1"] || 30, notes: "Peak squeeze" },
                { id: "wed-w2", name: "Tricep Kickbacks", sets: 3, reps: "12-15", rest: "-", targetWeight: adjustments["wed-w2"] || 25, notes: "Full extension" },
                { id: "wed-w3", name: "Wrist Curls", sets: 2, reps: "15-20", rest: "-", targetWeight: adjustments["wed-w3"] || 20, notes: "Superset" },
                { id: "wed-w4", name: "Reverse Wrist Curls", sets: 2, reps: "15-20", rest: "-", targetWeight: adjustments["wed-w4"] || 15, notes: "Continuous" },
                { id: "wed-w5", name: "DB Bent Over Rows", sets: 2, reps: "15", rest: "-", targetWeight: adjustments["wed-w5"] || 40, notes: "Light" },
                { id: "wed-w6", name: "Standing Oblique Crunches", sets: 2, reps: "15 each", rest: "-", targetWeight: adjustments["wed-w6"] || 25, notes: "Hold DB" }
            ]
        }
    },
    thursday: { rest: { title: "Active Recovery", duration: "Rest", color: "gray", location: "N/A" } },
    friday: { rest: { title: "Active Recovery", duration: "Rest", color: "gray", location: "N/A" } },
    saturday: {
        am: {
            title: "Full Upper Body",
            duration: "90 min",
            color: "orange",
            location: "Home",
            exercises: [
                { id: "sat-1", name: "DB Bench Press", sets: 5, reps: "6,6,8,10,12", rest: "90s", targetWeight: adjustments["sat-1"] || 85, notes: "Pyramid" },
                { id: "sat-2", name: "Incline DB Press", sets: 4, reps: "8-10", rest: "75s", targetWeight: adjustments["sat-2"] || 70, notes: "Upper chest" },
                { id: "sat-3", name: "Decline Cable Flyes", sets: 3, reps: "12-15", rest: "60s", targetWeight: adjustments["sat-3"] || 25, notes: "Stretch" },
                { id: "sat-4", name: "Cable Crossovers", sets: 3, reps: "15", rest: "45s", targetWeight: adjustments["sat-4"] || 30, notes: "Squeeze" },
                { id: "sat-5", name: "Bent Over DB Rows", sets: 4, reps: "8-10", rest: "75s", targetWeight: adjustments["sat-5"] || 80, notes: "Heavy" },
                { id: "sat-6", name: "Wide Grip Pulldowns", sets: 4, reps: "10-12", rest: "60s", targetWeight: adjustments["sat-6"] || 130, notes: "Full stretch" },
                { id: "sat-7", name: "Seated Cable Rows", sets: 3, reps: "12", rest: "60s", targetWeight: adjustments["sat-7"] || 110, notes: "V-bar" },
                { id: "sat-8", name: "Seated DB Press", sets: 4, reps: "8-10", rest: "75s", targetWeight: adjustments["sat-8"] || 65, notes: "Shoulders" },
                { id: "sat-9", name: "Cable Lateral Raises", sets: 3, reps: "12-15", rest: "45s", targetWeight: adjustments["sat-9"] || 15, notes: "Each arm" },
                { id: "sat-10", name: "EZ Bar Cable Curls", sets: 3, reps: "10-12", rest: "60s", targetWeight: adjustments["sat-10"] || 60, notes: "Biceps" },
                { id: "sat-11", name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: "45s", targetWeight: adjustments["sat-11"] || 55, notes: "Rope" },
                { id: "sat-12", name: "Hand Release Push-Ups", sets: 3, reps: "20-25", rest: "90s", targetWeight: 0, notes: "ACFT" },
                { id: "sat-13", name: "Wide Push-Ups", sets: 2, reps: "15", rest: "60s", targetWeight: 0, notes: "Chest" },
                { id: "sat-14", name: "Diamond Push-Ups", sets: 2, reps: "12", rest: "60s", targetWeight: 0, notes: "Triceps" }
            ]
        }
    },
    sunday: {
        am: {
            title: "Full Lower + Run",
            duration: "90 min",
            color: "red",
            location: "Home",
            exercises: [
                { id: "sun-1", name: "Squat Machine", sets: 5, reps: "8,8,10,10,12", rest: "90s", targetWeight: adjustments["sun-1"] || 225, notes: "Progressive" },
                { id: "sun-2", name: "Leg Extensions", sets: 4, reps: "12-15", rest: "60s", targetWeight: adjustments["sun-2"] || 100, notes: "Squeeze" },
                { id: "sun-3", name: "Walking DB Lunges", sets: 3, reps: "12 each", rest: "75s", targetWeight: adjustments["sun-3"] || 55, notes: "Total" },
                { id: "sun-4", name: "Hex Bar Deadlifts", sets: 4, reps: "6-8", rest: "2m", targetWeight: adjustments["sun-4"] || 315, notes: "Heavy" },
                { id: "sun-5", name: "Leg Curls", sets: 4, reps: "12-15", rest: "60s", targetWeight: adjustments["sun-5"] || 80, notes: "Hamstrings" },
                { id: "sun-6", name: "Dumbbell RDLs", sets: 3, reps: "10-12", rest: "75s", targetWeight: adjustments["sun-6"] || 65, notes: "Each hand" },
                { id: "sun-7", name: "Calf Raises", sets: 5, reps: "15-20", rest: "45s", targetWeight: adjustments["sun-7"] || 150, notes: "Full ROM" },
                { id: "sun-8", name: "Plank Hold", sets: 3, reps: "90-120s", rest: "60s", targetWeight: 0, notes: "Goal: 4:00" },
                { id: "sun-9", name: "2-Mile Run", sets: 1, reps: "See plan", rest: "-", targetWeight: 0, notes: "Goal: 14:30" }
            ]
        }
    }
});

const runningPlan = [
    { week: 1, type: "Tempo", protocol: "1.5 mi @ 7:00 pace + 0.5 mi cooldown" },
    { week: 2, type: "Intervals", protocol: "6 x 400m @ 1:35-1:40, 90s rest" },
    { week: 3, type: "Long Run", protocol: "3-4 mi @ 8:00-8:30 pace" },
    { week: 4, type: "Race + Sprint", protocol: "2 mi @ 7:15 pace + 4x50m sprints" }
];

const colorClasses = {
    emerald: { bg: "bg-emerald-600", light: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", gradient: "from-emerald-600 to-emerald-500" },
    blue: { bg: "bg-blue-600", light: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", gradient: "from-blue-600 to-blue-500" },
    purple: { bg: "bg-purple-600", light: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", gradient: "from-purple-600 to-purple-500" },
    orange: { bg: "bg-orange-600", light: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", gradient: "from-orange-600 to-orange-500" },
    red: { bg: "bg-red-600", light: "bg-red-50", border: "border-red-300", text: "text-red-700", gradient: "from-red-600 to-red-500" },
    slate: { bg: "bg-slate-600", light: "bg-slate-50", border: "border-slate-300", text: "text-slate-700", gradient: "from-slate-600 to-slate-500" },
    gray: { bg: "bg-gray-400", light: "bg-gray-50", border: "border-gray-300", text: "text-gray-600", gradient: "from-gray-400 to-gray-300" }
};

const getRPEColor = (rpe) => {
    if (rpe <= 3) return "bg-green-500";
    if (rpe <= 5) return "bg-yellow-500";
    if (rpe <= 7) return "bg-orange-500";
    if (rpe <= 9) return "bg-red-500";
    return "bg-red-700";
};

function WorkoutApp() {
    const [currentView, setCurrentView] = useState('workout');
    const [selectedDay, setSelectedDay] = useState(() => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    });
    const [workoutPlan, setWorkoutPlan] = useState(createWorkoutPlan());
    const [exerciseLog, setExerciseLog] = useState({});
    const [weekNumber, setWeekNumber] = useState(1);
    const [acftProgress, setAcftProgress] = useState({
        pushups: { current: 60, goal: 70 },
        sdc: { current: "2:38", goal: "2:28" },
        deadlift: { current: 340, goal: 400 },
        run: { current: "16:30", goal: "14:30" },
        plank: { current: "3:40", goal: "4:00" }
    });
    const [weeklyStats, setWeeklyStats] = useState([]);
    const [showAdjustments, setShowAdjustments] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // Load data on mount
    useEffect(() => {
        const log = storage.get('exerciseLog');
        if (log) setExerciseLog(log);
        
        const stats = storage.get('weeklyStats');
        if (stats) setWeeklyStats(stats);
        
        const week = storage.get('weekNumber');
        if (week) setWeekNumber(week);
        
        const acft = storage.get('acftProgress');
        if (acft) setAcftProgress(acft);
        
        const adjustments = storage.get('weightAdjustments');
        if (adjustments) setWorkoutPlan(createWorkoutPlan(adjustments));
    }, []);

    // Save functions
    const saveAll = (log, stats, week, acft, adjustments) => {
        storage.set('exerciseLog', log);
        storage.set('weeklyStats', stats);
        storage.set('weekNumber', week);
        storage.set('acftProgress', acft);
        if (adjustments) storage.set('weightAdjustments', adjustments);
    };

    const days = [
        { key: 'monday', label: 'M', full: 'Monday' },
        { key: 'tuesday', label: 'T', full: 'Tuesday' },
        { key: 'wednesday', label: 'W', full: 'Wednesday' },
        { key: 'thursday', label: 'T', full: 'Thursday' },
        { key: 'friday', label: 'F', full: 'Friday' },
        { key: 'saturday', label: 'S', full: 'Saturday' },
        { key: 'sunday', label: 'S', full: 'Sunday' }
    ];

    const getSetKey = (day, session, exId, setNum) => `${today}-${day}-${session}-${exId}-${setNum}`;

    const updateSet = (day, session, exId, setNum, field, value) => {
        const key = getSetKey(day, session, exId, setNum);
        const newLog = {
            ...exerciseLog,
            [key]: { ...exerciseLog[key], [field]: value }
        };
        setExerciseLog(newLog);
        saveAll(newLog, weeklyStats, weekNumber, acftProgress, null);
    };

    const toggleSetComplete = (day, session, exId, setNum) => {
        const key = getSetKey(day, session, exId, setNum);
        const current = exerciseLog[key]?.completed || false;
        updateSet(day, session, exId, setNum, 'completed', !current);
    };

    const getExerciseStats = (day, session, exId, totalSets) => {
        let completed = 0;
        let totalRPE = 0;
        let rpeCount = 0;
        
        for (let i = 1; i <= totalSets; i++) {
            const key = getSetKey(day, session, exId, i);
            const setData = exerciseLog[key];
            if (setData?.completed) completed++;
            if (setData?.rpe) {
                totalRPE += setData.rpe;
                rpeCount++;
            }
        }
        
        return {
            completed,
            total: totalSets,
            avgRPE: rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : null
        };
    };

    const getSessionProgress = (day, session) => {
        const exercises = workoutPlan[day]?.[session]?.exercises || [];
        if (exercises.length === 0) return { percent: 0, avgRPE: null };
        
        let totalSets = 0;
        let completedSets = 0;
        let totalRPE = 0;
        let rpeCount = 0;
        
        exercises.forEach(ex => {
            const numSets = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets) || 3;
            for (let i = 1; i <= numSets; i++) {
                totalSets++;
                const key = getSetKey(day, session, ex.id, i);
                const setData = exerciseLog[key];
                if (setData?.completed) completedSets++;
                if (setData?.rpe) {
                    totalRPE += setData.rpe;
                    rpeCount++;
                }
            }
        });
        
        return {
            percent: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
            avgRPE: rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : null
        };
    };

    const calculateWeeklyAdjustments = () => {
        const adjustments = {};
        const recommendations = [];
        
        Object.keys(workoutPlan).forEach(day => {
            ['am', 'work'].forEach(session => {
                const exercises = workoutPlan[day]?.[session]?.exercises || [];
                exercises.forEach(ex => {
                    if (ex.targetWeight === 0) return;
                    
                    const numSets = typeof ex.sets === 'number' ? ex.sets : parseInt(ex.sets) || 3;
                    let totalRPE = 0;
                    let rpeCount = 0;
                    let maxWeight = 0;
                    
                    for (let i = 1; i <= numSets; i++) {
                        const key = getSetKey(day, session, ex.id, i);
                        const setData = exerciseLog[key];
                        if (setData?.rpe) {
                            totalRPE += setData.rpe;
                            rpeCount++;
                        }
                        if (setData?.weight) {
                            maxWeight = Math.max(maxWeight, parseFloat(setData.weight) || 0);
                        }
                    }
                    
                    if (rpeCount > 0) {
                        const avgRPE = totalRPE / rpeCount;
                        const baseWeight = maxWeight || ex.targetWeight;
                        
                        if (avgRPE <= 4) {
                            const increase = avgRPE <= 2 ? 10 : 5;
                            adjustments[ex.id] = Math.round(baseWeight + increase);
                            recommendations.push({
                                exercise: ex.name,
                                day: day,
                                avgRPE,
                                currentWeight: baseWeight,
                                newWeight: adjustments[ex.id],
                                direction: 'increase',
                                reason: avgRPE <= 2 ? 'Very easy - increase 10 lbs' : 'Easy - increase 5 lbs'
                            });
                        } else if (avgRPE >= 9) {
                            const decrease = avgRPE >= 10 ? 10 : 5;
                            adjustments[ex.id] = Math.round(baseWeight - decrease);
                            recommendations.push({
                                exercise: ex.name,
                                day: day,
                                avgRPE,
                                currentWeight: baseWeight,
                                newWeight: adjustments[ex.id],
                                direction: 'decrease',
                                reason: avgRPE >= 10 ? 'Failed reps - decrease 10 lbs' : 'Too hard - decrease 5 lbs'
                            });
                        } else if (avgRPE >= 6 && avgRPE <= 8) {
                            adjustments[ex.id] = Math.round(baseWeight + 5);
                            recommendations.push({
                                exercise: ex.name,
                                day: day,
                                avgRPE,
                                currentWeight: baseWeight,
                                newWeight: adjustments[ex.id],
                                direction: 'increase',
                                reason: 'Good effort - progress 5 lbs'
                            });
                        }
                    }
                });
            });
        });
        
        return { adjustments, recommendations };
    };

    const applyAdjustments = () => {
        const { adjustments } = calculateWeeklyAdjustments();
        setWorkoutPlan(createWorkoutPlan(adjustments));
        setWeekNumber(prev => prev + 1);
        
        const weekSummary = {
            week: weekNumber,
            date: today,
            adjustments,
            sessions: {}
        };
        
        days.forEach(d => {
            ['am', 'work'].forEach(s => {
                const progress = getSessionProgress(d.key, s);
                if (progress.percent > 0) {
                    weekSummary.sessions[`${d.key}-${s}`] = progress;
                }
            });
        });
        
        const newStats = [...weeklyStats, weekSummary];
        setWeeklyStats(newStats);
        setExerciseLog({});
        
        saveAll({}, newStats, weekNumber + 1, acftProgress, adjustments);
        setShowAdjustments(false);
    };

    const renderSetRow = (day, session, exercise, setNum) => {
        const key = getSetKey(day, session, exercise.id, setNum);
        const setData = exerciseLog[key] || {};
        const isCompleted = setData.completed;
        
        const repScheme = exercise.reps.includes(',') 
            ? exercise.reps.split(',')[setNum - 1]?.trim() || exercise.reps.split(',')[0] 
            : exercise.reps;

        return React.createElement('div', {
            key: setNum,
            className: `flex items-center gap-2 p-2 rounded-lg ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`
        },
            React.createElement('button', {
                onClick: () => toggleSetComplete(day, session, exercise.id, setNum),
                className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white border-2 border-gray-300 text-gray-500'
                }`
            }, isCompleted ? React.createElement(Icon, { name: 'check', size: 16 }) : setNum),
            
            React.createElement('div', { className: "text-xs text-gray-500 w-10 text-center" }, repScheme),
            
            React.createElement('div', { className: "flex-1" },
                React.createElement('input', {
                    type: "number",
                    inputMode: "numeric",
                    placeholder: `${exercise.targetWeight}`,
                    value: setData.weight || '',
                    onChange: (e) => updateSet(day, session, exercise.id, setNum, 'weight', e.target.value),
                    className: "w-full px-2 py-1 text-sm border rounded text-center"
                })
            ),
            
            React.createElement('div', { className: "w-12" },
                React.createElement('input', {
                    type: "text",
                    inputMode: "numeric",
                    placeholder: "reps",
                    value: setData.actualReps || '',
                    onChange: (e) => updateSet(day, session, exercise.id, setNum, 'actualReps', e.target.value),
                    className: "w-full px-1 py-1 text-sm border rounded text-center"
                })
            ),
            
            React.createElement('div', { className: "w-14" },
                React.createElement('select', {
                    value: setData.rpe || '',
                    onChange: (e) => updateSet(day, session, exercise.id, setNum, 'rpe', parseInt(e.target.value)),
                    className: `w-full px-1 py-1 text-sm border rounded text-center ${
                        setData.rpe ? getRPEColor(setData.rpe) + ' text-white' : ''
                    }`
                },
                    React.createElement('option', { value: "" }, "RPE"),
                    [1,2,3,4,5,6,7,8,9,10].map(n => 
                        React.createElement('option', { key: n, value: n }, n)
                    )
                )
            )
        );
    };

    const renderExercise = (day, session, exercise) => {
        const colors = colorClasses[workoutPlan[day][session].color];
        const numSets = typeof exercise.sets === 'number' ? exercise.sets : parseInt(exercise.sets) || 3;
        const stats = getExerciseStats(day, session, exercise.id, numSets);
        const allComplete = stats.completed === stats.total;
        
        return React.createElement('div', {
            key: exercise.id,
            className: `bg-white rounded-xl shadow-sm mb-3 overflow-hidden border ${allComplete ? 'border-green-300' : 'border-gray-200'}`
        },
            React.createElement('div', { className: `p-3 ${allComplete ? 'bg-green-50' : colors.light}` },
                React.createElement('div', { className: "flex justify-between items-start" },
                    React.createElement('div', { className: "flex-1" },
                        React.createElement('h4', { className: `font-semibold ${allComplete ? 'text-green-700' : 'text-gray-800'}` }, exercise.name),
                        React.createElement('div', { className: "flex items-center gap-3 mt-1 text-xs text-gray-500" },
                            React.createElement('span', null, `${numSets} sets × ${exercise.reps}`),
                            exercise.rest !== '-' && React.createElement('span', null, `Rest: ${exercise.rest}`)
                        )
                    ),
                    React.createElement('div', { className: "text-right" },
                        React.createElement('div', { className: `text-sm font-bold ${colors.text}` },
                            exercise.targetWeight > 0 ? `${exercise.targetWeight} lbs` : 'BW'
                        ),
                        React.createElement('div', { className: "text-xs text-gray-400" }, exercise.notes)
                    )
                ),
                React.createElement('div', { className: "mt-2 flex items-center gap-2" },
                    React.createElement('div', { className: "flex-1 h-2 bg-gray-200 rounded-full overflow-hidden" },
                        React.createElement('div', {
                            className: `h-full transition-all ${allComplete ? 'bg-green-500' : 'bg-blue-500'}`,
                            style: { width: `${(stats.completed / stats.total) * 100}%` }
                        })
                    ),
                    React.createElement('span', { className: "text-xs font-medium text-gray-600" }, `${stats.completed}/${stats.total}`),
                    stats.avgRPE && React.createElement('span', {
                        className: `text-xs px-2 py-0.5 rounded-full text-white ${getRPEColor(parseFloat(stats.avgRPE))}`
                    }, `RPE ${stats.avgRPE}`)
                )
            ),
            React.createElement('div', { className: "p-2 space-y-1" },
                React.createElement('div', { className: "grid grid-cols-5 gap-1 text-xs text-gray-400 font-medium px-2 mb-1" },
                    React.createElement('div', null, "Set"),
                    React.createElement('div', { className: "text-center" }, "Target"),
                    React.createElement('div', { className: "text-center" }, "Weight"),
                    React.createElement('div', { className: "text-center" }, "Reps"),
                    React.createElement('div', { className: "text-center" }, "RPE")
                ),
                Array.from({ length: numSets }, (_, i) => renderSetRow(day, session, exercise, i + 1))
            )
        );
    };

    const renderSession = (day, sessionKey, session) => {
        if (!session?.exercises) return null;
        const colors = colorClasses[session.color];
        const progress = getSessionProgress(day, sessionKey);
        
        return React.createElement('div', { key: sessionKey, className: "mb-6" },
            React.createElement('div', { className: `bg-gradient-to-r ${colors.gradient} text-white rounded-xl p-4 mb-3 shadow-lg` },
                React.createElement('div', { className: "flex justify-between items-center" },
                    React.createElement('div', null,
                        React.createElement('h3', { className: "font-bold text-lg" }, session.title),
                        React.createElement('div', { className: "flex items-center gap-2 text-sm opacity-90 mt-1" },
                            React.createElement(Icon, { name: 'clock', size: 14 }),
                            React.createElement('span', null, session.duration),
                            React.createElement('span', null, "•"),
                            React.createElement('span', null, session.location)
                        )
                    ),
                    React.createElement('div', { className: "text-right" },
                        React.createElement('div', { className: "text-3xl font-bold" }, `${progress.percent}%`),
                        progress.avgRPE && React.createElement('div', { className: "text-xs opacity-75" }, `Avg RPE: ${progress.avgRPE}`)
                    )
                ),
                React.createElement('div', { className: "mt-3 h-2 bg-white/30 rounded-full overflow-hidden" },
                    React.createElement('div', {
                        className: "h-full bg-white transition-all duration-300",
                        style: { width: `${progress.percent}%` }
                    })
                )
            ),
            React.createElement('div', { className: "space-y-3" },
                session.exercises.map(ex => renderExercise(day, sessionKey, ex))
            )
        );
    };

    const renderWorkoutView = () => {
        const dayData = workoutPlan[selectedDay];
        
        return React.createElement('div', { className: "pb-24" },
            // Day selector
            React.createElement('div', { className: "flex gap-1 mb-4 bg-white rounded-xl p-2 shadow-sm" },
                days.map(day => {
                    const hasWorkout = workoutPlan[day.key]?.am || workoutPlan[day.key]?.work;
                    const isRest = workoutPlan[day.key]?.rest;
                    const amProgress = getSessionProgress(day.key, 'am').percent;
                    const workProgress = getSessionProgress(day.key, 'work').percent;
                    const progress = hasWorkout && !isRest ? Math.round((amProgress + (workProgress || amProgress)) / (workProgress ? 2 : 1)) : 0;
                    
                    return React.createElement('button', {
                        key: day.key,
                        onClick: () => setSelectedDay(day.key),
                        className: `flex-1 py-2 rounded-lg text-center transition-all ${
                            selectedDay === day.key
                                ? 'bg-green-600 text-white shadow-md'
                                : isRest
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-50 hover:bg-gray-100'
                        }`
                    },
                        React.createElement('div', { className: "text-xs font-bold" }, day.label),
                        hasWorkout && !isRest && progress > 0 && React.createElement('div', {
                            className: `text-xs mt-0.5 ${selectedDay === day.key ? 'text-green-100' : 'text-green-600'}`
                        }, `${progress}%`),
                        isRest && React.createElement('div', { className: "text-xs mt-0.5" }, "Rest")
                    );
                })
            ),
            
            // Week indicator
            React.createElement('div', { className: "flex justify-between items-center mb-4 px-1" },
                React.createElement('span', { className: "text-sm font-medium text-gray-600" }, `Week ${weekNumber}`),
                React.createElement('span', { className: "text-sm text-gray-500" }, `Run: ${runningPlan[(weekNumber - 1) % 4].type}`)
            ),
            
            // Workout content
            dayData?.rest 
                ? React.createElement('div', { className: "bg-white rounded-xl p-8 text-center shadow-sm" },
                    React.createElement('div', { className: "text-6xl mb-4" }, "🧘"),
                    React.createElement('h2', { className: "text-xl font-bold text-gray-700" }, "Rest Day"),
                    React.createElement('p', { className: "text-gray-500 mt-2" }, "Active recovery, stretching, mobility")
                )
                : React.createElement(React.Fragment, null,
                    dayData?.am && renderSession(selectedDay, 'am', dayData.am),
                    dayData?.work && renderSession(selectedDay, 'work', dayData.work),
                    selectedDay === 'sunday' && React.createElement('div', {
                        className: "bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-4 mt-4 shadow-lg"
                    },
                        React.createElement('h3', { className: "font-bold flex items-center gap-2" },
                            React.createElement(Icon, { name: 'activity', size: 20 }),
                            " This Week's Run"
                        ),
                        React.createElement('div', { className: "mt-2" },
                            React.createElement('div', { className: "text-xl font-bold" }, runningPlan[(weekNumber - 1) % 4].type),
                            React.createElement('div', { className: "text-sm opacity-90 mt-1" }, runningPlan[(weekNumber - 1) % 4].protocol)
                        )
                    )
                )
        );
    };

    const renderProgressView = () => {
        const { recommendations } = calculateWeeklyAdjustments();
        
        return React.createElement('div', { className: "pb-24" },
            // ACFT Progress
            React.createElement('div', { className: "bg-white rounded-xl p-4 shadow-sm mb-4" },
                React.createElement('h3', { className: "font-bold text-gray-800 flex items-center gap-2 mb-3" },
                    React.createElement(Icon, { name: 'target', size: 20, className: "text-green-600" }),
                    " ACFT Goals"
                ),
                React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                    Object.entries(acftProgress).map(([event, data]) =>
                        React.createElement('div', { key: event, className: "bg-gray-50 rounded-lg p-3" },
                            React.createElement('div', { className: "text-xs text-gray-500 uppercase font-semibold" },
                                event === 'sdc' ? 'Sprint-Drag-Carry' : event === 'pushups' ? 'Push-Ups' : event.charAt(0).toUpperCase() + event.slice(1)
                            ),
                            React.createElement('div', { className: "flex items-center gap-1 mt-1" },
                                React.createElement('span', { className: "text-lg font-bold" }, data.current),
                                React.createElement('span', { className: "text-gray-400" }, "→"),
                                React.createElement('span', { className: "text-green-600 font-bold" }, data.goal)
                            )
                        )
                    )
                )
            ),
            
            // Weekly Adjustments
            React.createElement('div', { className: "bg-white rounded-xl p-4 shadow-sm mb-4" },
                React.createElement('div', { className: "flex justify-between items-center mb-3" },
                    React.createElement('h3', { className: "font-bold text-gray-800 flex items-center gap-2" },
                        React.createElement(Icon, { name: 'trending-up', size: 20, className: "text-blue-600" }),
                        ` Week ${weekNumber} Adjustments`
                    ),
                    React.createElement('button', {
                        onClick: () => setShowAdjustments(!showAdjustments),
                        className: "text-sm text-blue-600 font-medium"
                    }, showAdjustments ? 'Hide' : 'Review')
                ),
                
                recommendations.length === 0
                    ? React.createElement('p', { className: "text-gray-500 text-sm" }, "Complete more exercises with RPE ratings to get personalized adjustments.")
                    : React.createElement(React.Fragment, null,
                        React.createElement('div', { className: "text-sm text-gray-600 mb-3" }, "Based on your RPE scores:"),
                        showAdjustments && React.createElement('div', { className: "space-y-2 mb-4" },
                            recommendations.slice(0, 10).map((rec, idx) =>
                                React.createElement('div', {
                                    key: idx,
                                    className: `p-3 rounded-lg border ${rec.direction === 'increase' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`
                                },
                                    React.createElement('div', { className: "flex justify-between items-start" },
                                        React.createElement('div', null,
                                            React.createElement('div', { className: "font-medium text-gray-800" }, rec.exercise),
                                            React.createElement('div', { className: "text-xs text-gray-500 capitalize" }, rec.day)
                                        ),
                                        React.createElement('div', {
                                            className: `flex items-center gap-1 ${rec.direction === 'increase' ? 'text-green-600' : 'text-orange-600'}`
                                        },
                                            React.createElement(Icon, { name: rec.direction === 'increase' ? 'trending-up' : 'trending-down', size: 16 }),
                                            React.createElement('span', { className: "font-bold" }, `${rec.currentWeight} → ${rec.newWeight}`)
                                        )
                                    ),
                                    React.createElement('div', { className: "text-xs mt-1 text-gray-600" }, `Avg RPE: ${rec.avgRPE.toFixed(1)} - ${rec.reason}`)
                                )
                            )
                        ),
                        React.createElement('button', {
                            onClick: applyAdjustments,
                            className: "w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl shadow-md active:scale-98"
                        }, `Apply Adjustments & Start Week ${weekNumber + 1}`)
                    )
            ),
            
            // RPE Guide
            React.createElement('div', { className: "bg-white rounded-xl p-4 shadow-sm" },
                React.createElement('h3', { className: "font-bold text-gray-800 flex items-center gap-2 mb-3" },
                    React.createElement(Icon, { name: 'info', size: 20, className: "text-purple-600" }),
                    " RPE Scale Guide"
                ),
                React.createElement('div', { className: "space-y-2" },
                    [
                        { range: "1-2", label: "Very Easy", desc: "Could do many more reps", color: "bg-green-500" },
                        { range: "3-4", label: "Easy", desc: "Several reps in reserve", color: "bg-green-400" },
                        { range: "5-6", label: "Moderate", desc: "Challenging but sustainable", color: "bg-yellow-500" },
                        { range: "7-8", label: "Hard", desc: "1-3 reps in reserve", color: "bg-orange-500" },
                        { range: "9", label: "Very Hard", desc: "Could do 1 more rep max", color: "bg-red-500" },
                        { range: "10", label: "Maximum/Failed", desc: "Could not complete rep", color: "bg-red-700" }
                    ].map(item =>
                        React.createElement('div', { key: item.range, className: "flex items-center gap-3" },
                            React.createElement('div', {
                                className: `w-8 h-8 rounded-full ${item.color} text-white flex items-center justify-center text-xs font-bold`
                            }, item.range),
                            React.createElement('div', null,
                                React.createElement('div', { className: "font-medium text-sm" }, item.label),
                                React.createElement('div', { className: "text-xs text-gray-500" }, item.desc)
                            )
                        )
                    )
                )
            )
        );
    };

    const renderSettingsView = () => {
        return React.createElement('div', { className: "pb-24" },
            React.createElement('div', { className: "bg-white rounded-xl p-4 shadow-sm mb-4" },
                React.createElement('h3', { className: "font-bold text-gray-800 mb-4" }, "ACFT Scores"),
                React.createElement('div', { className: "space-y-4" },
                    Object.entries(acftProgress).map(([event, data]) =>
                        React.createElement('div', { key: event, className: "flex items-center justify-between" },
                            React.createElement('label', { className: "text-sm font-medium text-gray-700 capitalize w-24" },
                                event === 'sdc' ? 'SDC' : event
                            ),
                            React.createElement('div', { className: "flex items-center gap-2" },
                                React.createElement('input', {
                                    type: "text",
                                    value: data.current,
                                    onChange: (e) => {
                                        const newProgress = { ...acftProgress, [event]: { ...data, current: e.target.value } };
                                        setAcftProgress(newProgress);
                                        saveAll(exerciseLog, weeklyStats, weekNumber, newProgress, null);
                                    },
                                    className: "w-20 px-2 py-1 border rounded text-center"
                                }),
                                React.createElement('span', { className: "text-gray-400" }, "→"),
                                React.createElement('input', {
                                    type: "text",
                                    value: data.goal,
                                    onChange: (e) => {
                                        const newProgress = { ...acftProgress, [event]: { ...data, goal: e.target.value } };
                                        setAcftProgress(newProgress);
                                        saveAll(exerciseLog, weeklyStats, weekNumber, newProgress, null);
                                    },
                                    className: "w-20 px-2 py-1 border rounded text-center"
                                })
                            )
                        )
                    )
                )
            ),
            
            React.createElement('div', { className: "bg-white rounded-xl p-4 shadow-sm mb-4" },
                React.createElement('h3', { className: "font-bold text-gray-800 mb-4" }, "Week Number"),
                React.createElement('div', { className: "flex items-center justify-center gap-4" },
                    React.createElement('button', {
                        onClick: () => {
                            const newWeek = Math.max(1, weekNumber - 1);
                            setWeekNumber(newWeek);
                            saveAll(exerciseLog, weeklyStats, newWeek, acftProgress, null);
                        },
                        className: "w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                    }, React.createElement(Icon, { name: 'chevron-left', size: 20 })),
                    React.createElement('span', { className: "font-bold text-2xl w-12 text-center" }, weekNumber),
                    React.createElement('button', {
                        onClick: () => {
                            const newWeek = weekNumber + 1;
                            setWeekNumber(newWeek);
                            saveAll(exerciseLog, weeklyStats, newWeek, acftProgress, null);
                        },
                        className: "w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                    }, React.createElement(Icon, { name: 'chevron-right', size: 20 }))
                )
            ),
            
            React.createElement('div', { className: "bg-white rounded-xl p-4 shadow-sm mb-4" },
                React.createElement('h3', { className: "font-bold text-gray-800 mb-4" }, "Data Management"),
                React.createElement('button', {
                    onClick: () => {
                        if (confirm('Reset today\'s workout data?')) {
                            const newLog = { ...exerciseLog };
                            Object.keys(newLog).forEach(key => {
                                if (key.startsWith(today)) delete newLog[key];
                            });
                            setExerciseLog(newLog);
                            saveAll(newLog, weeklyStats, weekNumber, acftProgress, null);
                        }
                    },
                    className: "w-full py-3 bg-orange-100 text-orange-700 font-medium rounded-lg mb-2"
                }, "Reset Today's Data"),
                React.createElement('button', {
                    onClick: () => {
                        if (confirm('Reset ALL data? This cannot be undone!')) {
                            setExerciseLog({});
                            setWeeklyStats([]);
                            setWeekNumber(1);
                            setWorkoutPlan(createWorkoutPlan());
                            saveAll({}, [], 1, acftProgress, {});
                        }
                    },
                    className: "w-full py-3 bg-red-100 text-red-700 font-medium rounded-lg"
                }, "Reset All Data")
            ),
            
            React.createElement('div', { className: "bg-gray-100 rounded-xl p-4 text-center text-sm text-gray-500" },
                React.createElement('p', { className: "font-medium" }, "ACFT Workout Tracker"),
                React.createElement('p', null, "Goal: 500 pts"),
                React.createElement('p', { className: "mt-2" }, "Data saves automatically to device")
            )
        );
    };

    return React.createElement('div', { className: "min-h-screen bg-gray-100" },
        // Header
        React.createElement('div', { className: "bg-gradient-to-r from-green-700 to-green-600 text-white px-4 pt-12 pb-4 safe-area-pt" },
            React.createElement('div', { className: "flex justify-between items-center" },
                React.createElement('div', null,
                    React.createElement('h1', { className: "text-xl font-bold flex items-center gap-2" },
                        React.createElement(Icon, { name: 'dumbbell', size: 24 }),
                        currentView === 'workout' ? 'Workout' : currentView === 'progress' ? 'Progress' : 'Settings'
                    ),
                    React.createElement('p', { className: "text-sm opacity-90" },
                        new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                    )
                ),
                React.createElement('div', { className: "text-right" },
                    React.createElement('div', { className: "text-2xl font-bold" }, "490"),
                    React.createElement('div', { className: "text-xs opacity-75" }, "ACFT Score")
                )
            )
        ),
        
        // Content
        React.createElement('div', { className: "p-4" },
            currentView === 'workout' && renderWorkoutView(),
            currentView === 'progress' && renderProgressView(),
            currentView === 'settings' && renderSettingsView()
        ),
        
        // Bottom Navigation
        React.createElement('div', { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-around items-center safe-area-pb" },
            React.createElement('button', {
                onClick: () => setCurrentView('workout'),
                className: `flex flex-col items-center py-2 px-4 ${currentView === 'workout' ? 'text-green-600' : 'text-gray-400'}`
            },
                React.createElement(Icon, { name: 'dumbbell', size: 24 }),
                React.createElement('span', { className: "text-xs mt-1" }, "Workout")
            ),
            React.createElement('button', {
                onClick: () => setCurrentView('progress'),
                className: `flex flex-col items-center py-2 px-4 ${currentView === 'progress' ? 'text-green-600' : 'text-gray-400'}`
            },
                React.createElement(Icon, { name: 'bar-chart-3', size: 24 }),
                React.createElement('span', { className: "text-xs mt-1" }, "Progress")
            ),
            React.createElement('button', {
                onClick: () => setCurrentView('settings'),
                className: `flex flex-col items-center py-2 px-4 ${currentView === 'settings' ? 'text-green-600' : 'text-gray-400'}`
            },
                React.createElement(Icon, { name: 'settings', size: 24 }),
                React.createElement('span', { className: "text-xs mt-1" }, "Settings")
            )
        )
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(WorkoutApp));
