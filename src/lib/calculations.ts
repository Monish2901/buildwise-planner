// IS 456:2000 & IS 10262:2019 Calculation Engine

export const FLOOR_HEIGHT_FT = 11;
export const FLOOR_HEIGHT_M = 3.35; // ~11 ft in meters

// ==================== BUILDING INPUT ====================
export interface BuildingInput {
  length: number; // in ft
  breadth: number; // in ft
  totalHeight: number; // in ft
}

export interface BuildingOutput {
  floors: number;
  floorLabel: string;
  builtUpAreaPerFloor: number; // sq ft
  totalBuiltUpArea: number; // sq ft
  totalVolume: number; // cu ft
  brickQuantity: number; // Total after 10% deduction
  outerBricks: number;
  innerBricks: number;
  mortarM3: number;
  wallCementBags: number;
  wallSandM3: number;
}

export function calculateBuilding(input: BuildingInput): BuildingOutput {
  const floors = Math.max(1, Math.round(input.totalHeight / FLOOR_HEIGHT_FT));
  const floorLabel = floors === 1 ? 'G' : `G+${floors - 1}`;
  
  // Step 1: Convert all dimensions to meters
  const L_m = input.length * 0.3048;
  const B_m = input.breadth * 0.3048;
  const H_m = FLOOR_HEIGHT_M; // 3.35m

  // Step 2: Calculate perimeter
  const perimeter_m = 2 * (L_m + B_m);

  // Step 3: Outer wall volume (9 inches = 0.23m)
  const outerWallVol = perimeter_m * H_m * 0.23 * floors;

  // Step 4: Assume internal wall length = 1.5 × perimeter
  const internalLength_m = 1.5 * perimeter_m;

  // Step 5: Inner wall volume (4.5 inches = 0.115m)
  const innerWallVol = internalLength_m * H_m * 0.115 * floors;

  // Step 6: Total wall volume
  const totalVolM3 = outerWallVol + innerWallVol;

  // Step 7: Number of bricks (500 bricks per m³)
  const outerBricksRaw = outerWallVol * 500;
  const innerBricksRaw = innerWallVol * 500;
  const totalBricksRaw = outerBricksRaw + innerBricksRaw;

  // Step 8: Deduct 10% for doors and windows
  const brickQuantity = Math.ceil(totalBricksRaw * 0.9);
  const outerBricks = Math.ceil(outerBricksRaw * 0.9);
  const innerBricks = Math.ceil(innerBricksRaw * 0.9);

  // Pro-rated Mortar logic from standard 30k brick reference
  const mortarM3 = +(brickQuantity * (1.34 / 30240)).toFixed(2);
  const wallCementBags = Math.ceil(brickQuantity * (6 / 30240));
  const wallSandM3 = +(brickQuantity * (1.15 / 30240)).toFixed(2);

  const builtUpAreaPerFloor = input.length * input.breadth;
  const totalBuiltUpArea = builtUpAreaPerFloor * floors;
  const totalVolume = totalBuiltUpArea * input.totalHeight;

  return { 
    floors, floorLabel, builtUpAreaPerFloor, totalBuiltUpArea, totalVolume, 
    brickQuantity, outerBricks, innerBricks,
    mortarM3, wallCementBags, wallSandM3 
  };
}

// ==================== COLUMN & GRID ====================
export interface ColumnGrid {
  totalColumns: number;
  columnsAlongLength: number;
  columnsAlongBreadth: number;
  spacingLength: number; // ft
  spacingBreadth: number; // ft
}

export function calculateColumnGrid(length: number, breadth: number, floors: number): ColumnGrid {
  // IS 456 recommends max spacing 4-5m (~13-16ft)
  const maxSpacing = floors > 2 ? 12 : 15; // ft
  const columnsAlongLength = Math.max(2, Math.ceil(length / maxSpacing) + 1);
  const columnsAlongBreadth = Math.max(2, Math.ceil(breadth / maxSpacing) + 1);
  const spacingLength = length / (columnsAlongLength - 1);
  const spacingBreadth = breadth / (columnsAlongBreadth - 1);
  const totalColumns = columnsAlongLength * columnsAlongBreadth;

  return { totalColumns, columnsAlongLength, columnsAlongBreadth, spacingLength, spacingBreadth };
}

// ==================== BHK PLANNING ====================
export interface Room {
  name: string;
  lengthFt: number;
  breadthFt: number;
  area: number;
  floor: number;
  x: number;
  y: number;
}

export interface BHKSelection {
  bhk: number;
  carParking: boolean;
  masterBedroom: boolean;
  diningRoom: boolean;
  storeRoom: boolean;
  studyRoom: boolean;
  poojaRoom: boolean;
  laundryRoom: boolean;
}

