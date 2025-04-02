
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/lib/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const { currentUser, loading } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [photoURL, setPhotoURL] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName
        }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (): string => {
    if (!displayName) return '?';
    return displayName.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoURL} />
                <AvatarFallback className="bg-primary text-white text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm" className="mt-2">
                  Change avatar
                </Button>
              )}
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <Label htmlFor="displayName">Display Name</Label>
                {isEditing ? (
                  <Input 
                    id="displayName" 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)} 
                    placeholder="Your display name" 
                    className="bg-white text-gray-900" 
                  />
                ) : (
                  <div className="py-2 px-3 rounded-md border bg-white text-gray-900">
                    {currentUser?.displayName || 'Not set'}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="py-2 px-3 rounded-md border bg-white text-gray-900">
                  {currentUser?.email || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
              <Pencil className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
