import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft, Mail, Lock, Smile, Users, GraduationCap, Stethoscope, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, AppRole } from "@/hooks/useAuth";
import PageBackground from "@/components/PageBackground";

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);

const hubs = [
  { id: "kid" as AppRole, label: "Kid Hub", icon: Smile, emoji: "🎮" },
  { id: "parent" as AppRole, label: "Parent Hub", icon: Users, emoji: "👨‍👩‍👧" },
  { id: "teacher" as AppRole, label: "Teacher Hub", icon: GraduationCap, emoji: "📚" },
  { id: "therapist" as AppRole, label: "Therapist Hub", icon: Stethoscope, emoji: "🩺" },
];

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signUp, isAuthenticated, role } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; role?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      const from = (location.state as { from?: Location })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const roleToHub: Record<AppRole, string> = {
          kid: '/hub/kid',
          parent: '/hub/parent',
          teacher: '/hub/teacher',
          therapist: '/hub/therapist',
          admin: '/hub/therapist',
        };
        navigate(roleToHub[role], { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location.state]);

  const validateForm = (isSignUp: boolean): boolean => {
    const newErrors: typeof errors = {};

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Validate password
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    // Signup-specific validations
    if (isSignUp) {
      if (!selectedRole) {
        newErrors.role = "Please select your role";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        let message = "Sign in failed. Please try again.";
        if (error.message.includes("Invalid login credentials")) {
          message = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("Email not confirmed")) {
          message = "Please verify your email address before signing in.";
        }
        toast({
          title: "Sign In Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      const { error } = await signUp(email, password, selectedRole);
      
      if (error) {
        let message = "Sign up failed. Please try again.";
        if (error.message.includes("already registered") || error.message.includes("already exists")) {
          message = "This email is already registered. Please sign in instead.";
        } else if (error.message.includes("Password")) {
          message = error.message;
        }
        toast({
          title: "Sign Up Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to Stammerly! Your account has been created.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <PageBackground />
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-2xl">Welcome to Stammerly</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to continue or create a new account
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                        disabled={loading}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-lg font-semibold" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <p className="text-sm font-medium mb-3">Select your role:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {hubs.map((hub) => {
                        const Icon = hub.icon;
                        const isSelected = selectedRole === hub.id;
                        return (
                          <button
                            key={hub.id}
                            type="button"
                            onClick={() => setSelectedRole(hub.id)}
                            disabled={loading}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50"
                            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5" />
                              <span className="text-lg">{hub.emoji}</span>
                            </div>
                            <span className="text-sm font-medium">{hub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                        disabled={loading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                        disabled={loading}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-11 h-12 rounded-xl"
                        required
                        disabled={loading}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-lg font-semibold" 
                    size="lg"
                    disabled={loading || !selectedRole}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