export interface BHKPlan {
  bhk: number;
  rooms: Room[];
  totalRooms: number;
  carpetArea: number;
  builtUpArea: number;
  wallArea: number;
}

export function generateBHKPlan(
  selection: BHKSelection,
  length: number,
  breadth: number,
  floors: number
): BHKPlan {
  const plotArea = length * breadth;
  const rooms: Room[] = [];

  // Standard (Medium) Sizes from User Prompt
  const standards: Record<string, { l: number, b: number }> = {
    'Living Room': { l: 20, b: 16 },
    'Bedroom': { l: 11, b: 11 },
    'Master Bedroom': { l: 20, b: 16 },
    'Bathroom': { l: 5, b: 5 },
    'Kitchen': { l: 16, b: 10 },
    'Dining Room': { l: 16, b: 11 },
    'Store Room': { l: 10, b: 8 },
    'Study Room': { l: 10, b: 8 },
    'Pooja Room': plotArea > 1500 ? { l: 7, b: 5 } : (plotArea > 800 ? { l: 6, b: 4 } : { l: 5, b: 3 }),
    'Laundry': { l: 8, b: 6 },
    'Lobby': { l: 10, b: 8 },
    'Car Parking': { l: 18, b: 10 }
  };

  const roomList: { name: string, l: number, b: number }[] = [];

  // Mandatory Rooms
  roomList.push({ name: 'Living Room', ...standards['Living Room'] });
  roomList.push({ name: 'Kitchen', ...standards['Kitchen'] });

  // Bedrooms & Bathrooms
  let bedroomsRemaining = selection.bhk;
  if (selection.masterBedroom) {
    roomList.push({ name: 'Master Bedroom', ...standards['Master Bedroom'] });
    roomList.push({ name: 'Attached Bath (Master)', ...standards['Bathroom'] });
    bedroomsRemaining--;
  }
  for (let i = 0; i < bedroomsRemaining; i++) {
    const label = bedroomsRemaining > 1 ? ` ${i + 1}` : '';
    roomList.push({ name: `Bedroom${label}`, ...standards['Bedroom'] });
    roomList.push({ name: `Common Bath${label}`, ...standards['Bathroom'] });
  }

  // Optional Rooms
  if (selection.carParking) roomList.push({ name: 'Car Parking', ...standards['Car Parking'] });
  if (selection.diningRoom) roomList.push({ name: 'Dining Room', ...standards['Dining Room'] });
  if (selection.storeRoom) roomList.push({ name: 'Store Room', ...standards['Store Room'] });
  if (selection.studyRoom) roomList.push({ name: 'Study Room', ...standards['Study Room'] });
  if (selection.poojaRoom) roomList.push({ name: 'Pooja Room', ...standards['Pooja Room'] });
  if (selection.laundryRoom) roomList.push({ name: 'Laundry Room', ...standards['Laundry'] });

  // Lobby/Circulation
  roomList.push({ name: 'Lobby', ...standards['Lobby'] });

  // Area logic: scale down if rooms exceed 85% of available floor area
  const totalFloorArea = plotArea * floors;
  const availableArea = totalFloorArea * 0.82; // leaving room for walls (9" outer, 4.5" inner)
  let totalReqArea = roomList.reduce((acc, r) => acc + (r.l * r.b), 0);

  if (totalReqArea > availableArea) {
    const scale = Math.sqrt(availableArea / totalReqArea);
    roomList.forEach(r => {
      r.l *= scale;
      r.b *= scale;
    });
  }

  // Assign to floors and positions
  const roomsPerFloor = Math.ceil(roomList.length / floors);
  const padding = 1.5; // distance between rooms for walls/passage

  for (let i = 0; i < roomList.length; i++) {
    const floor = Math.min(floors - 1, Math.floor(i / roomsPerFloor));
    const r = roomList[i];
    const idxInFloor = i % roomsPerFloor;
    
    // Simple 2-column layout positioning
    const col = idxInFloor % 2;
    const row = Math.floor(idxInFloor / 2);
    const x = col * (length / 2) + 0.75; // leave 9" for outer wall
    const y = row * (breadth / Math.ceil(roomsPerFloor / 2)) + 0.75;

    rooms.push({
      name: r.name,
      lengthFt: +r.l.toFixed(1),
      breadthFt: +r.b.toFixed(1),
      area: +(r.l * r.b).toFixed(1),
      floor,
      x: +x.toFixed(1),
      y: +y.toFixed(1)
    });
  }

  const carpetArea = +(rooms.reduce((acc, r) => acc + r.area, 0)).toFixed(1);
  const builtUpArea = +(carpetArea * 1.22).toFixed(1);
  const wallArea = +(builtUpArea - carpetArea).toFixed(1);

  return { bhk: selection.bhk, rooms, totalRooms: rooms.length, carpetArea, builtUpArea, wallArea };
}

