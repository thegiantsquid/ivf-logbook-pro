import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, LayoutDashboard, Shield, Users, Calendar, Clock, CheckCircle2, MessageSquare, Briefcase } from 'lucide-react';
import MedicalCross from '@/components/icons/MedicalCross';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
const LandingPage = () => {
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">LogBook Pro</span>
                <br />
                <span>Streamlining Medical Record Keeping</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Designed for medical professionals worldwide, LogBook Pro helps you track, analyze, and manage patient records with unparalleled ease and security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="px-8" asChild>
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <a href="#features">Explore Features</a>
                </Button>
              </div>
            </div>
            <div className="flex-1 animate-slide-in-from-right">
              <div className="neumorphic rounded-2xl p-2 bg-background/50 backdrop-blur-sm">
                <img alt="Medical professional using LogBook Pro" className="w-full rounded-xl shadow-lg border border-border" src="/lovable-uploads/ff91ab59-4786-476c-8b30-6939ccd9df81.png" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features Available in LogBook Pro</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              LogBook Pro offers tools designed specifically for healthcare providers to manage medical records efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-card hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Medical Records Management</h3>
                <p className="text-muted-foreground">
                  Add, view, and edit patient records with our intuitive interface designed for healthcare workflows.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-card hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Interactive Dashboard</h3>
                <p className="text-muted-foreground">
                  Access key metrics and patient information at a glance with our comprehensive dashboard.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-card hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Data Summaries</h3>
                <p className="text-muted-foreground">
                  View summaries of collected data to identify trends and inform clinical decisions.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-card hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Secure Authentication</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security ensures patient data remains protected and compliant with healthcare standards.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-card hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">User Profile Management</h3>
                <p className="text-muted-foreground">
                  Customize your profile and manage your account settings with ease.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-card hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Subscription Options</h3>
                <p className="text-muted-foreground">
                  Choose the plan that fits your needs with our flexible subscription options.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Medical Professionals Worldwide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See why healthcare providers across different specialties and countries choose LogBook Pro.
            </p>
          </div>

          <Carousel className="mx-auto max-w-4xl">
            <CarouselContent>
              {/* Testimonial 1 */}
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-primary">RC</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. Rebecca Chen</h4>
                      <p className="text-sm text-muted-foreground"> Singapore</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "LogBook Pro has transformed how I manage patient records. The interface is intuitive, and the analytics features help me identify trends that would have otherwise gone unnoticed."
                  </p>
                </div>
              </CarouselItem>

              {/* Testimonial 2 */}
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-primary">JM</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. James Miller</h4>
                      <p className="text-sm text-muted-foreground">General Practitioner, Canada</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "The ability to access patient records securely from anywhere has been invaluable for my practice, especially during telehealth consultations. LogBook Pro is now an essential tool in my daily workflow."
                  </p>
                </div>
              </CarouselItem>

              {/* Testimonial 3 */}
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-primary">AL</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. Amara Leblanc</h4>
                      <p className="text-sm text-muted-foreground">Neurologist, France</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "The collaborative features have enhanced communication within our medical team. We can now efficiently share insights and coordinate patient care across departments."
                  </p>
                </div>
              </CarouselItem>

              {/* Testimonial 4 - NEW */}
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-primary">SK</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. Sarah Kim</h4>
                      <p className="text-sm text-muted-foreground">Pediatrician, South Korea</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "As a pediatrician with a busy practice, LogBook Pro has simplified my record keeping enormously. The dashboard gives me quick insights into my young patients' health trends, helping me provide better care."
                  </p>
                </div>
              </CarouselItem>

              {/* Testimonial 5 - NEW */}
              <CarouselItem>
                <div className="bg-card p-8 rounded-xl border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-primary">MP</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Dr. Miguel Patel</h4>
                      <p className="text-sm text-muted-foreground">Surgeon, Brazil</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "The detailed record-keeping capabilities have been crucial for my surgical practice. Being able to quickly access previous procedures and outcomes helps me provide the best patient care possible."
                  </p>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* For All Medical Professionals Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Every Medical Specialty</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              LogBook Pro adapts to the unique needs of different medical specialties and healthcare settings worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {/* Specialty 1 */}
            <div className="bg-card p-4 rounded-lg border border-border text-center hover:shadow-md transition-all">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">Cardiology</h4>
            </div>

            {/* Specialty 2 */}
            <div className="bg-card p-4 rounded-lg border border-border text-center hover:shadow-md transition-all">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">Pediatrics</h4>
            </div>

            {/* Specialty 3 */}
            <div className="bg-card p-4 rounded-lg border border-border text-center hover:shadow-md transition-all">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">Oncology</h4>
            </div>

            {/* Specialty 4 */}
            <div className="bg-card p-4 rounded-lg border border-border text-center hover:shadow-md transition-all">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">Dermatology</h4>
            </div>

            {/* Specialty 5 */}
            <div className="bg-card p-4 rounded-lg border border-border text-center hover:shadow-md transition-all">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">Psychiatry</h4>
            </div>

            {/* Specialty 6 */}
            <div className="bg-card p-4 rounded-lg border border-border text-center hover:shadow-md transition-all">
              <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">Surgery</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Medical Practice?</h2>
            <p className="text-lg mb-8">
              Join thousands of healthcare professionals worldwide who are streamlining their workflow with LogBook Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8" asChild>
                <Link to="/login">Get Started Today</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8" asChild>
                <Link to="/subscribe">View Pricing</Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">LogBook Pro</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Streamlining medical record keeping for healthcare professionals worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-primary">Features</a></li>
                <li><Link to="/subscribe" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Security</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Support</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">HIPAA Compliance</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LogBook Pro. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;