import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetTrack,
  useListComments,
  useLikeTrack,
  useUnlikeTrack,
  useCreateComment,
  useReportTrack,
} from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Heart, MessageSquare, Flag, ArrowLeft, Send, UserCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

export default function TrackDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const { data: track, isLoading, refetch } = useGetTrack(id!);
  const { data: comments, refetch: refetchComments } = useListComments(id!);
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();
  const commentMutation = useCreateComment();
  const reportMutation = useReportTrack();

  const handleLike = async () => {
    if (!track) return;
    if (track.isLiked) {
      await unlikeMutation.mutateAsync({ id: track.id });
    } else {
      await likeMutation.mutateAsync({ id: track.id });
    }
    refetch();
  };

  const handleComment = async () => {
    if (!comment.trim() || !user) return;
    await commentMutation.mutateAsync({ id: id!, data: { text: comment } });
    setComment("");
    refetchComments();
    refetch();
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    await reportMutation.mutateAsync({ id: id!, data: { reason: reportReason } });
    setShowReport(false);
    setReportReason("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Track not found.</p>
        <Link href="/discover"><Button variant="outline" className="mt-4">Back to Discover</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/discover">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </Button>
      </Link>

      <div className="rounded-xl overflow-hidden border border-border bg-card">
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${track.youtubeId}?rel=0&modestbranding=1`}
            title={track.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{track.title}</h1>
              <Link href={`/artists/${track.artistId}`}>
                <p className="text-muted-foreground hover:text-primary transition-colors cursor-pointer mt-1">
                  {track.artistName}
                </p>
              </Link>
            </div>
            <Badge variant="outline">{track.genre}</Badge>
          </div>

          {track.description && (
            <p className="text-sm text-muted-foreground">{track.description}</p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Button
              variant={track.isLiked ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={handleLike}
              disabled={!user || likeMutation.isPending || unlikeMutation.isPending}
            >
              <Heart className={`w-4 h-4 ${track.isLiked ? "fill-current" : ""}`} />
              {track.likesCount}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 pointer-events-none">
              <MessageSquare className="w-4 h-4" />
              {track.commentsCount}
            </Button>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 ml-auto text-muted-foreground hover:text-destructive"
                onClick={() => setShowReport(!showReport)}
              >
                <Flag className="w-4 h-4" /> Report
              </Button>
            )}
          </div>

          {showReport && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <Button size="sm" onClick={handleReport} disabled={reportMutation.isPending}>Submit</Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Comments</h2>

        {user && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
              />
              <Button size="icon" onClick={handleComment} disabled={!comment.trim() || commentMutation.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {comments && comments.length > 0 ? comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                {c.avatar ? (
                  <img src={c.avatar} className="w-full h-full object-cover rounded-full" alt={c.username} />
                ) : (
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-sm">{c.username}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