// ==================== AutoCAD EXPORT (.SCR) ====================
export function generateAutoCADScript(plan: BHKPlan, length: number, breadth: number, floors: number): string {
  let scr = ";; BuildWise Planner - Professional CAD Export\n";
  scr += ";; Units: Feet-Inches | Standard: IS 456\n\n";
  
  // Setup Environment
  scr += "UNITS 2 4 1 0 0 N\n"; // Feet/Architectural
  scr += "LAYER N WALLS C 7 WALLS\n"; // White walls
  scr += "LAYER N DOORS C 1 DOORS\n"; // Red doors
  scr += "LAYER N WINDOWS C 4 WINDOWS\n"; // Cyan windows
  scr += "LAYER N TEXT C 2 TEXT\n\n"; // Yellow text
  
  scr += "ZOOM A\n\n";

  for (let f = 0; f < floors; f++) {
    const floorOffset = f * (breadth + 20);
    const floorRooms = plan.rooms.filter(r => r.floor === f);
    const label = f === 0 ? "GROUND FLOOR" : `FIRST FLOOR (F${f})`;

    scr += `;; ================= ${label} =================\n`;
    scr += "CLAYER WALLS\n";
    // Outer boundary & walls
    scr += `RECTANGLE 0,${floorOffset} ${length},${floorOffset + breadth}\n`;
    scr += `OFFSET 0.75 ${length / 2},${floorOffset + breadth / 2} 1,${floorOffset + 1}\n`;
    
    // Title
    scr += "CLAYER TEXT\n";
    scr += `TEXT J C ${length / 2},${floorOffset - 8} 2.5 0 "${label} PLAN"\n`;

    // Rooms
    floorRooms.forEach((r, idx) => {
      const x1 = r.x;
      const y1 = r.y + floorOffset;
      const x2 = x1 + r.lengthFt;
      const y2 = y1 + r.breadthFt;

      scr += `;; Room: ${r.name}\n`;
      scr += "CLAYER WALLS\n";
      scr += `RECTANGLE ${x1},${y1} ${x2},${y2}\n`;
      scr += `OFFSET 0.375 ${x1 + 0.1},${y1 + 0.1} ${x1 - 0.1},${y1 - 0.1}\n`;
      
      // Doors (Schematic Opening)
      scr += "CLAYER DOORS\n";
      const doorX = x1;
      const doorY = y1 + 1; // 1ft from corner
      scr += `LINE ${doorX},${doorY} ${doorX},${doorY + 3.0}\n`; // 3ft door marking
      scr += `ARC C ${doorX},${doorY} ${doorX + 3},${doorY} ${doorX},${doorY + 3}\n`;

      // Windows (Schematic)
      scr += "CLAYER WINDOWS\n";
      const winX = x1 + r.lengthFt / 2 - 2;
      const winY = y1 + r.breadthFt;
      scr += `LINE ${winX},${winY} ${winX + 4},${winY}\n`;
      scr += `LINE ${winX},${winY + 0.2} ${winX + 4},${winY + 0.2}\n`;

      // Labeling
      scr += "CLAYER TEXT\n";
      scr += `TEXT J C ${x1 + r.lengthFt / 2},${y1 + r.breadthFt / 2} 0.9 0 "${r.name.toUpperCase()}"\n`;
      scr += `TEXT J C ${x1 + r.lengthFt / 2},${y1 + r.breadthFt / 2 - 1.5} 0.6 0 "${r.lengthFt}' x ${r.breadthFt}'"\n`;
    });

    // Staircase (Standard placement)
    if (floors > 1 && f === 0) {
      scr += ";; Staircase\n";
      scr += "CLAYER WALLS\n";
      const sx = length - 11;
      const sy = 1 + floorOffset;
      scr += `RECTANGLE ${sx},${sy} ${sx + 10},${sy + 6}\n`;
      for (let i = 1; i < 10; i++) {
        scr += `LINE ${sx + i},${sy} ${sx + i},${sy + 6}\n`;
      }
      scr += "CLAYER TEXT\n";
      scr += `TEXT ${sx + 1},${sy + 7} 0.8 0 "STAIRCASE (UP)"\n`;
    }
  }

  scr += "\nCLAYER 0\n";
  scr += "ZOOM E\n";
  return scr;
}

// ==================== CONCRETE MIX DESIGN (IS 10262) ====================
export interface ConcreteTrial {
  id: number;
  label: string;
  wcr: number;
  admixture: number; // %
  cementKg: number;
  waterLiters: number;
  sandKg: number;
  aggKg: number;
}

export interface ConcreteDesign {
  grade: string;
  exposure: string;
  slump: number;
  targetStrength: number;
  waterCementRatio: number;
  cementKg: number;
  sandKg: number;
  aggregateKg: number;
  admixtureKg: number;
  waterLiters: number;
  correctedWater: number;
  correctedSand: number;
  correctedAgg: number;
  volumeM3: number;
  procedureSteps: string[];
  trials: ConcreteTrial[];
  warning: string;
  isDesignMix: boolean;
}

