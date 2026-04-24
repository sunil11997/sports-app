
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Dumbbell, 
  Target, 
  Info, 
  CheckCircle2,
  BookOpen,
  Clock,
  ClipboardCheck,
  History,
  Filter,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DRILLS_DATA: Record<string, any[]> = {
  'Kabaddi': [
    { id: 'k1', name: 'Dubki Mastery', skill: 'Dubki', instructions: ['Start low.', 'Anticipate tackle.', 'Duck head.', 'Propel forward.'], equipment: 'Mats', duration: '15m' },
    { id: 'k2', name: 'Toe Touch Reach', skill: 'Toe Touch', instructions: ['Extend leg quickly.', 'Touch foot.', 'Retreat fast.'], equipment: 'None', duration: '10m' },
    { id: 'k3', name: 'Hand Touch Sprint', skill: 'Running Hand Touch', instructions: ['Sprint toward defender.', 'Touch shoulder.', 'Spin back.'], equipment: 'None', duration: '15m' },
    { id: 'k4', name: 'Back Kick Power', skill: 'Back Kick', instructions: ['Face away.', 'Kick backward with force.', 'Maintain balance.'], equipment: 'None', duration: '12m' },
    { id: 'k5', name: 'Lion Jump Timing', skill: 'Lion Jump', instructions: ['Wait for low dive.', 'Explosive vertical jump.', 'Clear defender.'], equipment: 'Soft Mats', duration: '15m' },
    { id: 'k6', name: 'Sidekick Accuracy', skill: 'Sidekick', instructions: ['Lunge sideways.', 'Kick toward midline.', 'Quick recovery.'], equipment: 'None', duration: '10m' },
    { id: 'k7', name: 'Scorpion Kick Reach', skill: 'Scorpion Kick', instructions: ['Arch back.', 'Kick over head.', 'Target shoulder.'], equipment: 'Mats', duration: '20m' },
    { id: 'k8', name: 'Frog Jump Leap', skill: 'Frog Jump', instructions: ['Crouch deep.', 'Jump over thigh tackle.', 'Land on hands.'], equipment: 'Mats', duration: '15m' },
    { id: 'k9', name: 'Ankle Hold Grip', skill: 'Ankle Hold', instructions: ['Watch feet.', 'Grip both hands.', 'Pull backward.'], equipment: 'Mats', duration: '15m' },
    { id: 'k10', name: 'Thigh Hold Power', skill: 'Thigh Hold', instructions: ['Dive low.', 'Grip upper thigh.', 'Lock legs.'], equipment: 'Mats', duration: '15m' },
    { id: 'k11', name: 'Chain Tackle Sync', skill: 'Chain Tackle', instructions: ['Hold hands.', 'Move as unit.', 'Swing forward.'], equipment: 'Partner', duration: '20m' },
    { id: 'k12', name: 'Dash Defense', skill: 'Dash', instructions: ['Shoulder push.', 'Drive raider out.', 'Stay in bounds.'], equipment: 'Mats', duration: '15m' },
    { id: 'k13', name: 'The Wall Block', skill: 'Block', instructions: ['Stand firm.', 'Absorb impact.', 'Encircle raider.'], equipment: 'Mats', duration: '15m' },
    { id: 'k14', name: 'Waist Hold Lock', skill: 'Waist Hold', instructions: ['Grip from behind.', 'Lift raider off ground.', 'Hold firm.'], equipment: 'Mats', duration: '15m' },
    { id: 'k15', name: 'Knee Hold Takedown', skill: 'Knee Hold', instructions: ['Dive at knees.', 'Collapse raider.', 'Pin down.'], equipment: 'Mats', duration: '15m' },
  ],
  'Volleyball': [
    { id: 'v1', name: 'Service Ace', skill: 'Serving', instructions: ['Toss high.', 'Strike palm.', 'Target corner.'], equipment: 'Ball', duration: '20m' },
    { id: 'v2', name: 'Bump Pass Control', skill: 'Passing (Bump)', instructions: ['Flat platform.', 'Leg drive.', 'Direct to setter.'], equipment: 'Ball', duration: '15m' },
    { id: 'v3', name: 'Set Precision', skill: 'Setting', instructions: ['Finger tips.', 'Triangle shape.', 'High arc.'], equipment: 'Ball', duration: '20m' },
    { id: 'v4', name: 'Spike Power', skill: 'Spiking (Attack)', instructions: ['3-step run.', 'Peak jump.', 'Snap wrist.'], equipment: 'Net', duration: '25m' },
    { id: 'v5', name: 'Wall Block', skill: 'Blocking', instructions: ['Hands up.', 'Push over net.', 'Time jump.'], equipment: 'Net', duration: '15m' },
    { id: 'v6', name: 'Floor Dig', skill: 'Digging (Defense)', instructions: ['Low stance.', 'Pop ball up.', 'Protect floor.'], equipment: 'Ball', duration: '20m' },
    { id: 'v7', name: 'Quick Feet', skill: 'Footwork / Movement', instructions: ['Shuffle side.', 'Ready position.', 'Fast pivot.'], equipment: 'Cones', duration: '15m' },
    { id: 'v8', name: 'Court Talk', skill: 'Communication', instructions: ['Call "Mine".', 'Point zones.', 'Encourage team.'], equipment: 'Team', duration: '10m' },
  ],
  'Handball': [
    { id: 'h1', name: 'Snap Pass', skill: 'Passing', instructions: ['Wrist flick.', 'Target chest.', 'Step into it.'], equipment: 'Ball', duration: '15m' },
    { id: 'h2', name: 'Safe Hands', skill: 'Catching', instructions: ['W-shape hands.', 'Absorb impact.', 'Eyes on ball.'], equipment: 'Ball', duration: '15m' },
    { id: 'h3', name: 'Controlled Dribble', skill: 'Dribbling', instructions: ['Waist height.', 'Protect with body.', 'Keep head up.'], equipment: 'Ball', duration: '15m' },
    { id: 'h4', name: 'Power Shot', skill: 'Shooting', instructions: ['Rotate core.', 'Aim for corners.', 'Full follow-through.'], equipment: 'Goal', duration: '20m' },
    { id: 'h5', name: 'Jump Shot Peak', skill: 'Jump shot', instructions: ['Explode up.', 'Hold in air.', 'Shoot at peak.'], equipment: 'Goal', duration: '20m' },
    { id: 'h6', name: 'Running Drive', skill: 'Running shot', instructions: ['Maintain speed.', 'Quick release.', 'Stay balanced.'], equipment: 'Goal', duration: '15m' },
    { id: 'h7', name: 'Goal Dive', skill: 'Dive shot', instructions: ['Leap forward.', 'Shoot low.', 'Safe landing.'], equipment: 'Mats', duration: '20m' },
    { id: 'h8', name: 'Trick Spin', skill: 'Spin shot', instructions: ['Side wrist flick.', 'Curve ball path.', 'Bypass keeper.'], equipment: 'Goal', duration: '20m' },
    { id: 'h9', name: 'Body Fake', skill: 'Feints (body fake)', instructions: ['Step left.', 'Drive right.', 'Sell the move.'], equipment: 'Defender', duration: '15m' },
    { id: 'h10', name: 'One-on-One', skill: 'Break-through (1 vs 1 attack)', instructions: ['Dribble deep.', 'Explode past.', 'Target gap.'], equipment: 'Defender', duration: '20m' },
    { id: 'h11', name: 'Fast Break Sprint', skill: 'Fast break', instructions: ['Turn and run.', 'Receive long pass.', 'Finish on goal.'], equipment: 'Ball', duration: '15m' },
    { id: 'h12', name: 'Defensive Block', skill: 'Blocking', instructions: ['Arms vertical.', 'Close gaps.', 'Deny line.'], equipment: 'None', duration: '15m' },
    { id: 'h13', name: 'Tight Marking', skill: 'Marking', instructions: ['Stay close.', 'Arm on hip.', 'Shadow moves.'], equipment: 'Partner', duration: '15m' },
    { id: 'h14', name: 'Clean Tackle', skill: 'Tackling', instructions: ['Front contact.', 'Stop movement.', 'Keep hands up.'], equipment: 'Partner', duration: '15m' },
    { id: 'h15', name: 'Pass Intercept', skill: 'Interception', instructions: ['Anticipate lane.', 'Burst to ball.', 'Fast break.'], equipment: 'Ball', duration: '15m' },
    { id: 'h16', name: 'Keeper Reflex', skill: 'Goalkeeping', instructions: ['Low stance.', 'Large span.', 'Reflex saves.'], equipment: 'Goal', duration: '30m' },
    { id: 'h17', name: 'Wall Stance', skill: 'Defensive stance', instructions: ['Feet wide.', 'Knees bent.', 'Active hands.'], equipment: 'None', duration: '10m' },
    { id: 'h18', name: 'Handball Shuffle', skill: 'Footwork', instructions: ['Lateral move.', 'Don\'t cross.', 'Quick shift.'], equipment: 'Cones', duration: '15m' },
    { id: 'h19', name: 'Pivot Turn', skill: 'Pivot play', instructions: ['Back to goal.', 'Spin fast.', 'Shot release.'], equipment: 'Partner', duration: '20m' },
    { id: 'h20', name: 'Field Vision', skill: 'Positioning', instructions: ['Find space.', 'Open lanes.', 'Support ball.'], equipment: 'Pitch', duration: '15m' },
    { id: 'h21', name: 'Trailing Runner', skill: 'Support play', instructions: ['Follow drive.', 'Ready for pass.', 'Clear lane.'], equipment: 'Team', duration: '15m' },
    { id: 'h22', name: 'Game Rhythm', skill: 'Timing', instructions: ['Pass-move sync.', 'Tempo control.', 'Fast release.'], equipment: 'Ball', duration: '15m' },
    { id: 'h23', name: 'Full Unit Sync', skill: 'Coordination', instructions: ['Shift together.', 'Rotational flow.', 'Zone cover.'], equipment: 'Team', duration: '15m' },
    { id: 'h24', name: 'Team Signals', skill: 'Communication', instructions: ['Call plays.', 'Visual cues.', 'Verbal alert.'], equipment: 'Team', duration: '10m' },
    { id: 'h25', name: 'Split Decision', skill: 'Decision making', instructions: ['Shoot vs Pass.', 'Analyze gap.', 'Fast choice.'], equipment: 'Match', duration: '15m' },
    { id: 'h26', name: 'Court Logic', skill: 'Game awareness', instructions: ['Read defense.', 'Clock watch.', 'Tactical shift.'], equipment: 'Match', duration: '15m' },
    { id: 'h27', name: 'Instant Trigger', skill: 'Reaction time', instructions: ['Fumble drill.', 'Loose ball chase.', 'Quick grab.'], equipment: 'Ball', duration: '15m' },
    { id: 'h28', name: 'Static Balance', skill: 'Balance & body control', instructions: ['One leg stance.', 'Contact control.', 'Landing firm.'], equipment: 'None', duration: '10m' },
  ],
  'Kho Kho': [
    { id: 'kh1', name: 'Square Sit', skill: 'Sitting posture', instructions: ['Low squat.', 'Heels flat.', 'Alert hands.'], equipment: 'None', duration: '10m' },
    { id: 'kh2', name: 'Pole Pivot', skill: 'Pole turning', instructions: ['Inner hand grip.', 'Pole low.', 'Accelerate out.'], equipment: 'Poles', duration: '15m' },
    { id: 'kh3', name: 'Clear Kho', skill: 'Giving kho', instructions: ['Shoulder tap.', 'Loud "KHO".', 'Sit instantly.'], equipment: 'None', duration: '10m' },
    { id: 'kh4', name: 'Reactive Rise', skill: 'Receiving kho', instructions: ['Anticipate tap.', 'Explosive stand.', 'Immediate chase.'], equipment: 'None', duration: '10m' },
    { id: 'kh5', name: 'Direct Chase', skill: 'Chasing', instructions: ['Straight line.', 'Target runner.', 'Fast steps.'], equipment: 'None', duration: '15m' },
    { id: 'kh6', name: 'Sidestep Dodge', skill: 'Dodging', instructions: ['Shift weight.', 'Fake direction.', 'Clear lane.'], equipment: 'None', duration: '15m' },
    { id: 'kh7', name: 'Zig-Zag Flow', skill: 'Zig-zag running', instructions: ['Curve patterns.', 'Avoid tag.', 'Speed curve.'], equipment: 'Cones', duration: '15m' },
    { id: 'kh8', name: 'Snap Pivot', skill: 'Sudden direction change', instructions: ['Plant foot.', 'Hard turn.', 'Drive away.'], equipment: 'None', duration: '15m' },
    { id: 'kh9', name: 'Shoulder Fake', skill: 'Fake (feint) movement', instructions: ['Drop shoulder.', 'Eye contact.', 'Exit opposite.'], equipment: 'None', duration: '15m' },
    { id: 'kh10', name: 'Precision Tag', skill: 'Touching (tagging)', instructions: ['Arm extension.', 'Soft touch.', 'Safety first.'], equipment: 'None', duration: '10m' },
    { id: 'kh11', name: 'Air Dive', skill: 'Diving', instructions: ['Target runner.', 'Full layout.', 'Tuck/roll.'], equipment: 'Soft Ground', duration: '20m' },
    { id: 'kh12', name: 'Safety Roll', skill: 'Rolling', instructions: ['Landing skill.', 'Shoulder lead.', 'Smooth exit.'], equipment: 'None', duration: '15m' },
    { id: 'kh13', name: 'Lane Skid', skill: 'Skidding', instructions: ['Low friction.', 'Surface use.', 'Slide to tag.'], equipment: 'Court', duration: '15m' },
    { id: 'kh14', name: 'In-Game Pace', skill: 'Running speed', instructions: ['Sprint bursts.', 'Endurance run.', 'Timed laps.'], equipment: 'None', duration: '20m' },
    { id: 'kh15', name: 'Instant React', skill: 'Reaction time', instructions: ['Audio cues.', 'Visual switch.', 'Fast start.'], equipment: 'None', duration: '15m' },
    { id: 'kh16', name: 'Lane Footwork', skill: 'Footwork', instructions: ['Short steps.', 'Square agility.', 'Stable base.'], equipment: 'Cones', duration: '15m' },
    { id: 'kh17', name: 'Chaser Unit', skill: 'Coordination', instructions: ['Pass sequence.', 'Rotation flow.', 'No crossing.'], equipment: 'Team', duration: '15m' },
    { id: 'kh18', name: 'Core Control', skill: 'Balance & body control', instructions: ['Static hold.', 'Dynamic shift.', 'Contact ready.'], equipment: 'None', duration: '10m' },
    { id: 'kh19', name: 'Boundary Vision', skill: 'Awareness of court', instructions: ['Stay in lines.', 'Corner check.', 'Pole distance.'], equipment: 'Court', duration: '15m' },
    { id: 'kh20', name: 'Strategic Squad', skill: 'Team coordination', instructions: ['Defensive line.', 'Offensive flow.', 'Joint effort.'], equipment: 'Team', duration: '15m' },
  ],
  'Running': [
    { id: 'r1', name: 'Block Start', skill: 'Starting technique', instructions: ['Hips high.', 'Drive legs.', 'Stay low.'], equipment: 'Blocks', duration: '15m' },
    { id: 'r2', name: 'Speed Phase', skill: 'Acceleration', instructions: ['Fast build.', 'High knees.', 'Strong arms.'], equipment: 'Track', duration: '15m' },
    { id: 'r3', name: 'Step Reach', skill: 'Stride length', instructions: ['Knee drive.', 'Full reach.', 'Back push.'], equipment: 'None', duration: '15m' },
    { id: 'r4', name: 'Fast Taps', skill: 'Stride frequency', instructions: ['High cadence.', 'Fast contact.', 'Quick lift.'], equipment: 'Metronome', duration: '15m' },
    { id: 'r5', name: 'Tall Posture', skill: 'Running posture', instructions: ['Head up.', 'Back straight.', 'Relax jaw.'], equipment: 'None', duration: '15m' },
    { id: 'r6', name: 'Piston Arms', skill: 'Arm action', instructions: ['90 degrees.', 'Swing shoulders.', 'Don\'t cross.'], equipment: 'None', duration: '10m' },
    { id: 'r7', name: 'Ball Strike', skill: 'Foot placement', instructions: ['Land mid-foot.', 'No heel strike.', 'Spring out.'], equipment: 'None', duration: '15m' },
    { id: 'r8', name: 'Deep Oxygen', skill: 'Breathing control', instructions: ['Rhythm breath.', 'Nose in.', 'Mouth out.'], equipment: 'None', duration: '10m' },
    { id: 'r9', name: 'Split Times', skill: 'Pacing', instructions: ['Target laps.', 'Hold speed.', 'Finish strong.'], equipment: 'Watch', duration: '20m' },
    { id: 'r10', name: 'Iron Lungs', skill: 'Endurance', instructions: ['Long distance.', 'Steady pace.', 'Mind focus.'], equipment: 'None', duration: '30m' },
    { id: 'r11', name: 'Raw Velocity', skill: 'Speed', instructions: ['Full sprint.', 'Max effort.', 'Recovery rest.'], equipment: 'None', duration: '20m' },
    { id: 'r12', name: 'Pro Sprinting', skill: 'Sprinting technique', instructions: ['Power drive.', 'Air time.', 'Sharp finish.'], equipment: 'None', duration: '20m' },
    { id: 'r13', name: 'Banked Turn', skill: 'Turning technique', instructions: ['Lean inward.', 'Inner arm swing.', 'Maintain pace.'], equipment: 'Track', duration: '15m' },
    { id: 'r14', name: 'Chest Lean', skill: 'Finish (leaning)', instructions: ['Lunge tape.', 'Push chest.', 'Follow through.'], equipment: 'Tape', duration: '10m' },
    { id: 'r15', name: 'Flash Start', skill: 'Reaction time', instructions: ['Gun start.', 'Instant drive.', 'Ear alert.'], equipment: 'None', duration: '15m' },
    { id: 'r16', name: 'Gravel Balance', skill: 'Balance', instructions: ['Stable ankle.', 'Core tight.', 'Head still.'], equipment: 'None', duration: '10m' },
    { id: 'r17', name: 'Body Rhythm', skill: 'Coordination', instructions: ['Arm-leg sync.', 'Smooth flow.', 'Effortless run.'], equipment: 'None', duration: '15m' },
    { id: 'r18', name: 'Cone Slalom', skill: 'Agility', instructions: ['Quick weave.', 'Low center.', 'Fast exit.'], equipment: 'Cones', duration: '15m' },
    { id: 'r19', name: 'Muscle Range', skill: 'Flexibility', instructions: ['Dynamic stretch.', 'High kick.', 'Glute bridge.'], equipment: 'Mats', duration: '15m' },
    { id: 'r20', name: 'Cooldown Flow', skill: 'Recovery technique', instructions: ['Slow jog.', 'Static stretch.', 'Hydrate.'], equipment: 'None', duration: '10m' },
  ],
  'Shot Put': [
    { id: 'sp1', name: 'Fingertip Hold', skill: 'Grip', instructions: ['Fingers base.', 'Wrist firm.', 'High elbow.'], equipment: 'Shot Put', duration: '10m' },
    { id: 'sp2', name: 'Strong Base', skill: 'Stance', instructions: ['Feet wide.', 'Shoulders back.', 'Center low.'], equipment: 'None', duration: '10m' },
    { id: 'sp3', name: 'Neck Pocket', skill: 'Shot placement (neck position)', instructions: ['Tuck in neck.', 'Thumb down.', 'Elbow up.'], equipment: 'Shot Put', duration: '10m' },
    { id: 'sp4', name: 'Back Glide', skill: 'Glide technique', instructions: ['Kick back.', 'Linear shift.', 'Fast landing.'], equipment: 'None', duration: '20m' },
    { id: 'sp5', name: 'Orbit Spin', skill: 'Rotation technique', instructions: ['Pivot foot.', 'Centrifugal pull.', 'Core drive.'], equipment: 'Circle', duration: '25m' },
    { id: 'sp6', name: 'Launch Launch', skill: 'Power position', instructions: ['Torque build.', 'Chest out.', 'Load leg.'], equipment: 'None', duration: '15m' },
    { id: 'sp7', name: 'Piston Kick', skill: 'Leg drive', instructions: ['Explode ground.', 'Hips forward.', 'Power transfer.'], equipment: 'None', duration: '15m' },
    { id: 'sp8', name: 'Snap Rotate', skill: 'Hip rotation', instructions: ['Whip hip.', 'Face front.', 'Shoulder follow.'], equipment: 'None', duration: '15m' },
    { id: 'sp9', name: 'Core Twist', skill: 'Trunk rotation', instructions: ['Shoulder separation.', 'Uncoil fast.', 'Punch out.'], equipment: 'None', duration: '15m' },
    { id: 'sp10', name: 'Full Punch', skill: 'Arm extension', instructions: ['Drive through.', 'Finger flick.', 'Snap wrist.'], equipment: 'None', duration: '15m' },
    { id: 'sp11', name: 'Sky High', skill: 'Release angle', instructions: ['45 degrees.', 'Aim up.', 'Eye follow.'], equipment: 'None', duration: '10m' },
    { id: 'sp12', name: 'Peak Launch', skill: 'Release height', instructions: ['Max extension.', 'Toe point.', 'Top release.'], equipment: 'None', duration: '10m' },
    { id: 'sp13', name: 'Arm Path', skill: 'Follow-through', instructions: ['Arm swing.', 'Stay in circle.', 'Look out.'], equipment: 'Circle', duration: '10m' },
    { id: 'sp14', name: 'Circle Grip', skill: 'Balance', instructions: ['Foot anchor.', 'Core lock.', 'Visual focus.'], equipment: 'Circle', duration: '10m' },
    { id: 'sp15', name: 'Full Throw Unit', skill: 'Coordination', instructions: ['Leg-arm sync.', 'Smooth build.', 'Max power.'], equipment: 'Shot Put', duration: '15m' },
    { id: 'sp16', name: 'Release Snap', skill: 'Timing', instructions: ['Wait for drive.', 'Punch late.', 'Fast release.'], equipment: 'Shot Put', duration: '15m' },
    { id: 'sp17', name: 'Circle Agility', skill: 'Footwork', instructions: ['Pivot drill.', 'Fast shift.', 'Stable land.'], equipment: 'Circle', duration: '15m' },
    { id: 'sp18', name: 'Pure Push', skill: 'Strength', instructions: ['Heavy press.', 'Core plank.', 'Leg squat.'], equipment: 'Weights', duration: '20m' },
    { id: 'sp19', name: 'Boom Throw', skill: 'Explosive power', instructions: ['Jump squat.', 'Med ball throw.', 'Fast kick.'], equipment: 'Med Ball', duration: '20m' },
    { id: 'sp20', name: 'Sector Aim', skill: 'Control', instructions: ['Target zones.', 'Stay in lines.', 'Consistent form.'], equipment: 'Shot Put', duration: '15m' },
  ],
  'Javline': [
    { id: 'jv1', name: 'Spear Grip', skill: 'Grip', instructions: ['Finnish/American hold.', 'Shoulder high.', 'Fingers lock.'], equipment: 'Javelin', duration: '10m' },
    { id: 'jv2', name: 'High Carry', skill: 'Carrying position', instructions: ['Above ear.', 'Point down.', 'Shoulder relax.'], equipment: 'Javelin', duration: '10m' },
    { id: 'jv3', name: 'Approach Pace', skill: 'Run-up', instructions: ['Build speed.', 'Straight path.', 'Smooth flow.'], equipment: 'Track', duration: '15m' },
    { id: 'jv4', name: 'Delivery Beat', skill: 'Approach rhythm', instructions: ['Beat timing.', 'Final sprint.', 'Transition beat.'], equipment: 'None', duration: '15m' },
    { id: 'jv5', name: 'The Drawback', skill: 'Withdrawal (drawing back)', instructions: ['Extend arm.', 'Rotate torso.', 'Keep javelin high.'], equipment: 'Javelin', duration: '15m' },
    { id: 'jv6', name: 'Side Shuffle', skill: 'Cross steps', instructions: ['Crossover legs.', 'Maintain pace.', 'Eyes front.'], equipment: 'Track', duration: '20m' },
    { id: 'jv7', name: 'Power Stride', skill: 'Impulse stride', instructions: ['Leap forward.', 'Plant back foot.', 'Load power.'], equipment: 'None', duration: '15m' },
    { id: 'jv8', name: 'Lead Block', skill: 'Block (front leg action)', instructions: ['Firm plant.', 'Stop motion.', 'Whip body.'], equipment: 'None', duration: '15m' },
    { id: 'jv9', name: 'Hip Whip', skill: 'Hip rotation', instructions: ['Hard turn.', 'Drive forward.', 'Shoulder follow.'], equipment: 'None', duration: '15m' },
    { id: 'jv10', name: 'Torso Coil', skill: 'Trunk rotation', instructions: ['Tight twist.', 'Fast release.', 'Shoulder punch.'], equipment: 'None', duration: '15m' },
    { id: 'jv11', name: 'Spear Punch', skill: 'Arm action', instructions: ['Above shoulder.', 'Fast strike.', 'Wrist flick.'], equipment: 'None', duration: '15m' },
    { id: 'jv12', name: 'Airborne Spear', skill: 'Release', instructions: ['Finger flick.', 'Over shoulder.', 'Look up.'], equipment: 'Javelin', duration: '10m' },
    { id: 'jv13', name: 'Flight Path', skill: 'Release angle', instructions: ['35 degrees.', 'Point first.', 'Steady line.'], equipment: 'None', duration: '10m' },
    { id: 'jv14', name: 'Exit Swing', skill: 'Follow-through', instructions: ['Arm circle.', 'Step across.', 'Stay in line.'], equipment: 'None', duration: '10m' },
    { id: 'jv15', name: 'Ground Anchor', skill: 'Balance', instructions: ['Stay in lines.', 'Core lock.', 'Visual focus.'], equipment: 'None', duration: '10m' },
    { id: 'jv16', name: 'Full Throw Flow', skill: 'Coordination', instructions: ['Run-throw sync.', 'Smooth build.', 'Peak effort.'], equipment: 'Javelin', duration: '15m' },
    { id: 'jv17', name: 'Wait and Whip', skill: 'Timing', instructions: ['Late release.', 'Max tension.', 'Snap fire.'], equipment: 'Javelin', duration: '15m' },
    { id: 'jv18', name: 'Crossover Shift', skill: 'Footwork', instructions: ['Fast crosses.', 'Stable base.', 'Firm plant.'], equipment: 'Cones', duration: '15m' },
    { id: 'jv19', name: 'Run Velocity', skill: 'Speed', instructions: ['Full sprint.', 'Hold carry.', 'Peak dash.'], equipment: 'None', duration: '20m' },
    { id: 'jv20', name: 'Spear Press', skill: 'Strength', instructions: ['Tricep push.', 'Core twist.', 'Leg lunge.'], equipment: 'Weights', duration: '20m' },
    { id: 'jv21', name: 'Shoulder Range', skill: 'Flexibility', instructions: ['Arm circles.', 'Dynamic stretch.', 'Back arch.'], equipment: 'Mats', duration: '15m' },
    { id: 'jv22', name: 'Target Spear', skill: 'Control', instructions: ['Point aim.', 'Sector hit.', 'Consistent arc.'], equipment: 'Javelin', duration: '15m' },
  ],
  'Long Jump': [
    { id: 'lj1', name: 'Approach Sprint', skill: 'Approach run', instructions: ['Build speed.', 'Consistent steps.', 'Eyes front.'], equipment: 'Track', duration: '15m' },
    { id: 'lj2', name: 'Speed Phase', skill: 'Acceleration', instructions: ['Fast build.', 'High knees.', 'Strong arms.'], equipment: 'Track', duration: '15m' },
    { id: 'lj3', name: 'Beat Flow', skill: 'Rhythm control', instructions: ['Steady count.', 'Tempo hold.', 'Final beat.'], equipment: 'Track', duration: '15m' },
    { id: 'lj4', name: 'Lift Off', skill: 'Take-off', instructions: ['Explode up.', 'Arm drive.', 'Peak reach.'], equipment: 'Board', duration: '20m' },
    { id: 'lj5', name: 'Board Precision', skill: 'Take-off foot placement', instructions: ['Hit board.', 'Don\'t foul.', 'Clean plant.'], equipment: 'Board', duration: '15m' },
    { id: 'lj6', name: 'Penultimate Step', skill: 'Penultimate step', instructions: ['Longer step.', 'Lower center.', 'Ready spring.'], equipment: 'Track', duration: '15m' },
    { id: 'lj7', name: 'Final Step Shift', skill: 'Last step control', instructions: ['Short step.', 'Fast plant.', 'Vertical push.'], equipment: 'Track', duration: '15m' },
    { id: 'lj8', name: 'Power Knee', skill: 'Knee drive', instructions: ['High lift.', 'Forward force.', 'Core pull.'], equipment: 'None', duration: '15m' },
    { id: 'lj9', name: 'Air Balance', skill: 'Arm swing', instructions: ['Above head.', 'Circle path.', 'Lift body.'], equipment: 'None', duration: '15m' },
    { id: 'lj10', name: 'Hang Time', skill: 'Flight technique (hang)', instructions: ['Arch back.', 'Arms high.', 'Hold pose.'], equipment: 'Sand Pit', duration: '20m' },
    { id: 'lj11', name: 'Hitch-Kick Flow', skill: 'Flight technique (hitch-kick)', instructions: ['Air steps.', 'Cycling motion.', 'Forward drive.'], equipment: 'Sand Pit', duration: '20m' },
    { id: 'lj12', name: 'Airbound Pose', skill: 'Body posture in air', instructions: ['Head up.', 'Eyes on pit.', 'Stay tall.'], equipment: 'None', duration: '15m' },
    { id: 'lj13', name: 'Landing Reach', skill: 'Landing', instructions: ['Feet forward.', 'Sweep arms.', 'Collapse soft.'], equipment: 'Sand Pit', duration: '20m' },
    { id: 'lj14', name: 'Reach for Distance', skill: 'Leg extension', instructions: ['Hold legs.', 'Reach pit.', 'Max distance.'], equipment: 'Sand Pit', duration: '15m' },
    { id: 'lj15', name: 'Heel Sweep', skill: 'Sand contact technique', instructions: ['Heels first.', 'Roll forward.', 'Exit front.'], equipment: 'Sand Pit', duration: '15m' },
    { id: 'lj16', name: 'Stability Hold', skill: 'Balance', instructions: ['No fall back.', 'Core lock.', 'Steady head.'], equipment: 'Sand Pit', duration: '10m' },
    { id: 'lj17', name: 'Run-Jump Sync', skill: 'Coordination', instructions: ['Full flow.', 'No stutter.', 'Peak power.'], equipment: 'Sand Pit', duration: '15m' },
    { id: 'lj18', name: 'Board Timing', skill: 'Timing', instructions: ['Perfect beat.', 'Last beat.', 'Flash spring.'], equipment: 'Board', duration: '15m' },
    { id: 'lj19', name: 'Board Velocity', skill: 'Speed', instructions: ['Full dash.', 'Hold carry.', 'Max sprint.'], equipment: 'Track', duration: '20m' },
    { id: 'lj20', name: 'Power Press', skill: 'Strength', instructions: ['Single leg squat.', 'Plank hold.', 'Calf rise.'], equipment: 'Weights', duration: '20m' },
    { id: 'lj21', name: 'Boom Spring', skill: 'Explosive power', instructions: ['Jump squat.', 'Box jump.', 'Fast dash.'], equipment: 'Box', duration: '20m' },
    { id: 'lj22', name: 'Hip Range', skill: 'Flexibility', instructions: ['Hamstring stretch.', 'Hip flexor.', 'High kick.'], equipment: 'Mats', duration: '15m' },
    { id: 'lj23', name: 'Pit Precision', skill: 'Control', instructions: ['Target center.', 'Straight run.', 'Solid land.'], equipment: 'Sand Pit', duration: '15m' },
  ],
  'High Jump': [
    { id: 'hj1', name: 'J-Approach Lead', skill: 'Approach run', instructions: ['Build speed.', 'Consistent steps.', 'Eyes front.'], equipment: 'Track', duration: '15m' },
    { id: 'hj2', name: 'Curve Entry', skill: 'Curve running', instructions: ['Lean inward.', 'Bank turn.', 'No speed loss.'], equipment: 'Track', duration: '15m' },
    { id: 'hj3', name: 'Perfect J-Path', skill: 'J-approach', instructions: ['Straight to curve.', 'Centrifugal pull.', 'Tempo beat.'], equipment: 'None', duration: '15m' },
    { id: 'hj4', name: 'Tempo Beat', skill: 'Rhythm control', instructions: ['Steady count.', 'Beat transition.', 'Final beat.'], equipment: 'None', duration: '15m' },
    { id: 'hj5', name: 'Explosive Lift', skill: 'Take-off', instructions: ['Outer foot plant.', 'Power vertical.', 'Arm drive.'], equipment: 'Mat', duration: '20m' },
    { id: 'hj6', name: 'Anchor Point', skill: 'Take-off foot placement', instructions: ['Away from bar.', 'Hard plant.', 'Quick spring.'], equipment: 'Mat', duration: '15m' },
    { id: 'hj7', name: 'Prep Step', skill: 'Penultimate step', instructions: ['Lower center.', 'Longer stride.', 'Ready lift.'], equipment: 'Track', duration: '15m' },
    { id: 'hj8', name: 'Final Beat', skill: 'Last step', instructions: ['Short step.', 'Fast plant.', 'Vertical snap.'], equipment: 'Track', duration: '15m' },
    { id: 'hj9', name: 'Air Knee', skill: 'Knee drive', instructions: ['High knee pull.', 'Rotate bar.', 'Vertical force.'], equipment: 'None', duration: '15m' },
    { id: 'hj10', name: 'Air Lift', skill: 'Arm swing', instructions: ['Double arm pull.', 'Above head.', 'Clear bar.'], equipment: 'None', duration: '15m' },
    { id: 'hj11', name: 'Curve Lean', skill: 'Body lean (inward)', instructions: ['Bank inward.', 'Head lead.', 'Core shift.'], equipment: 'None', duration: '15m' },
    { id: 'hj12', name: 'Fosbury Arch', skill: 'Bar clearance (Fosbury flop)', instructions: ['Back to bar.', 'Deep arch.', 'Kick feet.'], equipment: 'Bar', duration: '30m' },
    { id: 'hj13', name: 'Sky Arch', skill: 'Back arch', instructions: ['Shoulder lead.', 'Pelvis up.', 'Clear peak.'], equipment: 'None', duration: '20m' },
    { id: 'hj14', name: 'Hip Clearance', skill: 'Hip lift', instructions: ['Highest point.', 'Avoid touch.', 'Snap kick.'], equipment: 'None', duration: '15m' },
    { id: 'hj15', name: 'Chin Tuck', skill: 'Head position', instructions: ['Look for feet.', 'Safety tuck.', 'Protect neck.'], equipment: 'None', duration: '15m' },
    { id: 'hj16', name: 'Safety Landing', skill: 'Landing (mat)', instructions: ['Upper back land.', 'Legs together.', 'No touch bar.'], equipment: 'Mat', duration: '20m' },
    { id: 'hj17', name: 'Statue Control', skill: 'Balance', instructions: ['Mid-air shift.', 'Core anchor.', 'Stable land.'], equipment: 'None', duration: '10m' },
    { id: 'hj18', name: 'Whole Body Sync', skill: 'Coordination', instructions: ['Approach-arch flow.', 'No stutter.', 'Max power.'], equipment: 'Mat', duration: '15m' },
    { id: 'hj19', name: 'Jump Timing', skill: 'Timing', instructions: ['Perfect beat.', 'Last beat.', 'Flash spring.'], equipment: 'Bar', duration: '15m' },
    { id: 'hj20', name: 'J-Dash Velocity', skill: 'Speed', instructions: ['Full dash.', 'Hold carry.', 'Max sprint.'], equipment: 'Track', duration: '20m' },
    { id: 'hj21', name: 'Leg Press Power', skill: 'Strength', instructions: ['Single leg squat.', 'Plank hold.', 'Calf rise.'], equipment: 'Weights', duration: '20m' },
    { id: 'hj22', name: 'Box Leap', skill: 'Explosive power', instructions: ['Jump squat.', 'Box jump.', 'Vertical pop.'], equipment: 'Box', duration: '20m' },
    { id: 'hj23', name: 'Spine Range', skill: 'Flexibility', instructions: ['Bridge pose.', 'Shoulder range.', 'High kick.'], equipment: 'Mats', duration: '15m' },
    { id: 'hj24', name: 'Target Bar', skill: 'Control', instructions: ['Clear focus.', 'Consistent run.', 'Solid land.'], equipment: 'Bar', duration: '15m' },
  ]
};

