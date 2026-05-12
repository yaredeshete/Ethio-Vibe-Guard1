import { useState } from "react";
import { Link, useParams } from "wouter";
import { useGetDiscussion, useCreateReply } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, MessageSquare, Pin, Send, UserCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

export default function DiscussionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [reply, setReply] = useState("");

  const { data: discussion, isLoading, refetch } = useGetDiscussion(id!);
  const replyMutation = useCreateReply();

  const handleReply = async () => {
    if (!reply.trim() || !user) return;
    await replyMutation.mutateAsync({ id: id!, data: { content: reply } });
    setReply("");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Discussion not found.</p>
        <Link href="/community"><Button variant="outline" className="mt-4">Back to Community</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/community">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Community
        </Button>
      </Link>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              {discussion.authorAvatar ? (
                <img src={discussion.authorAvatar} className="w-full h-full rounded-full object-cover" alt={discussion.authorName} />
              ) : (
                <span className="text-sm font-bold text-secondary">{discussion.authorName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {discussion.isPinned && <Pin className="w-4 h-4 text-accent" />}
                <h1 className="text-xl font-bold">{discussion.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">by {discussion.authorName}</span>
                <Badge variant="secondary" className="text-xs">{discussion.category}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(discussion.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{discussion.content}</p>
          <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2 border-t">
            <MessageSquare className="w-4 h-4" />
            <span>{discussion.repliesCount} replies</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Replies</h2>

        {discussion.replies && discussion.replies.length > 0 ? discussion.replies.map((r) => (
          <div key={r.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {r.authorAvatar ? (
                <img src={r.authorAvatar} className="w-full h-full rounded-full object-cover" alt={r.authorName} />
              ) : (
                <UserCircle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{r.authorName}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">{r.content}</p>
            </div>
          </div>
        )) : (
          <p className="text-center text-muted-foreground py-6">No replies yet. Be the first to reply!</p>
        )}
      </div>

      {user ? (
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleReply}
              disabled={!reply.trim() || replyMutation.isPending}
              size="sm"
              className="gap-2"
            >
              <Send className="w-4 h-4" /> Post Reply
            </Button>
          </div>
        </div>
      ) : (
        <Card className="text-center p-6">
          <p className="text-muted-foreground mb-4">Sign in to join the discussion</p>
          <Link href="/login"><Button>Sign In</Button></Link>
        </Card>
      )}
    </div>
  );
}