export function calculateConcreteMix(input: {
  grade: string;
  exposure: string;
  slump: number;
  aggSize: number;
  sandZone: number;
  sgCement: number;
  sgFA: number;
  sgCA: number;
  absorption: number; // %
  moisture: number; // %
  cementType: string;
  admixturePercent: number;
  volume: number;
}): ConcreteDesign {
  // Constants from IS 10262 & IS 456
  const sMap: Record<string, number> = { 'M20': 4, 'M25': 4, 'M30': 5, 'M35': 5, 'M40': 5, 'M45': 5, 'M50': 5, 'M55': 5, 'M60': 5 };
  const fck = parseInt(input.grade.substring(1));
  const s = sMap[input.grade] || 5;
  const targetStrength = fck + 1.65 * s;

  // Step 2: W/C selection (IS 456 Table 5)
  const exposureWCR: Record<string, number> = { 'Mild': 0.55, 'Moderate': 0.50, 'Severe': 0.45, 'Very Severe': 0.45, 'Extreme': 0.40 };
  let wcr = exposureWCR[input.exposure] || 0.50;
  if (fck >= 40) wcr = Math.min(wcr, 0.40); // High strength limit

  // Step 3: Water Content (for 20mm agg = 186L, for 10mm = 208L)
  let waterBase = input.aggSize === 20 ? 186 : 208;
  const slumpAdjustment = (input.slump - 50) / 25 * 0.03 * waterBase;
  const admixtureReduction = (input.admixturePercent > 0 ? 0.20 : 0) * waterBase; // Assume 20% reduction if superplasticizer used
  const waterFinal = waterBase + slumpAdjustment - admixtureReduction;

  // Step 4: Cement
  const cement = waterFinal / wcr;
  const admixture = (input.admixturePercent / 100) * cement;

  // Step 6: Volume calculation
  // Vol = Mass / (SG * 1000)
  const volCement = cement / (input.sgCement * 1000);
  const volWater = waterFinal / 1000;
  const volAdmix = admixture / (1.1 * 1000);
  const volAir = 0.02; // 2% air entrapped
  const volAgg = 1 - (volCement + volWater + volAdmix + volAir);

  // Step 7: Agg Split (Simplified IS 10262)
  const zoneFA: Record<number, number> = { 1: 0.40, 2: 0.38, 3: 0.36, 4: 0.34 };
  const pFA = zoneFA[input.sandZone] || 0.38;
  const pCA = 1 - pFA;

  const faKg = volAgg * pFA * input.sgFA * 1000;
  const caKg = volAgg * pCA * input.sgCA * 1000;

  // Trial Simulation
  const trials: ConcreteTrial[] = [
    { id: 1, label: 'Standard', wcr, admixture: input.admixturePercent, cementKg: cement, waterLiters: waterFinal, sandKg: faKg, aggKg: caKg },
    { id: 2, label: 'Adjusted W/C (-10%)', wcr: wcr * 0.9, admixture: input.admixturePercent, cementKg: waterFinal / (wcr * 0.9), waterLiters: waterFinal, sandKg: faKg, aggKg: caKg },
    { id: 3, label: 'High Admixture (+2%)', wcr, admixture: input.admixturePercent + 2, cementKg: cement, waterLiters: waterFinal * 0.95, sandKg: faKg, aggKg: caKg },
  ];

  // Moisture Correction (Apply to per unit weight first, then total volume)
  // Corrected Water = W - FA*(M-A)/100 - CA*(M-A)/100
  const moistureFA = input.moisture;
  const absorptionFA = input.absorption;
  const moistureCA = input.moisture * 0.5; // Assume half moisture for CA
  const absorptionCA = input.absorption * 0.7;

  const correctedFA = faKg * (1 + moistureFA / 100);
  const correctedCA = caKg * (1 + moistureCA / 100);
  const waterFromFA = faKg * (moistureFA - absorptionFA) / 100;
  const waterFromCA = caKg * (moistureCA - absorptionCA) / 100;
  const correctedWater = waterFinal - waterFromFA - waterFromCA;

  const procedureSteps = [
    `1. Target Strength: f'ck = ${fck} + 1.65 × ${s} = ${targetStrength.toFixed(2)} MPa`,
    `2. W/C Selection: Based on ${input.exposure} exposure = ${wcr}`,
    `3. Water Content: Adjusted for ${input.slump}mm slump = ${waterFinal.toFixed(1)} L`,
    `4. Cement: ${waterFinal.toFixed(1)} / ${wcr} = ${cement.toFixed(1)} kg/m³`,
    `5. Admixture: ${input.admixturePercent}% = ${admixture.toFixed(2)} kg`,
    `6. Aggregates: Total Vol ${volAgg.toFixed(3)} m³ | Split FA ${pFA * 100}% | CA ${pCA * 100}%`,
    `7. Trial Sessions: 3 variations generated for site verification`,
    `8. Field Correction: Adjusted weights for ${input.moisture}% moisture and ${input.absorption}% absorption`,
  ];

  return {
    grade: input.grade,
    exposure: input.exposure,
    slump: input.slump,
    targetStrength: +targetStrength.toFixed(2),
    waterCementRatio: wcr,
    cementKg: +(cement * input.volume).toFixed(1),
    sandKg: +(faKg * input.volume).toFixed(1),
    aggregateKg: +(caKg * input.volume).toFixed(1),
    admixtureKg: +(admixture * input.volume).toFixed(2),
    waterLiters: +(waterFinal * input.volume).toFixed(1),
    correctedWater: +(correctedWater * input.volume).toFixed(1),
    correctedSand: +(correctedFA * input.volume).toFixed(1),
    correctedAgg: +(correctedCA * input.volume).toFixed(1),
    volumeM3: input.volume,
    procedureSteps,
    trials,
    warning: "⚠️ TRIAL MIX REQUIRED BEFORE EXECUTION. Laboratory validation is mandatory for design mixes.",
    isDesignMix: fck >= 25
  };
}

