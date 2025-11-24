import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Database, Film, Code2, GitBranch, Search, ChevronDown, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const sqlRunnerRef = useRef<HTMLDivElement | null>(null);

  const scrollToSqlRunner = () => {
    sqlRunnerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const runQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a SQL query");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("http://localhost:5000/query?q=" + encodeURIComponent(query));
      let data: any;
      try {
        data = await resp.json();
      } catch (e) {
        // If response is not JSON, capture text
        const text = await resp.text();
        setResult(text);
        toast.success("Query executed");
        return;
      }

      setResult(JSON.stringify(data, null, 2));
      toast.success("Query executed successfully");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to execute query";
      setResult(`Error: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Database className="w-8 h-8 text-primary" />,
      title: "Relational Schema",
      description: "Normalized database design with optimized table relationships"
    },
    {
      icon: <GitBranch className="w-8 h-8 text-primary" />,
      title: "ER Diagram",
      description: "Complete entity-relationship model with cardinalities"
    },
    {
      icon: <Search className="w-8 h-8 text-primary" />,
      title: "Complex SQL Queries",
      description: "Advanced queries with joins, subqueries, and aggregations"
    },
    {
      icon: <Code2 className="w-8 h-8 text-primary" />,
      title: "PL/SQL",
      description: "Triggers, functions, and stored procedures for business logic"
    },
    {
      icon: <Film className="w-8 h-8 text-primary" />,
      title: "Views & Indexes",
      description: "Optimized views and strategic indexing for performance"
    },
    {
      icon: <PlayCircle className="w-8 h-8 text-primary" />,
      title: "Real-World Use Cases",
      description: "Streaming analytics, recommendations, and user management"
    }
  ];

  const tables = [
    {
      name: "Users",
      description: "Stores user account information including authentication details",
      fields: ["user_id (PK)", "email", "password_hash", "created_at", "subscription_id (FK)"]
    },
    {
      name: "Subscriptions",
      description: "Manages subscription tiers and pricing information",
      fields: ["subscription_id (PK)", "plan_name", "price", "duration_months", "max_devices"]
    },
    {
      name: "Content",
      description: "Contains movie and TV show metadata",
      fields: ["content_id (PK)", "title", "type", "genre", "release_year", "rating", "duration"]
    },
    {
      name: "Watch_History",
      description: "Tracks user viewing patterns and progress",
      fields: ["watch_id (PK)", "user_id (FK)", "content_id (FK)", "watch_time", "completed", "timestamp"]
    },
    {
      name: "Reviews",
      description: "Stores user ratings and reviews for content",
      fields: ["review_id (PK)", "user_id (FK)", "content_id (FK)", "rating", "comment", "created_at"]
    },
    {
      name: "Devices",
      description: "Manages user devices and streaming sessions",
      fields: ["device_id (PK)", "user_id (FK)", "device_name", "device_type", "last_active"]
    }
  ];

  const plsqlItems = {
    triggers: [
      {
        name: "update_avg_rating",
        description: "Automatically updates content average rating when a new review is added"
      },
      {
        name: "check_device_limit",
        description: "Ensures users don't exceed their subscription's device limit"
      }
    ],
    functions: [
      {
        name: "avg_watch_time",
        description: "Calculates average watch time for a user or content piece"
      },
      {
        name: "subscription_name",
        description: "Returns the subscription plan name for a given user"
      }
    ],
    procedures: [
      {
        name: "add_user",
        description: "Handles new user registration with validation and default subscription"
      },
      {
        name: "top_rated_by_genre",
        description: "Returns top-rated content filtered by genre with ranking"
      },
      {
        name: "user_watch_report",
        description: "Generates comprehensive viewing statistics for a user"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="relative max-w-5xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-primary/20 mb-6">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Database Management System</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            MOVIX
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A movie & streaming relational DBMS built with MySQL + PL/SQL
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
              onClick={scrollToSqlRunner}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Project Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Schema Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Database Schema</h2>
        <div className="space-y-4">
          {tables.map((table, index) => (
            <Collapsible key={index} className="border border-border rounded-lg bg-card">
              <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-lg">{table.name}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 pt-2">
                <p className="text-muted-foreground mb-4">{table.description}</p>
                <div className="bg-secondary rounded-md p-4">
                  <p className="text-sm font-medium mb-2 text-primary">Fields:</p>
                  <ul className="space-y-1">
                    {table.fields.map((field, idx) => (
                      <li key={idx} className="text-sm font-mono text-foreground">• {field}</li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* PL/SQL Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">PL/SQL Components</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plsqlItems.triggers.map((item, idx) => (
                  <div key={idx} className="pb-4 border-b border-border last:border-0">
                    <p className="font-semibold text-sm mb-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Functions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plsqlItems.functions.map((item, idx) => (
                  <div key={idx} className="pb-4 border-b border-border last:border-0">
                    <p className="font-semibold text-sm mb-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                Procedures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plsqlItems.procedures.map((item, idx) => (
                  <div key={idx} className="pb-4 border-b border-border last:border-0">
                    <p className="font-semibold text-sm mb-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SQL Runner Section */}
      <section ref={sqlRunnerRef} className="py-16 px-6 max-w-5xl mx-auto mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">SQL Query Runner</h2>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Execute SQL Queries</CardTitle>
            <CardDescription>Run queries against the MOVIX database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">SQL Query</label>
              <Textarea
                placeholder="SELECT * FROM users LIMIT 10;"
                value={query}
                onChange={(e: any) => setQuery(e.target.value)}
                className="font-mono text-sm min-h-[120px] bg-secondary border-border"
              />
            </div>
            <Button 
              onClick={runQuery} 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Running..." : "Run SQL"}
            </Button>
            {result && (
              <div>
                <label className="text-sm font-medium mb-2 block">Results</label>
                <pre className="bg-secondary rounded-md p-4 text-sm font-mono overflow-x-auto border border-border">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground">
        <p className="text-sm">
          Built with MySQL, PL/SQL, and modern web technologies
        </p>
      </footer>
    </div>
  );
};

export default Index;
