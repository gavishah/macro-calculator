# Macro Calculator — Gemini CLI Task Spec
## Project: macrocalculatorfree.com
## Location: C:\Users\gbsha\Documents\macro-calculator

---

## CONTEXT

This is a Vite + React app. Two files need updating:
- `public/foods.json` — the nutrition database (190 foods, 10 categories)
- `src/App.jsx` — the React calculator app

The app fetches foods.json on load via `fetch("/foods.json")`.
Each food item currently looks like this:

```json
{ "id": "apple", "name": "Apple", "per100": { "cal": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, ... } }
```

After your changes each food must look like this:

```json
{ 
  "id": "apple", 
  "name": "Apple", 
  "per100": { "cal": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, ... },
  "servings": [
    { "unit": "medium apple", "grams": 182 },
    { "unit": "cup sliced", "grams": 109 }
  ]
}
```

---

## CHANGE 1 — ADD SERVINGS TO foods.json

Add a `"servings"` array to EVERY food item in foods.json.
Each serving object: `{ "unit": "string", "grams": number }`
Always include grams as an option in the UI (handled in App.jsx — not in the JSON).
Do NOT modify per100 values. Do NOT add or remove any foods. Only add the servings array.

### FRUITS (30 items)

```
apple          → [{"unit":"medium apple","grams":182},{"unit":"cup sliced","grams":109},{"unit":"large apple","grams":223}]
banana         → [{"unit":"medium banana","grams":118},{"unit":"large banana","grams":136},{"unit":"small banana","grams":101}]
orange         → [{"unit":"medium orange","grams":131},{"unit":"large orange","grams":184},{"unit":"cup sections","grams":180}]
mango          → [{"unit":"cup diced","grams":165},{"unit":"whole mango","grams":336},{"unit":"slice","grams":40}]
strawberry     → [{"unit":"cup whole","grams":152},{"unit":"large berry","grams":18},{"unit":"medium berry","grams":12}]
blueberry      → [{"unit":"cup","grams":148},{"unit":"handful","grams":40}]
grapes         → [{"unit":"cup","grams":151},{"unit":"handful (~15 grapes)","grams":75}]
watermelon     → [{"unit":"cup diced","grams":152},{"unit":"wedge (1/16 melon)","grams":286}]
pineapple      → [{"unit":"cup chunks","grams":165},{"unit":"slice (3/4 inch)","grams":84}]
kiwi           → [{"unit":"medium kiwi","grams":76},{"unit":"large kiwi","grams":91},{"unit":"cup sliced","grams":177}]
peach          → [{"unit":"medium peach","grams":150},{"unit":"large peach","grams":175},{"unit":"cup sliced","grams":154}]
pear           → [{"unit":"medium pear","grams":178},{"unit":"large pear","grams":230},{"unit":"cup sliced","grams":140}]
plum           → [{"unit":"medium plum","grams":66},{"unit":"large plum","grams":85}]
cherry         → [{"unit":"cup","grams":154},{"unit":"10 cherries","grams":68}]
lemon          → [{"unit":"medium lemon","grams":108},{"unit":"tbsp juice","grams":15},{"unit":"wedge","grams":22}]
lime           → [{"unit":"medium lime","grams":67},{"unit":"tbsp juice","grams":15},{"unit":"wedge","grams":11}]
pomegranate    → [{"unit":"medium pomegranate","grams":282},{"unit":"cup seeds","grams":174}]
papaya         → [{"unit":"cup cubed","grams":145},{"unit":"small papaya","grams":157}]
guava          → [{"unit":"medium guava","grams":55},{"unit":"cup","grams":165}]
lychee         → [{"unit":"cup","grams":190},{"unit":"10 lychees","grams":100}]
fig_fresh      → [{"unit":"medium fig","grams":50},{"unit":"large fig","grams":64},{"unit":"cup","grams":149}]
fig_dried      → [{"unit":"medium dried fig","grams":8},{"unit":"cup","grams":149},{"unit":"tbsp","grams":10}]
date_medjool   → [{"unit":"1 date (pitted)","grams":24},{"unit":"cup chopped","grams":147}]
apricot        → [{"unit":"medium apricot","grams":35},{"unit":"cup halves","grams":155}]
apricot_dried  → [{"unit":"cup","grams":130},{"unit":"tbsp","grams":8},{"unit":"5 halves","grams":28}]
coconut_fresh  → [{"unit":"cup shredded","grams":80},{"unit":"tbsp","grams":5}]
passion_fruit  → [{"unit":"1 fruit","grams":18},{"unit":"cup","grams":236}]
cantaloupe     → [{"unit":"cup diced","grams":160},{"unit":"wedge (1/8 melon)","grams":138}]
raspberry      → [{"unit":"cup","grams":123},{"unit":"handful","grams":40}]
blackberry     → [{"unit":"cup","grams":144},{"unit":"handful","grams":40}]
```

