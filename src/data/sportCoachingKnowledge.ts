/**
 * National-Level Multi-Sport Coaching & Rules Knowledge Base
 * Adhering to official School Games Federation of India (SGFI),
 * Amateur Kabaddi Federation of India (AKFI), Kho-Kho Federation of India (KKFI),
 * Volleyball Federation of India (VFI), Athletics Federation of India (AFI),
 * BCCI, AIFF, BAI, and BFI official specifications.
 * 
 * Bilingual: Marathi & English
 */

export interface StructuredDrill {
  id: string;
  sport: string;
  nameEn: string;
  nameMr: string;
  category: 'Fundamental' | 'Tactical' | 'Conditioning';
  setup: string;
  objective: string;
  durationMin: number;
  repetitions: string;
  restSeconds: number;
  coachingCues: string[];
  commonMistakes: string[];
  progression: string;
  regression: string;
  safetyPrecautions: string[];
  successCriteria: string;
}

export interface SportOfficialRules {
  sport: string;
  governingBody: string;
  courtDimensions: string;
  teamSize: string;
  matchDuration: string;
  officialAgeCutoff: string;
  equipmentSpecifications: string[];
  officialRules: string[];
  tacticalRecommendations: string[];
}

export const OFFICIAL_SPORTS_RULES: Record<string, SportOfficialRules> = {
  Kabaddi: {
    sport: 'Kabaddi',
    governingBody: 'Amateur Kabaddi Federation of India (AKFI) / SGFI',
    courtDimensions: '13m x 10m (Boys U17/U19), 12m x 8m (Girls & Boys U14). Baulk line 3.75m/3.0m, Bonus line 4.75m/4.0m.',
    teamSize: '7 playing + 5 substitutes (Squad of 12).',
    matchDuration: '2 halves of 20 minutes with 5 min break (U14: 15 min halves).',
    officialAgeCutoff: '31st December of the competition academic year (SGFI standard).',
    equipmentSpecifications: [
      'Official synthetic mat (minimum 40mm thick) or leveled clay ground.',
      'Athletic footwear (non-marking mat shoes) and knee/ankle compression caps.',
      'Official electronic 30-second raid timer & scoreboard.'
    ],
    officialRules: [
      'Cant (कब्बडी-कब्बडी उच्चार): Must be continuous in one single breath without pause.',
      '30-Second Raid Rule: Every raid must conclude within 30 seconds or raider is declared out.',
      'Do-or-Die Raid: Third consecutive empty raid by a team requires scoring a point or raider is out.',
      'Bonus Line: Active only when defending team has 6 or 7 players on court.',
      'Super Tackle: Successful tackle with 3 or fewer defenders awards 2 points.'
    ],
    tacticalRecommendations: [
      'Right Corner & Left Corner must maintain synchronous chain link with In defenders.',
      'Raiders should exploit baulk-line hesitation with quick toe-touches before attempting turn-escapes.'
    ]
  },
  'Kho Kho': {
    sport: 'Kho Kho',
    governingBody: 'Kho Kho Federation of India (KKFI) / SGFI',
    courtDimensions: '27m x 16m (Senior/U17), 23m x 14m (Sub-Junior U14). 8 squares in central lane (30cm x 30cm), 2 wooden poles (height 120-125cm).',
    teamSize: '9 playing + 3 substitutes (12 registered).',
    matchDuration: '4 innings of 9 minutes each (U14: 7 minutes each inning).',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Two smooth wooden poles (height 120-125cm, circumference 28-30cm).',
      'Clay or grass surface with standard line marking (width 3-5cm).'
    ],
    officialRules: [
      'Early Kho / Sudden Kho: Chaser must utter "KHO" loudly and touch sitting player simultaneously.',
      'Direction Rule: Once chaser takes a direction towards either pole, direction cannot be reversed.',
      'Line Foul: Chaser shoulder line must not cross center lane without touching pole.',
      'Batch System: Defenders enter the field in batches of 3 players.'
    ],
    tacticalRecommendations: [
      'Batch 1 defenders should focus on circular dodging around center posts to consume maximum clock.',
      'Chasers should utilize deep pole dives only when runner is off-balance on the boundary line.'
    ]
  },
  Volleyball: {
    sport: 'Volleyball',
    governingBody: 'Volleyball Federation of India (VFI) / FIVB / SGFI',
    courtDimensions: '18m x 9m divided by net. Attack line 3m from center line. Net height: Boys U17/U19 2.43m, Girls 2.24m (U14 Boys 2.24m, Girls 2.15m).',
    teamSize: '6 on-court + 6 substitutes + up to 2 Liberos (Squad of 12-14).',
    matchDuration: 'Best of 5 sets (25 pts for sets 1-4, 15 pts for set 5, 2-pt advantage required).',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Official FIVB regulation ball (circumference 65-67cm, weight 260-280g, pressure 0.30-0.325 kg/cm2).',
      'Antennae (1.80m length) mounted on outer edges of net.',
      'Posts 0.50m - 1.0m outside sidelines.'
    ],
    officialRules: [
      'Maximum 3 touches per side (excluding block touch).',
      'Libero cannot serve, block, or attack the ball above net height.',
      'Rotational fault: Players must be in rotational order at the moment of service contact.',
      'Net touch: Contact with the net between antennae during the action of playing ball is a fault.'
    ],
    tacticalRecommendations: [
      'Setter should prioritize quick middle-tempo sets to pull the opponent middle blocker out of position.',
      'Float serves should target seam between passer #1 and passer #2.'
    ]
  },
  Athletics: {
    sport: 'Athletics',
    governingBody: 'Athletics Federation of India (AFI) / World Athletics / SGFI',
    courtDimensions: 'Standard 400m 8-lane track with synthetic or cinder surface. Straight 100m/110m track.',
    teamSize: 'Individual and 4x100m / 4x400m relay teams.',
    matchDuration: 'Event-based schedule.',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Shot Put: Boys U17 5.0kg, Boys U14 4.0kg, Girls U17/U14 3.0kg.',
      'Javelin: Boys U17 700g, Boys U14 600g, Girls U17/U14 500g.',
      'Discus: Boys U17 1.5kg, Boys U14 1.0kg, Girls U17/U14 1.0kg.',
      'Relay baton (length 28-30cm, weight min 50g).'
    ],
    officialRules: [
      'Zero false start rule: First false start results in disqualification (IAAF/AFI rule).',
      'Lane infringement: Stepping on or over inside lane line in bends leads to disqualification.',
      'Relay Exchange Zone: Baton exchange must take place entirely within 30m takeover zone.'
    ],
    tacticalRecommendations: [
      'Sprinters should focus on low heel recovery in drive phase (first 25-30m) before transitioning to upright mechanics.',
      'In 4x100m relay, anchor runner should initiate acceleration when incoming runner reaches visual checkmark.'
    ]
  },
  Cricket: {
    sport: 'Cricket',
    governingBody: 'Board of Control for Cricket in India (BCCI) / SGFI',
    courtDimensions: 'Pitch length 22 yards (20.12m), width 10 ft (3.05m). Boundary radius 55m - 65m for school age groups.',
    teamSize: '11 playing + up to 4 reserves (Squad of 15).',
    matchDuration: 'Limited overs (typically 15 to 20 overs per side in school tournaments).',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Standard cricket ball (leather/four-piece, weight 156-163g; U14 may use 142g junior ball).',
      'Stumps (28 inches high, width 9 inches across 3 stumps).',
      'Protective gear: Helmet with grille, batting pads, gloves, thigh guard, and abdominal guard.'
    ],
    officialRules: [
      'Front foot no-ball: Bowler front foot must land with some part behind the popping crease.',
      'Bouncer restriction: Maximum 1 bouncer above shoulder per over in T20 school format.',
      'Wide ball: Ball passing outside wide tramline markers on offside or legside down leg.',
      'DRS / Umpire Decision: Ground umpires decision is final on field.'
    ],
    tacticalRecommendations: [
      'Powerplay strategy: Utilize first 4-5 overs for aggressive lofted drives over 30-yard circle.',
      'Death bowling: Focus on yorkers on off-stump line and slower back-of-the-hand cutters.'
    ]
  },
  Football: {
    sport: 'Football',
    governingBody: 'All India Football Federation (AIFF) / FIFA / SGFI',
    courtDimensions: 'Length 90m - 105m, Width 45m - 68m (Sub-junior U14: 75m x 50m). Goal size: 7.32m x 2.44m (U14: 6.4m x 2.13m).',
    teamSize: '11 on-field + up to 7 substitutes (Squad of 18).',
    matchDuration: '2 halves of 45 min (U17: 40 min halves, U14: 35 min halves) with 15 min halftime.',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Ball Size 5 (circumference 68-70cm, weight 410-450g; U14 may use Size 4 ball 63.5-66cm, 350-390g).',
      'Shin guards (mandatory for all players, covered by socks).',
      'Studded boots suitable for grass or ground surface.'
    ],
    officialRules: [
      'Offside: Player is in offside position if nearer to opponents goal line than both ball and second-last opponent when ball is played.',
      'Throw-in: Must face field, have part of both feet on or behind touchline, and deliver from behind head with both hands.',
      'Back-pass rule: Goalkeeper cannot handle ball played deliberately to them by teammate from foot.'
    ],
    tacticalRecommendations: [
      'Build-up play: Create passing diamonds in defensive third to break first line of pressing.',
      'Compact defensive block: Maintain vertical distance under 30 meters between forward line and back line.'
    ]
  },
  Badminton: {
    sport: 'Badminton',
    governingBody: 'Badminton Association of India (BAI) / BWF / SGFI',
    courtDimensions: '13.4m x 6.1m (Doubles), 13.4m x 5.18m (Singles). Net height 1.55m at posts, 1.524m at center.',
    teamSize: 'Singles (1v1) or Doubles (2v2).',
    matchDuration: 'Best of 3 games of 21 points (Rally point scoring, 2-pt advantage up to 30).',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Feather or nylon shuttlecock (weight 4.74 - 5.50g, 16 feathers).',
      'Badminton racket (max length 680mm, width 230mm).',
      'Non-marking court shoes.'
    ],
    officialRules: [
      'Service height: Shuttle must be below 1.15m from court surface at the moment of contact.',
      'Continuous play: 60-second interval when leading score reaches 11; 120-second interval between games.',
      'Line call: Shuttlecock landing on boundary line is ruled inside.'
    ],
    tacticalRecommendations: [
      'Exploit base position: Always recover to central T-junction after every shot.',
      'Mix deceptive drop shots with deep attacking clears to move opponent to 4 corners.'
    ]
  },
  Basketball: {
    sport: 'Basketball',
    governingBody: 'Basketball Federation of India (BFI) / FIBA / SGFI',
    courtDimensions: '28m x 15m. Backboard 1.80m x 1.05m. Rim height 3.05m (10 feet). 3-point line 6.75m (6.6m in corners).',
    teamSize: '5 on-court + up to 7 substitutes (Squad of 12).',
    matchDuration: '4 quarters of 10 minutes (FIBA standard).',
    officialAgeCutoff: '31st December of competition year.',
    equipmentSpecifications: [
      'Basketball Size 7 (Men/U17-U19, 749-780mm, 567-650g), Size 6 (Women/Girls & U14 Boys, 724-737mm).',
      '24-Second Shot Clock and 8-Second backcourt rule.'
    ],
    officialRules: [
      '24-Second Shot Clock: Team must attempt field goal that hits rim within 24 seconds.',
      'Traveling: Moving pivot foot without releasing ball for dribble or taking more than 2 steps.',
      'Fouls: Player disqualified upon committing 5 personal fouls.'
    ],
    tacticalRecommendations: [
      'Screen and Roll: Guard uses big man screen to drive to basket or kick out to 3-point shooter.',
      'Transition Defense: Minimum two players must sprint back on change of possession to stop fast breaks.'
    ]
  }
};

