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
      /* 400 ms animation + 1 000 ms blink = 1 400 ms total */
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
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

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
const BG = "#F4F4F0";
const CARD = "#FFFFFF";
const TXT = "#111827";
const MUTE = "#6B7280";
const ACC = "#111827";
const WHITE = "#FFFFFF";
const NUM_FONT = "'IBM Plex Mono', 'JetBrains Mono', monospace";
const HEADER_FONT = "'Space Grotesk', 'Inter', system-ui, sans-serif";
const PROT_COLOR = "#EF4444";
const CARB_COLOR = "#F59E0B";
const FAT_COLOR = "#3B82F6";

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
  const [mealUnits, setMealUnits] = useState({}); // { foodId: "unit_string" }

  /* ── Foods database state ── */
  const [foodsData, setFoodsData] = useState(null);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular_desc");

  /* ── localStorage: restore on mount ── */
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

  /* ── localStorage: save on every change ── */
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ age, weight, hFt, hIn, hCm, sex, unit, formula, activity, goal, prot, carb, fatP, diet, mealUnits }));
  }, [age, weight, hFt, hIn, hCm, sex, unit, formula, activity, goal, prot, carb, fatP, diet, mealUnits]);

  // Track food usage counts
  const getFoodUsage = () => {
    try { return JSON.parse(localStorage.getItem("foodUsageCount") || "{}"); }
    catch { return {}; }
  };

  const incrementFoodUsage = (id) => {
    const usage = getFoodUsage();
    usage[id] = (usage[id] || 0) + 1;
    localStorage.setItem("foodUsageCount", JSON.stringify(usage));
  };

  /* ── Fetch foods.json on mount ── */
  useEffect(() => {
    fetch("/foods.json")
      .then(r => r.json())
      .then(data => { setFoodsData(data); setFoodsLoading(false); })
      .catch(() => setFoodsLoading(false));
  }, []);

  /* ── Derived: flat list + lookup map ── */
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

  /* ── Step 1: diet filter ── */
  const dietFiltered = useMemo(() => {
    if (diet === "all") return allFoods;
    if (diet === "vegetarian") return allFoods.filter(f => !VEG_EXCLUDE_CATS.has(f.catKey));
    return allFoods.filter(f => !VEG_EXCLUDE_CATS.has(f.catKey) && !VEGAN_EXCLUDE_IDS.has(f.id));
  }, [allFoods, diet]);

  /* ── Step 2: macro filter + sort ── */
  const macroFiltered = useMemo(() => {
    const usage = getFoodUsage();
    let list = [...dietFiltered];

    // Macro filter
    if (macroFilter !== "any") {
      const min = macroFilter === "carbs" ? 5 : 2;
      list = list.filter(f => (f.per100[macroFilter] || 0) >= min);
    }

    // Sort
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

  /* ── Step 3: available category chips (in CATEGORIES order) ── */
  const availableCats = useMemo(() => {
    const present = new Set(macroFiltered.map(f => f.catKey));
    return CATEGORIES.filter(c => present.has(c.id));
  }, [macroFiltered]);

  /* ── Auto-reset selectedCat when it disappears after filter change ── */
  useEffect(() => {
    if (selectedCat && !availableCats.find(c => c.id === selectedCat)) setSelectedCat(null);
  }, [availableCats, selectedCat]);

  /* ── Step 4: category selection ── */
  const catFiltered = useMemo(() => {
    if (!selectedCat) return macroFiltered;
    return macroFiltered.filter(f => f.catKey === selectedCat);
  }, [macroFiltered, selectedCat]);

  /* ── Step 5: search across already-filtered results ── */
  const displayFoods = useMemo(() => {
    if (foodSearch.length < 2) return catFiltered;
    const q = foodSearch.toLowerCase();
    return catFiltered.filter(f => f.name.toLowerCase().includes(q));
  }, [foodSearch, catFiltered]);

  const showSearch = foodSearch.length >= 2;

  /* ── Group by category for display ── */
  const groupedFoods = useMemo(() => {
    const usage = getFoodUsage();
    const favThreshold = 3;
    const groups = new Map();

    // Separate favourites when sorting by popular_desc
    if (sortBy === "popular_desc") {
      const favs = displayFoods.filter(f => (usage[f.id] || 0) >= favThreshold);
      if (favs.length > 0) {
        groups.set("__favs__", { label: "Your Favourites", foods: favs, isFavs: true });
      }
    }

    displayFoods.forEach(f => {
      // Skip favs — already shown above
      if (sortBy === "popular_desc" && (usage[f.id] || 0) >= favThreshold) return;
      if (!groups.has(f.catKey)) groups.set(f.catKey, { label: f.catLabel, foods: [], isFavs: false });
      groups.get(f.catKey).foods.push(f);
    });

    return [...groups.values()];
  }, [displayFoods, sortBy]);

  const needsBF = FORMULAS.find(f => f.id === formula).needsBF;

  /* macro slider */
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

  /* results */
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

  // Given a food and its current selected unit string, return grams per 1 unit
  const resolveGrams = (food, unitStr) => {
    if (!unitStr || unitStr === "grams") return 1; // 1 gram = 1 gram
    const serving = (food.servings || []).find(s => s.unit === unitStr);
    return serving ? serving.grams : 1;
  };

  // Given a food and unit, return total grams for the quantity entered
  const totalGrams = (food, id) => {
    const qty = meal[id] || 0;
    const unitStr = mealUnits[id];
    const gramsPerUnit = resolveGrams(food, unitStr);
    return qty * gramsPerUnit;
  };

  /* meal totals — uses foodById from fetched data */
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
        // Default quantity = 1, default unit = first serving if available, else "grams"
        next[id] = 1;
        incrementFoodUsage(id);
        const defaultUnit = food.servings && food.servings.length > 0 
          ? food.servings[0].unit 
          : "grams";
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
    // Reset quantity to 1 when changing unit
    setMeal(prev => ({ ...prev, [id]: 1 }));
  };

  const pctBar = (val, rdaV) => {
    const pct = Math.min(Math.round((val / rdaV) * 100), 999);
    const w = Math.min(pct, 100);
    return { pct, w };
  };

  const cardStyle = { background: CARD, border: "2px solid " + TXT, borderRadius: 0, padding: "24px 20px", marginBottom: 18 };
  const inputStyle = { width: "100%", padding: "13px 12px", minHeight: 44, borderRadius: 0, border: "2px solid " + TXT, background: "transparent", color: TXT, fontSize: 16, fontFamily: NUM_FONT, outline: "none", boxSizing: "border-box", fontWeight: 500, WebkitAppearance: "none", appearance: "none" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: MUTE, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, fontFamily: HEADER_FONT };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: HEADER_FONT, color: TXT, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>

      {/* HEADER */}
      <header style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 8px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 0, background: CARD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, color: ACC, border: "2px solid " + TXT, boxShadow: "4px 4px 0px 0px " + TXT }}>M</div>
        <div>
          <h1 className="typewriter-title" style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Macro Calculator</h1>
          <p style={{ margin: 0, fontSize: 12, color: MUTE }}>Free · No login · No tracking · No ads</p>
        </div>
      </header>

      <div className="app-layout">
        <div className="app-left">
          {/* ── 1. FORMULA ── */}
          <div style={cardStyle}>
            <SH n="1" t="Choose Your Formula" />
            {FORMULAS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormula(f.id)}
                style={{
                  display: "block",
                  width: "100%",
                  position: "relative",
                  borderRadius: 0,
                  padding: 16,
                  textAlign: "left",
                  cursor: "pointer",
                  border: "2px solid " + TXT,
                  fontFamily: "inherit",
                  marginBottom: 10,
                  background: formula === f.id ? ACC : CARD,
                  color: formula === f.id ? WHITE : TXT,
                  transition: "all 0.1s ease",
                  boxShadow: formula === f.id ? "none" : "4px 4px 0px 0px " + TXT
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 0, background: formula === f.id ? WHITE : "#ddd", color: formula === f.id ? ACC : MUTE, border: formula === f.id ? "none" : "1px solid " + MUTE }}>{f.badge}</span>
                </div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: formula === f.id ? "rgba(255,255,255,0.65)" : MUTE }}>{f.who}</p>
                <p style={{ margin: 0, fontSize: 12, color: formula === f.id ? "rgba(255,255,255,0.5)" : MUTE }}>{f.detail}</p>
                {formula === f.id && <div style={{ position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: 0, background: WHITE, color: ACC, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>✓</div>}
              </button>
            ))}
          </div>

          {/* ── 2. DETAILS ── */}
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
                <button
                  key={a.v}
                  onClick={() => setActivity(a.v)}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "12px 14px",
                    minHeight: 44,
                    borderRadius: 0,
                    border: "2px solid " + TXT,
                    background: activity === a.v ? ACC : CARD,
                    color: activity === a.v ? WHITE : TXT,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    width: "100%",
                    marginBottom: 8,
                    transition: "all 0.1s ease",
                    boxShadow: activity === a.v ? "none" : "3px 3px 0px 0px " + TXT
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 0, background: activity === a.v ? WHITE : MUTE, flexShrink: 0 }} />
                  <div><div style={{ fontSize: 14, fontWeight: 700 }}>{a.label}</div><div style={{ fontSize: 12, color: activity === a.v ? "rgba(255,255,255,0.65)" : MUTE }}>{a.desc}</div></div>
                </button>
              ))}
            </R>
            <R l="Goal">
              <div style={{ display: "flex", gap: 8 }}>
                {GOALS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      padding: "14px 6px",
                      minHeight: 44,
                      borderRadius: 0,
                      border: "2px solid " + TXT,
                      background: goal === g.id ? ACC : CARD,
                      color: goal === g.id ? WHITE : TXT,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.1s ease",
                      boxShadow: goal === g.id ? "none" : "3px 3px 0px 0px " + TXT
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: goal === g.id ? WHITE : TXT }}>{g.label}</span>
                    <span style={{ fontSize: 11, color: goal === g.id ? "rgba(255,255,255,0.65)" : MUTE }}>{g.offset > 0 ? "+" : ""}{g.offset} cal</span>
                  </button>
                ))}
              </div>
            </R>
            <R l="Macro Split">
              {[{ k: "p", l: "Protein", v: prot, c: PROT_COLOR }, { k: "c", l: "Carbs", v: carb, c: CARB_COLOR }, { k: "f", l: "Fat", v: fatP, c: FAT_COLOR }].map(m => (
                <div key={m.k} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: MUTE, marginBottom: 6 }}><span>{m.l}</span><span style={{ color: m.c, fontWeight: 800 }}>{m.v}%</span></div>
                  <input type="range" min={5} max={90} value={m.v} onChange={e => sl(m.k, parseInt(e.target.value))} style={{ width: "100%", accentColor: m.c, cursor: "pointer" }} />
                </div>
              ))}
              {(() => {
                const B = 20;
                const pB = Math.round(prot / 100 * B);
                const cB = Math.round(carb / 100 * B);
                const fB = Math.max(0, B - pB - cB);
                return (
                  <div style={{ fontSize: 16, letterSpacing: "1px", lineHeight: 1, marginTop: 4, userSelect: "none" }}>
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
          {/* ── 3. RESULTS ── */}
          <div style={cardStyle}>
            <SH n="3" t="Your Results" />
            {!r ? (
              <div style={{ textAlign: "center", padding: "36px 16px", color: MUTE }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>📊</div>
                <p style={{ margin: 0, fontSize: 14 }}>Fill in your details above — results update live.</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    borderRadius: 0,
                    padding: "28px 20px",
                    textAlign: "center",
                    marginBottom: 14,
                    background: ACC,
                    color: WHITE,
                    border: "2px solid " + TXT
                  }}
                >
                  <span style={{ display: "block", fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Daily Target</span>
                  <span style={{ display: "block", fontSize: 54, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.05 }}><AN value={r.target} cursor /></span>
                  <span style={{ display: "block", fontSize: 13, opacity: 0.6, marginTop: 4 }}>kcal / day</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {[{ l: "BMR", v: r.bmr, t: "At rest" }, { l: "TDEE", v: r.tdee, t: "With activity" }].map(c => (
                    <div
                      key={c.l}
                      style={{
                        flex: 1,
                        borderRadius: 0,
                        padding: "16px 12px",
                        textAlign: "center",
                        border: "2px solid " + TXT,
                        background: CARD
                      }}
                    >
                      <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTE, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>{c.l}</span>
                      <span style={{ display: "block", fontSize: 26, fontWeight: 900, letterSpacing: "-1px" }}><AN value={c.v} /></span>
                      <span style={{ display: "block", fontSize: 11, color: MUTE, marginTop: 3 }}>{c.t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ l: "Protein", g: r.pG, p: prot, c: PROT_COLOR }, { l: "Carbs", g: r.cG, p: carb, c: CARB_COLOR }, { l: "Fat", g: r.fG, p: fatP, c: FAT_COLOR }].map(m => (
                    <div
                      key={m.l}
                      style={{
                        flex: 1,
                        borderRadius: 0,
                        padding: "14px 8px",
                        textAlign: "center",
                        border: "2px solid " + TXT,
                        background: CARD
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: 0, background: m.c, margin: "0 auto 6px" }} />
                      <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: MUTE }}>{m.l}</span>
                      <span style={{ display: "block", fontSize: 24, fontWeight: 900, letterSpacing: "-0.8px", lineHeight: 1.1 }}><AN value={m.g} />g</span>
                      <span style={{ display: "block", fontSize: 10, color: MUTE }}>{m.p}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── 4. MEAL BUILDER ── */}
          <div style={cardStyle}>
            <SH n="4" t="Meal Builder" />
            <p style={{ fontSize: 13, color: MUTE, marginTop: -10, marginBottom: 20 }}>Tap foods to add them. Adjust portions. See your total macros & micronutrients.</p>

            {/* Level 1 — Diet */}
            <R l="Diet">
              <Tog opts={[{ id: "all", l: "All" }, { id: "vegetarian", l: "Vegetarian" }, { id: "vegan", l: "Vegan" }]} v={diet} s={setDiet} />
            </R>

            {/* Level 2 — Macro filter */}
            <R l="Macro">
              <Tog opts={[{ id: "any", l: "Any" }, { id: "protein", l: "Protein" }, { id: "carbs", l: "Carbs" }, { id: "fat", l: "Fat" }]} v={macroFilter} s={setMacroFilter} />
            </R>

            {/* Level 3 — Category chips */}
            {availableCats.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={labelStyle}>Category</span>
                <div className="tabs-scroll">
                  <div style={{ display: "flex", gap: 6, width: "max-content" }}>
                    {availableCats.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
                        style={{
                          padding: "10px 14px",
                          minHeight: 44,
                          borderRadius: 0,
                          border: "2px solid " + TXT,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: HEADER_FONT,
                          whiteSpace: "nowrap",
                          background: selectedCat === cat.id ? ACC : CARD,
                          color: selectedCat === cat.id ? WHITE : TXT,
                          transition: "all 0.1s ease",
                          boxShadow: selectedCat === cat.id ? "none" : "3px 3px 0px 0px " + TXT
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sort controls */}
            <div style={{ marginBottom: 14 }}>
              <span style={labelStyle}>Sort By</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{
                    padding: "12px 8px",
                    minHeight: 44,
                    borderRadius: 0,
                    border: "2px solid " + TXT,
                    background: CARD,
                    color: TXT,
                    fontSize: 13,
                    fontFamily: NUM_FONT,
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    flex: 1
                  }}
                >
                  <option value="popular_desc">Most Popular</option>
                  <option value="popular_asc">Least Popular</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                  {macroFilter !== "any" && (
                    <>
                      <option value="macro_high">Highest {macroFilter.charAt(0).toUpperCase() + macroFilter.slice(1)}</option>
                      <option value="macro_low">Lowest {macroFilter.charAt(0).toUpperCase() + macroFilter.slice(1)}</option>
                    </>
                  )}
                </select>
                <span style={{ color: MUTE, fontSize: 18, pointerEvents: "none" }}>↕</span>
              </div>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: 12, position: "relative" }}>
              <input
                type="text"
                value={foodSearch}
                onChange={e => setFoodSearch(e.target.value)}
                placeholder="Search foods… (e.g. salmon, rice, yogurt)"
                style={{ ...inputStyle, paddingLeft: 42, fontWeight: 500 }}
              />
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: MUTE, pointerEvents: "none" }}>🔍</span>
              {foodSearch.length > 0 && (
                <button
                  onClick={() => setFoodSearch("")}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: MUTE, fontSize: 18, lineHeight: 1, padding: "8px", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
                >×</button>
              )}
            </div>

            {/* Search result count */}
            {showSearch && displayFoods.length > 0 && (
              <p style={{ fontSize: 12, color: MUTE, marginBottom: 12 }}>
                {displayFoods.length} result{displayFoods.length === 1 ? "" : "s"} for &ldquo;{foodSearch}&rdquo;
              </p>
            )}

            {/* Loading */}
            {foodsLoading && (
              <div style={{ textAlign: "center", padding: "36px 16px", color: MUTE }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
                <p style={{ margin: 0, fontSize: 14 }}>Loading food database…</p>
              </div>
            )}

            {/* No results */}
            {!foodsLoading && groupedFoods.length === 0 && (
              <p style={{ fontSize: 14, color: MUTE, textAlign: "center", padding: "24px 0", margin: 0 }}>
                No foods match your filters. Try adjusting your selection.
              </p>
            )}

            {/* Food list grouped by category */}
            {!foodsLoading && groupedFoods.map(group => (
              <div key={group.label}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: group.isFavs ? ACC : MUTE,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  margin: "20px 0 10px",
                  paddingBottom: 6,
                  borderBottom: `1px solid ${group.isFavs ? ACC : "#E5E7EB"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}>
                  {group.isFavs && <span>★</span>}
                  {group.label}
                </div>
                {group.foods.map(food => {
                  const selected = meal[food.id] !== undefined;
                  const g = meal[food.id] || 0;
                  return (
                    <div
                      key={food.id}
                      style={{
                        borderRadius: 0,
                        padding: "12px 16px",
                        marginBottom: 8,
                        background: CARD,
                        transition: "all 0.15s",
                        border: selected ? "2px solid " + ACC : "1px solid #E5E7EB",
                        boxShadow: selected ? "none" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleFood(food.id, food)}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {macroFilter === "any" ? (
                            <>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>{food.name}</span>
                              <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.cal}</b> cal</span>
                                <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.protein}g</b> <span style={{ color: PROT_COLOR, fontWeight: 700 }}>P</span></span>
                                <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.carbs}g</b> <span style={{ color: CARB_COLOR, fontWeight: 700 }}>C</span></span>
                                <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.fat}g</b> <span style={{ color: FAT_COLOR, fontWeight: 700 }}>F</span></span>
                                <span style={{ fontSize: 10, color: MUTE }}>per 100g</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>{food.name}</span>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 4 }}>
                                <span style={{ fontSize: 20, fontWeight: 900, color: TXT, fontFamily: NUM_FONT, lineHeight: 1 }}>{food.per100[macroFilter]}g</span>
                                <span style={{ fontSize: 12, color: MUTE }}>{macroFilter} per 100g</span>
                              </div>
                              <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                                {macroFilter !== "protein" && <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.protein}g</b> <span style={{ color: PROT_COLOR, fontWeight: 700 }}>P</span></span>}
                                {macroFilter !== "carbs" && <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.carbs}g</b> <span style={{ color: CARB_COLOR, fontWeight: 700 }}>C</span></span>}
                                {macroFilter !== "fat" && <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.fat}g</b> <span style={{ color: FAT_COLOR, fontWeight: 700 }}>F</span></span>}
                                <span style={{ fontSize: 11, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{food.per100.cal}</b> cal</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 0,
                            background: selected ? ACC : CARD,
                            color: selected ? WHITE : MUTE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 16,
                            flexShrink: 0,
                            border: "2px solid " + TXT
                          }}
                        >
                          {selected ? "✓" : "+"}
                        </div>
                      </div>
                      {selected && (() => {
                        const currentUnit = mealUnits[food.id] || "grams";
                        const gramsPerUnit = resolveGrams(food, currentUnit);
                        const qty = meal[food.id] || 0;
                        const grams = qty * gramsPerUnit;
                        const unitOptions = ["grams", ...(food.servings || []).map(s => s.unit)];

                        return (
                          <div style={{ marginTop: 12 }}>
                            {/* Unit selector + quantity input row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              {/* Quantity input */}
                              <input
                                type="number"
                                value={qty}
                                onChange={e => setGrams(food.id, e.target.value)}
                                min="0"
                                step="0.5"
                                style={{
                                  ...inputStyle,
                                  width: 80,
                                  padding: "10px 8px",
                                  fontSize: 16,
                                  textAlign: "center",
                                  flexShrink: 0
                                }}
                              />

                              {/* Unit dropdown */}
                              <select
                                value={currentUnit}
                                onChange={e => setFoodUnit(food.id, e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: "12px 8px",
                                  minHeight: 44,
                                  borderRadius: 0,
                                  border: "2px solid " + TXT,
                                  background: CARD,
                                  color: TXT,
                                  fontSize: 13,
                                  fontFamily: NUM_FONT,
                                  fontWeight: 600,
                                  outline: "none",
                                  cursor: "pointer",
                                  appearance: "none",
                                  WebkitAppearance: "none"
                                }}
                              >
                                {unitOptions.map(u => (
                                  <option key={u} value={u}>{u}</option>
                                ))}
                              </select>
                            </div>

                            {/* Calculated grams display (when not in grams mode) */}
                            {currentUnit !== "grams" && (
                              <p style={{ margin: "6px 0 0", fontSize: 11, color: MUTE }}>
                                = <strong style={{ color: TXT }}>{Math.round(grams)}g</strong> total
                              </p>
                            )}

                            {/* Macro display for this food at this quantity */}
                            {qty > 0 && (
                              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{Math.round(food.per100.cal * grams / 100)}</b> cal</span>
                                <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{Math.round(food.per100.protein * grams / 100 * 10) / 10}g</b> <span style={{ color: PROT_COLOR, fontWeight: 700 }}>P</span></span>
                                <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{Math.round(food.per100.carbs * grams / 100 * 10) / 10}g</b> <span style={{ color: CARB_COLOR, fontWeight: 700 }}>C</span></span>
                                <span style={{ fontSize: 12, color: MUTE, fontFamily: NUM_FONT }}><b style={{ color: TXT }}>{Math.round(food.per100.fat * grams / 100 * 10) / 10}g</b> <span style={{ color: FAT_COLOR, fontWeight: 700 }}>F</span></span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {selected && (() => {
                        const currentUnit = mealUnits[food.id] || "grams";
                        const gramsPerUnit = resolveGrams(food, currentUnit);
                        const qty = meal[food.id] || 0;
                        const grams = qty * gramsPerUnit;
                        if (grams <= 0) return null;
                        return (
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {MICRO_KEYS.filter(k => food.per100[k] > 0).map(k => {
                              const val = Math.round(food.per100[k] * grams / 100 * 10) / 10;
                              const pct = Math.round((val / rda[k]) * 100);
                              return (
                                <span key={k} style={{ fontSize: 10, padding: "3px 7px", borderRadius: 0, background: pct >= 20 ? "#ddd" : "#e8e8e8", color: pct >= 20 ? ACC : MUTE, fontWeight: 600, border: "1px solid " + MUTE }}>
                                  {MICRO_LABELS[k].split(" ").pop()} {val}{MICRO_UNITS[k]} ({pct}%)
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── 5. MEAL TOTALS ── */}
          {hasMeal && (
            <div style={cardStyle}>
              <SH n="5" t="Your Meal Totals" />

              {/* selected foods summary */}
              <div style={{ marginBottom: 16 }}>
                {Object.entries(meal).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                  const food = foodById[id];
                  if (!food) return null;
                  const currentUnit = mealUnits[id] || "grams";
                  const gramsPerUnit = resolveGrams(food, currentUnit);
                  const grams = qty * gramsPerUnit;
                  const display = currentUnit === "grams"
                    ? `${grams}g`
                    : `${qty} ${currentUnit} (${Math.round(grams)}g)`;
                  return (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{food.name}</span>
                      <span style={{ fontSize: 13, color: MUTE, fontFamily: NUM_FONT }}>{display} · {Math.round(food.per100.cal * grams / 100)} cal</span>
                    </div>
                  );
                })}
              </div>

              {/* macro totals */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[
                  { l: "Calories", v: Math.round(mt.cal), u: "kcal", target: r?.target },
                  { l: "Protein", v: Math.round(mt.protein), u: "g", target: r?.pG },
                  { l: "Carbs", v: Math.round(mt.carbs), u: "g", target: r?.cG },
                  { l: "Fat", v: Math.round(mt.fat), u: "g", target: r?.fG },
                ].map(m => (
                  <div
                    key={m.l}
                    style={{
                      flex: 1,
                      borderRadius: 0,
                      padding: "14px 6px",
                      textAlign: "center",
                      border: "2px solid " + TXT,
                      background: CARD
                    }}
                  >
                    <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTE, letterSpacing: "2px", textTransform: "uppercase" }}>{m.l}</span>
                    <span style={{ display: "block", fontSize: 20, fontWeight: 900, marginTop: 4, letterSpacing: "-0.5px", fontFamily: NUM_FONT }}>{m.v}</span>
                    <span style={{ display: "block", fontSize: 10, color: MUTE }}>{m.u}</span>
                    {m.target && <span style={{ display: "block", fontSize: 10, color: MUTE, marginTop: 2 }}>of {m.target}</span>}
                  </div>
                ))}            </div>

              {/* micronutrient bars */}
              <span style={labelStyle}>Vitamin & Mineral Coverage</span>
              <p style={{ fontSize: 12, color: MUTE, marginTop: -2, marginBottom: 14 }}>How much of your daily needs this meal covers</p>
              {MICRO_KEYS.map(k => {
                const { pct, w } = pctBar(mt[k], rda[k]);
                return (
                  <div key={k} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700 }}>{MICRO_LABELS[k]}</span>
                      <span style={{ color: pct >= 100 ? "#059669" : pct >= 50 ? MUTE : "#DC2626", fontWeight: 700 }}>
                        {Math.round(mt[k] * 10) / 10}{MICRO_UNITS[k]} · {pct}%
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 0, background: "#E5E7EB", border: "1px solid #D1D5DB" }}>
                      <div style={{ height: "100%", width: w + "%", borderRadius: 0, background: pct >= 100 ? "#059669" : pct >= 50 ? ACC : "#DC2626", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}

              <button onClick={() => setMeal({})} style={{ width: "100%", padding: "14px", minHeight: 44, borderRadius: 0, border: "2px solid " + TXT, background: CARD, color: TXT, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: HEADER_FONT, marginTop: 10, boxShadow: "4px 4px 0px 0px " + TXT }}>
                Clear Meal
              </button>
            </div>
          )}
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: 20, fontSize: 11, color: MUTE, fontFamily: HEADER_FONT }}>macrocalculatorfree.com · No ads · No data collected · Always free</footer>
    </div>
  );
}

/* ── helpers ── */
function SH({ n, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: TXT, fontFamily: NUM_FONT, flexShrink: 0 }}>[{n}]</span>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", fontFamily: HEADER_FONT }}>{t}</h2>
    </div>
  );
}
function R({ l, children }) {
  return <div style={{ marginBottom: 20 }}><span style={{ display: "block", fontSize: 11, fontWeight: 700, color: MUTE, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>{l}</span>{children}</div>;
}
function Tog({ opts, v, s }) {
  return (
    <div style={{ display: "flex", border: "2px solid " + TXT, borderRadius: 0 }}>
      {opts.map((o, i) => (
        <button key={o.id} onClick={() => s(o.id)} style={{
          flex: 1,
          padding: "10px 8px",
          minHeight: 44,
          borderRadius: 0,
          border: "none",
          borderRight: i < opts.length - 1 ? "2px solid " + TXT : "none",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: HEADER_FONT,
          transition: "all 0.1s ease",
          background: v === o.id ? ACC : "transparent",
          color: v === o.id ? WHITE : TXT
        }}>{o.l}</button>
      ))}
    </div>
  );
}
