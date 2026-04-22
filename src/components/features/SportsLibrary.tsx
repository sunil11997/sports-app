
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Library, PlayCircle, ChevronRight, Trophy, Target } from 'lucide-react';

const RULES_DATA = [
  {
    sport: "Kabaddi",
    rules: [
      "Duration: 20-minute halves (Men) / 15-minute halves (Women).",
      "Raid Limit: 30 seconds per raid.",
      "Scoring: 1 point for each opponent touched and safely returning to home half.",
      "Bonus Point: 6 or more defenders must be present.",
      "Super Tackle: 2 points if 3 or fewer defenders tackle the raider."
    ]
  },
  {
    sport: "Volleyball",
    rules: [
      "Sets: Played to 25 points (Final set to 15).",
      "Touches: Maximum 3 touches per side.",
      "Rotation: Players rotate clockwise after winning a point.",
      "Libero: Specialized defensive player with a different jersey.",
      "Net Foul: No part of the body can touch the net during play."
    ]
  },
  {
    sport: "Kho Kho",
    rules: [
      "Duration: Two innings of 9 minutes each.",
      "Chasing: 8 players sit in squares, 1 active chaser.",
      "Passing Kho: Active chaser must tap a sitting player's back to switch.",
      "Direction: Chasers cannot change direction once moving between poles.",
      "Out: Touching a runner or runner going out of bounds."
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RULES_DATA.map((item) => (
          <Card key={item.sport} className="border-2 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
                <ScrollText className="w-5 h-5" /> {item.sport}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {item.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3 text-sm font-medium">
                    <span className="text-primary font-black">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
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