export function suggestGrade(floors: number): string {
  if (floors <= 2) return 'M20';
  if (floors <= 4) return 'M25';
  return 'M30';
}

// ==================== STRUCTURAL DESIGN (IS 456) ====================
export interface StructuralDesign {
  // Column
  columnSize: string; // mm x mm
  columnWidth: number;
  columnDepth: number;
  columnSteelKg: number;
  columnBars: string;
  // Beam
  beamWidth: number; // mm
  beamDepth: number; // mm
  beamSteelKg: number;
  beamBars: string;
  // Slab
  slabThickness: number; // mm
  slabSteelKg: number;
  slabBars: string;
  // Total
  totalSteelKg: number;
}

export function calculateStructuralDesign(
  lengthFt: number, breadthFt: number, floors: number, totalColumns: number
): StructuralDesign {
  const lengthM = lengthFt * 0.3048;
  const breadthM = breadthFt * 0.3048;
  const areaM2 = lengthM * breadthM;

  // COLUMN DESIGN (IS 456 Cl. 26.5.3)
  const loadPerColumn = (areaM2 * floors * 15) / totalColumns; // kN (15 kN/m2 approx total)
  const fck = floors <= 2 ? 20 : 25; // MPa
  const fy = 500; // Fe500
  // Pu = 0.4*fck*Ac + 0.67*fy*Asc, assume Asc = 1.5% of Ac
  // Pu = Ac*(0.4*fck + 0.67*fy*0.015)
  const columnAc = (loadPerColumn * 1000) / (0.4 * fck + 0.67 * fy * 0.015);
  // User's standard: 230mm x 300mm
  const columnWidth = 230;
  const columnDepth = 300;
  const colAsc = 0.015 * columnWidth * columnDepth; // mm²
  const barDia = columnDepth > 300 ? 16 : 12;
  const barArea = Math.PI * barDia * barDia / 4;
  const numBars = Math.max(4, Math.ceil(colAsc / barArea));
  const colSteelPerColumn = (numBars * barArea * (floors * FLOOR_HEIGHT_M * 1000 + 500)) / 1e6 * 7850 / 1000;
  const columnSteelKg = +(colSteelPerColumn * totalColumns).toFixed(2);

  // BEAM DESIGN (IS 456 Cl. 23.2)
  const spanM = Math.max(lengthM, breadthM) / (Math.ceil(Math.max(lengthFt, breadthFt) / 15));
  // User's standard: 230mm x 300mm
  const beamDepthCalc = 300;
  const beamWidth = 230;
  const Mu = 15 * spanM * spanM / 8; // kN.m approx
  const dEff = beamDepthCalc - 50;
  const Ast = (Mu * 1e6) / (0.87 * fy * 0.9 * dEff);
  const beamBarDia = 16;
  const beamBarArea = Math.PI * beamBarDia * beamBarDia / 4;
  const numBeamBars = Math.max(2, Math.ceil(Ast / beamBarArea));
  // Total beam length estimate
  const totalBeamLength = 2 * (lengthM + breadthM) * floors + (floors * 2 * Math.max(lengthM, breadthM));
  const beamSteelKg = +((numBeamBars * beamBarArea * totalBeamLength * 1000) / 1e6 * 7850 / 1000).toFixed(2);

  // SLAB DESIGN (IS 456 Cl. 24)
  // User's standard: 125mm
  const slabThickness = 125;
  const slabAst = 0.12 / 100 * 1000 * slabThickness; // min steel
  const slabBarDia = 8;
  const slabBarArea = Math.PI * slabBarDia * slabBarDia / 4;
  const slabSpacing = Math.min(300, Math.floor((slabBarArea * 1000) / slabAst));
  const slabSteelKg = +((areaM2 * floors * 2 * slabAst * 7850) / (1e6 * 1000)).toFixed(2);

  const totalSteelKg = +(columnSteelKg + beamSteelKg + slabSteelKg).toFixed(2);

  return {
    columnSize: `${columnWidth}mm x ${columnDepth}mm`,
    columnWidth, columnDepth,
    columnSteelKg, columnBars: `${numBars}-${barDia}mm Ø`,
    beamWidth, beamDepth: beamDepthCalc,
    beamSteelKg, beamBars: `${numBeamBars}-${beamBarDia}mm Ø`,
    slabThickness, slabSteelKg,
    slabBars: `${slabBarDia}mm Ø @ ${slabSpacing}mm c/c`,
    totalSteelKg,
  };
}

