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

const LS_KEY = "macro-calc-v1";

function calcBMR(formula, sex, wKg, hCm, age, bf) {
  if (formula === "mifflin") return sex === "male" ? 10*wKg + 6.25*hCm - 5*age + 5 : 10*wKg + 6.25*hCm - 5*age - 161;
  if (formula === "harris")  return sex === "male" ? 88.362 + 13.397*wKg + 4.799*hCm - 5.677*age : 447.593 + 9.247*wKg + 3.098*hCm - 4.33*age;
  return 370 + 21.6 * (wKg * (1 - bf / 100));
}

/* ── Animated Num ── */
function AN({ value }) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) return;
    const t0 = performance.now();
    const run = (now) => {
      const progress = Math.min((now - t0) / 400, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(run);
      }
    };
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{display}</>;
}

/* ═══════════════════════════════════════════
   STYLES — light, clean, soft neumorphic
═══════════════════════════════════════════ */
const BG = "#f0f0f3";
const CARD = "#f0f0f3";
const TXT = "#2d2d2d";
const MUTE = "#8a8a8e";
const ACC = "#2d2d2d";
const WHITE = "#ffffff";
const neuUp = { boxShadow: "6px 6px 12px #cbcbcf, -6px -6px 12px #ffffff" };
const neuDn = { boxShadow: "inset 4px 4px 8px #cbcbcf, inset -4px -4px 8px #ffffff" };
const neuSm = { boxShadow: "3px 3px 6px #cbcbcf, -3px -3px 6px #ffffff" };

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
  const [foodTab, setFoodTab] = useState("fruits");
  const [meal, setMeal] = useState({});

  /* ── NEW: foods database state ── */
  const [foodsData, setFoodsData] = useState(null);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState("");

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
    } catch {}
  }, []);

  /* ── localStorage: save on every change ── */
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ age, weight, hFt, hIn, hCm, sex, unit, formula, activity, goal, prot, carb, fatP, diet }));
  }, [age, weight, hFt, hIn, hCm, sex, unit, formula, activity, goal, prot, carb, fatP, diet]);

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

  /* ── Search results (min 2 chars, across all categories) ── */
  const searchResults = useMemo(() => {
    if (foodSearch.length < 2) return [];
    const q = foodSearch.toLowerCase();
    return allFoods.filter(f => f.name.toLowerCase().includes(q));
  }, [foodSearch, allFoods]);

  const showSearch = foodSearch.length >= 2;

  /* ── Foods shown in the current view ── */
  const displayFoods = showSearch
    ? searchResults
    : foodsData?.categories[foodTab]?.items?.map(item => ({
        ...item,
        catKey: foodTab,
        catLabel: foodsData?.categories[foodTab]?.label,
      })) ?? [];

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

  /* meal totals — uses foodById from fetched data */
  const mealTotals = useCallback(() => {
    const t = { cal:0, protein:0, carbs:0, fat:0 };
    MICRO_KEYS.forEach(k => t[k] = 0);
    Object.entries(meal).forEach(([id, grams]) => {
      if (!grams || grams <= 0) return;
      const food = foodById[id];
      if (!food) return;
      const m = grams / 100;
      t.cal += food.per100.cal * m;
      t.protein += food.per100.protein * m;
      t.carbs += food.per100.carbs * m;
      t.fat += food.per100.fat * m;
      MICRO_KEYS.forEach(k => { t[k] += (food.per100[k] || 0) * m; });
    });
    Object.keys(t).forEach(k => t[k] = Math.round(t[k] * 10) / 10);
    return t;
  }, [meal, foodById]);

  const mt = mealTotals();
  const hasMeal = Object.values(meal).some(v => v > 0);

  const toggleFood = (id, defaultG) => {
    setMeal(prev => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; } else { next[id] = defaultG || 100; }
      return next;
    });
  };

  const setGrams = (id, g) => {
    setMeal(prev => ({ ...prev, [id]: Math.max(0, parseInt(g) || 0) }));
  };

  const pctBar = (val, rdaV) => {
    const pct = Math.min(Math.round((val / rdaV) * 100), 999);
    const w = Math.min(pct, 100);
    return { pct, w };
  };

  const cardStyle = { background: CARD, borderRadius: 22, padding: "24px 20px", marginBottom: 18, ...neuUp };
  const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: 14, border: "none", background: CARD, color: TXT, fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", fontWeight: 600, ...neuDn };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 800, color: MUTE, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'DM Sans','Nunito Sans',system-ui,sans-serif", color: TXT, WebkitFontSmoothing: "antialiased" }}>

      {/* HEADER */}
      <header style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px 8px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: CARD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, color: ACC, ...neuUp }}>M</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>Macro Calculator</h1>
          <p style={{ margin: 0, fontSize: 12, color: MUTE }}>Free · No login · No tracking · No ads</p>
        </div>
      </header>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* ── 1. FORMULA ── */}
        <div style={cardStyle}>
          <SH n="1" t="Choose Your Formula" />
          {FORMULAS.map(f => (
            <button key={f.id} onClick={() => setFormula(f.id)} style={{ display: "block", width: "100%", position: "relative", borderRadius: 16, padding: 16, textAlign: "left", cursor: "pointer", border: "none", fontFamily: "inherit", marginBottom: 10, background: CARD, transition: "all 0.2s", ...(formula===f.id ? {...neuDn, outline:"2px solid "+ACC} : neuSm) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 20, background: formula===f.id ? ACC : "#ddd", color: formula===f.id ? WHITE : MUTE }}>{f.badge}</span>
              </div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: MUTE }}>{f.who}</p>
              <p style={{ margin: 0, fontSize: 12, color: MUTE }}>{f.detail}</p>
              {formula===f.id && <div style={{ position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: "50%", background: ACC, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>✓</div>}
            </button>
          ))}
        </div>

        {/* ── 2. DETAILS ── */}
        <div style={cardStyle}>
          <SH n="2" t="Your Details" />
          <R l="Units"><Tog opts={[{id:"imperial",l:"Imperial"},{id:"metric",l:"Metric"}]} v={unit} s={setUnit} /></R>
          <R l="Sex"><Tog opts={[{id:"male",l:"Male"},{id:"female",l:"Female"}]} v={sex} s={setSex} /></R>
          <R l="Age"><input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 28" style={inputStyle} /></R>
          <R l={`Weight (${unit==="imperial"?"lbs":"kg"})`}><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} placeholder={unit==="imperial"?"e.g. 170":"e.g. 77"} style={inputStyle} /></R>
          <R l="Height">
            {unit==="imperial"
              ? <div style={{display:"flex",gap:10}}><input type="number" value={hFt} onChange={e=>setHFt(e.target.value)} placeholder="ft" style={{...inputStyle,flex:1}} /><input type="number" value={hIn} onChange={e=>setHIn(e.target.value)} placeholder="in" style={{...inputStyle,flex:1}} /></div>
              : <input type="number" value={hCm} onChange={e=>setHCm(e.target.value)} placeholder="e.g. 178 cm" style={inputStyle} />}
          </R>
          {needsBF && <R l="Body Fat %"><input type="number" value={bf} onChange={e=>setBf(e.target.value)} placeholder="e.g. 15" style={inputStyle} /></R>}
          <R l="Activity Level">
            {ACT.map(a => (
              <button key={a.v} onClick={()=>setActivity(a.v)} style={{ display:"flex", gap:10, alignItems:"center", padding:"12px 14px", borderRadius:14, border:"none", background:CARD, cursor:"pointer", textAlign:"left", fontFamily:"inherit", width:"100%", marginBottom:8, ...(activity===a.v?{...neuDn,outline:"2px solid "+ACC}:neuSm) }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:activity===a.v?ACC:"#ccc", flexShrink:0 }} />
                <div><div style={{fontSize:14,fontWeight:700}}>{a.label}</div><div style={{fontSize:12,color:MUTE}}>{a.desc}</div></div>
              </button>
            ))}
          </R>
          <R l="Goal">
            <div style={{display:"flex",gap:8}}>
              {GOALS.map(g => (
                <button key={g.id} onClick={()=>setGoal(g.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"14px 6px", borderRadius:14, border:"none", background:CARD, cursor:"pointer", fontFamily:"inherit", ...(goal===g.id?{...neuDn,outline:"2px solid "+ACC}:neuSm) }}>
                  <span style={{fontSize:13,fontWeight:700,color:goal===g.id?ACC:MUTE}}>{g.label}</span>
                  <span style={{fontSize:11,color:MUTE}}>{g.offset>0?"+":""}{g.offset} cal</span>
                </button>
              ))}
            </div>
          </R>
          <R l="Macro Split">
            {[{k:"p",l:"Protein",v:prot},{k:"c",l:"Carbs",v:carb},{k:"f",l:"Fat",v:fatP}].map(m => (
              <div key={m.k} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:MUTE,marginBottom:6}}><span>{m.l}</span><span style={{color:ACC,fontWeight:800}}>{m.v}%</span></div>
                <input type="range" min={5} max={90} value={m.v} onChange={e=>sl(m.k,parseInt(e.target.value))} style={{width:"100%",accentColor:ACC,cursor:"pointer"}} />
              </div>
            ))}
            <div style={{display:"flex",height:8,borderRadius:6,overflow:"hidden",...neuDn}}>
              <div style={{height:"100%",width:`${prot}%`,background:"#555",transition:"width 0.3s",borderRadius:"6px 0 0 6px"}} />
              <div style={{height:"100%",width:`${carb}%`,background:"#999",transition:"width 0.3s"}} />
              <div style={{height:"100%",width:`${fatP}%`,background:"#ccc",transition:"width 0.3s",borderRadius:"0 6px 6px 0"}} />
            </div>
          </R>
        </div>

        {/* ── 3. RESULTS ── */}
        <div style={cardStyle}>
          <SH n="3" t="Your Results" />
          {!r ? (
            <div style={{textAlign:"center",padding:"36px 16px",color:MUTE}}>
              <div style={{fontSize:34,marginBottom:10}}>📊</div>
              <p style={{margin:0,fontSize:14}}>Fill in your details above — results update live.</p>
            </div>
          ) : (
            <>
              <div style={{borderRadius:18,padding:"28px 20px",textAlign:"center",marginBottom:14,background:ACC,color:WHITE,...neuUp}}>
                <span style={{display:"block",fontSize:11,fontWeight:700,opacity:0.7,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:4}}>Daily Target</span>
                <span style={{display:"block",fontSize:54,fontWeight:900,letterSpacing:"-2px",lineHeight:1.05}}><AN value={r.target} /></span>
                <span style={{display:"block",fontSize:13,opacity:0.6,marginTop:4}}>kcal / day</span>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:20}}>
                {[{l:"BMR",v:r.bmr,t:"At rest"},{l:"TDEE",v:r.tdee,t:"With activity"}].map(c => (
                  <div key={c.l} style={{flex:1,borderRadius:16,padding:"16px 12px",textAlign:"center",...neuDn}}>
                    <span style={{display:"block",fontSize:10,fontWeight:700,color:MUTE,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:4}}>{c.l}</span>
                    <span style={{display:"block",fontSize:26,fontWeight:900,letterSpacing:"-1px"}}><AN value={c.v} /></span>
                    <span style={{display:"block",fontSize:11,color:MUTE,marginTop:3}}>{c.t}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                {[{l:"Protein",g:r.pG,p:prot,c:"#555"},{l:"Carbs",g:r.cG,p:carb,c:"#999"},{l:"Fat",g:r.fG,p:fatP,c:"#ccc"}].map(m => (
                  <div key={m.l} style={{flex:1,borderRadius:16,padding:"14px 8px",textAlign:"center",...neuDn}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:m.c,margin:"0 auto 6px"}} />
                    <span style={{display:"block",fontSize:11,fontWeight:700,color:MUTE}}>{m.l}</span>
                    <span style={{display:"block",fontSize:24,fontWeight:900,letterSpacing:"-0.8px",lineHeight:1.1}}><AN value={m.g} />g</span>
                    <span style={{display:"block",fontSize:10,color:MUTE}}>{m.p}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── 4. MEAL BUILDER ── */}
        <div style={cardStyle}>
          <SH n="4" t="Meal Builder" />
          <p style={{fontSize:13,color:MUTE,marginTop:-10,marginBottom:16}}>Tap foods to add them. Adjust portions. See your total macros & micronutrients.</p>

          <R l="Diet Preference"><Tog opts={[{id:"all",l:"All"},{id:"vegetarian",l:"Vegetarian"},{id:"vegan",l:"Vegan"}]} v={diet} s={setDiet} /></R>

          {/* ── Search bar ── */}
          <div style={{marginBottom:16,position:"relative"}}>
            <input
              type="text"
              value={foodSearch}
              onChange={e => setFoodSearch(e.target.value)}
              placeholder="Search all foods… (e.g. salmon, rice, yogurt)"
              style={{ ...inputStyle, paddingLeft: 42, fontWeight: 500 }}
            />
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, color:MUTE, pointerEvents:"none" }}>🔍</span>
            {foodSearch.length > 0 && (
              <button
                onClick={() => setFoodSearch("")}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:MUTE, fontSize:18, lineHeight:1, padding:2 }}
              >×</button>
            )}
          </div>

          {/* ── Category tabs (horizontal scroll) ── */}
          {!showSearch && (
            <div style={{ overflowX:"auto", marginBottom:18, paddingBottom:4, scrollbarWidth:"none", msOverflowStyle:"none" }}>
              <div style={{ display:"flex", gap:6, width:"max-content" }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setFoodTab(cat.id); setFoodSearch(""); }}
                    style={{
                      padding:"9px 14px", borderRadius:20, border:"none", fontSize:12, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", background:CARD, color:foodTab===cat.id?ACC:MUTE,
                      transition:"all 0.2s", ...(foodTab===cat.id ? {...neuDn, outline:"2px solid "+ACC} : neuSm)
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Search header ── */}
          {showSearch && (
            <p style={{fontSize:12,color:MUTE,marginBottom:12}}>
              {searchResults.length === 0 ? "No foods found" : `${searchResults.length} result${searchResults.length===1?"":"s"}`} for &ldquo;{foodSearch}&rdquo;
            </p>
          )}

          {/* ── Loading state ── */}
          {foodsLoading ? (
            <div style={{textAlign:"center",padding:"36px 16px",color:MUTE}}>
              <div style={{fontSize:28,marginBottom:10}}>⏳</div>
              <p style={{margin:0,fontSize:14}}>Loading food database…</p>
            </div>
          ) : (
            /* ── Food list ── */
            displayFoods.map(food => {
              const selected = meal[food.id] !== undefined;
              const g = meal[food.id] || 0;
              return (
                <div key={food.id} style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 10, background: CARD, transition: "all 0.2s", ...(selected ? {...neuDn, outline: "2px solid "+ACC} : neuSm) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleFood(food.id, 100)}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{food.name}</span>
                        {showSearch && food.catLabel && (
                          <span style={{ fontSize: 10, padding:"2px 7px", borderRadius:10, background:"#e4e4e7", color:MUTE, fontWeight:600 }}>{food.catLabel}</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: MUTE }}><b style={{color:TXT}}>{food.per100.cal}</b> cal</span>
                        <span style={{ fontSize: 11, color: MUTE }}><b style={{color:TXT}}>{food.per100.protein}g</b> P</span>
                        <span style={{ fontSize: 11, color: MUTE }}><b style={{color:TXT}}>{food.per100.carbs}g</b> C</span>
                        <span style={{ fontSize: 11, color: MUTE }}><b style={{color:TXT}}>{food.per100.fat}g</b> F</span>
                        <span style={{ fontSize: 10, color: MUTE }}>per 100g</span>
                      </div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: selected ? ACC : CARD, color: selected ? WHITE : MUTE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0, ...(selected ? {} : neuSm) }}>
                      {selected ? "✓" : "+"}
                    </div>
                  </div>
                  {selected && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: MUTE, flexShrink: 0 }}>Grams:</span>
                      <input type="number" value={g} onChange={e => setGrams(food.id, e.target.value)} style={{ ...inputStyle, width: 90, padding: "10px 12px", fontSize: 14, textAlign: "center" }} />
                      <div style={{ fontSize: 12, color: MUTE, flexWrap: "wrap", display: "flex", gap: 8 }}>
                        <span><b style={{color:TXT}}>{Math.round(food.per100.cal*g/100)}</b> cal</span>
                        <span><b style={{color:TXT}}>{Math.round(food.per100.protein*g/100*10)/10}g</b> P</span>
                        <span><b style={{color:TXT}}>{Math.round(food.per100.carbs*g/100*10)/10}g</b> C</span>
                        <span><b style={{color:TXT}}>{Math.round(food.per100.fat*g/100*10)/10}g</b> F</span>
                      </div>
                    </div>
                  )}
                  {/* key micros when selected */}
                  {selected && g > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {MICRO_KEYS.filter(k => food.per100[k] > 0).map(k => {
                        const val = Math.round(food.per100[k] * g / 100 * 10) / 10;
                        const pct = Math.round((val / rda[k]) * 100);
                        return (
                          <span key={k} style={{ fontSize: 10, padding: "3px 7px", borderRadius: 8, background: pct >= 20 ? "#ddd" : "#e8e8e8", color: pct >= 20 ? ACC : MUTE, fontWeight: 600 }}>
                            {MICRO_LABELS[k].split(" ").pop()} {val}{MICRO_UNITS[k]} ({pct}%)
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── 5. MEAL TOTALS ── */}
        {hasMeal && (
          <div style={cardStyle}>
            <SH n="5" t="Your Meal Totals" />

            {/* selected foods summary */}
            <div style={{ marginBottom: 16 }}>
              {Object.entries(meal).filter(([,g])=>g>0).map(([id,g]) => {
                const food = foodById[id];
                return food ? (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #e4e4e7" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{food.name}</span>
                    <span style={{ fontSize: 13, color: MUTE }}>{g}g · {Math.round(food.per100.cal*g/100)} cal</span>
                  </div>
                ) : null;
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
                <div key={m.l} style={{ flex: 1, borderRadius: 16, padding: "14px 6px", textAlign: "center", ...neuDn }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTE, letterSpacing: "0.5px", textTransform: "uppercase" }}>{m.l}</span>
                  <span style={{ display: "block", fontSize: 20, fontWeight: 900, marginTop: 4, letterSpacing: "-0.5px" }}>{m.v}</span>
                  <span style={{ display: "block", fontSize: 10, color: MUTE }}>{m.u}</span>
                  {m.target && <span style={{ display: "block", fontSize: 10, color: MUTE, marginTop: 2 }}>of {m.target}</span>}
                </div>
              ))}
            </div>

            {/* micronutrient bars */}
            <span style={labelStyle}>Vitamin & Mineral Coverage</span>
            <p style={{ fontSize: 12, color: MUTE, marginTop: -2, marginBottom: 14 }}>How much of your daily needs this meal covers</p>
            {MICRO_KEYS.map(k => {
              const { pct, w } = pctBar(mt[k], rda[k]);
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700 }}>{MICRO_LABELS[k]}</span>
                    <span style={{ color: pct >= 100 ? "#2d8a4e" : pct >= 50 ? MUTE : "#c44", fontWeight: 700 }}>
                      {Math.round(mt[k]*10)/10}{MICRO_UNITS[k]} · {pct}%
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 6, ...neuDn }}>
                    <div style={{ height: "100%", width: `${w}%`, borderRadius: 6, background: pct >= 100 ? "#2d8a4e" : pct >= 50 ? "#888" : "#c44", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}

            <button onClick={() => setMeal({})} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: CARD, color: MUTE, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 10, ...neuSm }}>
              Clear Meal
            </button>
          </div>
        )}
      </div>

      <footer style={{ textAlign: "center", padding: 20, fontSize: 11, color: MUTE }}>macrocalculatorfree.com · No ads · No data collected · Always free</footer>
    </div>
  );
}

/* ── helpers ── */
function SH({ n, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: ACC, color: WHITE, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...neuUp }}>{n}</div>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: "-0.3px" }}>{t}</h2>
    </div>
  );
}
function R({ l, children }) {
  return <div style={{ marginBottom: 20 }}><span style={{ display: "block", fontSize: 11, fontWeight: 800, color: MUTE, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>{l}</span>{children}</div>;
}
function Tog({ opts, v, s }) {
  return (
    <div style={{ display: "flex", borderRadius: 14, padding: 3, background: CARD, ...neuDn }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => s(o.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 11, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", background: v===o.id ? CARD : "transparent", color: v===o.id ? ACC : MUTE, ...(v===o.id ? neuSm : {}) }}>{o.l}</button>
      ))}
    </div>
  );
}
