
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Save, Bell, Mail, Shield, Lock } from 'lucide-react';

const Settings = () => {
  const { currentUser } = useAuth();
  
  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: true,
    appNotifications: true,
    marketingEmails: false
  });
  
  const [privacySettings, setPrivacySettings] = React.useState({
    showProfile: true,
    shareData: false
  });
  
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      // In a real app, we would save these settings to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNotifications} 
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, emailNotifications: checked}))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive in-app notifications
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.appNotifications} 
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, appNotifications: checked}))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and updates
                  </p>
                </div>
                <Switch 
                  checked={notificationSettings.marketingEmails} 
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, marketingEmails: checked}))
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy & Data Settings
              </CardTitle>
              <CardDescription>
                Manage your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Show Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your profile information
                  </p>
                </div>
                <Switch 
                  checked={privacySettings.showProfile} 
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({...prev, showProfile: checked}))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymous usage data to help improve our services
                  </p>
                </div>
                <Switch 
                  checked={privacySettings.shareData} 
                  onCheckedChange={(checked) => 
                    setPrivacySettings(prev => ({...prev, shareData: checked}))
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label className="text-base">Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
                <Button variant="outline" className="w-full sm:w-auto mt-2">
                  Update Password
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="w-full sm:w-auto mt-2">
                  Enable 2FA
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label className="text-base">Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Manage and log out from active sessions
                </p>
                <Button variant="outline" className="w-full sm:w-auto mt-2">
                  Manage Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