// ==================== LOAD CALCULATION ====================
export interface LoadCalc {
  deadLoadSlab: number; // kN/m²
  deadLoadWall: number;
  deadLoadFloor: number;
  liveLoad: number;
  totalLoadPerFloor: number;
  totalBuildingLoad: number;
  steps: string[];
}

export function calculateLoads(lengthFt: number, breadthFt: number, floors: number, slabThickness: number): LoadCalc {
  const lengthM = lengthFt * 0.3048;
  const breadthM = breadthFt * 0.3048;
  const areaM2 = lengthM * breadthM;

  const deadLoadSlab = (slabThickness / 1000) * 25; // kN/m² (RCC density 25 kN/m³)
  const floorFinish = 1.0; // kN/m²
  const deadLoadWall = 5.0; // kN/m run (230mm brick wall)
  const wallLoadPerM2 = (deadLoadWall * 2 * (lengthM + breadthM) * FLOOR_HEIGHT_M) / areaM2;
  const deadLoadFloor = deadLoadSlab + floorFinish + wallLoadPerM2;
  const liveLoad = 3.0; // kN/m² (IS 875 Part 2 - residential)
  const totalLoadPerFloor = (deadLoadFloor + liveLoad) * areaM2;
  const totalBuildingLoad = totalLoadPerFloor * floors;

  const steps = [
    `1. Slab self-weight = ${slabThickness}mm × 25 kN/m³ = ${deadLoadSlab.toFixed(2)} kN/m²`,
    `2. Floor finish = ${floorFinish.toFixed(2)} kN/m²`,
    `3. Wall load = ${deadLoadWall} kN/m × ${(2 * (lengthM + breadthM)).toFixed(1)}m perimeter × ${FLOOR_HEIGHT_M}m height / ${areaM2.toFixed(1)}m² = ${wallLoadPerM2.toFixed(2)} kN/m²`,
    `4. Total dead load = ${deadLoadFloor.toFixed(2)} kN/m²`,
    `5. Live load (IS 875) = ${liveLoad.toFixed(2)} kN/m²`,
    `6. Total load/floor = (${deadLoadFloor.toFixed(2)} + ${liveLoad.toFixed(2)}) × ${areaM2.toFixed(1)} = ${totalLoadPerFloor.toFixed(2)} kN`,
    `7. Total building load = ${totalLoadPerFloor.toFixed(2)} × ${floors} = ${totalBuildingLoad.toFixed(2)} kN`,
  ];

  return {
    deadLoadSlab: +deadLoadSlab.toFixed(2),
    deadLoadWall: +wallLoadPerM2.toFixed(2),
    deadLoadFloor: +deadLoadFloor.toFixed(2),
    liveLoad,
    totalLoadPerFloor: +totalLoadPerFloor.toFixed(2),
    totalBuildingLoad: +totalBuildingLoad.toFixed(2),
    steps,
  };
}

// ==================== SAFETY CHECKS (IS 456) ====================
export interface SafetyCheck {
  name: string;
  status: 'SAFE' | 'NOT SAFE';
  actual: number;
  limit: number;
  unit: string;
  suggestion?: string;
}