export const STRUCTURED_COACHING_DRILLS: Record<string, StructuredDrill[]> = {
  Kabaddi: [
    {
      id: 'kab_drill_01',
      sport: 'Kabaddi',
      nameEn: 'Corner Chain Tackle Coordination',
      nameMr: 'कोपरा साखळी पकड सराव (Corner Chain Tackle)',
      category: 'Fundamental',
      setup: 'Full mat or clay court marked with baulk line and corner zones. 4 defenders forming 2 linked pairs.',
      objective: 'Execute high-speed synchronous chain tackle pinning raiding opponent before mid-line return.',
      durationMin: 20,
      repetitions: '10 repetitions per corner pair',
      restSeconds: 45,
      coachingCues: [
        'Engage interlocking wrist grip with partner; never hold fingers loosely.',
        'Wait for raider to commit weight past the bonus line before triggering closing arc.',
        'Lead defender drives low tackling thigh; anchor defender locks torso and upper arm.'
      ],
      commonMistakes: [
        'Breaking chain prematurely allowing raider to turn and slip between players.',
        'Lunging head-first without lower body knee flexion leading to balance loss.'
      ],
      progression: 'Increase raider speed and allow dummy hand-touches with active escape footwork.',
      regression: 'Practice static locking stance with walking raider to perfect hand grip and timing.',
      safetyPrecautions: [
        'Inspect court for stones or mat separation.',
        'Avoid violent pull on raider neck or head (Strict AKFI safety foul).'
      ],
      successCriteria: '8 out of 10 raids stopped with zero chain separation and secure pin.'
    },
    {
      id: 'kab_drill_02',
      sport: 'Kabaddi',
      nameEn: 'Running Hand Touch & Instant Escape',
      nameMr: 'रनिंग हँड टच आणि तात्काळ सुटका (Running Hand Touch)',
      category: 'Fundamental',
      setup: 'Half court with 3 stationary cover defenders. Raider starting behind mid-line.',
      objective: 'Deliver explosive linear touch to cover defender chest/shoulder and retreat safely within 3 seconds.',
      durationMin: 15,
      repetitions: '12 raids per player',
      restSeconds: 30,
      coachingCues: [
        'Mask the attack using side-stepping footwork.',
        'Snap hand forward with fingertip contact and immediately push off back foot.',
        'Keep low center of gravity; never turn back towards defenders while retreating.'
      ],
      commonMistakes: [
        'Over-reaching causing chest to fall forward into defenders tackle zone.',
        'Pausing after touch instead of immediate explosive backward acceleration.'
      ],
      progression: 'Defenders react actively with closing tackle attempts upon touch.',
      regression: 'Practice touch against stationary padded shield or cone at shoulder height.',
      safetyPrecautions: [
        'Warm up ankles and Achilles tendons with dynamic hops.',
        'Ensure fingernails are trimmed to prevent facial scratches.'
      ],
      successCriteria: 'Raider scores touch and reaches midline within 3 seconds on 9 of 12 attempts.'
    }
  ],
  'Kho Kho': [
    {
      id: 'kho_drill_01',
      sport: 'Kho Kho',
      nameEn: 'Pole Turning & Low Dive Mastery',
      nameMr: 'खांब वळण आणि लो-डायव्ह (Pole Turn & Dive)',
      category: 'Fundamental',
      setup: 'Official Kho-Kho pole with soft landing pit or clean smooth clay surface.',
      objective: 'Execute a sharp 180-degree pole turn without crossing center line foul, transitioning into ground dive.',
      durationMin: 15,
      repetitions: '10 turns from each direction (left & right)',
      restSeconds: 40,
      coachingCues: [
        'Grip pole at hip height with inside hand to anchor momentum.',
        'Swing outside leg rapidly around pole staying tightly compressed.',
        'Extend both hands forward for dive landing on chest with arched spine to absorb impact.'
      ],
      commonMistakes: [
        'Grabbing pole too high causing body to swing outward away from runner.',
        'Landing directly on elbows causing joint contusion.'
      ],
      progression: 'Perform turn chasing a live runner who has a 2-meter head start from the pole.',
      regression: 'Practice pole pivot at half speed without dive; touch cone 1 meter past pole.',
      safetyPrecautions: [
        'Ensure landing area is free of pebbles, gravel, or hard dry clay chunks.',
        'Apply elbow guards during initial high-speed dive training.'
      ],
      successCriteria: 'Runner tagged within 1.5 seconds of pole turn on 7 of 10 attempts.'
    }
  ],
  Volleyball: [
    {
      id: 'vol_drill_01',
      sport: 'Volleyball',
      nameEn: 'Platform Passing & Target Setting',
      nameMr: 'अचूक पासिंग व सेटर टार्गेट (Platform Passing)',
      category: 'Fundamental',
      setup: 'Full court. Server on baseline, passer in Position 6, setter target basket in Position 2/3.',
      objective: 'Receive driven float serve and pass ball with high arc directly into setter target zone.',
      durationMin: 20,
      repetitions: '15 serve receptions per player',
      restSeconds: 30,
      coachingCues: [
        'Create flat platform by locking elbows and pressing wrists together.',
        'Angle platform towards target before contact; do not swing arms upward.',
        'Absorb ball speed using knee flexion; pass high (2.5m above net).'
      ],
      commonMistakes: [
        'Swinging arms vigorously on ball contact spraying ball out of bounds.',
        'Standing flat-footed instead of athletic forward-tilted ready stance.'
      ],
      progression: 'Server alternates between jump float and short drop serves.',
      regression: 'Coach tosses free ball from 6 meters to allow focus on forearm platform shape.',
      safetyPrecautions: [
        'Ensure court surface is dry to prevent slipping during sudden lateral lunges.'
      ],
      successCriteria: '12 out of 15 passes arrive directly inside the setter target basket.'
    }
  ],
  Athletics: [
    {
      id: 'ath_drill_01',
      sport: 'Athletics',
      nameEn: 'Starting Block Drive Phase & Acceleration',
      nameMr: 'स्टार्टिंग ब्लॉक व वेगवर्धन (Sprint Drive Phase)',
      category: 'Conditioning',
      setup: '100m straight track with starting blocks and cones placed at 10m, 20m, and 30m.',
      objective: 'Explode from starting blocks with 45-degree body angle and build maximum acceleration to 30m.',
      durationMin: 25,
      repetitions: '6 block starts of 30 meters',
      restSeconds: 120,
      coachingCues: [
        'On "Set", lift hips slightly higher than shoulders, shoulders over starting line.',
        'Drive powerfully off front foot; rear leg punches forward with aggressive knee lift.',
        'Keep head aligned with spine; do not raise chin or look up before 20 meters.'
      ],
      commonMistakes: [
        'Standing upright immediately on first stride losing horizontal propulsion.',
        'Stumbling due to excessive forward lean without adequate quad/glute strength.'
      ],
      progression: 'Use electronic audio pistol start with reaction time measurement.',
      regression: 'Start from falling 3-point stance without blocks to master drive angle.',
      safetyPrecautions: [
        'Mandatory 15-minute dynamic warm-up for hamstrings and calves before block work.'
      ],
      successCriteria: 'Smooth uninterrupted acceleration through 30m with zero premature torso elevation.'
    }
  ],
  Cricket: [
    {
      id: 'cric_drill_01',
      sport: 'Cricket',
      nameEn: 'Forward Defensive & Cover Drive Mechanics',
      nameMr: 'कव्हर ड्राईव्ह व डिफेन्स तंत्र (Cover Drive Mechanics)',
      category: 'Fundamental',
      setup: 'Nets or open pitch. Coach throwing throwdowns from 12 yards with tennis or leather ball.',
      objective: 'Execute high-elbow cover drive hitting ball along the ground through cone gates at cover point.',
      durationMin: 20,
      repetitions: '15 balls per batter',
      restSeconds: 30,
      coachingCues: [
        'Lead with head and front shoulder toward pitch of ball.',
        'High top-hand dominant grip, loose bottom hand.',
        'Present full face of bat; contact ball directly below eyes.'
      ],
      commonMistakes: [
        'Bottom hand overpowering top hand causing ball to fly in the air.',
        'Planting front foot across the line closing off bat swing.'
      ],
      progression: 'Bowler bowls off-spin and medium pace deliveries with varied lengths.',
      regression: 'Use batting tee at knee height to lock in footwork and high elbow finish.',
      safetyPrecautions: [
        'Mandatory helmet, batting pads, gloves, and abdominal guard during leather ball practice.'
      ],
      successCriteria: '12 out of 15 drives pass cleanly through cone gates along the ground.'
    }
  ],
  Football: [
    {
      id: 'foot_drill_01',
      sport: 'Football',
      nameEn: '1-Touch Passing & Rondo Possession (4v1 / 5v2)',
      nameMr: '१-टच पासिंग व रोंडो ताबा (Rondo Possession)',
      category: 'Tactical',
      setup: '10m x 10m marked grid with 4 perimeter players and 1 central defender.',
      objective: 'Maintain continuous ball possession using 1-touch and 2-touch passing under active defensive pressure.',
      durationMin: 20,
      repetitions: '4 rounds of 4 minutes',
      restSeconds: 60,
      coachingCues: [
        'Receive with back foot across body to open field vision.',
        'Firm side-foot push pass with locked ankle.',
        'Supporting teammates must constantly adjust angles creating passing triangles.'
      ],
      commonMistakes: [
        'Flat-footed waiting for ball instead of moving toward the pass.',
        'Weak passes that roll slowly and are intercepted by defender.'
      ],
      progression: 'Limit entire perimeter team to strict 1-touch passing and add 2nd defender (5v2).',
      regression: 'Enlarge grid to 14m x 14m with passive defender to build rhythm.',
      safetyPrecautions: [
        'Defenders must avoid slide tackles inside tight possession grids.'
      ],
      successCriteria: 'Perimeter team achieves 20 consecutive passes without turnover.'
    }
  ],
  Badminton: [
    {
      id: 'bad_drill_01',
      sport: 'Badminton',
      nameEn: '6-Corner Shadow Footwork & Recovery',
      nameMr: '६-कोपरा शॅडो फूटवर्क (6-Corner Shadow Footwork)',
      category: 'Conditioning',
      setup: 'Full badminton court marked with 6 target points (2 net, 2 mid-court, 2 rear court).',
      objective: 'Perform rapid explosive footwork to all 6 corners returning to central base after each stroke.',
      durationMin: 15,
      repetitions: '5 sets of 12 corner visits (60 strokes per set)',
      restSeconds: 60,
      coachingCues: [
        'Stay light on balls of feet; initiate movement with split-step on coaches whistle.',
        'Use chassé footwork to rear corners; lunge with heel-to-toe landing on front net corners.',
        'Racket head stays up at eye level during return to central T.'
      ],
      commonMistakes: [
        'Rushing backwards without cross-behind step leading to tripping.',
        'Landing on toes during deep lunges risking patellar tendon strain.'
      ],
      progression: 'Coach points randomly to corners with audio-visual reaction stimulus.',
      regression: 'Reduce to 4 corners (front 2 and rear 2) at controlled steady pace.',
      safetyPrecautions: [
        'Inspect court for dust or moisture to prevent groin and ankle slips.'
      ],
      successCriteria: 'Complete 12-stroke sequence in under 20 seconds maintaining balanced recovery.'
    }
  ],
  Basketball: [
    {
      id: 'bask_drill_01',
      sport: 'Basketball',
      nameEn: 'Drive, Dish & 3-Man Weave Transition',
      nameMr: '३-खेळाडू विव्ह संक्रमण सराव (3-Man Weave Transition)',
      category: 'Tactical',
      setup: 'Full basketball court. 3 players starting at baseline (center, left, right lane).',
      objective: 'Transition ball from baseline to opposing basket with crisp chest passes ending in uncontested layup.',
      durationMin: 20,
      repetitions: '10 full-court trips',
      restSeconds: 45,
      coachingCues: [
        'Pass the ball ahead of your sprinting teammate (lead pass).',
        'Always run behind the player you just passed to (weave pattern).',
        'High-speed finish: drive knee up and lay ball softly off high corner of backboard square.'
      ],
      commonMistakes: [
        'Traveling before releasing pass.',
        'Passing behind sprinting teammate forcing them to break stride.'
      ],
      progression: 'Add 1 transitioning defender at half-court creating 3v1 fast break advantage.',
      regression: 'Execute weave at half-court speed without layup finish to solidify weave path.',
      safetyPrecautions: [
        'Ensure base padding behind basketball backboards is secure.'
      ],
      successCriteria: '8 out of 10 trips completed with 0 turnovers and successful layup.'
    }
  ]
};


