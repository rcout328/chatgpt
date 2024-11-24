import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BarChart3, ChevronDown, Crown, Home, LineChart, MessageSquare, Search, Send, Target, Users2, Atom, Bell, Settings, HelpCircle, LogOut, Sparkles, Zap, TrendingUp } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"

export default function AdvancedDashboard() {
  const [activeTab, setActiveTab] = useState("prompts")
  const [darkMode, setDarkMode] = useState(true)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    (<div
      className={`min-h-screen bg-gradient-to-br ${darkMode ? 'from-gray-900 to-black' : 'from-gray-100 to-white'} text-gray-100 transition-colors duration-300`}>
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <ScrollArea className="hidden lg:block border-r border-gray-800 p-4 h-screen">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <Crown className="h-8 w-8 text-yellow-500" />
            <span
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Cogent</span>
          </motion.div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500" />
          </div>

          {/* Navigation */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="text-xs uppercase text-gray-400">Dashboard</div>
            <NavItem icon={<Home className="h-4 w-4" />} label="Home" />

            <div className="text-xs uppercase text-gray-400 mt-6">Modules</div>
            <NavItem icon={<BarChart3 className="h-4 w-4" />} label="Market Analysis" />
            <NavItem icon={<Users2 className="h-4 w-4" />} label="Customer Discovery" />
            <NavItem icon={<Target className="h-4 w-4" />} label="Competitive Intelligence" />
            <NavItem icon={<LineChart className="h-4 w-4" />} label="Product Evolution" />
            <NavItem icon={<Atom className="h-4 w-4" />} label="Market Expansion" />

            <div className="text-xs uppercase text-gray-400 mt-6">Operations</div>
            <NavItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="Talk to Agents"
              rightIcon={<Send
                className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />} />
          </motion.div>

          {/* User Section */}
          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg">
              <Avatar className="h-8 w-8 ring-2 ring-purple-500">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>CB</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">crazybot_14ds</div>
                <div className="text-xs text-gray-400">Pro Plan</div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>User settings and options</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        </ScrollArea>

        {/* Main Content */}
        <div className="flex flex-col h-screen">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between p-4 border-b border-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 ring-2 ring-purple-500">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>CEO</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">CEO</span>
                  <span className="text-xs text-gray-400">Strategic planning and coordination</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeaderButton icon={<Bell className="h-4 w-4" />} tooltip="Notifications" />
              <HeaderButton icon={<Settings className="h-4 w-4" />} tooltip="Settings" />
              <HeaderButton icon={<HelpCircle className="h-4 w-4" />} tooltip="Help" />
              <HeaderButton icon={<LogOut className="h-4 w-4" />} tooltip="Log out" />
              <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                {darkMode ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </motion.div>

          {/* Tabs and Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden">
            <div className="border-b border-gray-800">
              <TabsList className="bg-transparent border-b border-gray-800">
                <TabsTrigger value="prompts" className="data-[state=active]:bg-gray-800">Popular Prompts</TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">Chat History</TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-gray-800">AI Insights</TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea className="flex-1">
              <TabsContent value="prompts" className="p-6">
                <motion.div
                  className="grid md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}>
                  <PromptCard
                    icon={<Users2 className="h-5 w-5 text-blue-500" />}
                    title="Customer Satisfaction"
                    content="How satisfied are our customers with our service?" />
                  <PromptCard
                    icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                    title="Online Presence"
                    content="How can we improve our online presence?" />
                  <PromptCard
                    icon={<Target className="h-5 w-5 text-red-500" />}
                    title="Marketing Strategies"
                    content="How effective are our current marketing strategies?" />
                  <PromptCard
                    icon={<BarChart3 className="h-5 w-5 text-yellow-500" />}
                    title="Competitor Analysis"
                    content="What competitors are doing differently?" />
                </motion.div>
              </TabsContent>
              <TabsContent value="history" className="p-6">
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}>
                  <HistoryCard
                    date="Yesterday"
                    title="Q3 Marketing Strategy"
                    content="Discussion about Q3 marketing strategy and budget allocation." />
                  <HistoryCard
                    date="2 days ago"
                    title="Customer Feedback Analysis"
                    content="In-depth analysis of recent customer feedback survey results." />
                </motion.div>
              </TabsContent>
              <TabsContent value="insights" className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Latest AI-Generated Insight
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">Based on recent data analysis, there's a significant opportunity to increase customer retention by 15% through implementing personalized follow-up strategies and enhancing our loyalty program.</p>
                      <div className="mt-4 flex items-center gap-4">
                        <Button variant="outline" size="sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Action Plan
                        </Button>
                        <Button variant="ghost" size="sm">Learn More</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Chat Input */}
          <motion.div
            className="p-4 border-t border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="relative">
              <Input
                placeholder="Let the magic begin, Ask a question"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10 focus:ring-2 focus:ring-purple-500" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-purple-500 hover:text-white transition-colors">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>)
  );
}

function NavItem({
  icon,
  label,
  rightIcon
}) {
  return (
    (<TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-gray-200 hover:bg-gray-800 rounded-lg group transition-colors">
            {icon}
            {label}
            {rightIcon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>)
  );
}

function HeaderButton({
  icon,
  tooltip
}) {
  return (
    (<TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-800 transition-colors">
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>)
  );
}

function PromptCard({
  icon,
  title,
  content
}) {
  return (
    (<Card
      className="bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-gray-300">{content}</p>
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity">
            Use Prompt
          </Button>
        </div>
      </CardContent>
    </Card>)
  );
}

function HistoryCard({
  date,
  title,
  content
}) {
  return (
    (<Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <p className="text-sm text-gray-400 mb-1">{date
}</p>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-gray-300">{content}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">View Details</Button>
        </div>
      </CardContent>
    </Card>)
  );
}

