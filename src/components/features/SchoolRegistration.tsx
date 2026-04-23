"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { School, User, MapPin, ClipboardList, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  teacherName: z.string().min(2, "Teacher name is required"),
  qualification: z.string().min(2, "Qualification is required"),
  role: z.string().min(2, "Role is required"),
  schoolName: z.string().min(5, "School official name is required"),
  taluka: z.string().min(2, "Taluka is required"),
  district: z.string().min(2, "District is required"),
  importantInfo: z.string().optional(),
});

export function SchoolRegistration({ store }: { store: any }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: "",
      qualification: "B.P.Ed / M.P.Ed",
      role: "Physical Education Director",
      schoolName: "",
      taluka: "Satana",
      district: "Nashik",
      importantInfo: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    store.saveSchoolProfile(values);
    toast({
      title: "School Registered",
      description: "Institutional profile has been initialized successfully.",
      className: "bg-primary text-white font-black"
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <Card className="border-0 shadow-2xl rounded-[3.5rem] overflow-hidden bg-white">
        <CardHeader className="bg-primary p-12 text-white text-center space-y-4">
          <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md">
            <School className="w-12 h-12 text-white" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black uppercase tracking-tight">Institutional Setup</CardTitle>
            <p className="text-white/70 font-bold uppercase tracking-widest text-xs mt-2">Initialize Ashram Shala Registry</p>
          </div>
        </CardHeader>
        <CardContent className="p-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Teacher Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b-2 border-primary/10 pb-3">
                    <User className="w-5 h-5" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Coaching Staff Details</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="teacherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Teacher Name (Full)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sunil Deshmukh" className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Qualification</FormLabel>
                          <FormControl>
                            <Input className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Role/Designation</FormLabel>
                          <FormControl>
                            <Input className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* School Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary border-b-2 border-primary/10 pb-3">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-black uppercase text-sm tracking-widest">Institutional Location</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="schoolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Official School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="शासकीय माध्यमिक आश्रम शाळा..." className="rounded-xl border-2 h-12 font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taluka"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Taluka</FormLabel>
                          <FormControl>
                            <Input className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">District</FormLabel>
                          <FormControl>
                            <Input className="rounded-xl border-2 h-12 font-bold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Important Institutional Information (Optional)
                </FormLabel>
                <FormControl>
                  <Input placeholder="Hostel capacity, special sports grants, etc." className="rounded-xl border-2 h-12 font-bold" {...form.register('importantInfo')} />
                </FormControl>
              </div>

              <div className="pt-8 flex justify-center">
                <Button type="submit" className="w-full md:w-80 bg-primary hover:bg-primary/90 text-white rounded-2xl h-16 font-black uppercase tracking-widest shadow-xl active-scale">
                  <Save className="w-5 h-5 mr-3" /> Initialize Hub <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}