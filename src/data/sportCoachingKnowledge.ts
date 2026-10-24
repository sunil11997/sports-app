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
