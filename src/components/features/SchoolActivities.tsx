
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Printer, 
  Plus, 
  History, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle2,
  Trash2,
  BookOpen,
  ShieldAlert,
  ListOrdered
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ACTIVITY_GUIDELINES: Record<string, { rules: string[], instructions: string[] }> = {
  "Yoga Session": {
    rules: [
      "Maintain absolute silence during the session.",
      "Preferably perform on an empty stomach or 2 hours after a light meal.",
      "Wear comfortable, loose institutional clothing.",
      "Students must bring their own yoga mats or clean cloth."
    ],
    instructions: [
      "Start with basic breathing exercises (Pranayama).",
      "Progress to Suryanamaskar (12 standard steps).",
      "Hold each asana for 15-30 seconds with focused deep breathing.",
      "Conclude with 5 minutes of Shavasana for full body relaxation."
    ]
  },
  "Mindfulness Meditation": {
    rules: [
      "Sit in a stable Sukhasana or Padmasana position.",
      "Keep hands in Dhyana Mudra (palms up, one on top of other).",
      "Eyes must be gently closed or focused on a fixed point on the ground.",
      "Strict 'no-talking' rule for the entire duration."
    ],
    instructions: [
      "Begin with 3 deep 'cleansing' breaths.",
      "Instruct students to observe thoughts without judgment (like clouds passing).",
      "Gently bring focus back to the present moment when the mind wanders.",
      "Conclude by rubbing palms together and placing them over the eyes."
    ]
  },
  "Breath Awareness Meditation": {
    rules: [
      "Keep the spine, neck, and head in a straight vertical line.",
      "Mouth should be closed; breathing only through the nostrils.",
      "Avoid leaning against walls or other students.",
      "Maintain a calm and peaceful internal environment."
    ],
    instructions: [
      "Focus attention solely on the touch of air at the entrance of the nostrils.",
      "Observe the natural rhythm of incoming and outgoing breath.",
      "Do not try to control the breath; just observe it as it is.",
      "Perform for 10-15 minutes followed by a minute of quiet sitting."
    ]
  },
  "OM Chanting Meditation": {
    rules: [
      "Uniform chanting speed across the entire class.",
      "Proper pronunciation of 'A-U-M' sounds.",
      "Listen to the resonance of the group chanting.",
      "Sit in a circle formation for better energy flow."
    ],
    instructions: [
      "Take a deep breath and start with the 'A' sound from the belly.",
      "Transition to 'U' in the chest and 'M' in the head.",
      "Feel the vibration in the body for 2 seconds after each chant.",
      "Repeat for 21 cycles with eyes closed and focused on the brow point."
    ]
  },
  "Mass PT": {
    rules: [
      "Perfect synchronization with the drum beat or whistle command.",
      "Maintain exactly one arm length distance between students.",
      "Strict discipline in row and column formations.",
      "Unified uniform standards apply."
    ],
    instructions: [
      "Arrange students in rows by standard and height.",
      "Establish commands: 'Attention', 'Stand at Ease', 'Eyes Right'.",
      "Perform the 8 standard Maharashtra State PT exercises in count.",
      "Monitor and correct uniform arm/leg alignment across the group."
    ]
  },
  "Morning Drills": {
    rules: [
      "Strict punctuality (Report to ground by 6:30 AM).",
      "Full institutional sports kit required.",
      "Mandatory 10-minute warm-up before high-intensity drills.",
      "Hydration breaks every 20 minutes."
    ],
    instructions: [
      "Begin with 2 rounds of light rhythmic jogging.",
      "Conduct ABC drills (High knees, Butt kicks, A-skips).",
      "Perform 3 sets of 20m shuttle runs or agility ladder work.",
      "End with 5 minutes of static stretching for injury prevention."
    ]
  },
  "Institutional Games": {
    rules: [
      "Safety is priority - zero tolerance for rough play.",
      "Respect the referee/teacher's final decision without argument.",
      "Ensure maximum inclusion of all students in the class.",
      "Check ground for debris before starting play."
    ],
    instructions: [
      "Explain the basic objective and scoring of the game.",
      "Divide the class into balanced, mixed-ability teams.",
      "Monitor gameplay for injury risks and sportsmanship.",
      "Conclude with a collective debrief and team handshake."
    ]
  },
  "Physical Education Theory": {
    rules: [
      "Bring PE textbooks and institutional notebooks.",
      "Active participation in classroom discussions.",
      "Field equipment is not allowed inside the theory classroom.",
      "No food or water during the lecture."
    ],
    instructions: [
      "Explain the anatomy and physiological benefits of specific exercises.",
      "Discuss the history and international rules of a chosen sport.",
      "Draw diagrams of court layouts (Kabaddi/Volleyball) on board.",
      "Assign weekly fitness tracking goals to students."
    ]
  },
  "Special Camp Activity": {
    rules: [
      "Focus on intensive, high-level technical training.",
      "Students must track nutrition and recovery logs.",
      "Senior students assigned leadership roles for drills.",
      "Report any persistent pain to medical registry immediately."
    ],
    instructions: [
      "Specify goal-oriented drills (e.g., raiding techniques for Kabaddi).",
      "Conduct high-pressure match simulations.",
      "Review technical mistakes immediately after each drill.",
      "End with a group discussion on match tactics and strategy."
    ]
  },
  "Annual Sports Practice": {
    rules: [
      "Grouping by event categories (Jumps, Throws, Runs).",
      "Record every timing/distance for institutional progress tracking.",
      "Equipment must be returned to the store room after practice.",
      "Spikes allowed only on the designated track area."
    ],
    instructions: [
      "Focus on refined start techniques for sprints (Block starts).",
      "Practice technical release phases for Shot Put and Javelin.",
      "Baton exchange drills for relay team synchronization.",
      "Conduct final heat simulations with timing recorded."
    ]
  }
};