### VEGETABLES (40 items)

```
spinach              → [{"unit":"cup raw (packed)","grams":30},{"unit":"cup cooked","grams":180},{"unit":"handful","grams":20}]
kale                 → [{"unit":"cup chopped (packed)","grams":67},{"unit":"cup cooked","grams":130}]
broccoli             → [{"unit":"cup chopped","grams":91},{"unit":"medium stalk","grams":148},{"unit":"floret","grams":11}]
cauliflower          → [{"unit":"cup chopped","grams":107},{"unit":"medium head","grams":588}]
brussels_sprouts     → [{"unit":"cup","grams":88},{"unit":"1 sprout","grams":19}]
cabbage_green        → [{"unit":"cup shredded","grams":89},{"unit":"cup chopped","grams":89}]
cabbage_red          → [{"unit":"cup shredded","grams":89},{"unit":"cup chopped","grams":89}]
carrot               → [{"unit":"medium carrot","grams":61},{"unit":"large carrot","grams":72},{"unit":"cup chopped","grams":128},{"unit":"cup shredded","grams":110}]
sweet_potato         → [{"unit":"medium sweet potato","grams":130},{"unit":"large sweet potato","grams":180},{"unit":"cup cubed","grams":133}]
potato               → [{"unit":"medium potato","grams":213},{"unit":"large potato","grams":369},{"unit":"cup diced","grams":150}]
tomato               → [{"unit":"medium tomato","grams":123},{"unit":"large tomato","grams":182},{"unit":"cup chopped","grams":180},{"unit":"cherry tomato","grams":17}]
cucumber             → [{"unit":"medium cucumber","grams":301},{"unit":"cup sliced","grams":119},{"unit":"8 slices","grams":52}]
bell_pepper_red      → [{"unit":"medium pepper","grams":119},{"unit":"large pepper","grams":164},{"unit":"cup chopped","grams":149}]
bell_pepper_green    → [{"unit":"medium pepper","grams":119},{"unit":"large pepper","grams":164},{"unit":"cup chopped","grams":149}]
bell_pepper_yellow   → [{"unit":"medium pepper","grams":119},{"unit":"large pepper","grams":164},{"unit":"cup chopped","grams":149}]
onion                → [{"unit":"medium onion","grams":110},{"unit":"large onion","grams":150},{"unit":"cup chopped","grams":160},{"unit":"tbsp chopped","grams":10}]
garlic               → [{"unit":"1 clove","grams":3},{"unit":"tsp minced","grams":2.8},{"unit":"tbsp minced","grams":8.4}]
ginger_root          → [{"unit":"tbsp grated","grams":6},{"unit":"tsp grated","grams":2},{"unit":"1 inch piece","grams":11}]
leek                 → [{"unit":"medium leek","grams":89},{"unit":"cup chopped","grams":89}]
celery               → [{"unit":"medium stalk","grams":40},{"unit":"cup chopped","grams":101},{"unit":"large stalk","grams":64}]
asparagus            → [{"unit":"medium spear","grams":16},{"unit":"cup (about 7 spears)","grams":134}]
zucchini             → [{"unit":"medium zucchini","grams":196},{"unit":"cup sliced","grams":113},{"unit":"cup chopped","grams":124}]
aubergine            → [{"unit":"medium aubergine","grams":548},{"unit":"cup cubed","grams":82}]
mushroom_white       → [{"unit":"medium mushroom","grams":18},{"unit":"cup sliced","grams":70},{"unit":"cup whole","grams":96}]
mushroom_portobello  → [{"unit":"1 cap","grams":84},{"unit":"cup sliced","grams":86}]
mushroom_shiitake    → [{"unit":"cup","grams":145},{"unit":"4 mushrooms","grams":40}]
beetroot             → [{"unit":"medium beet","grams":82},{"unit":"cup sliced","grams":136}]
pumpkin              → [{"unit":"cup cubed","grams":116},{"unit":"cup mashed","grams":245}]
butternut_squash     → [{"unit":"cup cubed","grams":140},{"unit":"medium squash","grams":600}]
corn                 → [{"unit":"medium ear","grams":77},{"unit":"cup kernels","grams":154}]
peas_green           → [{"unit":"cup","grams":145},{"unit":"tbsp","grams":9}]
green_beans          → [{"unit":"cup","grams":100},{"unit":"handful","grams":40}]
artichoke            → [{"unit":"medium artichoke","grams":128},{"unit":"large artichoke","grams":162}]
watercress           → [{"unit":"cup (packed)","grams":34},{"unit":"handful","grams":20}]
bok_choy             → [{"unit":"cup shredded","grams":70},{"unit":"medium head","grams":822}]
radish               → [{"unit":"medium radish","grams":4.5},{"unit":"cup sliced","grams":116},{"unit":"10 radishes","grams":45}]
turnip               → [{"unit":"medium turnip","grams":122},{"unit":"cup cubed","grams":130}]
parsnip              → [{"unit":"medium parsnip","grams":133},{"unit":"cup sliced","grams":133}]
fennel               → [{"unit":"medium bulb","grams":234},{"unit":"cup sliced","grams":87},{"unit":"tbsp seeds","grams":6}]
pak_choi             → [{"unit":"cup shredded","grams":70},{"unit":"medium head","grams":500}]
```

