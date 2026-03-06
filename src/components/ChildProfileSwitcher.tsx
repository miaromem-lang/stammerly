import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Check, Loader2, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChildLink {
  id: string;
  child_user_id: string;
  child_display_name: string;
  is_active: boolean;
}

interface ChildProfileSwitcherProps {
  onChildSelected?: (childId: string | null, childName: string) => void;
}

export const ChildProfileSwitcher = ({ onChildSelected }: ChildProfileSwitcherProps) => {
  const [children, setChildren] = useState<ChildLink[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildEmail, setNewChildEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("parent_child_links")
        .select("id, child_user_id, child_display_name, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const links = (data || []) as ChildLink[];
      setChildren(links);

      if (links.length > 0 && !activeChildId) {
        setActiveChildId(links[0].child_user_id);
        onChildSelected?.(links[0].child_user_id, links[0].child_display_name);
      }
    } catch (err) {
      console.error("Error fetching children:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child: ChildLink) => {
    setActiveChildId(child.child_user_id);
    onChildSelected?.(child.child_user_id, child.child_display_name);
    toast.success(`Switched to ${child.child_display_name}'s profile`);
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) return;
    setAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Look up child by email if provided
      let childUserId = crypto.randomUUID(); // placeholder if no email
      if (newChildEmail.trim()) {
        // We store the link — the child_user_id will be resolved when the child account exists
        // For now we use a placeholder that parents can update later
      }

      const { error } = await (supabase as any)
        .from("parent_child_links")
        .insert({
          parent_user_id: user.id,
          child_user_id: childUserId,
          child_display_name: newChildName.trim(),
        });

      if (error) throw error;

      toast.success(`Added ${newChildName.trim()}'s profile`);
      setNewChildName("");
      setNewChildEmail("");
      setShowAddForm(false);
      fetchChildren();
    } catch (err: any) {
      toast.error(err.message || "Failed to add child profile");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          Child Profiles
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Switch between your children's profiles. Each has separate data and recommendations.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {children.length === 0 && !showAddForm && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No child profiles linked yet. Add your first child below.
          </p>
        )}

        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => handleSelectChild(child)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
              activeChildId === child.child_user_id
                ? "bg-primary/10 border border-primary/30"
                : "bg-secondary/50 hover:bg-secondary border border-transparent"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-accent-orange/20 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-accent-orange" />
            </div>
            <span className="flex-1 font-medium text-sm text-foreground">
              {child.child_display_name}
            </span>
            {activeChildId === child.child_user_id && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Check className="w-3 h-3 mr-1" /> Active
              </Badge>
            )}
          </button>
        ))}

        {showAddForm ? (
          <div className="space-y-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
            <Input
              placeholder="Child's display name"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
            />
            <Input
              placeholder="Child's account email (optional)"
              type="email"
              value={newChildEmail}
              onChange={(e) => setNewChildEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="navy"
                size="sm"
                className="flex-1"
                onClick={handleAddChild}
                disabled={adding || !newChildName.trim()}
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Add Child
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Child Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
