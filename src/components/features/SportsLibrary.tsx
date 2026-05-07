
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Library, PlayCircle, Trophy, Target, ShieldCheck, Clock, BookOpen } from 'lucide-react';

const RULES_DATA = [
  {
    sport: "Kabaddi",
    rules: [
      "Duration: 20-minute halves (Men) / 15-minute halves (Women).",
      "Raid Limit: 30 seconds per raid.",
      "Scoring: 1 point for each opponent touched and safely returning to home half.",
      "Bonus Point: 6 or more defenders must be present.",
      "Super Tackle: 2 points if 3 or fewer defenders tackle the raider.",
      "All Out: 2 extra points for a complete clear of the opponent team."
    ]
  },
  {
    sport: "Volleyball",
    rules: [
      "Sets: Played to 25 points (Final deciding set to 15).",
      "Touches: Maximum 3 touches per side.",
      "Rotation: Players must rotate clockwise after winning a point on opponent serve.",
      "Libero: Specialized defensive player with a different colored jersey.",
      "Net Foul: No part of the body can touch the net during active play.",
      "Service: Must be executed within 8 seconds of the whistle."
    ]
  },
  {
    sport: "Kho Kho",
    rules: [
      "Duration: Two innings of 9 minutes each per team.",
      "Chasing: 8 players sit in squares facing alternate directions, 1 active chaser.",
      "Passing Kho: Active chaser must tap a sitting player's back to switch roles.",
      "Direction: Chasers cannot change direction once moving between poles.",
      "Out: Touching a runner or runner going out of the rectangular field.",
      "Pole Turning: Using the pole to pivot is a key tactical move."
    ]
  },
  {
    sport: "Handball",
    rules: [
      "Duration: Two halves of 30 minutes each (Senior).",
      "Steps Rule: Maximum 3 steps allowed while holding the ball.",
      "Dribbling: Players can dribble similar to basketball but with specific handball techniques.",
      "Goal Area: Only the goalkeeper is allowed inside the 6m D-zone.",
      "Scoring: Ball must completely cross the goal line between the posts.",
      "Passive Play: Referee can penalize teams that avoid attacking."
    ]
  },
  {
    sport: "Running (Athletics)",
    rules: [
      "Start: False start results in immediate disqualification (Senior standards).",
      "Lane Control: Runners must stay in their assigned lanes for 100m, 200m, and 400m.",
      "Baton Exchange: In relays, baton must be passed within the 20m exchange zone.",
      "Finish: Time is taken when the runner's torso crosses the finish line.",
      "Wind Assist: Records are not valid if wind exceeds 2.0m/s."
    ]
  },
  {
    sport: "Shot Put",
    rules: [
      "Grip: Shot must be held at the base of fingers, not in the palm.",
      "Delivery: Shot must be 'put' from the shoulder with one hand only.",
      "Circle: Thrower must stay within the 2.135m diameter circle.",
      "Sector: Shot must land within the 34.92-degree landing sector.",
      "Foul: Leaving the circle before the shot lands or stepping on the toe-board."
    ]
  },
  {
    sport: "Javelin Throw",
    rules: [
      "Grip: Javelin must be held at the grip.",
      "Delivery: Must be thrown over the shoulder or upper part of the arm.",
      "Landing: Metal head must strike the ground before any other part.",
      "Safety: No rotation or turning back to the landing area allowed.",
      "Valid Throw: Point of the javelin must leave a mark in the landing sector."
    ]
  },
  {
    sport: "Long Jump",
    rules: [
      "Takeoff: Must be executed from behind the front edge of the takeoff board.",
      "Measurement: From the board edge to the nearest break in the sand.",
      "Run-up: No limit on length, but must be within the runway lanes.",
      "Foul: Stepping over the takeoff line (plasticine indicator).",
      "Safety: Landing must be completed inside the sand pit."
    ]
  },
  {
    sport: "High Jump",
    rules: [
      "Takeoff: Must be executed from a single foot.",
      "Clearance: Bar must be cleared without being knocked off its supports.",
      "Attempts: Three consecutive failures at the same height result in elimination.",
      "Approach: Jumpers can approach from any angle.",
      "Safety: Landing must be on the official high-jump crash mat."
    ]
  }
];

const DRILLS_DATA = [
  {
    category: "Agility & Speed",
    drills: [
      "Ladder Drills: High knees, lateral shuffles, and in-and-outs.",
      "Cone Slalom: Sprinting through zig-zag cone patterns.",
      "Shuttle Runs: 10m sprints with hand-touches at each end."
    ]
  },
  {
    category: "Strength",
    drills: [
      "Explosive Squat Jumps: For vertical power in volleyball/basketball.",
      "Medicine Ball Throws: For core and upper body power.",
      "Plank variations: For fundamental core stability."
    ]
  }
];

export function SportsLibrary({ type }: { type: 'rules' | 'drills' | 'videos' }) {
  if (type === 'rules') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10 shadow-lg text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl border border-primary/10">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-black text-primary uppercase tracking-tight">Institutional Rulebook</h2>
            <p className="text-lg font-medium text-muted-foreground max-w-2xl mx-auto">
              Official technical regulations for competitive games at Ashram Shala Waghamba.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RULES_DATA.map((item) => (
            <Card key={item.sport} className="border-2 rounded-[2.5rem] overflow-hidden bg-white shadow-xl hover:border-primary/30 transition-all group">
              <CardHeader className="bg-primary/5 border-b p-6">
                <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-accent" /> {item.sport}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {item.rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-4 text-sm font-bold text-foreground/80 leading-relaxed">
                      <span className="text-accent font-black text-lg">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'drills') {
    return (
      <div className="space-y-6">
        {DRILLS_DATA.map((item) => (
          <Card key={item.category} className="border-2 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-2xl font-black text-primary uppercase flex items-center gap-3">
                <Library className="w-6 h-6" /> {item.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.drills.map((drill, idx) => (
                <div key={idx} className="bg-muted/30 p-4 rounded-xl flex items-center gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-bold uppercase">{drill}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="group border-2 rounded-[2rem] overflow-hidden cursor-pointer hover:border-primary transition-all">
          <div className="aspect-video bg-muted flex items-center justify-center relative">
            <PlayCircle className="w-12 h-12 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
            <Badge className="absolute bottom-3 right-3 bg-black/60 text-white border-0 font-bold">12:40</Badge>
          </div>
          <CardContent className="p-4">
            <h4 className="font-black text-primary uppercase text-sm mb-1">Kabaddi Defensive Moves - Lesson {i}</h4>
            <p className="text-xs font-medium text-muted-foreground">Mastering the Ankle Hold technique with pro timing.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