### MEAT & POULTRY (19 items)

```
chicken_breast_raw   → [{"unit":"medium breast","grams":174},{"unit":"large breast","grams":226},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
chicken_thigh_raw    → [{"unit":"medium thigh","grams":116},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
chicken_drumstick_raw → [{"unit":"medium drumstick","grams":110},{"unit":"oz","grams":28}]
turkey_breast_raw    → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"thick slice","grams":85}]
turkey_mince_raw     → [{"unit":"cup","grams":225},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
duck_breast_raw      → [{"unit":"medium breast","grams":160},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
beef_mince_lean      → [{"unit":"cup","grams":225},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
beef_mince_20fat     → [{"unit":"cup","grams":225},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
beef_sirloin_raw     → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"6oz steak","grams":170}]
beef_ribeye_raw      → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"8oz steak","grams":226}]
beef_liver_raw       → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"thick slice","grams":85}]
pork_tenderloin_raw  → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"thick slice","grams":85}]
pork_belly_raw       → [{"unit":"oz","grams":28},{"unit":"rasher","grams":35},{"unit":"palm-sized portion","grams":85}]
pork_shoulder_raw    → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"cup diced","grams":225}]
lamb_leg_raw         → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"chop","grams":110}]
lamb_mince_raw       → [{"unit":"cup","grams":225},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
venison_raw          → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85},{"unit":"6oz portion","grams":170}]
rabbit_raw           → [{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
bacon_raw            → [{"unit":"rasher/slice","grams":28},{"unit":"oz","grams":28},{"unit":"3 rashers","grams":85}]
```

### FISH & SEAFOOD (19 items)