/**
 * High-precision pedagogical database for every sport skill in Waghamba Sports Hub.
 * Guarantees that EVERY drill selected by the coach displays complete, authoritative
 * specifications, cues, precautions, and criteria.
 */
const SKILL_DRILL_KNOWLEDGE_BASE: Record<string, Partial<StructuredDrill>> = {
  // --- KABADDI ---
  "cant": {
    nameEn: "Cant Practice & Respiratory Endurance",
    nameMr: "कब्बडी-कब्बडी उच्चार (Cant) व दम सराव",
    category: "Fundamental",
    setup: "13m x 10m court. Raiders line up behind baulk line with stopwatch.",
    objective: "Maintain continuous, audible 'Kabaddi-Kabaddi' cant in one single breath while performing raiding footwork for 25+ seconds.",
    durationMin: 15,
    repetitions: "8 sustained breath raids per player",
    restSeconds: 45,
    coachingCues: [
      "Inhale deeply from diaphragm before crossing midline (दम भरणे).",
      "Cant must be loud, distinct, and without any pause or gasp (न थांबता स्पष्ट उच्चार).",
      "Coordinate cant rhythm with side-to-side shuffle strides."
    ],
    commonMistakes: [
      "Breathing in during the raid (Break of Cant foul - AKFI Rule 6).",
      "Mumbling or dropping voice volume while turning."
    ],
    progression: "Simulate defensive tackle pressure while sustaining cant to the 28th second.",
    regression: "Stationary cant timing against a stopwatch without running.",
    safetyPrecautions: [
      "Ensure athletes hydrate properly before breath-holding exercises.",
      "Immediately stop if any student feels lightheaded or dizzy."
    ],
    successCriteria: "Continuous unbroken cant sustained for minimum 25 seconds on 7 of 8 attempts."
  },
  "toe touch": {
    nameEn: "Explosive Toe Touch & Recovery",
    nameMr: "गतिमान टो टच व तात्काळ माघार (Toe Touch Drill)",
    category: "Fundamental",
    setup: "Baulk line and corner defense marked with cones. 2 cover defenders in crouch stance.",
    objective: "Execute a sudden low leg extension touching the cover defender's toe/shoe and spring backward to safety.",
    durationMin: 20,
    repetitions: "12 touches per leg (left and right)",
    restSeconds: 30,
    coachingCues: [
      "Lower center of gravity and fake eye contact toward opposite corner (नजर चकवा).",
      "Extend kicking leg straight from hip like a whip (पायाचा फटका).",
      "Instantly recoil the leg and push backward off the supporting heel."
    ],
    commonMistakes: [
      "Bending forward from waist causing upper body to fall into defenders' reach.",
      "Leaving extended foot planted on the mat after the touch."
    ],
    progression: "Defender attempts immediate ankle lock upon touch contact.",
    regression: "Practice touching a stationary cone or block at floor level.",
    safetyPrecautions: [
      "Dynamic groin and hamstring warm-up mandatory to prevent adductor strain.",
      "Check ground for non-slip traction."
    ],
    successCriteria: "Clean touch and recovery back across baulk line within 2.5 seconds on 10 of 12 tries."
  },
  "hand touch": {
    nameEn: "Running Hand Touch & Instant Escape",
    nameMr: "रनिंग हँड टच आणि तात्काळ सुटका (Running Hand Touch)",
    category: "Fundamental",
    setup: "Half court with 3 stationary cover defenders. Raider starting behind mid-line.",
    objective: "Deliver explosive linear touch to cover defender chest/shoulder and retreat safely within 3 seconds.",
    durationMin: 15,
    repetitions: "12 raids per player",
    restSeconds: 30,
    coachingCues: [
      "Mask the attack using side-stepping footwork.",
      "Snap hand forward with fingertip contact and immediately push off back foot.",
      "Keep low center of gravity; never turn back towards defenders while retreating."
    ],
    commonMistakes: [
      "Over-reaching causing chest to fall forward into defenders tackle zone.",
      "Pausing after touch instead of immediate explosive backward acceleration."
    ],
    progression: "Defenders react actively with closing tackle attempts upon touch.",
    regression: "Practice touch against stationary padded shield or cone at shoulder height.",
    safetyPrecautions: [
      "Warm up ankles and Achilles tendons with dynamic hops.",
      "Ensure fingernails are trimmed to prevent facial scratches."
    ],
    successCriteria: "Raider scores touch and reaches midline within 3 seconds on 9 of 12 attempts."
  },
  "dubki": {
    nameEn: "Dubki Escape Under Chain Tackle",
    nameMr: "डुबकी सराव (Dubki Under Chain)",
    category: "Tactical",
    setup: "Center court. Two defenders holding hands in tight chain tackle at waist height.",
    objective: "Drop low under the defenders' arm-chain using hip flexion and explode forward toward midline.",
    durationMin: 20,
    repetitions: "10 dubki escapes per raider",
    restSeconds: 45,
    coachingCues: [
      "Bait the chain forward by taking 2 aggressive steps.",
      "Drop both knees low, duck head below chain level, and slide under (छाती जमिनीजवळ ठेवा).",
      "Power through using explosive quad drive once shoulders clear the chain."
    ],
    commonMistakes: [
      "Dropping head too late, getting trapped at neck level.",
      "Crawling on knees instead of driving through on footpads."
    ],
    progression: "Defenders actively drop chain downward to close the gap.",
    regression: "Defenders hold chain high at chest height to learn slide trajectory.",
    safetyPrecautions: [
      "Mat must be cushioned to prevent knee abrasions.",
      "Never lead with top of head to protect cervical spine."
    ],
    successCriteria: "Clean escape past chain without upper body contact on 7 of 10 attempts."
  },
  "bonus": {
    nameEn: "Bonus Line Crossing & Trailing Foot Lift",
    nameMr: "बोनस लाईन तंत्र व मागील पाय हवेत उचलणे",
    category: "Fundamental",
    setup: "Court with baulk line and bonus line. Minimum 6 defensive cones simulating 6-man defense.",
    objective: "Plant lead foot completely across bonus line while lifting trailing foot entirely off the mat (AKFI Rule 11).",
    durationMin: 15,
    repetitions: "15 bonus attempts per corner",
    restSeconds: 30,
    coachingCues: [
      "Attack corner zone to stretch defender link.",
      "Cross bonus line with front foot while keeping weight centered.",
      "Lift trailing foot at least 3 inches off ground before touching line (मागील पाय स्पष्ट वर उचला)."
    ],
    commonMistakes: [
      "Trailing foot touching ground simultaneously (No Bonus).",
      "Front foot touching bonus line rather than crossing cleanly."
    ],
    progression: "Corner defender rushes forward to trap raider the moment bonus foot plants.",
    regression: "Static bonus line posture check with mirror/coach observation.",
    safetyPrecautions: [
      "Maintain ankle joint stability with pre-drill mobility drills."
    ],
    successCriteria: "12 out of 15 valid bonus line crosses confirmed by referee check."
  },
  "ankle hold": {
    nameEn: "Corner Ankle Hold Lock (घोटा पकड)",
    nameMr: "कोपरा घोटा पकड सराव (Corner Ankle Hold)",
    category: "Fundamental",
    setup: "Corner zone. Raider attempting running hand touch on corner defender.",
    objective: "Grip raider's advancing ankle with both hands and lift upward, depriving raider of traction.",
    durationMin: 20,
    repetitions: "12 holds per defender",
    restSeconds: 40,
    coachingCues: [
      "Stay in deep crouch stance; do not commit until raider's heel plants.",
      "Lock both hands tightly around Achilles tendon like a vice (घोट्यावर मजबूत पकड).",
      "Pull ankle upward and inward toward your chest while driving hips back."
    ],
    commonMistakes: [
      "Grabbing calf muscle instead of narrow ankle joint.",
      "Lifting head up allowing raider to kick free."
    ],
    progression: "Support covers arrive within 1 second to pin raider's upper body.",
    regression: "Practice grip and lift on walking raider.",
    safetyPrecautions: [
      "Do not twist raider's knee sideways; lift vertically to prevent ligament stress."
    ],
    successCriteria: "Raider stopped before midline on 9 of 12 attempts."
  },
  "thigh hold": {
    nameEn: "Double Thigh Hold & Torso Pin",
    nameMr: "मांडी पकड सराव (Double Thigh Hold)",
    category: "Fundamental",
    setup: "Cover defense area. Raider turning to retreat.",
    objective: "Drive both shoulders into raider's thighs, wrap arms tightly behind knees, and lift.",
    durationMin: 20,
    repetitions: "10 holds per cover pair",
    restSeconds: 45,
    coachingCues: [
      "Time the tackle when raider turns back toward midline.",
      "Drive shoulder into mid-thigh level; lock hands behind knees (मांडीभोवती घट्ट मिठी).",
      "Keep neck tight to raider's hip to avoid head collision."
    ],
    commonMistakes: [
      "Tackling too high around waist allowing raider to stretch hand to midline.",
      "Eyes closed on tackle impact."
    ],
    progression: "Raider actively fights to crawl forward with hand extension.",
    regression: "Practice wrap and drive against tackle bag or stationary partner.",
    safetyPrecautions: [
      "Keep head outside raider's body line to avoid knee strike to face."
    ],
    successCriteria: "Complete stoppage within 1 meter of tackle on 8 of 10 attempts."
  },
  "chain tackle": {
    nameEn: "Corner Chain Tackle Coordination",
    nameMr: "कोपरा साखळी पकड सराव (Corner Chain Tackle)",
    category: "Fundamental",
    setup: "Full mat or clay court marked with baulk line and corner zones. 4 defenders forming 2 linked pairs.",
    objective: "Execute high-speed synchronous chain tackle pinning raiding opponent before mid-line return.",
    durationMin: 20,
    repetitions: "10 repetitions per corner pair",
    restSeconds: 45,
    coachingCues: [
      "Engage interlocking wrist grip with partner; never hold fingers loosely.",
      "Wait for raider to commit weight past the bonus line before triggering closing arc.",
      "Lead defender drives low tackling thigh; anchor defender locks torso and upper arm."
    ],
    commonMistakes: [
      "Breaking chain prematurely allowing raider to turn and slip between players.",
      "Lunging head-first without lower body knee flexion leading to balance loss."
    ],
    progression: "Increase raider speed and allow dummy hand-touches with active escape footwork.",
    regression: "Practice static locking stance with walking raider to perfect hand grip and timing.",
    safetyPrecautions: [
      "Inspect court for stones or mat separation.",
      "Avoid violent pull on raider neck or head (Strict AKFI safety foul)."
    ],
    successCriteria: "8 out of 10 raids stopped with zero chain separation and secure pin."
  },
  "dash": {
    nameEn: "Cover Dash Out-of-Bounds Tackle",
    nameMr: "डॅश सराव (Cover Dash Out of Bounds)",
    category: "Fundamental",
    setup: "Side lobby line. Raider attacking corner.",
    objective: "Cover defender dashes laterally and shoves raider out over lobby sideline before hand reaches midline.",
    durationMin: 15,
    repetitions: "10 dashes per side",
    restSeconds: 45,
    coachingCues: [
      "Read raider's momentum moving toward sideline.",
      "Sprint diagonally with chest forward, engaging both forearms on raider's torso (छातीवर जोरदार डॅश).",
      "Follow through with leg drive pushing raider out of bounds."
    ],
    commonMistakes: [
      "Stepping out of bounds before pushing raider out.",
      "Pushing with straight stiff arms causing elbow hyperextension."
    ],
    progression: "Raider uses spin maneuver to slip past the incoming dash.",
    regression: "Practice dash against heavy shield held by coach.",
    safetyPrecautions: [
      "Ensure minimum 2-meter clear run-off buffer outside lobby boundary lines."
    ],
    successCriteria: "Raider driven across sideline before reaching baulk line on 8 of 10 attempts."
  },

  // --- KHO KHO ---
  "pole dive": {
    nameEn: "Pole Turning & Low Dive Mastery",
    nameMr: "खांब वळण आणि लो-डायव्ह (Pole Turn & Dive)",
    category: "Fundamental",
    setup: "Official Kho-Kho pole with soft landing pit or clean smooth clay surface.",
    objective: "Execute a sharp 180-degree pole turn without crossing center line foul, transitioning into ground dive.",
    durationMin: 15,
    repetitions: "10 turns from each direction (left & right)",
    restSeconds: 40,
    coachingCues: [
      "Grip pole at hip height with inside hand to anchor momentum.",
      "Swing outside leg rapidly around pole staying tightly compressed.",
      "Extend both hands forward for dive landing on chest with arched spine to absorb impact."
    ],
    commonMistakes: [
      "Grabbing pole too high causing body to swing outward away from runner.",
      "Landing directly on elbows causing joint contusion."
    ],
    progression: "Perform turn chasing a live runner who has a 2-meter head start from the pole.",
    regression: "Practice pole pivot at half speed without dive; touch cone 1 meter past pole.",
    safetyPrecautions: [
      "Ensure landing area is free of pebbles, gravel, or hard dry clay chunks.",
      "Apply elbow guards during initial high-speed dive training."
    ],
    successCriteria: "Runner tagged within 1.5 seconds of pole turn on 7 of 10 attempts."
  },
  "giving kho": {
    nameEn: "Sudden Kho Touch & Direction Commitment",
    nameMr: "वेगवान 'खो' देणे व दिशा पकडणे (Giving Kho Drill)",
    category: "Fundamental",
    setup: "Central lane with 8 sitting chasers.",
    objective: "Chaser approaches sitting teammate, touches back and shouts 'KHO' simultaneously, taking active chase direction.",
    durationMin: 15,
    repetitions: "16 kho exchanges per player",
    restSeconds: 30,
    coachingCues: [
      "Touch back flat with palm while uttering loud 'KHO' (एकाच वेळी स्पर्श व उच्चार).",
      "Do not cross shoulder line over the central lane (KKFI Line Foul).",
      "Sitting player must explode forward into the lane immediately upon touch."
    ],
    commonMistakes: [
      "Touching back before saying KHO (Early Kho / Delay Foul).",
      "Hesitating at center line causing directional change foul."
    ],
    progression: "Live defenders running in batches of 3 across the cross lanes.",
    regression: "Stationary practice of touch + shout + sprint start in cross lane.",
    safetyPrecautions: [
      "Sitting players keep fingers tucked under thighs to prevent being stepped on."
    ],
    successCriteria: "Zero line fouls or voice delay fouls across 16 consecutive Kho touches."
  },
  "zig-zag": {
    nameEn: "Zig-Zag Cross Lane Evading Run",
    nameMr: "झिग-झॅग चकवा धावणे (Zig-Zag Evading Run)",
    category: "Conditioning",
    setup: "8 central lane squares marked with cones. 2 chasers positioned.",
    objective: "Runner weaves rapidly through cross lanes without letting chasers anticipate turning angle.",
    durationMin: 15,
    repetitions: "6 runs of 45 seconds each",
    restSeconds: 60,
    coachingCues: [
      "Stay low with bent knees to change direction on either foot.",
      "Keep eyes on both chasers at all times (३६० अंश नजर).",
      "Use sudden decelerations and head fakes at cross lane intersections."
    ],
    commonMistakes: [
      "Running wide loops that allow chaser to take short straight line.",
      "Losing balance when pivoting around sitting chasers."
    ],
    progression: "Chasers actively coordinate Kho calls to trap runner between squares 3 and 6.",
    regression: "Run zig-zag course through agility poles without chasers to build footwork.",
    safetyPrecautions: [
      "Wear appropriate rubber-soled court shoes with ankle support."
    ],
    successCriteria: "Evade chasers for full 45 seconds on at least 4 of 6 runs."
  },

  // --- VOLLEYBALL ---
  "serving": {
    nameEn: "Target Floating & Overhand Serve",
    nameMr: "अचूक फ्लोट सर्व्हिस सराव (Target Float Serve)",
    category: "Fundamental",
    setup: "Full volleyball court. Cones placed in Zone 1 (deep right), Zone 5 (deep left), and Zone 6 (deep center).",
    objective: "Deliver flat overhand float serve with no ball rotation landing inside targeted defensive corners.",
    durationMin: 20,
    repetitions: "20 serves per player",
    restSeconds: 30,
    coachingCues: [
      "Toss ball consistent 1 meter above head with non-hitting hand.",
      "Hit solid flat palm through center of ball; lock wrist on contact (नो रिस्ट स्नॅप).",
      "Stop follow-through abruptly like a punch to induce turbulent floating flight."
    ],
    commonMistakes: [
      "Snapping wrist downward causing topspin and predictable trajectory.",
      "Erratic toss forcing body to lean off-balance."
    ],
    progression: "Target specific 1m x 1m hula hoops in the seam between passers #1 and #2.",
    regression: "Serve from 6 meters from net before moving back to 9-meter baseline.",
    safetyPrecautions: [
      "Thorough shoulder rotator cuff warm-up with resistance bands before hard serving."
    ],
    successCriteria: "15 out of 20 serves clear net and land inside designated target zones."
  },
  "passing": {
    nameEn: "Platform Passing & Target Setting",
    nameMr: "अचूक पासिंग व सेटर टार्गेट (Platform Passing)",
    category: "Fundamental",
    setup: "Full court. Server on baseline, passer in Position 6, setter target basket in Position 2/3.",
    objective: "Receive driven float serve and pass ball with high arc directly into setter target zone.",
    durationMin: 20,
    repetitions: "15 serve receptions per player",
    restSeconds: 30,
    coachingCues: [
      "Create flat platform by locking elbows and pressing wrists together.",
      "Angle platform towards target before contact; do not swing arms upward.",
      "Absorb ball speed using knee flexion; pass high (2.5m above net)."
    ],
    commonMistakes: [
      "Swinging arms vigorously on ball contact spraying ball out of bounds.",
      "Standing flat-footed instead of athletic forward-tilted ready stance."
    ],
    progression: "Server alternates between jump float and short drop serves.",
    regression: "Coach tosses free ball from 6 meters to allow focus on forearm platform shape.",
    safetyPrecautions: [
      "Ensure court surface is dry to prevent slipping during sudden lateral lunges."
    ],
    successCriteria: "12 out of 15 passes arrive directly inside the setter target basket."
  },
  "spike": {
    nameEn: "Approach, Jump & Spike Power Drive",
    nameMr: "स्पाइकिंग ॲप्रोच व आक्रमक स्मॅश (Spike Power Drive)",
    category: "Fundamental",
    setup: "Attack line 3m from net. Setter in Position 3 tossing high outside ball to Position 4.",
    objective: "Execute 3-step rhythmic approach, vertical double-arm jump, and high-point spike over the net.",
    durationMin: 20,
    repetitions: "12 spikes per attacker",
    restSeconds: 45,
    coachingCues: [
      "Rhythm footwork: Left-Right-Left (for right-handed hitters).",
      "Swing both arms back on penultimate step, then explode upward like drawing a bow (धनुष्य ताणल्याप्रमाणे).",
      "Snap wrist over ball at maximum vertical extension; hit ball in front of hitting shoulder."
    ],
    commonMistakes: [
      "Jumping forward into the net (Net Touch Foul).",
      "Hitting ball behind head resulting in weak shots out of bounds."
    ],
    progression: "Add 2-man opposition block to challenge attacker's cross-court vs line shot selection.",
    regression: "Practice standing spike against thrown ball over lower net.",
    safetyPrecautions: [
      "Land softly on two feet with bent knees to protect anterior cruciate ligament (ACL)."
    ],
    successCriteria: "9 out of 12 spikes hit cleanly inside boundaries with downward trajectory."
  },

  // --- CRICKET ---
  "drive": {
    nameEn: "Forward Defensive & Cover Drive Mechanics",
    nameMr: "कव्हर ड्राईव्ह व डिफेन्स तंत्र (Cover Drive Mechanics)",
    category: "Fundamental",
    setup: "Nets or open pitch. Coach throwing throwdowns from 12 yards with tennis or leather ball.",
    objective: "Execute high-elbow cover drive hitting ball along the ground through cone gates at cover point.",
    durationMin: 20,
    repetitions: "15 balls per batter",
    restSeconds: 30,
    coachingCues: [
      "Lead with head and front shoulder toward pitch of ball.",
      "High top-hand dominant grip, loose bottom hand.",
      "Present full face of bat; contact ball directly below eyes."
    ],
    commonMistakes: [
      "Bottom hand overpowering top hand causing ball to fly in the air.",
      "Planting front foot across the line closing off bat swing."
    ],
    progression: "Bowler bowls off-spin and medium pace deliveries with varied lengths.",
    regression: "Use batting tee at knee height to lock in footwork and high elbow finish.",
    safetyPrecautions: [
      "Mandatory helmet, batting pads, gloves, and abdominal guard during leather ball practice."
    ],
    successCriteria: "12 out of 15 drives pass cleanly through cone gates along the ground."
  },
  "bowling": {
    nameEn: "Line & Length Spot Bowling Accuracy",
    nameMr: "टप्पा व अचूक दिशा गोलंदाजी सराव (Spot Bowling)",
    category: "Fundamental",
    setup: "22-yard pitch. Target coin or 1m x 1m chalk box marked on good-length area (6-8m from batting crease).",
    objective: "Deliver 18 consecutive balls hitting target spot on off-stump channel.",
    durationMin: 25,
    repetitions: "3 overs (18 balls) per bowler",
    restSeconds: 60,
    coachingCues: [
      "Maintain consistent, rhythmic run-up with identical stride lengths.",
      "Front arm pulls down vigorously toward front hip; keep bowling arm close to ear.",
      "Release ball at 12 o'clock high point; finish follow-through across opposite hip."
    ],
    commonMistakes: [
      "Overstepping bowling crease (Front foot no-ball).",
      "Falling away to the off-side causing wide deliveries down leg side."
    ],
    progression: "Place stumps at batter's end and bowl to active batter defending with wooden stump bat.",
    regression: "Bowl from 2-step approach to groove release point before full run-up.",
    safetyPrecautions: [
      "Warm up lower back and shoulder with rotational medicine ball tosses to protect lumbar spine."
    ],
    successCriteria: "At least 12 of 18 deliveries pitch directly inside the target chalk box."
  },

  // --- FOOTBALL ---
  "rondo": {
    nameEn: "1-Touch Passing & Rondo Possession (4v1 / 5v2)",
    nameMr: "१-टच पासिंग व रोंडो ताबा (Rondo Possession)",
    category: "Tactical",
    setup: "10m x 10m marked grid with 4 perimeter players and 1 central defender.",
    objective: "Maintain continuous ball possession using 1-touch and 2-touch passing under active defensive pressure.",
    durationMin: 20,
    repetitions: "4 rounds of 4 minutes",
    restSeconds: 60,
    coachingCues: [
      "Receive with back foot across body to open field vision.",
      "Firm side-foot push pass with locked ankle.",
      "Supporting teammates must constantly adjust angles creating passing triangles."
    ],
    commonMistakes: [
      "Flat-footed waiting for ball instead of moving toward the pass.",
      "Weak passes that roll slowly and are intercepted by defender."
    ],
    progression: "Limit entire perimeter team to strict 1-touch passing and add 2nd defender (5v2).",
    regression: "Enlarge grid to 14m x 14m with passive defender to build rhythm.",
    safetyPrecautions: [
      "Defenders must avoid slide tackles inside tight possession grids."
    ],
    successCriteria: "Perimeter team achieves 20 consecutive passes without turnover."
  },
  "dribbl": {
    nameEn: "Cone Slalom Agility Dribble",
    nameMr: "शंकू स्लॅलोम ड्रिबलिंग नियंत्रण (Slalom Dribble)",
    category: "Fundamental",
    setup: "8 cones placed in a straight line spaced 1.5 meters apart. 15-meter sprint zone at finish.",
    objective: "Weave through cones with rapid inside/outside foot touches keeping ball within 30cm of boot.",
    durationMin: 15,
    repetitions: "8 trips per player (alternating dominant & weak foot)",
    restSeconds: 30,
    coachingCues: [
      "Stay on toes with low center of gravity and soft knees.",
      "Use pinky toe (outside) to push ball out, big toe (inside) to chop ball back.",
      "Keep head up between touches to observe surrounding space."
    ],
    commonMistakes: [
      "Kicking ball too far ahead and knocking cones over.",
      "Looking exclusively at feet without peripheral vision."
    ],
    progression: "Add passive defender at final cone; finish with quick shot on mini-goal.",
    regression: "Widen cone spacing to 2.5 meters to allow easier turning angles.",
    safetyPrecautions: [
      "Ensure pitch is level with no hidden ruts or divots."
    ],
    successCriteria: "Complete 8-cone slalom in under 9 seconds without touching any cone."
  },

  // --- BADMINTON ---
  "smash": {
    nameEn: "Forehand Jump Smash & High Contact Kill",
    nameMr: "जंप स्मॅश व आक्रमक फिनिश (Jump Smash)",
    category: "Fundamental",
    setup: "Rear court. Feeder tosses high deep lift from opposite front court.",
    objective: "Execute scissor-kick jump smash driving shuttle steeply downward over net into sideline tramlines.",
    durationMin: 20,
    repetitions: "15 smashes per player",
    restSeconds: 45,
    coachingCues: [
      "Get completely behind the shuttle before jumping (शटलच्या मागे पोहोचा).",
      "Scissor kick: back leg kicks forward during aerial phase to generate core torque.",
      "Pronate forearm explosively at contact; hit shuttle at 45-degree angle downward."
    ],
    commonMistakes: [
      "Hitting shuttle behind head causing flat or out-of-bounds trajectory.",
      "Landing stiff-legged putting excessive shock on knees."
    ],
    progression: "Defender attempts backhand drive return; smash hitter must recover to net for follow-up tap.",
    regression: "Stationary smash without jump to master high contact point and wrist pronation.",
    safetyPrecautions: [
      "Check court for sweat drips to prevent catastrophic ankle roll upon jump landing."
    ],
    successCriteria: "10 out of 15 smashes cross net with steep downward angle inside singles sidelines."
  },
  "footwork": {
    nameEn: "6-Corner Shadow Footwork & Recovery",
    nameMr: "६-कोपरा शॅडो फूटवर्क (6-Corner Shadow Footwork)",
    category: "Conditioning",
    setup: "Full badminton court marked with 6 target points (2 net, 2 mid-court, 2 rear court).",
    objective: "Perform rapid explosive footwork to all 6 corners returning to central base after each stroke.",
    durationMin: 15,
    repetitions: "5 sets of 12 corner visits (60 strokes per set)",
    restSeconds: 60,
    coachingCues: [
      "Stay light on balls of feet; initiate movement with split-step on coaches whistle.",
      "Use chassé footwork to rear corners; lunge with heel-to-toe landing on front net corners.",
      "Racket head stays up at eye level during return to central T."
    ],
    commonMistakes: [
      "Rushing backwards without cross-behind step leading to tripping.",
      "Landing on toes during deep lunges risking patellar tendon strain."
    ],
    progression: "Coach points randomly to corners with audio-visual reaction stimulus.",
    regression: "Reduce to 4 corners (front 2 and rear 2) at controlled steady pace.",
    safetyPrecautions: [
      "Inspect court for dust or moisture to prevent groin and ankle slips."
    ],
    successCriteria: "Complete 12-stroke sequence in under 20 seconds maintaining balanced recovery."
  },

  // --- BASKETBALL ---
  "layup": {
    nameEn: "High-Speed Right & Left Hand Layup Footwork",
    nameMr: "ले-अप फूटवर्क व अचूक फिनिश (Layup Mastery)",
    category: "Fundamental",
    setup: "3-point line 45-degree wing. Basket with standard backboard.",
    objective: "Dribble in at full speed, gather ball, take standard 2-step footwork, and lay ball off backboard square into basket.",
    durationMin: 15,
    repetitions: "10 layups with right hand, 10 with left hand",
    restSeconds: 30,
    coachingCues: [
      "Right layup footwork: gather on Right foot, explode vertically off Left foot.",
      "Drive right knee up toward chest like connected by string to right shooting wrist.",
      "Bank ball softly off upper top-right corner of inner backboard square."
    ],
    commonMistakes: [
      "Taking 3 steps without dribbling (Traveling violation).",
      "Jumping outward away from basket instead of straight up toward rim."
    ],
    progression: "Defender applies contest pressure from behind with padded blocking pad.",
    regression: "Practice 1-2 step from 2 meters without initial dribble.",
    safetyPrecautions: [
      "Ensure floor under backboard is dry and free of stray basketballs."
    ],
    successCriteria: "16 out of 20 layups scored (min 7 on non-dominant hand)."
  },

  // --- ATHLETICS ---
  "sprint": {
    nameEn: "Starting Block Drive Phase & Acceleration",
    nameMr: "स्टार्टिंग ब्लॉक व वेगवर्धन (Sprint Drive Phase)",
    category: "Conditioning",
    setup: "100m straight track with starting blocks and cones placed at 10m, 20m, and 30m.",
    objective: "Explode from starting blocks with 45-degree body angle and build maximum acceleration to 30m.",
    durationMin: 25,
    repetitions: "6 block starts of 30 meters",
    restSeconds: 120,
    coachingCues: [
      "On 'Set', lift hips slightly higher than shoulders, shoulders over starting line.",
      "Drive powerfully off front foot; rear leg punches forward with aggressive knee lift.",
      "Keep head aligned with spine; do not raise chin or look up before 20 meters."
    ],
    commonMistakes: [
      "Standing upright immediately on first stride losing horizontal propulsion.",
      "Stumbling due to excessive forward lean without adequate quad/glute strength."
    ],
    progression: "Use electronic audio pistol start with reaction time measurement.",
    regression: "Start from falling 3-point stance without blocks to master drive angle.",
    safetyPrecautions: [
      "Mandatory 15-minute dynamic warm-up for hamstrings and calves before block work."
    ],
    successCriteria: "Smooth uninterrupted acceleration through 30m with zero premature torso elevation."
  },
  "shot put": {
    nameEn: "Shot Put Glide & Power Stance Release",
    nameMr: "गोळाफेक ग्लाइड व पॉवर पोझिशन (Shot Put Glide)",
    category: "Fundamental",
    setup: "Official 2.135m throwing circle with stop board and landing sector.",
    objective: "Execute linear glide from rear of circle into explosive hip-shoulder separation and high release.",
    durationMin: 20,
    repetitions: "10 throws per athlete",
    restSeconds: 60,
    coachingCues: [
      "Tuck shot firmly against neck under chin; thumb pointing down, elbow held high.",
      "Hop backward dynamically uncoiling from low crouch stance onto right center foot.",
      "Explode upward pushing shot off fingers like a shot-put press; do not throw like a baseball."
    ],
    commonMistakes: [
      "Dropping elbow below shoulder level risking elbow tendon injury.",
      "Stepping on top of stop board (Foul throw)."
    ],
    progression: "Throw with regulation competition implement weight (U14 Boys 4kg, U17 Boys 5kg).",
    regression: "Power position standing throws without glide to perfect hip uncoil.",
    safetyPrecautions: [
      "Landing sector must be completely clear of all students before implement is released."
    ],
    successCriteria: "All 10 throws stay within sector boundaries with clean elbow-high release."
  }
};

