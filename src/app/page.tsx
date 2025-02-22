"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useState } from "react";

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-background to-primary/5 overflow-hidden">
        <div className="container relative px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] items-center gap-8">
            {/* Left floating card */}
            <div className="hidden lg:block">
              <div className="animate-float-slow">
                <Card className="w-[280px] bg-card/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Today&apos;s Quote</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">&ldquo;The only way to do great work is to love what you do.&rdquo;</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Center content */}
            <div className="flex flex-col items-center space-y-4 text-center lg:col-start-2">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Digital Journal for
                  <span className="text-primary"> Mindful Reflection</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Track your moods, capture your thoughts, and discover AI-powered insights to help you grow and stay positive.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">Get Started</Button>
                <Button size="lg" variant="outline">Learn More</Button>
              </div>
            </div>

            {/* Right floating card */}
            <div className="hidden lg:block">
              <div className="animate-float">
                <Card className="w-[280px] bg-card/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Mood Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-full rounded-full bg-primary/20">
                        <div className="h-3 w-3/4 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-sm">Positive</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Get personalized insights and sentiment analysis from your journal entries.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>Mood Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Visualize your emotional journey with interactive mood boards and analytics.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle>Daily Inspiration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Receive AI-generated quotes and prompts to inspire your daily reflections.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Preview Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Track Your Journey</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <Card className="w-full md:w-auto bg-card/95">
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Your Mood History</h3>
              <div className="space-y-2">
                {["😊 Happy", "😌 Calm", "🤔 Thoughtful", "😴 Tired"].map((mood, i) => (
                  <HoverCard key={i}>
                    <HoverCardTrigger asChild>
                      <div className="p-3 bg-card/95 rounded-lg cursor-pointer hover:bg-accent/10 transition-colors">
                        {mood}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      View your journal entries and insights for days when you felt {mood.split(" ")[1]}
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
