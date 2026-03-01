import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Edit2, Loader2, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { CardSkeleton } from "../components/LoadingSpinner";
import { SubjectTagBadge } from "../components/SubjectTagBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetMyProfile,
  useGetStudyPosts,
  useUpdateProfile,
} from "../hooks/useQueries";
import { formatRelativeTime, getInitials } from "../utils/timeUtils";

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const { data: allPosts, isLoading: postsLoading } = useGetStudyPosts();
  const updateProfile = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", bio: "" });

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setForm({ displayName: profile.displayName, bio: profile.bio });
    }
  }, [profile]);

  // Prompt setup if no profile
  useEffect(() => {
    if (!profileLoading && identity && !profile) {
      setEditing(true);
    }
  }, [profileLoading, identity, profile]);

  const currentPrincipal = identity?.getPrincipal().toString();
  const myPosts = (allPosts ?? []).filter(
    (p) => p.author.toString() === currentPrincipal,
  );

  const handleSave = async () => {
    const trimmedName = form.displayName.trim();
    if (!trimmedName) {
      toast.error("Display name is required");
      return;
    }
    if (trimmedName.length < 3) {
      toast.error("Display name must be at least 3 characters");
      return;
    }
    if (trimmedName.length > 30) {
      toast.error("Display name must be 30 characters or less");
      return;
    }
    if (form.bio.length > 200) {
      toast.error("Bio must be 200 characters or less");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        displayName: trimmedName,
        bio: form.bio,
      });
      toast.success("Profile saved!");
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Failed to save profile");
    }
  };

  const initials = getInitials(profile?.displayName || form.displayName || "U");

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Profile
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your campus identity
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-xl font-bold font-heading">
                {initials}
              </div>

              {profileLoading ? (
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              ) : profile ? (
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground">
                    {profile.displayName}
                  </h2>
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs border-primary/30 text-primary"
                  >
                    {profile.role || "Student"}
                  </Badge>
                </div>
              ) : (
                <div>
                  <h2 className="font-heading font-bold text-xl text-muted-foreground">
                    New Student
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set up your profile below
                  </p>
                </div>
              )}
            </div>

            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="border-border"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {editing ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="display-name">Display Name *</Label>
                <Input
                  id="display-name"
                  placeholder="Your full name"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself — year, branch, interests..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="bg-secondary border-border resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
                {profile && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        displayName: profile.displayName,
                        bio: profile.bio,
                      });
                    }}
                    className="border-border"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {profile?.bio ? (
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No bio added yet.
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">
                  {currentPrincipal
                    ? `${currentPrincipal.slice(0, 20)}...`
                    : "Anonymous"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Study Posts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-heading font-semibold text-foreground">
            My Study Posts
          </h2>
          <span className="text-muted-foreground text-sm">
            ({myPosts.length})
          </span>
        </div>

        {postsLoading ? (
          <div className="space-y-3">
            {(["sk-a", "sk-b"] as const).map((k) => (
              <CardSkeleton key={k} />
            ))}
          </div>
        ) : myPosts.length === 0 ? (
          <EmptyState
            icon={<BookOpen />}
            title="No study posts yet"
            description="Share your first study material to help fellow students."
          />
        ) : (
          <div className="space-y-3">
            {myPosts.map((post, idx) => (
              <motion.div
                key={String(post.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-border bg-card campus-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-medium text-foreground line-clamp-1">
                        {post.title}
                      </h3>
                      <SubjectTagBadge
                        tag={post.subjectTag}
                        className="flex-shrink-0"
                      />
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(post.timestamp)}</span>
                      <span>·</span>
                      <span>{post.likes.length} likes</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