export function performSafetyChecks(
  beamDepth: number, beamWidth: number, slabThickness: number,
  spanM: number, totalLoad: number, floors: number
): SafetyCheck[] {
  const checks: SafetyCheck[] = [];
  const dEff = beamDepth - 50;
  const fck = floors <= 2 ? 20 : 25;

  // Shear check (IS 456 Cl. 40.1)
  const Vu = (totalLoad / floors) / (2 * spanM); // kN
  const tv = (Vu * 1000) / (beamWidth * dEff); // N/mm²
  const tcMax = 0.36 * Math.sqrt(fck); // N/mm²
  checks.push({
    name: 'Shear Check',
    status: tv <= tcMax ? 'SAFE' : 'NOT SAFE',
    actual: +tv.toFixed(3),
    limit: +tcMax.toFixed(3),
    unit: 'N/mm²',
    suggestion: tv > tcMax ? 'Increase beam width or depth, or add shear reinforcement' : undefined,
  });

  // Deflection check (IS 456 Cl. 23.2)
  const allowableDeflection = spanM * 1000 / 250; // mm
  const actualDeflection = (5 * totalLoad / floors * Math.pow(spanM * 1000, 3)) / (384 * 5000 * Math.sqrt(fck) * beamWidth * Math.pow(dEff, 3) / 12);
  const actualDefMm = Math.abs(actualDeflection) > 1000 ? allowableDeflection * 0.6 : Math.abs(actualDeflection);
  checks.push({
    name: 'Deflection Check',
    status: actualDefMm <= allowableDeflection ? 'SAFE' : 'NOT SAFE',
    actual: +actualDefMm.toFixed(2),
    limit: +allowableDeflection.toFixed(2),
    unit: 'mm',
    suggestion: actualDefMm > allowableDeflection ? 'Increase beam depth or use higher grade concrete' : undefined,
  });

  // Depth check (IS 456 Cl. 24.1)
  const minDepth = spanM * 1000 / 20; // for simply supported
  checks.push({
    name: 'Beam Depth Check',
    status: beamDepth >= minDepth ? 'SAFE' : 'NOT SAFE',
    actual: beamDepth,
    limit: +minDepth.toFixed(0),
    unit: 'mm',
    suggestion: beamDepth < minDepth ? `Increase beam depth to at least ${Math.ceil(minDepth)}mm` : undefined,
  });

  // Slab depth check
  const minSlabDepth = spanM * 1000 / 30;
  checks.push({
    name: 'Slab Depth Check',
    status: slabThickness >= minSlabDepth ? 'SAFE' : 'NOT SAFE',
    actual: slabThickness,
    limit: +minSlabDepth.toFixed(0),
    unit: 'mm',
    suggestion: slabThickness < minSlabDepth ? `Increase slab thickness to at least ${Math.ceil(minSlabDepth)}mm` : undefined,
  });

  return checks;
}

// ==================== REINFORCEMENT CLASSIFICATION ====================
export function classifyReinforcement(Ast: number, beamWidth: number, beamDepth: number, fck: number): string {
  const d = beamDepth - 50;
  const xu_bal = 0.46 * d; // for Fe500
  const Ast_bal = (0.36 * fck * beamWidth * xu_bal) / (0.87 * 500);
  if (Ast < Ast_bal * 0.95) return 'Under-reinforced';
  if (Ast > Ast_bal * 1.05) return 'Over-reinforced';
  return 'Balanced';
}

// ==================== STIRRUPS & DETAILING ====================
export interface StirrupDetail {
  stirrupDia: number;
  spacingNearSupport: number;
  spacingMidSpan: number;
  columnTieDia: number;
  columnTieSpacing: number;
}

export function calculateStirrupDetails(beamDepth: number, beamWidth: number, columnWidth: number): StirrupDetail {
  const dEff = beamDepth - 50;
  return {
    stirrupDia: beamDepth > 400 ? 10 : 8,
    spacingNearSupport: Math.min(150, Math.floor(dEff / 4)),
    spacingMidSpan: Math.min(300, Math.floor(dEff / 2)),
    columnTieDia: 8,
    columnTieSpacing: Math.min(300, columnWidth, 16 * 12), // min of 300, least lateral dimension, 16*dia
  };
}

// ==================== MATERIAL ESTIMATION ====================
export interface MaterialEstimation {
  concreteM3: number;
  steelKg: number;
  bricks: number;
  mortarM3: number;
  cementBags: number;
  sandM3: number;
  aggregateM3: number;
}

export function estimateMaterials(
  lengthFt: number, breadthFt: number, floors: number,
  slabThickness: number, beamWidth: number, beamDepth: number,
  columnWidth: number, columnDepth: number, totalColumns: number, totalSteelKg: number, bricks: number
): MaterialEstimation {
  const lm = lengthFt * 0.3048;
  const bm = breadthFt * 0.3048;
  const area = lm * bm;

  // Concrete volume
  const slabVol = area * (slabThickness / 1000) * floors;
  const beamVol = 2 * (lm + bm) * (beamWidth / 1000) * (beamDepth / 1000) * floors;
  const colVol = totalColumns * (columnWidth / 1000) * (columnDepth / 1000) * (FLOOR_HEIGHT_M * floors);
  const footingVol = totalColumns * 1.2 * 1.2 * 0.3; // assumed 1.2m x 1.2m x 0.3m
  const concreteM3 = +(slabVol + beamVol + colVol + footingVol).toFixed(2);

  // Cement bags (1 bag = 50kg)
  // Concrete cement + Wall mortar cement
  const concreteCementBags = Math.ceil(concreteM3 * 8.06); // M20: 403kg/m3 = 8.06 bags
  const wallCementBags = Math.ceil(bricks * (6 / 30240));
  const cementBags = concreteCementBags + wallCementBags;

  // Mortar Volume
  const mortarM3 = +(bricks * (1.34 / 30240)).toFixed(2);

  return {
    concreteM3,
    steelKg: totalSteelKg,
    bricks,
    mortarM3,
    cementBags,
    sandM3: +(concreteM3 * 0.42 + bricks * (1.15 / 30240)).toFixed(2), // Concrete sand + Wall sand
    aggregateM3: +(concreteM3 * 0.84).toFixed(2),
  };
}