```
salmon_atlantic      → [{"unit":"fillet (6oz)","grams":170},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
salmon_wild          → [{"unit":"fillet (6oz)","grams":170},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
tuna_raw             → [{"unit":"fillet (6oz)","grams":170},{"unit":"oz","grams":28},{"unit":"steak","grams":170}]
tuna_canned_water    → [{"unit":"can drained (5oz)","grams":142},{"unit":"tbsp","grams":14},{"unit":"oz","grams":28}]
cod_raw              → [{"unit":"fillet (6oz)","grams":170},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
haddock_raw          → [{"unit":"fillet (6oz)","grams":170},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
mackerel_raw         → [{"unit":"fillet","grams":100},{"unit":"oz","grams":28},{"unit":"whole small mackerel","grams":220}]
sardines_canned      → [{"unit":"can (3.75oz)","grams":106},{"unit":"2 sardines","grams":48},{"unit":"oz","grams":28}]
shrimp_raw           → [{"unit":"large shrimp","grams":6},{"unit":"cup","grams":145},{"unit":"oz","grams":28},{"unit":"6 large shrimp","grams":36}]
crab_raw             → [{"unit":"oz","grams":28},{"unit":"cup flaked","grams":135},{"unit":"palm-sized portion","grams":85}]
lobster_raw          → [{"unit":"oz","grams":28},{"unit":"tail (6oz)","grams":170},{"unit":"cup chunks","grams":145}]
oyster_raw           → [{"unit":"1 oyster","grams":25},{"unit":"6 oysters","grams":150},{"unit":"oz","grams":28}]
mussels_raw          → [{"unit":"cup","grams":150},{"unit":"oz","grams":28},{"unit":"10 mussels","grams":50}]
halibut_raw          → [{"unit":"fillet (6oz)","grams":170},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
tilapia_raw          → [{"unit":"fillet (4oz)","grams":113},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
trout_raw            → [{"unit":"fillet (5oz)","grams":142},{"unit":"oz","grams":28},{"unit":"palm-sized portion","grams":85}]
herring_raw          → [{"unit":"fillet","grams":100},{"unit":"oz","grams":28}]
anchovies_raw        → [{"unit":"1 anchovy fillet","grams":4},{"unit":"oz","grams":28},{"unit":"tbsp","grams":14}]
squid_raw            → [{"unit":"cup rings","grams":108},{"unit":"oz","grams":28},{"unit":"medium squid","grams":90}]
```

### DAIRY & EGGS (15 items)

```
whole_egg            → [{"unit":"large egg","grams":50},{"unit":"medium egg","grams":44},{"unit":"extra-large egg","grams":56}]
egg_white            → [{"unit":"large egg white","grams":33},{"unit":"cup","grams":243},{"unit":"tbsp","grams":15}]
egg_yolk             → [{"unit":"large egg yolk","grams":17},{"unit":"tbsp","grams":15}]
whole_milk           → [{"unit":"cup","grams":244},{"unit":"tbsp","grams":15},{"unit":"fl oz","grams":30}]
skimmed_milk         → [{"unit":"cup","grams":244},{"unit":"tbsp","grams":15},{"unit":"fl oz","grams":30}]
greek_yogurt_full    → [{"unit":"cup","grams":245},{"unit":"tbsp","grams":15},{"unit":"small pot (170g)","grams":170}]
greek_yogurt_0fat    → [{"unit":"cup","grams":245},{"unit":"tbsp","grams":15},{"unit":"small pot (170g)","grams":170}]
cottage_cheese       → [{"unit":"cup","grams":226},{"unit":"tbsp","grams":14},{"unit":"½ cup","grams":113}]
cheddar              → [{"unit":"oz","grams":28},{"unit":"slice","grams":21},{"unit":"cup shredded","grams":113},{"unit":"tbsp shredded","grams":7}]
mozzarella           → [{"unit":"oz","grams":28},{"unit":"slice","grams":21},{"unit":"cup shredded","grams":113},{"unit":"ball (125g)","grams":125}]
parmesan             → [{"unit":"tbsp grated","grams":5},{"unit":"oz","grams":28},{"unit":"cup grated","grams":100}]
feta                 → [{"unit":"oz","grams":28},{"unit":"cup crumbled","grams":150},{"unit":"tbsp crumbled","grams":9}]
butter_unsalted      → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"pat","grams":5},{"unit":"cup","grams":227}]
cream_cheese         → [{"unit":"tbsp","grams":14.5},{"unit":"oz","grams":28},{"unit":"cup","grams":232}]
heavy_cream          → [{"unit":"tbsp","grams":15},{"unit":"cup","grams":238},{"unit":"fl oz","grams":30}]
```

### LEGUMES (13 items)

Note: These are dry weights. Add a cooked equivalent note in the unit label.

