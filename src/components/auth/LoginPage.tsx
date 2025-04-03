import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  })
});
type LoginFormValues = z.infer<typeof loginSchema>;
const registerSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
type RegisterFormValues = z.infer<typeof registerSchema>;
const LoginPage: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    loading,
    currentUser
  } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  const handleLogin = async (values: LoginFormValues) => {
    await signInWithEmail(values.email, values.password);
  };
  const handleRegister = async (values: RegisterFormValues) => {
    await registerWithEmail(values.email, values.password);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 slide-transition">
          <h1 className="text-3xl font-bold text-primary mb-2">Logbook Pro</h1>
          <p className="text-muted-foreground">Professional tracking for IVF specialists</p>
        </div>
        
        <Card className="glass-card overflow-hidden border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-semibold">Sign In</CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4 px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={loginForm.control} name="password" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Password" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField control={registerForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={registerForm.control} name="password" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Password" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={registerForm.control} name="confirmPassword" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Confirm Password" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pb-6 px-8">
            <Button type="button" className="w-full bg-white hover:bg-gray-50 text-black border shadow-sm" onClick={signInWithGoogle} disabled={loading}>
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Secure access for verified medical professionals only
        </p>
      </div>
    </div>;
};
export default LoginPage;