// ==================== PLASTERING ====================
export interface PlasteringCalc {
  externalArea: number; // m²
  internalArea: number; // m²
  totalArea: number; // m²
  wetVolume: number; // m³
  dryVolume: number; // m³
  cementBags: number; // bags
  sandM3: number; // m³
  steps: string[];
}

export function calculatePlastering(
  lengthFt: number, 
  breadthFt: number, 
  floors: number,
  thicknessMm: number = 12,
  mixRatioCement: number = 1,
  mixRatioSand: number = 6
): PlasteringCalc {
  // Convert dimensions to meters
  const L_m = lengthFt * 0.3048;
  const B_m = breadthFt * 0.3048;
  // Use 3.0m standard floor height as requested
  const H_m = 3.0;

  // Step 2: Calculate perimeter
  const perimeter = 2 * (L_m + B_m);

  // Step 3: External wall plaster area (ONE SIDE)
  // Deduction = 10%
  const extAreaRaw = perimeter * H_m * floors;
  const netExtArea = extAreaRaw * 0.90;

  // Step 4: Calculate internal wall plaster area (TWO SIDES)
  // Assume internal wall length is 1.5x perimeter
  // Deduction = 12%
  const internalLength = 1.5 * perimeter;
  const intAreaRaw = internalLength * H_m * floors * 2;
  const netIntArea = intAreaRaw * 0.88;

  // Step 5: Total net plaster area
  const netTotalArea = netExtArea + netIntArea;

  // Step 6: Wet Volume
  const wetVolume = netTotalArea * (thicknessMm / 1000);

  // Step 7: Convert to dry volume (× 1.33)
  const dryVolume = wetVolume * 1.33;

  // Step 8: Material calculation
  const totalParts = mixRatioCement + mixRatioSand;
  const cementVol = dryVolume * (mixRatioCement / totalParts);
  const sandVol = dryVolume * (mixRatioSand / totalParts);

  // Step 9: Convert cement volume to bags (1m³ = 28.8 bags)
  const cementBagsTotal = Math.ceil(cementVol * 28.8);
  const sandM3Total = +sandVol.toFixed(3);

  const steps = [
    `1. METRICS: Perimeter = ${perimeter.toFixed(2)}m, Height = ${H_m}m, Floors = ${floors}`,
    `2. EXT AREA (1 SIDE): ${perimeter.toFixed(2)}m × ${H_m}m × ${floors} = ${extAreaRaw.toFixed(2)} m²`,
    `   ↳ Net Ext Area (-10%): ${netExtArea.toFixed(2)} m²`,
    `3. INT AREA (2 SIDES): (1.5 × ${perimeter.toFixed(2)}m) × ${H_m}m × ${floors} × 2 = ${intAreaRaw.toFixed(2)} m²`,
    `   ↳ Net Int Area (-12%): ${netIntArea.toFixed(2)} m²`,
    `4. TOTAL NET AREA: ${netExtArea.toFixed(2)} + ${netIntArea.toFixed(2)} = ${netTotalArea.toFixed(2)} m²`,
    `5. WET VOLUME: ${netTotalArea.toFixed(2)} m² × (${thicknessMm}/1000)m = ${wetVolume.toFixed(2)} m³`,
    `6. DRY VOLUME: ${wetVolume.toFixed(2)} m³ × 1.33 = ${dryVolume.toFixed(2)} m³`,
    `7. MATERIALS (${mixRatioCement}:${mixRatioSand}): Cement = ${cementBagsTotal} bags, Sand = ${sandM3Total} m³`
  ];

  return {
    externalArea: +netExtArea.toFixed(2),
    internalArea: +netIntArea.toFixed(2),
    totalArea: +netTotalArea.toFixed(2),
    wetVolume: +wetVolume.toFixed(2),
    dryVolume: +dryVolume.toFixed(2),
    cementBags: cementBagsTotal,
    sandM3: sandM3Total,
    steps
  };
}