```
lentils_red_dry      → [{"unit":"cup dry (→ ~2.5 cups cooked)","grams":192},{"unit":"tbsp dry","grams":12}]
lentils_green_dry    → [{"unit":"cup dry (→ ~2.5 cups cooked)","grams":192},{"unit":"tbsp dry","grams":12}]
chickpeas_dry        → [{"unit":"cup dry (→ ~3 cups cooked)","grams":200},{"unit":"tbsp dry","grams":12}]
black_beans_dry      → [{"unit":"cup dry (→ ~3 cups cooked)","grams":184},{"unit":"tbsp dry","grams":11}]
kidney_beans_dry     → [{"unit":"cup dry (→ ~3 cups cooked)","grams":184},{"unit":"tbsp dry","grams":11}]
pinto_beans_dry      → [{"unit":"cup dry (→ ~3 cups cooked)","grams":193},{"unit":"tbsp dry","grams":12}]
cannellini_dry       → [{"unit":"cup dry (→ ~3 cups cooked)","grams":184},{"unit":"tbsp dry","grams":11}]
edamame_fresh        → [{"unit":"cup (shelled)","grams":155},{"unit":"cup (in pods)","grams":155},{"unit":"tbsp","grams":10}]
mung_beans_dry       → [{"unit":"cup dry","grams":207},{"unit":"tbsp dry","grams":13}]
split_peas_dry       → [{"unit":"cup dry","grams":196},{"unit":"tbsp dry","grams":12}]
tofu_firm            → [{"unit":"cup cubed","grams":252},{"unit":"block (standard)","grams":396},{"unit":"oz","grams":28},{"unit":"slice","grams":84}]
tempeh               → [{"unit":"cup","grams":166},{"unit":"oz","grams":28},{"unit":"3oz serving","grams":85}]
seitan               → [{"unit":"oz","grams":28},{"unit":"cup","grams":166},{"unit":"3oz serving","grams":85}]
```

### GRAINS & CEREALS (18 items)

Note: All dry weights. Add cooked note where relevant.

```
white_rice_dry       → [{"unit":"cup dry (→ ~3 cups cooked)","grams":185},{"unit":"tbsp dry","grams":12}]
brown_rice_dry       → [{"unit":"cup dry (→ ~3 cups cooked)","grams":185},{"unit":"tbsp dry","grams":12}]
basmati_rice_dry     → [{"unit":"cup dry (→ ~3 cups cooked)","grams":185},{"unit":"tbsp dry","grams":12}]
oats_rolled          → [{"unit":"cup dry","grams":81},{"unit":"½ cup dry (1 serving)","grams":40},{"unit":"tbsp dry","grams":5}]
oats_steel_cut       → [{"unit":"cup dry","grams":160},{"unit":"¼ cup dry (1 serving)","grams":40},{"unit":"tbsp dry","grams":10}]
quinoa_dry           → [{"unit":"cup dry (→ ~3 cups cooked)","grams":170},{"unit":"tbsp dry","grams":11}]
buckwheat_dry        → [{"unit":"cup dry","grams":170},{"unit":"tbsp dry","grams":11}]
millet_dry           → [{"unit":"cup dry","grams":200},{"unit":"tbsp dry","grams":12}]
spelt_dry            → [{"unit":"cup dry","grams":174},{"unit":"tbsp dry","grams":11}]
whole_wheat_flour    → [{"unit":"cup","grams":120},{"unit":"tbsp","grams":7.5},{"unit":"tsp","grams":2.5}]
white_flour          → [{"unit":"cup","grams":125},{"unit":"tbsp","grams":8},{"unit":"tsp","grams":2.6}]
barley_dry           → [{"unit":"cup dry","grams":200},{"unit":"tbsp dry","grams":12}]
rye_flour            → [{"unit":"cup","grams":128},{"unit":"tbsp","grams":8}]
cornmeal_dry         → [{"unit":"cup","grams":122},{"unit":"tbsp","grams":8}]
amaranth_dry         → [{"unit":"cup dry","grams":193},{"unit":"tbsp dry","grams":12}]
teff_dry             → [{"unit":"cup dry","grams":193},{"unit":"tbsp dry","grams":12}]
bulgur_dry           → [{"unit":"cup dry","grams":140},{"unit":"tbsp dry","grams":9}]
couscous_dry         → [{"unit":"cup dry","grams":173},{"unit":"tbsp dry","grams":11}]
```