const ACTIVITY_TYPES = Object.keys(ACTIVITY_GUIDELINES);

export function SchoolActivities({ store }: { store: any }) {
  const { toast } = useToast();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [std, setStd] = useState("1");
  const [type, setType] = useState(ACTIVITY_TYPES[0]);
  const [duration, setDuration] = useState("30 Mins");
  const [summary, setSummary] = useState("");

  const currentGuidelines = useMemo(() => ACTIVITY_GUIDELINES[type], [type]);

  const handleSave = () => {
    if (!summary) {
      toast({ title: "Summary Required", description: "Please describe the activity summary.", variant: "destructive" });
      return;
    }

    const newActivity = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      std,
      type,
      duration,
      summary,
    };

    store.addActivity(newActivity);
    setSummary("");
    toast({ title: "Activity Logged", description: "Class activity record archived successfully." });
  };

  const handlePrint = (activity: any) => {
    const guid = ACTIVITY_GUIDELINES[activity.type];
    const printContent = `
      <html>
        <head>
          <title>Institutional Activity Report - Std ${activity.std}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #235C36; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #235C36; text-transform: uppercase; margin: 0; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-weight: bold; font-size: 14px; border-bottom: 1px dashed #ddd; padding-bottom: 20px; }
            h3 { color: #1b4b3a; border-left: 5px solid #8AF075; padding-left: 10px; text-transform: uppercase; }
            .section { margin-bottom: 30px; }
            .box { background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-weight: bold; }
            ul { padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>शासकीय माध्यमिक आश्रम शाळा वाघंबा</h1>
            <p style="font-weight: 800;">INSTITUTIONAL PHYSICAL EDUCATION RECORD</p>
          </div>

          <div class="meta">
            <div>Standard: Std ${activity.std}</div>
            <div>Activity Date: ${format(new Date(activity.date), 'PPPP')}</div>
            <div>Session Category: ${activity.type}</div>
            <div>Duration: ${activity.duration}</div>
          </div>

          <div class="section">
            <h3>Protocol Followed</h3>
            <div class="box">
              <p><strong>Rules Applied:</strong></p>
              <ul>${guid.rules.map(r => `<li>${r}</li>`).join('')}</ul>
              <p><strong>Conducting Steps:</strong></p>
              <ul>${guid.instructions.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
          </div>

          <div class="section">
            <h3>Session Observation Summary</h3>
            <div class="box" style="white-space: pre-wrap;">${activity.summary}</div>
          </div>

          <div class="footer">
            <div style="border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 10px;">Physical Education Teacher</div>
            <div style="border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 10px;">Principal Signature</div>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
  };

  const activitiesList = store.data.activities.slice().sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-2 border-primary/10 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-black text-primary uppercase flex items-center gap-2">
              <Plus className="w-5 h-5" /> Log Class Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase ml-2">Activity Category</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-xl border-2 h-14 font-black text-primary bg-accent/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase ml-2">Standard</label>
                <Select value={std} onValueChange={setStd}>
                  <SelectTrigger className="rounded-xl border-2 h-12 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>Std {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase ml-2">Duration</label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45 Mins" className="rounded-xl border-2 h-12 font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase ml-2">Activity Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-2 h-12 font-bold" />
            </div>

            <div className="space-y-4 pt-4 border-t border-dashed">
              <div className="bg-primary/5 p-5 rounded-2xl border-2 border-primary/5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Mandatory Rules</span>
                  </div>
                  <ul className="space-y-1">
                    {currentGuidelines.rules.map((rule, i) => (
                      <li key={i} className="text-[11px] font-bold text-foreground/70 leading-snug">• {rule}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent">
                    <ListOrdered className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">How to Conduct</span>
                  </div>
                  <ul className="space-y-1">
                    {currentGuidelines.instructions.map((inst, i) => (
                      <li key={i} className="text-[11px] font-bold text-foreground/70 leading-snug">{i + 1}. {inst}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase ml-2">Activity Summary</label>
              <Textarea 
                placeholder="Briefly describe today's specific observation..." 
                className="rounded-xl border-2 min-h-[100px] font-medium"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest shadow-lg active-scale">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Archive Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" /> Institutional History
          </h3>
        </div>

        {activitiesList.length === 0 ? (
          <Card className="border-dashed border-4 p-20 flex flex-col items-center text-muted-foreground rounded-[3rem] bg-white/50 opacity-40">
            <Zap className="w-16 h-16 mb-4" />
            <p className="text-xl font-bold uppercase tracking-widest">No activity logs recorded yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activitiesList.map((act: any) => (
              <Card key={act.id} className="border-2 rounded-[2rem] overflow-hidden bg-white shadow-lg group hover:border-primary/20 transition-all">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-primary uppercase tracking-tight">{act.type}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="border-primary/20 text-primary font-bold uppercase text-[9px]">Std {act.std}</Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(act.date), 'dd MMM yyyy')}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {act.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handlePrint(act)} className="h-10 w-10 border-2 rounded-xl text-primary hover:bg-primary/5">
                        <Printer className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => store.deleteActivity(act.id)} className="h-10 w-10 text-destructive hover:bg-destructive/5 rounded-xl">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative pl-6 py-1">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-full" />
                    <p className="text-foreground/80 font-medium leading-relaxed">
                      {act.summary}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
