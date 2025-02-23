"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f4f0e5]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="container relative px-4 md:px-6 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] items-center gap-8 w-full">
            {/* Left floating card - Recent Journal Entry + Hopper's Tip */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="animate-float-slow"
              >
                <Card className="w-[280px] bg-white/90 backdrop-blur shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Journal Entry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">
                      &ldquo;Reflecting on today&apos;s achievements. Completed that project I&apos;ve been working on and treated myself to a nice dinner. Small wins matter! 🌟&rdquo;
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Hopper&apos;s Tip: Remember to celebrate your small victories. They add up to big successes!
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Center content */}
            <div className="flex flex-col items-center space-y-6 text-center lg:col-start-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <motion.img
                    src="/assets/hoppers/hopperhappy.png"
                    alt="Hopper"
                    className="w-full h-full object-contain"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Meet <span className="text-primary">Hopper</span>,<br />
                  Your Journal Companion
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Write your daily thoughts and let Hopper help you track your emotional journey with caring responses and mood insights.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-x-4"
              >
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/login')}
                >
                  Start Journaling
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => {
                    const element = document.getElementById('features');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See How It Works
                </Button>
              </motion.div>
            </div>

            {/* Right floating card - Mood Calendar Preview + User's Achievements */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="animate-float"
              >
                <Card className="w-[280px] bg-white/90 backdrop-blur shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Mood Calendar Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                      {["Happy", "Calm", "Reflective", "Peaceful", "Happy", "Calm", "Reflective"].map((mood, i) => {
                        const moodColors: Record<string, string> = {
                          Happy: "bg-yellow-100",
                          Calm: "bg-blue-100",
                          Reflective: "bg-purple-100",
                          Peaceful: "bg-green-100",
                        };
                        return (
                          <div
                            key={i}
                            className={`h-8 w-8 rounded-md flex items-center justify-center ${moodColors[mood]}`}
                          >
                            <span className="text-xs text-gray-700">{i + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                        <span>Happy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                        <span>Calm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-100 rounded-full"></div>
                        <span>Reflective</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                        <span>Peaceful</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 relative z-10">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How Hopper Helps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Daily Journaling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Write your thoughts freely with timestamp tracking and easy editing tools.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Mood Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visual calendar with color-coded moods to track your emotional journey.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🐰</span>
                    AI Companion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hopper responds with empathy and provides emotional support based on your entries.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Experience Hopper</h2>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/90 rounded-2xl shadow-xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Side: Calendar Preview */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-bold text-xl mb-4 text-gray-800">Calendar</h3>
                    <div className="grid grid-cols-7 text-center font-bold mb-2 text-gray-700 text-sm">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const moodColors = [
                          "bg-yellow-100",
                          "bg-blue-100",
                          "bg-purple-100",
                          "bg-green-100",
                          "bg-white"
                        ];
                        const moods = ["Happy", "Calm", "Reflective", "Peaceful", ""];
                        const moodIndex = Math.floor(Math.random() * 5);
                        
                        return (
                          <div
                            key={i}
                            className={`h-14 border border-gray-200 rounded-md flex flex-col items-center justify-center ${moodColors[moodIndex]}`}
                          >
                            <span className="text-sm font-medium">{i + 1}</span>
                            {moods[moodIndex] && (
                              <span className="text-xs text-gray-600">{moods[moodIndex]}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hopper Response */}
                  <motion.div 
                    className="flex items-start gap-4"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src="/assets/hoppers/hopperhappy.png"
                        alt="Happy Hopper"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="relative bg-white rounded-xl shadow-lg p-4 flex-1">
                      <p className="text-sm text-gray-700">
                        I notice you&apos;ve been feeling more peaceful lately! It&apos;s wonderful to see you taking time for reflection. Would you like to share more about what&apos;s bringing you this sense of calm? 🌟
                      </p>
                      <div className="absolute left-[-8px] top-4 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-200"></div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Side: Journal Preview */}
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-gray-800">Journal Entry</h3>
                  
                  {/* Sample Entries */}
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-white">
                      <p className="text-sm text-gray-500 mb-1">Today, 7:30 AM</p>
                      <p className="text-sm text-gray-800">Had a peaceful meditation session this morning. It&apos;s amazing how just 10 minutes of mindfulness can change the entire day&apos;s perspective.</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-white">
                      <p className="text-sm text-gray-500 mb-1">Today, 10:15 AM</p>
                      <p className="text-sm text-gray-800">Started the day with a warm cup of tea and some journaling. The morning sunshine through my window feels like a gentle reminder that every day is a fresh start.</p>
                    </div>

                    <div className="p-3 border rounded-lg bg-white">
                      <p className="text-sm text-gray-500 mb-1">Today, 8:45 PM</p>
                      <p className="text-sm text-gray-800">Reflecting on today&apos;s achievements. Completed that project I&apos;ve been working on and treated myself to a nice dinner. Small wins matter! 🌟</p>
                    </div>
                  </div>

                  {/* Disabled Input Preview */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-400 cursor-not-allowed">
                      Type your journal entry here...
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        className="bg-gray-100 text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        Save Entry
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-white/80 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold mb-1">Color-Coded Moods</h4>
                <p className="text-sm text-gray-600">Visualize your emotional journey with our intuitive color system</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">💭</div>
                <h4 className="font-semibold mb-1">Thoughtful Responses</h4>
                <p className="text-sm text-gray-600">Receive caring insights from Hopper based on your entries</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/80 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">📅</div>
                <h4 className="font-semibold mb-1">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Watch your journey unfold day by day</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground">
              Join Hopper today and begin your mindful journaling practice with a supportive companion by your side.
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => router.push('/login')}
            >
              Get Started with Hopper
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}