### NUTS & SEEDS (17 items)

```
almonds              → [{"unit":"oz (~23 almonds)","grams":28},{"unit":"cup whole","grams":143},{"unit":"tbsp","grams":9},{"unit":"handful (~20 nuts)","grams":24}]
walnuts              → [{"unit":"oz (~14 halves)","grams":28},{"unit":"cup halves","grams":100},{"unit":"tbsp chopped","grams":7}]
cashews              → [{"unit":"oz (~18 cashews)","grams":28},{"unit":"cup whole","grams":137},{"unit":"tbsp","grams":9},{"unit":"handful","grams":28}]
brazil_nuts          → [{"unit":"1 nut","grams":5},{"unit":"oz (~6 nuts)","grams":28},{"unit":"cup","grams":133}]
pecans               → [{"unit":"oz (~15 halves)","grams":28},{"unit":"cup halves","grams":108},{"unit":"tbsp chopped","grams":7}]
pistachios           → [{"unit":"oz (~49 kernels)","grams":28},{"unit":"cup kernels","grams":123},{"unit":"handful","grams":30}]
macadamia            → [{"unit":"oz (~11 nuts)","grams":28},{"unit":"cup whole","grams":134},{"unit":"tbsp","grams":9}]
hazelnuts            → [{"unit":"oz (~20 nuts)","grams":28},{"unit":"cup","grams":135},{"unit":"tbsp","grams":9}]
pine_nuts            → [{"unit":"tbsp","grams":9},{"unit":"oz","grams":28},{"unit":"cup","grams":135}]
peanuts              → [{"unit":"oz","grams":28},{"unit":"cup","grams":146},{"unit":"tbsp","grams":9},{"unit":"handful","grams":30}]
chia_seeds           → [{"unit":"tbsp","grams":12},{"unit":"oz","grams":28},{"unit":"cup","grams":160}]
flaxseeds            → [{"unit":"tbsp","grams":7},{"unit":"tbsp ground","grams":7},{"unit":"oz","grams":28},{"unit":"cup","grams":149}]
sunflower_seeds      → [{"unit":"tbsp","grams":9},{"unit":"oz","grams":28},{"unit":"cup","grams":140},{"unit":"handful","grams":28}]
pumpkin_seeds        → [{"unit":"tbsp","grams":9},{"unit":"oz","grams":28},{"unit":"cup","grams":129},{"unit":"handful","grams":28}]
sesame_seeds         → [{"unit":"tbsp","grams":9},{"unit":"tsp","grams":3},{"unit":"oz","grams":28},{"unit":"cup","grams":144}]
hemp_seeds           → [{"unit":"tbsp","grams":10},{"unit":"oz","grams":28},{"unit":"cup","grams":155}]
poppy_seeds          → [{"unit":"tsp","grams":2.8},{"unit":"tbsp","grams":8.4},{"unit":"oz","grams":28}]
```

### OILS & FATS (8 items)

```
olive_oil            → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"cup","grams":216},{"unit":"fl oz","grams":28}]
coconut_oil          → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.5},{"unit":"cup","grams":218}]
avocado_oil          → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"cup","grams":218}]
flaxseed_oil         → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"cup","grams":218}]
sesame_oil           → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"cup","grams":218}]
sunflower_oil        → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"cup","grams":218}]
walnut_oil           → [{"unit":"tbsp","grams":14},{"unit":"tsp","grams":4.7},{"unit":"cup","grams":218}]
ghee                 → [{"unit":"tbsp","grams":13},{"unit":"tsp","grams":4.3},{"unit":"cup","grams":205}]
```

### HERBS & SPICES (11 items)

Note: These are dried — amounts are small. Values per 100g are for reference.

