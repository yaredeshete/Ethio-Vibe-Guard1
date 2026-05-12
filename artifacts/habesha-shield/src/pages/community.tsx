import { useState } from "react";
import { Link } from "wouter";
import { useListDiscussions, useCreateDiscussion } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { MessageSquare, PlusCircle, Pin, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const CATEGORIES = ["All", "Music Discussion", "Recommendations", "Community", "Security Awareness", "General"];

export default function Community() {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useListDiscussions({ category: category || undefined, page });
  const createMutation = useCreateDiscussion();

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await createMutation.mutateAsync({ data: { title: newTitle, content: newContent, category: newCategory } });
    setShowCreate(false);
    setNewTitle("");
    setNewContent("");
    refetch();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">Join discussions with Ethiopian music lovers</p>
        </div>
        {user && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" /> Start Discussion
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === (cat === "All" ? "" : cat) ? "default" : "outline"}
            size="sm"
            onClick={() => { setCategory(cat === "All" ? "" : cat); setPage(1); }}
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : data?.discussions && data.discussions.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.discussions.map((d) => (
              <Link key={d.id} href={`/community/${d.id}`}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {d.authorAvatar ? (
                        <img src={d.authorAvatar} className="w-full h-full rounded-full object-cover" alt={d.authorName} />
                      ) : (
                        <span className="text-sm font-bold text-secondary">{d.authorName?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        {d.isPinned && <Pin className="w-3 h-3 text-accent flex-shrink-0" />}
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{d.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{d.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">{d.category}</Badge>
                        <span className="text-xs text-muted-foreground">by {d.authorName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {d.repliesCount}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data.totalPages && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= (data.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No discussions yet. Start one!</p>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start a Discussion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Title (5-200 characters)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== "All").map((cat) => (
                <Button
                  key={cat}
                  variant={newCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="What's on your mind? (10-5000 characters)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newContent.trim() || createMutation.isPending}
            >
              Post Discussion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
