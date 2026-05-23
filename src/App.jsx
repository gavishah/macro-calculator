import { useState, useCallback, useRef, useEffect, useMemo } from "react";

/* ── RDA (daily reference) by sex ── */
const RDA = {
  male:   { vitA:900, vitC:90, vitD:15, vitB12:2.4, iron:8, calcium:1000, magnesium:420, zinc:11, potassium:3400, folate:400, omega3:1.6, selenium:55, vitK:120, vitE:15 },
  female: { vitA:700, vitC:75, vitD:15, vitB12:2.4, iron:18, calcium:1000, magnesium:320, zinc:8, potassium:2600, folate:400, omega3:1.1, selenium:55, vitK:90, vitE:15 },
};
const MICRO_LABELS = {
  vitA:"Vitamin A", vitC:"Vitamin C", vitD:"Vitamin D", vitB12:"Vitamin B12",
  iron:"Iron", calcium:"Calcium", magnesium:"Magnesium", zinc:"Zinc",
  potassium:"Potassium", folate:"Folate", omega3:"Omega-3", selenium:"Selenium",
  vitK:"Vitamin K", vitE:"Vitamin E"
};
const MICRO_UNITS = {
  vitA:"mcg", vitC:"mg", vitD:"mcg", vitB12:"mcg",
  iron:"mg", calcium:"mg", magnesium:"mg", zinc:"mg",
  potassium:"mg", folate:"mcg", omega3:"g", selenium:"mcg",
  vitK:"mcg", vitE:"mg"
};
const MICRO_KEYS = Object.keys(MICRO_LABELS);

/* ── FORMULAS ── */
const FORMULAS = [
  { id:"mifflin", name:"Mifflin-St Jeor", badge:"Recommended", who:"Best for most people", detail:"Most clinically validated. Uses age, weight, height & sex.", needsBF:false },
  { id:"harris",  name:"Harris-Benedict", badge:"Classic", who:"Slightly older formula", detail:"Developed 1919, revised 1984. Still a solid alternative.", needsBF:false },
  { id:"katch",   name:"Katch-McArdle", badge:"Athletes", who:"Know your body fat %?", detail:"Uses lean body mass — more accurate for muscular individuals.", needsBF:true },
];
const ACT = [
  { v:1.2, label:"Sedentary", desc:"Little/no exercise" },
  { v:1.375, label:"Light", desc:"1–3 days/week" },
  { v:1.55, label:"Moderate", desc:"3–5 days/week" },
  { v:1.725, label:"Active", desc:"6–7 days/week" },
  { v:1.9, label:"Very Active", desc:"Athlete/physical job" },
];
const GOALS = [
  { id:"cut", label:"Lose Fat", offset:-500 },
  { id:"maintain", label:"Maintain", offset:0 },
  { id:"bulk", label:"Build Muscle", offset:300 },
];

/* ── Category tabs matching foods.json keys ── */
const CATEGORIES = [
  { id:"fruits",        label:"Fruits" },
  { id:"vegetables",    label:"Vegetables" },
  { id:"meat_poultry",  label:"Meat & Poultry" },
  { id:"fish_seafood",  label:"Fish & Seafood" },
  { id:"dairy_eggs",    label:"Dairy & Eggs" },
  { id:"legumes",       label:"Legumes" },
  { id:"grains_cereals",label:"Grains" },
  { id:"nuts_seeds",    label:"Nuts & Seeds" },
  { id:"oils_fats",     label:"Oils & Fats" },
  { id:"herbs_spices",  label:"Herbs & Spices" },
  { id:"beverages",     label:"Beverages" }
];

const VEGAN_EXCLUDE_IDS = new Set(["eggs","egg_white","egg_yolk","whole_milk","skimmed_milk","greek_yogurt_full","greek_yogurt_0fat","cottage_cheese","cheddar","mozzarella","parmesan","feta","butter_unsalted","cream_cheese","heavy_cream"]);
const VEG_EXCLUDE_CATS  = new Set(["meat_poultry","fish_seafood"]);

const LS_KEY = "macro-calc-v1";

function calcBMR(formula, sex, wKg, hCm, age, bf) {
  if (formula === "mifflin") return sex === "male" ? 10*wKg + 6.25*hCm - 5*age + 5 : 10*wKg + 6.25*hCm - 5*age - 161;
  if (formula === "harris")  return sex === "male" ? 88.362 + 13.397*wKg + 4.799*hCm - 5.677*age : 447.593 + 9.247*wKg + 3.098*hCm - 4.33*age;
  return 370 + 21.6 * (wKg * (1 - bf / 100));
}