```
turmeric_dried       → [{"unit":"tsp","grams":3},{"unit":"tbsp","grams":9},{"unit":"oz","grams":28}]
cinnamon_dried       → [{"unit":"tsp","grams":2.6},{"unit":"tbsp","grams":7.8},{"unit":"oz","grams":28}]
ginger_dried         → [{"unit":"tsp","grams":1.8},{"unit":"tbsp","grams":5.4},{"unit":"oz","grams":28}]
cumin_dried          → [{"unit":"tsp","grams":2.1},{"unit":"tbsp","grams":6.3},{"unit":"oz","grams":28}]
paprika_dried        → [{"unit":"tsp","grams":2.3},{"unit":"tbsp","grams":6.9},{"unit":"oz","grams":28}]
oregano_dried        → [{"unit":"tsp","grams":1},{"unit":"tbsp","grams":3},{"unit":"oz","grams":28}]
black_pepper         → [{"unit":"tsp","grams":2.3},{"unit":"tbsp","grams":6.9},{"unit":"oz","grams":28}]
basil_dried          → [{"unit":"tsp","grams":0.7},{"unit":"tbsp","grams":2.1},{"unit":"oz","grams":28}]
chili_powder         → [{"unit":"tsp","grams":2.7},{"unit":"tbsp","grams":8},{"unit":"oz","grams":28}]
coriander_dried      → [{"unit":"tsp","grams":1.8},{"unit":"tbsp","grams":5.4},{"unit":"oz","grams":28}]
rosemary_dried       → [{"unit":"tsp","grams":1.2},{"unit":"tbsp","grams":3.5},{"unit":"oz","grams":28}]
```

---

## CHANGE 2 — UPDATE App.jsx MEAL BUILDER

### What to change

In the current App.jsx, when a food is selected (meal[food.id] is set),
the UI shows:

```jsx
<span style={{ fontSize:12, fontWeight:700, color:MUTE, flexShrink:0 }}>Grams:</span>
<input type="number" value={g} onChange={e => setGrams(food.id, e.target.value)} ... />
<div>...cal, P, C, F display...</div>
```

Replace this entire selected-food expanded section with the new unit-aware version below.

### New state needed

Add to the App component state:
```js
const [mealUnits, setMealUnits] = useState({}); // { foodId: "unit_string" }
```

Add to localStorage save/restore (key: `mealUnits` — but only save selected unit preferences, NOT the gram amounts since those reset per session).

### Helper function — resolveGrams

Add this function inside the App component (before the return statement):

```js
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
```

### New setGrams function

Replace the existing setGrams function:
```js
const setGrams = (id, g) => {
  setMeal(prev => ({ ...prev, [id]: Math.max(0, parseFloat(g) || 0) }));
};

const setUnit = (id, unitStr) => {
  setMealUnits(prev => ({ ...prev, [id]: unitStr }));
  // Reset quantity to 1 when changing unit
  setMeal(prev => ({ ...prev, [id]: 1 }));
};
```

Note: `setUnit` here is for meal units — rename the food unit setter to `setFoodUnit` to avoid conflict with the existing `unit` state (imperial/metric).

### toggleFood update

Update toggleFood to set default unit when food is added:
```js
const toggleFood = (id, food) => {
  setMeal(prev => {
    const next = { ...prev };
    if (next[id] !== undefined) {
      delete next[id];
      setMealUnits(mu => { const n={...mu}; delete n[id]; return n; });
    } else {
      // Default quantity = 1, default unit = first serving if available, else "grams"
      next[id] = 1;
      const defaultUnit = food.servings && food.servings.length > 0 
        ? food.servings[0].unit 
        : "grams";
      setMealUnits(mu => ({ ...mu, [id]: defaultUnit }));
    }
    return next;
  });
};
```

Update all `toggleFood(food.id, 100)` calls in JSX to `toggleFood(food.id, food)`.

### New meal totals calculation

Update mealTotals to use totalGrams:
```js
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
```

### New JSX for selected food expanded section

Replace the current selected-food expanded div (the one with "Grams:" label and input) with:

```jsx
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
            padding: "10px 8px",
            minHeight: 44,
            borderRadius: 0,
            border: "none",
            borderBottom: "2px solid #1a1a1a",
            background: "transparent",
            color: TXT,
            fontSize: 13,
            fontFamily: "inherit",
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
        <div style={{ display:"flex", gap:10, marginTop:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, color:MUTE }}><b style={{color:TXT}}>{Math.round(food.per100.cal * grams / 100)}</b> cal</span>
          <span style={{ fontSize:12, color:MUTE }}><b style={{color:TXT}}>{Math.round(food.per100.protein * grams / 100 * 10)/10}g</b> P</span>
          <span style={{ fontSize:12, color:MUTE }}><b style={{color:TXT}}>{Math.round(food.per100.carbs * grams / 100 * 10)/10}g</b> C</span>
          <span style={{ fontSize:12, color:MUTE }}><b style={{color:TXT}}>{Math.round(food.per100.fat * grams / 100 * 10)/10}g</b> F</span>
        </div>
      )}
    </div>
  );
})()}
```

### Micro tags update

Update the micronutrient tags section to use totalGrams:
```jsx
{selected && (() => {
  const currentUnit = mealUnits[food.id] || "grams";
  const gramsPerUnit = resolveGrams(food, currentUnit);
  const qty = meal[food.id] || 0;
  const grams = qty * gramsPerUnit;
  if (grams <= 0) return null;
  return (
    <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:6 }}>
      {MICRO_KEYS.filter(k => food.per100[k] > 0).map(k => {
        const val = Math.round(food.per100[k] * grams / 100 * 10) / 10;
        const pct = Math.round((val / rda[k]) * 100);
        return (
          <span key={k} style={{ fontSize:10, padding:"3px 7px", borderRadius:8, background:pct>=20?"#ddd":"#e8e8e8", color:pct>=20?ACC:MUTE, fontWeight:600 }}>
            {MICRO_LABELS[k].split(" ").pop()} {val}{MICRO_UNITS[k]} ({pct}%)
          </span>
        );
      })}
    </div>
  );
})()}
```

### Meal summary display update

In section 5 (Your Meal Totals), update the food summary rows to show unit:
```jsx
{Object.entries(meal).filter(([,qty])=>qty>0).map(([id,qty]) => {
  const food = foodById[id];
  if (!food) return null;
  const currentUnit = mealUnits[id] || "grams";
  const gramsPerUnit = resolveGrams(food, currentUnit);
  const grams = qty * gramsPerUnit;
  const display = currentUnit === "grams" 
    ? `${grams}g` 
    : `${qty} ${currentUnit} (${Math.round(grams)}g)`;
  return (
    <div key={id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #e4e4e7" }}>
      <span style={{ fontSize:13, fontWeight:600 }}>{food.name}</span>
      <span style={{ fontSize:13, color:MUTE }}>{display} · {Math.round(food.per100.cal * grams / 100)} cal</span>
    </div>
  );
})}
```

---

## VARIABLE NAME NOTE

The existing app uses `unit` for imperial/metric toggle and `setUnit` for that setter.
For the new food unit selector, use these names to avoid conflicts:
- State: `mealUnits` (object mapping foodId → unit string)
- Setter for food unit: `setFoodUnit`
- Setter for imperial/metric stays: `setUnit`

---

## FILE SPLITTING (if needed)

If foods.json becomes too large to edit at once, split into:
- `public/foods-fruits-veg.json`
- `public/foods-meat-fish.json`  
- `public/foods-dairy-grains.json`
- `public/foods-nuts-oils-spices.json`

Then in App.jsx fetch all four and merge:
```js
const [f1,f2,f3,f4] = await Promise.all([
  fetch("/foods-fruits-veg.json").then(r=>r.json()),
  fetch("/foods-meat-fish.json").then(r=>r.json()),
  fetch("/foods-dairy-grains.json").then(r=>r.json()),
  fetch("/foods-nuts-oils-spices.json").then(r=>r.json()),
]);
const merged = { meta: f1.meta, categories: { ...f1.categories, ...f2.categories, ...f3.categories, ...f4.categories }};
setFoodsData(merged);
```

---

## AFTER CHANGES

1. Run `npm run dev` — test locally at localhost:5173
2. Verify: select a food, check unit dropdown appears, change units, verify gram conversion shown
3. Verify: meal totals update correctly when units change
4. Run `npm run build`
5. Run `git add . && git commit -m "add serving units to all foods and unit selector in meal builder" && git push`