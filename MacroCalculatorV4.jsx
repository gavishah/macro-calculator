import { useState, useCallback, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   COMPREHENSIVE FOOD DATABASE
   Every food: macros + key micronutrients per 100g
   Micros: vitA(mcg), vitC(mg), vitD(mcg), vitB12(mcg),
           iron(mg), calcium(mg), magnesium(mg), zinc(mg),
           potassium(mg), folate(mcg), omega3(g), selenium(mcg),
           vitK(mcg), vitE(mg)
═══════════════════════════════════════════════════════════ */
const FOODS = [
  // ── POULTRY ──
  { id:"chicken_breast", name:"Chicken Breast (skinless)", cat:"poultry", per100:{ protein:31, carbs:0, fat:3.6, cal:165, vitA:6, vitC:0, vitD:0.1, vitB12:0.3, iron:1, calcium:11, magnesium:29, zinc:1, potassium:256, folate:4, omega3:0.03, selenium:27, vitK:0, vitE:0.3 }},
  { id:"turkey_breast", name:"Turkey Breast", cat:"poultry", per100:{ protein:29, carbs:0, fat:1, cal:135, vitA:0, vitC:0, vitD:0.1, vitB12:0.4, iron:0.7, calcium:10, magnesium:27, zinc:1.6, potassium:293, folate:6, omega3:0.01, selenium:22, vitK:0, vitE:0.1 }},
  { id:"chicken_thigh", name:"Chicken Thigh (skinless)", cat:"poultry", per100:{ protein:25, carbs:0, fat:8, cal:179, vitA:19, vitC:0, vitD:0.1, vitB12:0.3, iron:1.1, calcium:12, magnesium:23, zinc:1.8, potassium:222, folate:7, omega3:0.06, selenium:18, vitK:2.4, vitE:0.2 }},
  { id:"ground_turkey", name:"Ground Turkey (lean)", cat:"poultry", per100:{ protein:27, carbs:0, fat:7, cal:170, vitA:0, vitC:0, vitD:0.1, vitB12:1.3, iron:1.1, calcium:17, magnesium:22, zinc:2.6, potassium:270, folate:8, omega3:0.1, selenium:24, vitK:0, vitE:0.3 }},
  { id:"duck_breast", name:"Duck Breast", cat:"poultry", per100:{ protein:23, carbs:0, fat:11, cal:201, vitA:24, vitC:2.8, vitD:0, vitB12:0.4, iron:2.7, calcium:11, magnesium:19, zinc:1.9, potassium:271, folate:5, omega3:0.1, selenium:14, vitK:2.8, vitE:0.7 }},

  // ── MEAT ──
  { id:"lean_beef", name:"Lean Beef Mince (5%)", cat:"meat", per100:{ protein:26, carbs:0, fat:5, cal:155, vitA:0, vitC:0, vitD:0.1, vitB12:2.5, iron:2.7, calcium:18, magnesium:21, zinc:5.5, potassium:318, folate:7, omega3:0.05, selenium:18, vitK:1.8, vitE:0.4 }},
  { id:"sirloin", name:"Sirloin Steak", cat:"meat", per100:{ protein:27, carbs:0, fat:9, cal:207, vitA:0, vitC:0, vitD:0.1, vitB12:1.5, iron:2.6, calcium:19, magnesium:23, zinc:4.8, potassium:342, folate:13, omega3:0.05, selenium:26, vitK:1.6, vitE:0.4 }},
  { id:"pork_tenderloin", name:"Pork Tenderloin", cat:"meat", per100:{ protein:26, carbs:0, fat:3, cal:143, vitA:0, vitC:0.6, vitD:0.5, vitB12:0.5, iron:1, calcium:5, magnesium:28, zinc:2, potassium:421, folate:5, omega3:0.02, selenium:33, vitK:0, vitE:0.3 }},
  { id:"lamb", name:"Lamb Chops", cat:"meat", per100:{ protein:25, carbs:0, fat:14, cal:235, vitA:0, vitC:0, vitD:0, vitB12:2.6, iron:1.6, calcium:17, magnesium:23, zinc:4.5, potassium:310, folate:18, omega3:0.3, selenium:23, vitK:3.6, vitE:0.2 }},
  { id:"venison", name:"Venison", cat:"meat", per100:{ protein:30, carbs:0, fat:3, cal:158, vitA:0, vitC:0, vitD:0, vitB12:6.3, iron:3.4, calcium:11, magnesium:24, zinc:3, potassium:335, folate:4, omega3:0.1, selenium:10, vitK:0, vitE:0.3 }},

  // ── FISH & SEAFOOD ──
  { id:"salmon", name:"Salmon (Atlantic)", cat:"fish", per100:{ protein:25, carbs:0, fat:13, cal:208, vitA:12, vitC:0, vitD:16, vitB12:3.2, iron:0.8, calcium:12, magnesium:29, zinc:0.6, potassium:363, folate:25, omega3:2.2, selenium:37, vitK:0.5, vitE:3.5 }},
  { id:"tuna_canned", name:"Tuna (canned, in water)", cat:"fish", per100:{ protein:25, carbs:0, fat:1, cal:116, vitA:6, vitC:0, vitD:1.7, vitB12:2.5, iron:1.3, calcium:11, magnesium:30, zinc:0.8, potassium:237, folate:4, omega3:0.3, selenium:90, vitK:0, vitE:0.9 }},
  { id:"cod", name:"Cod", cat:"fish", per100:{ protein:23, carbs:0, fat:1, cal:105, vitA:12, vitC:1, vitD:1, vitB12:1.2, iron:0.4, calcium:18, magnesium:32, zinc:0.5, potassium:413, folate:7, omega3:0.2, selenium:33, vitK:0, vitE:0.6 }},
  { id:"shrimp", name:"Shrimp", cat:"fish", per100:{ protein:24, carbs:0, fat:1, cal:99, vitA:54, vitC:0, vitD:0, vitB12:1.1, iron:0.5, calcium:70, magnesium:37, zinc:1.6, potassium:264, folate:3, omega3:0.5, selenium:38, vitK:0.3, vitE:2.2 }},
  { id:"sardines", name:"Sardines (canned)", cat:"fish", per100:{ protein:25, carbs:0, fat:11, cal:208, vitA:32, vitC:0, vitD:4.8, vitB12:8.9, iron:2.9, calcium:382, magnesium:39, zinc:1.3, potassium:397, folate:10, omega3:1.5, selenium:52, vitK:2.6, vitE:2 }},
  { id:"mackerel", name:"Mackerel", cat:"fish", per100:{ protein:19, carbs:0, fat:14, cal:205, vitA:50, vitC:0.4, vitD:16, vitB12:8.7, iron:1.6, calcium:12, magnesium:76, zinc:0.6, potassium:314, folate:1, omega3:2.5, selenium:44, vitK:5, vitE:1.5 }},

  // ── VEGETARIAN PROTEIN ──
  { id:"eggs", name:"Eggs (whole)", cat:"vegetarian", per100:{ protein:13, carbs:1, fat:11, cal:155, vitA:160, vitC:0, vitD:2, vitB12:0.9, iron:1.7, calcium:56, magnesium:12, zinc:1.3, potassium:138, folate:47, omega3:0.1, selenium:30, vitK:0.3, vitE:1.1 }},
  { id:"egg_whites", name:"Egg Whites", cat:"vegetarian", per100:{ protein:11, carbs:0, fat:0, cal:52, vitA:0, vitC:0, vitD:0, vitB12:0.1, iron:0.1, calcium:7, magnesium:11, zinc:0, potassium:163, folate:4, omega3:0, selenium:20, vitK:0, vitE:0 }},
  { id:"greek_yogurt", name:"Greek Yogurt (0% fat)", cat:"vegetarian", per100:{ protein:10, carbs:4, fat:0.7, cal:59, vitA:4, vitC:0, vitD:0, vitB12:0.8, iron:0.1, calcium:110, magnesium:11, zinc:0.5, potassium:141, folate:7, omega3:0, selenium:9, vitK:0.2, vitE:0 }},
  { id:"cottage_cheese", name:"Cottage Cheese", cat:"vegetarian", per100:{ protein:11, carbs:3, fat:5, cal:98, vitA:37, vitC:0, vitD:0, vitB12:0.4, iron:0.1, calcium:83, magnesium:8, zinc:0.4, potassium:104, folate:12, omega3:0, selenium:9, vitK:0.1, vitE:0.1 }},
  { id:"tofu", name:"Tofu (firm)", cat:"vegetarian", per100:{ protein:17, carbs:2, fat:9, cal:144, vitA:0, vitC:0, vitD:0, vitB12:0, iron:5.4, calcium:350, magnesium:30, zinc:0.8, potassium:121, folate:15, omega3:0.4, selenium:8.9, vitK:2.4, vitE:0.01 }},
  { id:"tempeh", name:"Tempeh", cat:"vegetarian", per100:{ protein:19, carbs:9, fat:11, cal:193, vitA:0, vitC:0, vitD:0, vitB12:0.1, iron:2.7, calcium:111, magnesium:81, zinc:1.1, potassium:412, folate:24, omega3:0.1, selenium:0, vitK:0, vitE:0 }},
  { id:"lentils", name:"Lentils (cooked)", cat:"vegetarian", per100:{ protein:9, carbs:20, fat:0.4, cal:116, vitA:8, vitC:1.5, vitD:0, vitB12:0, iron:3.3, calcium:19, magnesium:36, zinc:1.3, potassium:369, folate:181, omega3:0.04, selenium:2.8, vitK:1.7, vitE:0.1 }},
  { id:"chickpeas", name:"Chickpeas (cooked)", cat:"vegetarian", per100:{ protein:9, carbs:27, fat:2.6, cal:164, vitA:1, vitC:1.3, vitD:0, vitB12:0, iron:2.9, calcium:49, magnesium:48, zinc:1.5, potassium:291, folate:172, omega3:0.1, selenium:3.7, vitK:4, vitE:0.4 }},
  { id:"black_beans", name:"Black Beans (cooked)", cat:"vegetarian", per100:{ protein:9, carbs:24, fat:0.5, cal:132, vitA:0, vitC:0, vitD:0, vitB12:0, iron:2.1, calcium:27, magnesium:70, zinc:1.1, potassium:355, folate:149, omega3:0.1, selenium:1.2, vitK:3.3, vitE:0 }},
  { id:"edamame", name:"Edamame", cat:"vegetarian", per100:{ protein:11, carbs:10, fat:5, cal:121, vitA:15, vitC:6, vitD:0, vitB12:0, iron:2.3, calcium:63, magnesium:64, zinc:1.4, potassium:436, folate:311, omega3:0.4, selenium:0.8, vitK:26.7, vitE:0.7 }},
  { id:"seitan", name:"Seitan", cat:"vegetarian", per100:{ protein:25, carbs:14, fat:1.9, cal:185, vitA:0, vitC:0, vitD:0, vitB12:0, iron:3.6, calcium:54, magnesium:14, zinc:0.8, potassium:100, folate:8, omega3:0, selenium:18, vitK:0, vitE:0 }},
  { id:"quinoa", name:"Quinoa (cooked)", cat:"vegetarian", per100:{ protein:4, carbs:22, fat:2, cal:120, vitA:1, vitC:0, vitD:0, vitB12:0, iron:1.5, calcium:17, magnesium:64, zinc:1.1, potassium:172, folate:42, omega3:0.1, selenium:2.8, vitK:0, vitE:0.6 }},

  // ── CARB SOURCES ──
  { id:"white_rice", name:"White Rice (cooked)", cat:"carbs", per100:{ protein:2.7, carbs:28, fat:0.3, cal:130, vitA:0, vitC:0, vitD:0, vitB12:0, iron:0.2, calcium:10, magnesium:12, zinc:0.5, potassium:35, folate:58, omega3:0, selenium:7.5, vitK:0, vitE:0 }},
  { id:"brown_rice", name:"Brown Rice (cooked)", cat:"carbs", per100:{ protein:2.6, carbs:23, fat:0.9, cal:112, vitA:0, vitC:0, vitD:0, vitB12:0, iron:0.4, calcium:10, magnesium:44, zinc:0.6, potassium:43, folate:4, omega3:0, selenium:9.8, vitK:0.1, vitE:0.2 }},
  { id:"oats", name:"Rolled Oats (dry)", cat:"carbs", per100:{ protein:13, carbs:68, fat:7, cal:389, vitA:0, vitC:0, vitD:0, vitB12:0, iron:4.7, calcium:54, magnesium:177, zinc:3.6, potassium:429, folate:56, omega3:0.1, selenium:28, vitK:0, vitE:0.4 }},
  { id:"sweet_potato", name:"Sweet Potato (baked)", cat:"carbs", per100:{ protein:2, carbs:20, fat:0.1, cal:90, vitA:961, vitC:19.6, vitD:0, vitB12:0, iron:0.7, calcium:38, magnesium:27, zinc:0.3, potassium:475, folate:6, omega3:0, selenium:0.2, vitK:2.3, vitE:0.7 }},
  { id:"potato", name:"Potato (baked)", cat:"carbs", per100:{ protein:2, carbs:21, fat:0.1, cal:93, vitA:0, vitC:9.6, vitD:0, vitB12:0, iron:0.6, calcium:15, magnesium:28, zinc:0.3, potassium:535, folate:28, omega3:0, selenium:0.5, vitK:2, vitE:0 }},
  { id:"ww_bread", name:"Whole Wheat Bread", cat:"carbs", per100:{ protein:9, carbs:41, fat:3, cal:247, vitA:0, vitC:0, vitD:0, vitB12:0, iron:2.5, calcium:107, magnesium:75, zinc:1.8, potassium:254, folate:42, omega3:0, selenium:40, vitK:1.4, vitE:0.4 }},
  { id:"ww_pasta", name:"Whole Wheat Pasta (cooked)", cat:"carbs", per100:{ protein:5, carbs:25, fat:0.9, cal:124, vitA:0, vitC:0, vitD:0, vitB12:0, iron:1.1, calcium:15, magnesium:30, zinc:0.8, potassium:44, folate:7, omega3:0, selenium:25, vitK:0, vitE:0.1 }},
  { id:"banana", name:"Banana", cat:"carbs", per100:{ protein:1.1, carbs:23, fat:0.3, cal:89, vitA:3, vitC:8.7, vitD:0, vitB12:0, iron:0.3, calcium:5, magnesium:27, zinc:0.2, potassium:358, folate:20, omega3:0.03, selenium:1, vitK:0.5, vitE:0.1 }},
  { id:"blueberries", name:"Blueberries", cat:"carbs", per100:{ protein:0.7, carbs:14, fat:0.3, cal:57, vitA:3, vitC:9.7, vitD:0, vitB12:0, iron:0.3, calcium:6, magnesium:6, zinc:0.2, potassium:77, folate:6, omega3:0.1, selenium:0.1, vitK:19.3, vitE:0.6 }},
  { id:"dates", name:"Dates (Medjool)", cat:"carbs", per100:{ protein:2.5, carbs:75, fat:0.4, cal:282, vitA:0, vitC:0, vitD:0, vitB12:0, iron:1, calcium:39, magnesium:43, zinc:0.3, potassium:656, folate:19, omega3:0, selenium:1.9, vitK:2.7, vitE:0.05 }},
  { id:"orange", name:"Orange", cat:"carbs", per100:{ protein:0.9, carbs:12, fat:0.1, cal:47, vitA:11, vitC:53, vitD:0, vitB12:0, iron:0.1, calcium:40, magnesium:10, zinc:0.1, potassium:181, folate:30, omega3:0, selenium:0.5, vitK:0, vitE:0.2 }},

  // ── FAT SOURCES ──
  { id:"avocado", name:"Avocado", cat:"fat", per100:{ protein:2, carbs:9, fat:15, cal:160, vitA:7, vitC:10, vitD:0, vitB12:0, iron:0.6, calcium:12, magnesium:29, zinc:0.6, potassium:485, folate:81, omega3:0.1, selenium:0.4, vitK:21, vitE:2.1 }},
  { id:"olive_oil", name:"Extra Virgin Olive Oil", cat:"fat", per100:{ protein:0, carbs:0, fat:100, cal:884, vitA:0, vitC:0, vitD:0, vitB12:0, iron:0.6, calcium:1, magnesium:0, zinc:0, potassium:1, folate:0, omega3:0.8, selenium:0, vitK:60, vitE:14.4 }},
  { id:"almonds", name:"Almonds", cat:"fat", per100:{ protein:21, carbs:22, fat:49, cal:579, vitA:0, vitC:0, vitD:0, vitB12:0, iron:3.7, calcium:269, magnesium:270, zinc:3.1, potassium:733, folate:44, omega3:0, selenium:4, vitK:0, vitE:25.6 }},
  { id:"walnuts", name:"Walnuts", cat:"fat", per100:{ protein:15, carbs:14, fat:65, cal:654, vitA:1, vitC:1.3, vitD:0, vitB12:0, iron:2.9, calcium:98, magnesium:158, zinc:3.1, potassium:441, folate:98, omega3:9.1, selenium:4.9, vitK:2.7, vitE:0.7 }},
  { id:"chia_seeds", name:"Chia Seeds", cat:"fat", per100:{ protein:17, carbs:42, fat:31, cal:486, vitA:0, vitC:1.6, vitD:0, vitB12:0, iron:7.7, calcium:631, magnesium:335, zinc:4.6, potassium:407, folate:49, omega3:17.8, selenium:55, vitK:0, vitE:0.5 }},
  { id:"flaxseeds", name:"Flaxseeds", cat:"fat", per100:{ protein:18, carbs:29, fat:42, cal:534, vitA:0, vitC:0.6, vitD:0, vitB12:0, iron:5.7, calcium:255, magnesium:392, zinc:4.3, potassium:813, folate:87, omega3:22.8, selenium:25, vitK:4.3, vitE:0.3 }},
  { id:"peanut_butter", name:"Peanut Butter (natural)", cat:"fat", per100:{ protein:25, carbs:20, fat:50, cal:588, vitA:0, vitC:0, vitD:0, vitB12:0, iron:1.7, calcium:43, magnesium:168, zinc:2.8, potassium:649, folate:92, omega3:0, selenium:7.5, vitK:0.3, vitE:9.1 }},
  { id:"dark_chocolate", name:"Dark Chocolate (85%)", cat:"fat", per100:{ protein:8, carbs:46, fat:43, cal:598, vitA:2, vitC:0, vitD:0, vitB12:0.3, iron:11.9, calcium:73, magnesium:228, zinc:3.3, potassium:715, folate:22, omega3:0, selenium:6.8, vitK:7.2, vitE:0.6 }},
  { id:"cashews", name:"Cashews", cat:"fat", per100:{ protein:18, carbs:30, fat:44, cal:553, vitA:0, vitC:0, vitD:0, vitB12:0, iron:6.7, calcium:37, magnesium:292, zinc:5.8, potassium:660, folate:25, omega3:0.1, selenium:20, vitK:34, vitE:0.9 }},
  { id:"cheddar", name:"Cheddar Cheese", cat:"fat", per100:{ protein:25, carbs:1, fat:33, cal:402, vitA:265, vitC:0, vitD:0.6, vitB12:0.8, iron:0.7, calcium:721, magnesium:28, zinc:3.1, potassium:98, folate:18, omega3:0.1, selenium:13.9, vitK:2.8, vitE:0.3 }},
  { id:"sunflower_seeds", name:"Sunflower Seeds", cat:"fat", per100:{ protein:21, carbs:20, fat:51, cal:584, vitA:3, vitC:1.4, vitD:0, vitB12:0, iron:5.2, calcium:78, magnesium:325, zinc:5, potassium:645, folate:227, omega3:0.1, selenium:53, vitK:0, vitE:35.2 }},

  // ── VEGETABLES ──
  { id:"spinach", name:"Spinach (raw)", cat:"vegetable", per100:{ protein:2.9, carbs:3.6, fat:0.4, cal:23, vitA:469, vitC:28, vitD:0, vitB12:0, iron:2.7, calcium:99, magnesium:79, zinc:0.5, potassium:558, folate:194, omega3:0.1, selenium:1, vitK:483, vitE:2 }},
  { id:"broccoli", name:"Broccoli", cat:"vegetable", per100:{ protein:2.8, carbs:7, fat:0.4, cal:34, vitA:31, vitC:89, vitD:0, vitB12:0, iron:0.7, calcium:47, magnesium:21, zinc:0.4, potassium:316, folate:63, omega3:0, selenium:2.5, vitK:102, vitE:0.8 }},
  { id:"kale", name:"Kale", cat:"vegetable", per100:{ protein:4.3, carbs:9, fat:0.9, cal:49, vitA:241, vitC:120, vitD:0, vitB12:0, iron:1.5, calcium:150, magnesium:47, zinc:0.6, potassium:491, folate:141, omega3:0.2, selenium:0.9, vitK:817, vitE:1.5 }},
  { id:"bell_pepper", name:"Red Bell Pepper", cat:"vegetable", per100:{ protein:1, carbs:6, fat:0.3, cal:31, vitA:157, vitC:128, vitD:0, vitB12:0, iron:0.4, calcium:7, magnesium:12, zinc:0.3, potassium:211, folate:46, omega3:0, selenium:0.1, vitK:4.9, vitE:1.6 }},
  { id:"carrots", name:"Carrots", cat:"vegetable", per100:{ protein:0.9, carbs:10, fat:0.2, cal:41, vitA:835, vitC:5.9, vitD:0, vitB12:0, iron:0.3, calcium:33, magnesium:12, zinc:0.2, potassium:320, folate:19, omega3:0, selenium:0.1, vitK:13, vitE:0.7 }},
  { id:"tomatoes", name:"Tomatoes", cat:"vegetable", per100:{ protein:0.9, carbs:4, fat:0.2, cal:18, vitA:42, vitC:14, vitD:0, vitB12:0, iron:0.3, calcium:10, magnesium:11, zinc:0.2, potassium:237, folate:15, omega3:0, selenium:0, vitK:7.9, vitE:0.5 }},
  { id:"brussels", name:"Brussels Sprouts", cat:"vegetable", per100:{ protein:3.4, carbs:9, fat:0.3, cal:43, vitA:38, vitC:85, vitD:0, vitB12:0, iron:1.4, calcium:42, magnesium:23, zinc:0.4, potassium:389, folate:61, omega3:0.1, selenium:1.6, vitK:177, vitE:0.9 }},
  { id:"asparagus", name:"Asparagus", cat:"vegetable", per100:{ protein:2.2, carbs:4, fat:0.1, cal:20, vitA:38, vitC:5.6, vitD:0, vitB12:0, iron:2.1, calcium:24, magnesium:14, zinc:0.5, potassium:202, folate:149, omega3:0, selenium:2.3, vitK:41.6, vitE:1.1 }},
  { id:"mushrooms", name:"Mushrooms (white)", cat:"vegetable", per100:{ protein:3.1, carbs:3, fat:0.3, cal:22, vitA:0, vitC:2.1, vitD:0.2, vitB12:0, iron:0.5, calcium:3, magnesium:9, zinc:0.5, potassium:318, folate:17, omega3:0, selenium:9.3, vitK:0, vitE:0 }},
  { id:"cauliflower", name:"Cauliflower", cat:"vegetable", per100:{ protein:1.9, carbs:5, fat:0.3, cal:25, vitA:0, vitC:48, vitD:0, vitB12:0, iron:0.4, calcium:22, magnesium:15, zinc:0.3, potassium:299, folate:57, omega3:0, selenium:0.6, vitK:15.5, vitE:0.1 }},
  { id:"cabbage", name:"Cabbage", cat:"vegetable", per100:{ protein:1.3, carbs:6, fat:0.1, cal:25, vitA:5, vitC:37, vitD:0, vitB12:0, iron:0.5, calcium:40, magnesium:12, zinc:0.2, potassium:170, folate:43, omega3:0.1, selenium:0.3, vitK:76, vitE:0.1 }},
  { id:"beetroot", name:"Beetroot", cat:"vegetable", per100:{ protein:1.6, carbs:10, fat:0.2, cal:43, vitA:2, vitC:4.9, vitD:0, vitB12:0, iron:0.8, calcium:16, magnesium:23, zinc:0.4, potassium:325, folate:109, omega3:0, selenium:0.7, vitK:0.2, vitE:0 }},
  { id:"peas", name:"Green Peas", cat:"vegetable", per100:{ protein:5.4, carbs:14, fat:0.4, cal:81, vitA:38, vitC:40, vitD:0, vitB12:0, iron:1.5, calcium:25, magnesium:33, zinc:1.2, potassium:244, folate:65, omega3:0, selenium:1.8, vitK:24.8, vitE:0.1 }},
];

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
  const [foodTab, setFoodTab] = useState("protein");
  const [meal, setMeal] = useState({}); // { foodId: grams }

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

  /* meal totals */
  const mealTotals = useCallback(() => {
    const t = { cal:0, protein:0, carbs:0, fat:0 };
    MICRO_KEYS.forEach(k => t[k] = 0);
    Object.entries(meal).forEach(([id, grams]) => {
      if (!grams || grams <= 0) return;
      const food = FOODS.find(f => f.id === id);
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
  }, [meal]);

  const mt = mealTotals();
  const hasMeal = Object.values(meal).some(v => v > 0);

  /* food filtering */
  const filteredFoods = (tab) => {
    let cats = [];
    if (tab === "protein") cats = diet === "vegan" ? ["vegetarian"] : diet === "vegetarian" ? ["vegetarian","fish"] : ["poultry","meat","fish","vegetarian"];
    else if (tab === "carbs") cats = ["carbs"];
    else if (tab === "fat") cats = ["fat"];
    else cats = ["vegetable"];
    let list = FOODS.filter(f => cats.includes(f.cat));
    if (diet === "vegan" && tab === "protein") list = list.filter(f => !["eggs","egg_whites","greek_yogurt","cottage_cheese"].includes(f.id));
    return list;
  };

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

          {/* tabs */}
          <div style={{display:"flex",borderRadius:14,padding:3,marginBottom:18,background:CARD,...neuDn}}>
            {["protein","carbs","fat","vegetables"].map(t => (
              <button key={t} onClick={()=>setFoodTab(t)} style={{ flex:1, padding:"10px 4px", borderRadius:11, border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", background:foodTab===t?CARD:"transparent", color:foodTab===t?ACC:MUTE, transition:"all 0.2s", ...(foodTab===t?neuSm:{}) }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>

          {/* food list */}
          {filteredFoods(foodTab).map(food => {
            const selected = meal[food.id] !== undefined;
            const g = meal[food.id] || 0;
            return (
              <div key={food.id} style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 10, background: CARD, transition: "all 0.2s", ...(selected ? {...neuDn, outline: "2px solid "+ACC} : neuSm) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => toggleFood(food.id, 100)}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{food.name}</span>
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
          })}
        </div>

        {/* ── 5. MEAL TOTALS ── */}
        {hasMeal && (
          <div style={cardStyle}>
            <SH n="5" t="Your Meal Totals" />

            {/* selected foods summary */}
            <div style={{ marginBottom: 16 }}>
              {Object.entries(meal).filter(([,g])=>g>0).map(([id,g]) => {
                const food = FOODS.find(f=>f.id===id);
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