export function SportsDrills({ store }: { store: any }) {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState('Kabaddi');
  const [viewCompletedOnly, setViewCompletedMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const completions = store.data.drillCompletions || {};

  const handleToggleComplete = async (drillId: string, drillName: string) => {
    const isDone = !!completions[drillId];
    setIsProcessing(drillId);

    try {
      store.setDrillCompletion(drillId, !isDone);
      
      if (!isDone) {
        toast({ 
          title: "Session Logged", 
          description: `${drillName} finished. Removed from active list.`,
          className: "bg-accent border-accent-foreground text-accent-foreground font-black"
        });
      } else {
        toast({ 
          title: "Drill Reset", 
          description: `${drillName} returned to active list.` 
        });
      }
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Sync Error", 
        description: "Could not update drill status." 
      });
    } finally {
      setIsProcessing(null);
    }
  };

  // Logic: Default view shows drills NOT in completions. 
  // History view shows drills THAT ARE in completions.
  const currentDrills = (DRILLS_DATA[activeSport] || []).filter(d => 
    viewCompletedOnly ? completions[d.id] : !completions[d.id]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-primary/10 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-10 h-10 text-cyan-600" /> Coaching Hub
            </h2>
            <p className="text-lg font-medium text-foreground/70">
              Technical training protocols mapping directly to Game Skill move sets.
            </p>
          </div>
          <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4">
            <div className="space-y-2 w-full md:w-64">
              <label className="text-[10px] font-black text-primary uppercase ml-2">Game / Discipline</label>
              <select 
                value={activeSport} 
                onChange={(e) => setActiveSport(e.target.value)}
                className="w-full h-14 rounded-2xl border-2 border-primary/20 bg-white px-4 font-black text-primary uppercase appearance-none shadow-sm focus:outline-none focus:border-primary"
              >
                {Object.keys(DRILLS_DATA).map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 w-full md:w-64">
              <label className="text-[10px] font-black text-primary uppercase ml-2">Training View</label>
              <Button 
                variant={viewCompletedOnly ? "default" : "outline"} 
                onClick={() => setViewCompletedMode(!viewCompletedOnly)}
                className={cn(
                  "w-full h-14 rounded-2xl border-2 font-black uppercase text-xs tracking-widest transition-all",
                  viewCompletedOnly ? "bg-accent text-accent-foreground border-accent" : "border-primary/20 bg-white text-primary"
                )}
              >
                {viewCompletedOnly ? <><Loader2 className="w-4 h-4 mr-2" /> Back to Pending</> : <><History className="w-4 h-4 mr-2" /> View History</>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentDrills.length === 0 ? (
        <Card className="border-dashed border-4 p-20 flex flex-col items-center text-muted-foreground rounded-[3rem] bg-white/50">
          <Dumbbell className="w-16 h-16 mb-6 opacity-10" />
          <p className="text-xl font-bold uppercase tracking-widest opacity-30 text-center">
            {viewCompletedOnly 
              ? 'No training sessions archived yet' 
              : 'Training Finished! All drills for this sport are completed.'}
          </p>
          {!viewCompletedOnly && (
            <Button variant="ghost" onClick={() => setViewCompletedMode(true)} className="mt-4 font-black uppercase text-xs tracking-widest">
              Review Completed Drills
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {currentDrills.map((drill) => {
            const isDone = !!completions[drill.id];
            const isLoading = isProcessing === drill.id;
            
            return (
              <Card key={drill.id} className={cn(
                "border-2 rounded-[2.5rem] overflow-hidden transition-all group relative",
                isDone ? "border-primary/40 bg-primary/5 opacity-80" : "hover:border-primary/30 bg-white shadow-xl"
              )}>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-primary uppercase tracking-tight leading-tight">{drill.name}</h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="outline" className="border-cyan-200 text-cyan-700 bg-cyan-50 font-black text-[9px] uppercase px-3">
                          {drill.skill}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-muted-foreground font-black text-[10px] uppercase">
                        <Clock className="w-3 h-3" /> {drill.duration}
                      </div>
                      {isDone && <CheckCircle2 className="w-8 h-8 text-primary fill-white animate-in zoom-in" />}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Coaching Instructions</span>
                      </div>
                      <ul className="space-y-3">
                        {drill.instructions.map((step: string, idx: number) => (
                          <li key={idx} className="flex gap-3 text-sm font-medium text-foreground/80 leading-snug">
                            <span className="flex-shrink-0 w-5 h-5 bg-white border border-primary/20 rounded-full flex items-center justify-center text-[10px] font-black text-primary shadow-sm">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase px-2">
                      <Target className="w-3 h-3 text-accent" /> Equipment: <span className="text-foreground ml-1">{drill.equipment}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleToggleComplete(drill.id, drill.name)}
                    variant={isDone ? "default" : "outline"}
                    disabled={isLoading}
                    className={cn(
                      "w-full rounded-2xl font-black uppercase text-xs tracking-widest h-14 transition-all active-scale shadow-lg",
                      isDone ? "bg-primary hover:bg-primary/90" : "border-2 border-primary/20 hover:bg-primary/5"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isDone ? (
                      <><CheckCircle className="w-5 h-5 mr-2" /> RETURN TO ACTIVE LIST</>
                    ) : (
                      "MARK AS COMPLETED"
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-2 border-dashed rounded-[3rem] bg-muted/10 p-12 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <Info className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          <h4 className="text-xl font-black text-muted-foreground uppercase tracking-tight">Institutional Drill Logic</h4>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed italic">
            "Once a technical drill is marked complete, it is archived to the session history to help the coach focus on remaining objectives. 
            Archived drills can be reviewed and reset at any time via the Training View toggle."
          </p>
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">
            Approved by PE Department - Waghamba School
          </p>
        </div>
      </Card>
    </div>
  );
}