/* ── Animated Num ── */
function AN({ value, cursor = false }) {
  const [display, setDisplay] = useState(value);
  const [showCursor, setShowCursor] = useState(false);
  const rafRef = useRef(null);
  const prevRef = useRef(value);
  const cursorTimer = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) return;
    if (cursor) {
      setShowCursor(true);
      clearTimeout(cursorTimer.current);
      cursorTimer.current = setTimeout(() => setShowCursor(false), 1400);
    }
    const t0 = performance.now();
    const run = (now) => {
      const progress = Math.min((now - t0) / 400, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(cursorTimer.current); };
  }, [value]);

  return (
    <>
      <span style={{ fontFamily: NUM_FONT }}>{display}</span>
      {cursor && showCursor && <span className="result-cursor">|</span>}
    </>
  );
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const BG = "var(--bg)";
const CARD = "var(--card-bg)";
const TXT = "var(--txt)";
const MUTE = "var(--mute)";
const ACC = "var(--primary-acc)";
const HIGHLIGHT = "var(--active-highlight)";
const WHITE = "#FFFFFF";
const NUM_FONT = "var(--font-mono)";
const HEADER_FONT = "var(--font-header)";
const PROT_COLOR = "var(--prot)";
const CARB_COLOR = "var(--carb)";
const FAT_COLOR = "var(--fat)";

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [formula, setFormula] = useState("mifflin");
  const [unit, setUnit] = useState("imperial");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [hFt, setHFt] = useState("");
  const [hIn, setHIn] = useState("");
  const [hCm, setHCm] = useState("");
  const [bf, setBf] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState("maintain");
  const [prot, setProt] = useState(30);
  const [carb, setCarb] = useState(40);
  const [fatP, setFatP] = useState(30);
  const [diet, setDiet] = useState("all");
  const [macroFilter, setMacroFilter] = useState("any");
  const [selectedCat, setSelectedCat] = useState(null);
  const [meal, setMeal] = useState({});
  const [mealUnits, setMealUnits] = useState({});

  const [foodsData, setFoodsData] = useState(null);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular_desc");

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Day/Night theme switching
  useEffect(() => {
    const hour = new Date().getHours();
    const isDark = hour >= 20 || hour < 6;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (!saved) return;
      if (saved.age      !== undefined) setAge(saved.age);
      if (saved.weight   !== undefined) setWeight(saved.weight);
      if (saved.hFt      !== undefined) setHFt(saved.hFt);
      if (saved.hIn      !== undefined) setHIn(saved.hIn);
      if (saved.hCm      !== undefined) setHCm(saved.hCm);
      if (saved.sex      !== undefined) setSex(saved.sex);
      if (saved.unit     !== undefined) setUnit(saved.unit);
      if (saved.formula  !== undefined) setFormula(saved.formula);
      if (saved.activity !== undefined) setActivity(saved.activity);
      if (saved.goal     !== undefined) setGoal(saved.goal);
      if (saved.prot     !== undefined) setProt(saved.prot);
      if (saved.carb     !== undefined) setCarb(saved.carb);
      if (saved.fatP     !== undefined) setFatP(saved.fatP);
      if (saved.diet     !== undefined) setDiet(saved.diet);
      if (saved.mealUnits !== undefined) setMealUnits(saved.mealUnits);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ age, weight, hFt, hIn, hCm, sex, unit, formula, activity, goal, prot, carb, fatP, diet, mealUnits }));
  }, [age, weight, hFt, hIn, hCm, sex, unit, formula, activity, goal, prot, carb, fatP, diet, mealUnits]);

  const getFoodUsage = () => {
    try { return JSON.parse(localStorage.getItem("foodUsageCount") || "{}"); }
    catch { return {}; }
  };

  const incrementFoodUsage = (id) => {
    const usage = getFoodUsage();
    usage[id] = (usage[id] || 0) + 1;
    localStorage.setItem("foodUsageCount", JSON.stringify(usage));
  };

  useEffect(() => {
    fetch("/foods.json")
      .then(r => r.json())
      .then(data => { setFoodsData(data); setFoodsLoading(false); })
      .catch(() => setFoodsLoading(false));
  }, []);

  const allFoods = useMemo(() => {
    if (!foodsData) return [];
    return Object.entries(foodsData.categories).flatMap(([catKey, cat]) =>
      (cat.items || []).map(item => ({ ...item, catKey, catLabel: cat.label }))
    );
  }, [foodsData]);

  const foodById = useMemo(() => {
    const map = {};
    allFoods.forEach(f => { map[f.id] = f; });
    return map;
  }, [allFoods]);

  const dietFiltered = useMemo(() => {
    if (diet === "all") return allFoods;
    if (diet === "vegetarian") return allFoods.filter(f => !VEG_EXCLUDE_CATS.has(f.catKey));
    return allFoods.filter(f => !VEG_EXCLUDE_CATS.has(f.catKey) && !VEGAN_EXCLUDE_IDS.has(f.id));
  }, [allFoods, diet]);

  const macroFiltered = useMemo(() => {
    const usage = getFoodUsage();
    let list = [...dietFiltered];
    if (macroFilter !== "any") {
      const min = macroFilter === "carbs" ? 5 : 2;
      list = list.filter(f => (f.per100[macroFilter] || 0) >= min);
    }
    const favThreshold = 3;
    if (sortBy === "popular_desc") {
      list.sort((a, b) => {
        const aFav = (usage[a.id] || 0) >= favThreshold;
        const bFav = (usage[b.id] || 0) >= favThreshold;
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return (b.popularity || 50) - (a.popularity || 50);
      });
    } else if (sortBy === "popular_asc") {
      list.sort((a, b) => (a.popularity || 50) - (b.popularity || 50));
    } else if (sortBy === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "macro_high" && macroFilter !== "any") {
      list.sort((a, b) => (b.per100[macroFilter] || 0) - (a.per100[macroFilter] || 0));
    } else if (sortBy === "macro_low" && macroFilter !== "any") {
      list.sort((a, b) => (a.per100[macroFilter] || 0) - (b.per100[macroFilter] || 0));
    }
    return list;
  }, [dietFiltered, macroFilter, sortBy]);

  const availableCats = useMemo(() => {
    const present = new Set(macroFiltered.map(f => f.catKey));
    return CATEGORIES.filter(c => present.has(c.id));
  }, [macroFiltered]);

  useEffect(() => {
    if (selectedCat && !availableCats.find(c => c.id === selectedCat)) setSelectedCat(null);
  }, [availableCats, selectedCat]);

  const catFiltered = useMemo(() => {
    if (!selectedCat) return macroFiltered;
    return macroFiltered.filter(f => f.catKey === selectedCat);
  }, [macroFiltered, selectedCat]);

  const displayFoods = useMemo(() => {
    if (foodSearch.length < 2) return catFiltered;
    const q = foodSearch.toLowerCase();
    return catFiltered.filter(f => f.name.toLowerCase().includes(q));
  }, [foodSearch, catFiltered]);

  const showSearch = foodSearch.length >= 2;

  const groupedFoods = useMemo(() => {
    const usage = getFoodUsage();
    const favThreshold = 3;
    const groups = new Map();
    if (sortBy === "popular_desc") {
      const favs = displayFoods.filter(f => (usage[f.id] || 0) >= favThreshold);
      if (favs.length > 0) {
        groups.set("__favs__", { label: "Your Favourites", foods: favs, isFavs: true });
      }
    }
    displayFoods.forEach(f => {
      if (sortBy === "popular_desc" && (usage[f.id] || 0) >= favThreshold) return;
      if (!groups.has(f.catKey)) groups.set(f.catKey, { label: f.catLabel, foods: [], isFavs: false });
      groups.get(f.catKey).foods.push(f);
    });
    return [...groups.values()];
  }, [displayFoods, sortBy]);

  const needsBF = FORMULAS.find(f => f.id === formula).needsBF;

  const sl = (which, val) => {
    val = Math.max(5, Math.min(90, val));
    const others = 100 - val;
    if (which === "p") {
      const ratio = carb + fatP === 0 ? 0.5 : carb / (carb + fatP);
      setProt(val); const c = Math.round(others * ratio); setCarb(c); setFatP(100 - val - c);
    } else if (which === "c") {
      const ratio = prot + fatP === 0 ? 0.5 : prot / (prot + fatP);
      setCarb(val); const p = Math.round(others * ratio); setProt(p); setFatP(100 - val - p);
    } else {
      const ratio = prot + carb === 0 ? 0.5 : prot / (prot + carb);
      setFatP(val); const p = Math.round(others * ratio); setProt(p); setCarb(100 - val - p);
    }
  };

  const res = useCallback(() => {
    const a_=parseInt(age),w_=parseFloat(weight),bf_=parseFloat(bf);
    if(!a_||!w_||a_<10||a_>120||w_<=0) return null;
    const wK=unit==="imperial"?w_*0.453592:w_;
    let hC; if(unit==="imperial"){const ft=parseInt(hFt);if(!ft||ft<2)return null;hC=ft*30.48+(parseInt(hIn)||0)*2.54;}else{const cm=parseInt(hCm);if(!cm||cm<60)return null;hC=cm;}
    if(formula==="katch"&&(!bf_||bf_<2||bf_>60))return null;
    const bmr=calcBMR(formula,sex,wK,hC,a_,bf_);const tdee=bmr*activity;const t=Math.round(tdee+GOALS.find(g=>g.id===goal).offset);
    return{bmr:Math.round(bmr),tdee:Math.round(tdee),target:t,pG:Math.round((t*prot/100)/4),cG:Math.round((t*carb/100)/4),fG:Math.round((t*fatP/100)/9)};
  },[formula,unit,sex,age,weight,hFt,hIn,hCm,bf,activity,goal,prot,carb,fatP]);

  const r = res();
  const rda = RDA[sex] || RDA.male;

  const resolveGrams = (food, unitStr) => {
    if (!unitStr || unitStr === "grams") return 1;
    const serving = (food.servings || []).find(s => s.unit === unitStr);
    return serving ? serving.grams : 1;
  };

  const mealTotals = useCallback(() => {
    const t = { cal:0, protein:0, carbs:0, fat:0 };
    MICRO_KEYS.forEach(k => t[k] = 0);
    Object.entries(meal).forEach(([id, qty]) => {
      if (!qty || qty <= 0) return;
      const food = foodById[id];
      if (!food) return;
      const unitStr = mealUnits[id];
      const gramsPerUnit = resolveGrams(food, unitStr);
      const grams = qty * gramsPerUnit;
      const m = grams / 100;
      t.cal += food.per100.cal * m;
      t.protein += food.per100.protein * m;
      t.carbs += food.per100.carbs * m;
      t.fat += food.per100.fat * m;
      MICRO_KEYS.forEach(k => { t[k] += (food.per100[k] || 0) * m; });
    });
    Object.keys(t).forEach(k => t[k] = Math.round(t[k] * 10) / 10);
    return t;
  }, [meal, mealUnits, foodById]);

  const mt = mealTotals();
  const hasMeal = Object.values(meal).some(v => v > 0);

  const toggleFood = (id, food) => {
    setMeal(prev => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        delete next[id];
        setMealUnits(mu => { const n={...mu}; delete n[id]; return n; });
      } else {
        next[id] = 1;
        incrementFoodUsage(id);
        const defaultUnit = food.servings && food.servings.length > 0 ? food.servings[0].unit : "grams";
        setMealUnits(mu => ({ ...mu, [id]: defaultUnit }));
      }
      return next;
    });
  };

  const setGrams = (id, g) => {
    setMeal(prev => ({ ...prev, [id]: Math.max(0, parseFloat(g) || 0) }));
  };

  const setFoodUnit = (id, unitStr) => {
    setMealUnits(prev => ({ ...prev, [id]: unitStr }));
    setMeal(prev => ({ ...prev, [id]: 1 }));
  };

  const pctBar = (val, rdaV) => {
    const pct = Math.min(Math.round((val / rdaV) * 100), 999);
    const w = Math.min(pct, 100);
    return { pct, w };
  };

  const cardStyle = { 
    background: CARD, 
    borderRadius: 20, 
    padding: "24px 20px", 
    marginBottom: 20, 
    boxShadow: "var(--shadow)", 
    border: "1px solid var(--border)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  };
  const inputStyle = { 
    width: "100%", 
    padding: "13px 12px", 
    minHeight: 48, 
    borderRadius: 14, 
    border: "1px solid var(--border)", 
    background: "var(--input-bg)", 
    color: TXT, 
    fontSize: 16, 
    fontFamily: NUM_FONT, 
    outline: "none", 
    boxSizing: "border-box", 
    fontWeight: 500 
  };
  const labelStyle = { 
    display: "block", 
    fontSize: 11, 
    fontWeight: 800, 
    color: MUTE, 
    letterSpacing: "1.5px", 
    textTransform: "uppercase", 
    marginBottom: 10, 
    fontFamily: HEADER_FONT 
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: HEADER_FONT, color: TXT, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>

      <header style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: ACC, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, color: WHITE, boxShadow: "0 8px 16px -4px rgba(4,120,87,0.4)" }}>M</div>
          <div>
            <h1 className="typewriter-title" style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>Macro Calculator</h1>
            <p style={{ margin: 0, fontSize: 13, color: MUTE, fontWeight: 500 }}>Elite Performance · No login · Free</p>
          </div>
        </div>
        <button 
          onClick={() => setShowFeedback(true)}
          style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            color: MUTE, 
            padding: "8px 16px", 
            borderRadius: 10, 
            border: "1px solid var(--border)", 
            background: CARD,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = ACC; e.target.style.color = TXT; }}
          onMouseLeave={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.color = MUTE; }}
        >
          Give Feedback
        </button>
      </header>

      <div className="app-layout">
        <div className="app-left">
          <div style={cardStyle}>
            <SH n="1" t="Choose Your Formula" />
            {FORMULAS.map(f => (
              <button key={f.id} onClick={() => setFormula(f.id)} style={{ display: "block", width: "100%", position: "relative", borderRadius: 16, padding: 18, textAlign: "left", cursor: "pointer", border: "1px solid var(--border)", fontFamily: "inherit", marginBottom: 12, background: formula === f.id ? HIGHLIGHT : CARD, color: formula === f.id ? "#000" : TXT, transition: "all 0.2s ease", boxShadow: formula === f.id ? "0 4px 12px -2px rgba(163,230,53,0.4)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{f.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: formula === f.id ? "rgba(0,0,0,0.1)" : "var(--input-bg)", color: formula === f.id ? "#000" : MUTE }}>{f.badge}</span>
                </div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: formula === f.id ? "rgba(0,0,0,0.6)" : MUTE }}>{f.who}</p>
                <p style={{ margin: 0, fontSize: 12, color: formula === f.id ? "rgba(0,0,0,0.5)" : MUTE }}>{f.detail}</p>
                {formula === f.id && <div style={{ position: "absolute", top: 18, right: 18, width: 24, height: 24, borderRadius: "50%", background: "#000", color: HIGHLIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>✓</div>}
              </button>
            ))}
          </div>

          <div style={cardStyle}>
            <SH n="2" t="Your Details" />
            <R l="Units"><Tog opts={[{ id: "imperial", l: "Imperial" }, { id: "metric", l: "Metric" }]} v={unit} s={setUnit} /></R>
            <R l="Sex"><Tog opts={[{ id: "male", l: "Male" }, { id: "female", l: "Female" }]} v={sex} s={setSex} /></R>
            <R l="Age"><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28" style={inputStyle} /></R>
            <R l={`Weight (${unit === "imperial" ? "lbs" : "kg"})`}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === "imperial" ? "e.g. 170" : "e.g. 77"} style={inputStyle} /></R>
            <R l="Height">
              {unit === "imperial"
                ? <div style={{ display: "flex", gap: 10 }}><input type="number" value={hFt} onChange={e => setHFt(e.target.value)} placeholder="ft" style={{ ...inputStyle, flex: 1 }} /><input type="number" value={hIn} onChange={e => setHIn(e.target.value)} placeholder="in" style={{ ...inputStyle, flex: 1 }} /></div>
                : <input type="number" value={hCm} onChange={e => setHCm(e.target.value)} placeholder="e.g. 178 cm" style={inputStyle} />}
            </R>
            {needsBF && <R l="Body Fat %"><input type="number" value={bf} onChange={e => setBf(e.target.value)} placeholder="e.g. 15" style={inputStyle} /></R>}
            <R l="Activity Level">
              {ACT.map(a => (
                <button key={a.v} onClick={() => setActivity(a.v)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", minHeight: 44, borderRadius: 16, border: "1px solid var(--border)", background: activity === a.v ? HIGHLIGHT : CARD, color: activity === a.v ? "#000" : TXT, cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%", marginBottom: 10, transition: "all 0.2s ease" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: activity === a.v ? "#000" : "var(--border)", flexShrink: 0 }} />
                  <div><div style={{ fontSize: 15, fontWeight: 700 }}>{a.label}</div><div style={{ fontSize: 13, color: activity === a.v ? "rgba(0,0,0,0.6)" : MUTE }}>{a.desc}</div></div>
                </button>
              ))}
            </R>
            <R l="Goal">
              <div style={{ display: "flex", gap: 10 }}>
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => setGoal(g.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "16px 8px", minHeight: 44, borderRadius: 16, border: "1px solid var(--border)", background: goal === g.id ? HIGHLIGHT : CARD, color: goal === g.id ? "#000" : TXT, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease" }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{g.label}</span>
                    <span style={{ fontSize: 11, color: goal === g.id ? "rgba(0,0,0,0.6)" : MUTE }}>{g.offset > 0 ? "+" : ""}{g.offset} cal</span>
                  </button>
                ))}
              </div>
            </R>
            <R l="Macro Split">
              {[{ k: "p", l: "Protein", v: prot, c: PROT_COLOR }, { k: "c", l: "Carbs", v: carb, c: CARB_COLOR }, { k: "f", l: "Fat", v: fatP, c: FAT_COLOR }].map(m => (
                <div key={m.k} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: MUTE, marginBottom: 8 }}><span>{m.l}</span><span style={{ color: m.c, fontWeight: 800 }}>{m.v}%</span></div>
                  <input type="range" min={5} max={90} value={m.v} onChange={e => sl(m.k, parseInt(e.target.value))} style={{ width: "100%", accentColor: m.c, cursor: "pointer" }} />
                </div>
              ))}
              {(() => {
                const B = 20;
                const pB = Math.round(prot / 100 * B);
                const cB = Math.round(carb / 100 * B);
                const fB = Math.max(0, B - pB - cB);
                return (
                  <div style={{ fontSize: 20, letterSpacing: "1px", lineHeight: 1, marginTop: 8, userSelect: "none" }}>
                    <span style={{ color: PROT_COLOR }}>{"█".repeat(pB)}</span>
                    <span style={{ color: CARB_COLOR }}>{"█".repeat(cB)}</span>
                    <span style={{ color: FAT_COLOR }}>{"█".repeat(fB)}</span>
                  </div>
                );
              })()}
            </R>
          </div>
        </div>

        <div className="app-right">
          <div style={{ ...cardStyle, background: ACC, color: WHITE, border: "none" }}>
            <SH n="3" t="Elite Results" />
            {!r ? (
              <div style={{ textAlign: "center", padding: "36px 16px", color: "rgba(255,255,255,0.6)" }}>
                <div style={{ fontSize: 42, marginBottom: 12 }}>⚡</div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Awaiting performance metrics...</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 800, opacity: 0.8, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 8 }}>Target Caloric Intake</span>
                  <span style={{ display: "block", fontSize: 72, fontWeight: 900, letterSpacing: "-3px", lineHeight: 1 }}><AN value={r.target} cursor /></span>
                  <span style={{ display: "block", fontSize: 16, opacity: 0.7, marginTop: 8, fontWeight: 600 }}>KCAL / DAY</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  {[{ l: "BMR", v: r.bmr, t: "Base Rate" }, { l: "TDEE", v: r.tdee, t: "Total Burn" }].map(c => (
                    <div key={c.l} style={{ flex: 1, borderRadius: 16, padding: "20px 14px", textAlign: "center", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}>
                      <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: HIGHLIGHT, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>{c.l}</span>
                      <span style={{ display: "block", fontSize: 32, fontWeight: 900, letterSpacing: "-1.5px" }}><AN value={c.v} /></span>
                      <span style={{ display: "block", fontSize: 12, opacity: 0.6, marginTop: 4, fontWeight: 600 }}>{c.t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ l: "Protein", g: r.pG, p: prot, c: PROT_COLOR }, { l: "Carbs", g: r.cG, p: carb, c: CARB_COLOR }, { l: "Fat", g: r.fG, p: fatP, c: FAT_COLOR }].map(m => (
                    <div key={m.l} style={{ flex: 1, borderRadius: 16, padding: "18px 8px", textAlign: "center", background: CARD, color: TXT }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.c, margin: "0 auto 8px", boxShadow: `0 0 8px ${m.c}` }} />
                      <span style={{ display: "block", fontSize: 12, fontWeight: 800, color: MUTE, textTransform: "uppercase" }}>{m.l}</span>
                      <span style={{ display: "block", fontSize: 28, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, margin: "4px 0" }}><AN value={m.g} />g</span>
                      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: m.c }}>{m.p}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={cardStyle}>
            <SH n="4" t="Meal Builder" />
            <p style={{ fontSize: 14, color: MUTE, marginTop: -12, marginBottom: 24, fontWeight: 500 }}>Select athletic fuel to analyze nutritional density.</p>
            <R l="Diet Preference"><Tog opts={[{ id: "all", l: "Standard" }, { id: "vegetarian", l: "Veg" }, { id: "vegan", l: "Vegan" }]} v={diet} s={setDiet} /></R>
            <R l="Macro Focus"><Tog opts={[{ id: "any", l: "All" }, { id: "protein", l: "Protein" }, { id: "carbs", l: "Carbs" }, { id: "fat", l: "Fat" }]} v={macroFilter} s={setMacroFilter} /></R>
            {availableCats.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <span style={labelStyle}>Inventory</span>
                <div className="tabs-scroll">
                  <div style={{ display: "flex", gap: 8, width: "max-content" }}>
                    {availableCats.map(cat => (
                      <button key={cat.id} onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)} style={{ padding: "12px 18px", minHeight: 44, borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: HEADER_FONT, whiteSpace: "nowrap", background: selectedCat === cat.id ? HIGHLIGHT : CARD, color: selectedCat === cat.id ? "#000" : TXT, transition: "all 0.2s ease" }}>{cat.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <span style={labelStyle}>Organization</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, flex: 1, background:CARD }}>
                  <option value="popular_desc">Most Utilized</option>
                  <option value="popular_asc">Emerging</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                  {macroFilter !== "any" && (
                    <>
                      <option value="macro_high">Peak {macroFilter.charAt(0).toUpperCase() + macroFilter.slice(1)}</option>
                      <option value="macro_low">Base {macroFilter.charAt(0).toUpperCase() + macroFilter.slice(1)}</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16, position: "relative" }}>
              <input type="text" value={foodSearch} onChange={e => setFoodSearch(e.target.value)} placeholder="Search performance database..." style={{ ...inputStyle, paddingLeft: 46, background:CARD }} />
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: MUTE, pointerEvents: "none" }}>🔍</span>
              {foodSearch.length > 0 && <button onClick={() => setFoodSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: MUTE, fontSize: 20, lineHeight: 1, padding: "10px", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
            </div>
            {!foodsLoading && groupedFoods.map(group => (
              <div key={group.label}>
                <div style={{ fontSize: 12, fontWeight: 800, color: group.isFavs ? ACC : MUTE, letterSpacing: "2.5px", textTransform: "uppercase", margin: "28px 0 14px", paddingBottom: 8, borderBottom: `2px solid ${group.isFavs ? HIGHLIGHT : "var(--border)"}`, display: "flex", alignItems: "center", gap: 8 }}>
                  {group.isFavs && <span style={{color:HIGHLIGHT}}>★</span>}{group.label}
                </div>
                {group.foods.map(food => {
                  const selected = meal[food.id] !== undefined;
                  const g = meal[food.id] || 0;
                  return (
                    <div key={food.id} className="food-card" style={{ borderRadius: 16, padding: "16px 20px", marginBottom: 10, background: CARD, border: selected ? "2px solid " + HIGHLIGHT : "1px solid var(--border)", boxShadow: selected ? "0 8px 20px -4px rgba(163,230,53,0.3)" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleFood(food.id, food)}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {macroFilter === "any" ? (
                            <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 16, fontWeight: 800, display:"block", width:"100%", letterSpacing: "-0.3px" }}>{food.name}</span>
                              <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT, fontWeight: 600 }}><b style={{ color: TXT }}>{food.per100.cal}</b> CAL</span>
                              <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT, fontWeight: 600 }}><b style={{ color: TXT }}>{food.per100.protein}G</b> <span style={{ color: PROT_COLOR, fontWeight: 800 }}>P</span></span>
                              <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT, fontWeight: 600 }}><b style={{ color: TXT }}>{food.per100.carbs}G</b> <span style={{ color: CARB_COLOR, fontWeight: 800 }}>C</span></span>
                              <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT, fontWeight: 600 }}><b style={{ color: TXT }}>{food.per100.fat}G</b> <span style={{ color: FAT_COLOR, fontWeight: 800 }}>F</span></span>
                            </div>
                          ) : (
                            <>
                              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>{food.name}</span>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                                <span style={{ fontSize: 24, fontWeight: 900, color: TXT, fontFamily: NUM_FONT, lineHeight: 1 }}>{food.per100[macroFilter]}g</span>
                                <span style={{ fontSize: 13, color: MUTE, fontWeight: 700, textTransform: "uppercase" }}>{macroFilter} / 100g</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: selected ? HIGHLIGHT : "var(--input-bg)", color: selected ? "#000" : MUTE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 }}>{selected ? "✓" : "+"}</div>
                      </div>
                      {selected && (() => {
                        const currentUnit = mealUnits[food.id] || "grams";
                        const gramsPerUnit = resolveGrams(food, currentUnit);
                        const qty = meal[food.id] || 0;
                        const grams = qty * gramsPerUnit;
                        const unitOptions = ["grams", ...(food.servings || []).map(s => s.unit)];
                        return (
                          <div style={{ marginTop: 16, padding: "16px", background: "var(--input-bg)", borderRadius: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <input type="number" value={qty} onChange={e => setGrams(food.id, e.target.value)} min="0" step="0.5" style={{ ...inputStyle, width: 90, background:CARD, textAlign: "center" }} />
                              <select value={currentUnit} onChange={e => setFoodUnit(food.id, e.target.value)} style={{ ...inputStyle, flex: 1, background:CARD, fontSize: 14, fontWeight: 700 }}>{unitOptions.map(u => <option key={u} value={u}>{u}</option>)}</select>
                            </div>
                            {currentUnit !== "grams" && <p style={{ margin: "10px 0 0", fontSize: 12, color: MUTE, fontWeight: 600 }}>= <strong style={{ color: TXT, fontFamily: NUM_FONT }}>{Math.round(grams)}g</strong> total mass</p>}
                            {qty > 0 && (
                              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 13, color: MUTE, fontFamily: NUM_FONT, fontWeight: 700 }}><b style={{ color: TXT }}>{Math.round(food.per100.cal * grams / 100)}</b> CAL</span>
                                <span style={{ fontSize: 13, color: MUTE, fontFamily: NUM_FONT, fontWeight: 700 }}><b style={{ color: TXT }}>{Math.round(food.per100.protein * grams / 100 * 10) / 10}G</b> <span style={{ color: PROT_COLOR, fontWeight: 800 }}>P</span></span>
                                <span style={{ fontSize: 13, color: MUTE, fontFamily: NUM_FONT, fontWeight: 700 }}><b style={{ color: TXT }}>{Math.round(food.per100.carbs * grams / 100 * 10) / 10}G</b> <span style={{ color: CARB_COLOR, fontWeight: 800 }}>C</span></span>
                                <span style={{ fontSize: 13, color: MUTE, fontFamily: NUM_FONT, fontWeight: 700 }}><b style={{ color: TXT }}>{Math.round(food.per100.fat * grams / 100 * 10) / 10}G</b> <span style={{ color: FAT_COLOR, fontWeight: 800 }}>F</span></span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {hasMeal && (
            <div style={cardStyle}>
              <SH n="5" t="Athletic Analysis" />
              <div style={{ marginBottom: 20 }}>
                {Object.entries(meal).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                  const food = foodById[id];
                  if (!food) return null;
                  const currentUnit = mealUnits[id] || "grams";
                  const gramsPerUnit = resolveGrams(food, currentUnit);
                  const grams = qty * gramsPerUnit;
                  const display = currentUnit === "grams" ? `${grams}g` : `${qty} ${currentUnit} (${Math.round(grams)}g)`;
                  return (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>{food.name}</span>
                      <span style={{ fontSize: 13, color: MUTE, fontFamily: NUM_FONT, fontWeight: 600 }}>{display} · {Math.round(food.per100.cal * grams / 100)} CAL</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                {[
                  { l: "Calories", v: Math.round(mt.cal), u: "kcal", target: r?.target },
                  { l: "Protein", v: Math.round(mt.protein), u: "g", target: r?.pG },
                  { l: "Carbs", v: Math.round(mt.carbs), u: "g", target: r?.cG },
                  { l: "Fat", v: Math.round(mt.fat), u: "g", target: r?.fG },
                ].map(m => (
                  <div key={m.l} style={{ flex: 1, borderRadius: 16, padding: "18px 6px", textAlign: "center", border: "1px solid var(--border)", background: "var(--input-bg)" }}>
                    <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: MUTE, letterSpacing: "1.5px", textTransform: "uppercase" }}>{m.l}</span>
                    <span style={{ display: "block", fontSize: 24, fontWeight: 900, margin: "6px 0", letterSpacing: "-0.5px", fontFamily: NUM_FONT }}>{m.v}</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTE, fontWeight: 700 }}>{m.u}</span>
                    {m.target && <span style={{ display: "block", fontSize: 10, color: ACC, marginTop: 4, fontWeight: 800 }}>GOAL: {m.target}</span>}
                  </div>
                ))}
              </div>
              <span style={labelStyle}>Nutritional Density Coverage</span>
              {MICRO_KEYS.map(k => {
                const { pct, w } = pctBar(mt[k], rda[k]);
                return (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800 }}>{MICRO_LABELS[k]}</span>
                      <span style={{ color: pct >= 100 ? HIGHLIGHT : pct >= 50 ? MUTE : "#EF4444", fontWeight: 800, fontFamily: NUM_FONT }}>{Math.round(mt[k] * 10) / 10}{MICRO_UNITS[k]} · {pct}%</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 12, background: "var(--border)", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
                      <div style={{ height: "100%", width: w + "%", background: pct >= 100 ? HIGHLIGHT : pct >= 50 ? ACC : "#EF4444", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: pct >= 100 ? `0 0 12px ${HIGHLIGHT}` : "none" }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setMeal({})} style={{ width: "100%", padding: "16px", minHeight: 44, borderRadius: 16, border: "none", background: "#000", color: HIGHLIGHT, fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: HEADER_FONT, marginTop: 12, boxShadow: "0 10px 20px -10px rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "2px" }}>Reset Performance Log</button>
            </div>
          )}
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: "60px 40px", fontSize: 13, color: MUTE, fontFamily: HEADER_FONT, fontWeight: 600, letterSpacing: "0.5px" }}>MACROCALCULATORFREE.COM · ELITE ATHLETIC EDITION</footer>

      {/* FEEDBACK MODAL */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: HEADER_FONT }}>Share Your Feedback</h2>
            <p style={{ fontSize: 14, color: MUTE, marginTop: 8 }}>Help us improve the elite calculator experience.</p>
            
            <textarea
              className="modal-textarea"
              placeholder="Tell us what you'd like to see or report an issue..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => { setShowFeedback(false); setFeedbackText(""); }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--input-bg)", color: TXT, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  window.location.href = 'mailto:gavishah21@gmail.com?subject=Macro Calculator Feedback&body=' + encodeURIComponent(feedbackText);
                  setShowFeedback(false);
                  setFeedbackText("");
                }}
                style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: ACC, color: WHITE, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px -2px rgba(4,120,87,0.3)" }}
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helpers ── */
function SH({ n, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28, borderRadius:8, background:HIGHLIGHT, color:"#000", fontWeight: 900, fontSize: 14, fontFamily: NUM_FONT, flexShrink: 0, boxShadow: "0 4px 10px -2px rgba(163,230,53,0.5)" }}>{n}</span>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", fontFamily: HEADER_FONT }}>{t}</h2>
    </div>
  );
}
function R({ l, children }) {
  return <div style={{ marginBottom: 24 }}><span style={{ display: "block", fontSize: 12, fontWeight: 800, color: MUTE, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>{l}</span>{children}</div>;
}
function Tog({ opts, v, s }) {
  return (
    <div style={{ display: "flex", background: "var(--input-bg)", padding: 5, borderRadius: 16, border: "1px solid var(--border)" }}>
      {opts.map((o) => (
        <button key={o.id} onClick={() => s(o.id)} style={{ flex: 1, padding: "10px 4px", minHeight: 40, borderRadius: 12, border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", background: v === o.id ? HIGHLIGHT : "transparent", color: v === o.id ? "#000" : MUTE, boxShadow: v === o.id ? "0 4px 12px -2px rgba(163,230,53,0.4)" : "none" }}>{o.l}</button>
      ))}
    </div>
  );
}