/**
 * Universal lookup engine: Returns authoritative, structured pedagogical drill specifications
 * for ANY drill across all 8 sports, Yoga, and PT Mass. Never returns null or empty content.
 */
export function getCoachingDrillSpecs(drillName: string, sport?: string): StructuredDrill {
  const cleanName = (drillName || "").trim();
  const lowerName = cleanName.toLowerCase();
  const cleanSport = sport || (
    lowerName.includes("kabaddi") ? "Kabaddi" :
    lowerName.includes("kho") ? "Kho Kho" :
    lowerName.includes("volley") ? "Volleyball" :
    lowerName.includes("cricket") ? "Cricket" :
    lowerName.includes("foot") ? "Football" :
    lowerName.includes("badminton") ? "Badminton" :
    lowerName.includes("basket") ? "Basketball" :
    lowerName.includes("sprint") || lowerName.includes("shot") || lowerName.includes("javelin") ? "Athletics" :
    "Sports"
  );

  // 1. Direct search in primary STRUCTURED_COACHING_DRILLS list
  if (STRUCTURED_COACHING_DRILLS[cleanSport]) {
    const found = STRUCTURED_COACHING_DRILLS[cleanSport].find(
      (d) =>
        d.nameEn.toLowerCase() === lowerName ||
        d.nameMr.toLowerCase() === lowerName ||
        lowerName.includes(d.nameEn.toLowerCase()) ||
        d.nameEn.toLowerCase().includes(lowerName)
    );
    if (found) return found;
  }

  // 2. Search cross-sport in primary list
  for (const s of Object.keys(STRUCTURED_COACHING_DRILLS)) {
    const found = STRUCTURED_COACHING_DRILLS[s].find(
      (d) =>
        d.nameEn.toLowerCase() === lowerName ||
        lowerName.includes(d.nameEn.toLowerCase()) ||
        d.nameEn.toLowerCase().includes(lowerName)
    );
    if (found) return found;
  }

  // 3. Search in extended pedagogical knowledge base
  for (const [key, spec] of Object.entries(SKILL_DRILL_KNOWLEDGE_BASE)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return {
        id: `drill_${cleanSport.toLowerCase()}_${key.replace(/\s+/g, '_')}`,
        sport: cleanSport,
        nameEn: spec.nameEn || cleanName,
        nameMr: spec.nameMr || `${cleanName} (सराव)`,
        category: spec.category || 'Fundamental',
        setup: spec.setup || `Official ${cleanSport} ground marking and equipment.`,
        objective: spec.objective || `Master technical execution and tactical speed for ${cleanName}.`,
        durationMin: spec.durationMin || 20,
        repetitions: spec.repetitions || '10 - 12 repetitions per player',
        restSeconds: spec.restSeconds || 30,
        coachingCues: spec.coachingCues || [
          "Maintain balanced, athletic stance with low center of gravity.",
          "Coordinate explosive footwork with precise technical execution.",
          "Recover quickly to base position immediately following movement."
        ],
        commonMistakes: spec.commonMistakes || [
          "Rushing movement without proper body balance.",
          "Dropping head or breaking core tension during execution."
        ],
        progression: spec.progression || "Increase speed and add live opponent opposition.",
        regression: spec.regression || "Perform at controlled half-speed with coach feedback.",
        safetyPrecautions: spec.safetyPrecautions || [
          "Ensure adequate warm-up and inspect surface for safe footing."
        ],
        successCriteria: spec.successCriteria || "Clean execution on 8 out of 10 repetitions without technical faults."
      };
    }
  }

  // 4. Authoritative Dynamic Fallback for any other drill
  return {
    id: `drill_${cleanSport.toLowerCase()}_${lowerName.replace(/[^a-z0-9]/g, '_')}`,
    sport: cleanSport,
    nameEn: cleanName,
    nameMr: `${cleanName} सराव व कौशल्य तंत्र`,
    category: 'Fundamental',
    setup: `आश्रम शाळा मैदान, अधिकृत ${cleanSport} क्रीडा साहित्य व मार्किंग.`,
    objective: `${cleanSport} मधील '${cleanName}' कौशल्याची शारीरिक व तांत्रिक अचूकता विकसित करणे.`,
    durationMin: 20,
    repetitions: "10 ते 12 आवर्तने (Repetitions)",
    restSeconds: 30,
    coachingCues: [
      "सराव करताना शरीराचा तोल (Balance) व नजर योग्य दिशेला ठेवा.",
      "हालचालीमध्ये लवचिकता व स्फोटक वेग (Explosive speed) साधा.",
      "कौशल्य पूर्ण झाल्यावर तात्काळ मूळ स्थितीत (Ready position) परत या."
    ],
    commonMistakes: [
      "घाईघाईत सराव करणे ज्यामुळे मूलभूत पोझिशन चुकते.",
      "हात किंवा पायाची हालचाल अर्धवट सोडणे."
    ],
    progression: "विरोधकाचा सक्रिय दबाव जोडून वेगवान निर्णय क्षमतेसह सराव करा.",
    regression: "मार्गदर्शकांच्या उपस्थितीत संथ गतीने पायऱ्या तपासा.",
    safetyPrecautions: [
      "सराव सुरू करण्यापूर्वी ५ मिनिटे वॉर्म-अप करा.",
      "मैदानावर दगड किंवा निसरडी जागा नसल्याची खात्री करा."
    ],
    successCriteria: "१० पैकी किमान ८ प्रयत्नांत अचूक व नियमानुसार सराव पूर्ण होणे."
  };
}
