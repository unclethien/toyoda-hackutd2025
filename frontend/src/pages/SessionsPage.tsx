import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Car, MapPin, Calendar, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SessionsPage = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const sessions = useQuery(
    api.sessions.listMine,
    user?.sub ? { userId: user.sub } : "skip"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">
          My Car Searches
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your dealer outreach sessions
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* New Session Button */}
        <Button
          onClick={() => navigate("/sessions/new")}
          size="lg"
          className="w-full"
        >
          <Plus className="h-5 w-5" />
          New Car Search
        </Button>

        {/* Sessions List */}
        {!sessions && (
          <div className="text-center py-12 text-muted-foreground">
            Loading your sessions...
          </div>
        )}

        {sessions && sessions.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground">No car searches yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first session to get started
            </p>
          </div>
        )}

        {sessions && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onClick={() => navigate(`/sessions/${session._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: {
    _id: string;
    model: string;
    version: string;
    carType: string;
    zipCode: string;
    status: string;
    createdAt: number;
  };
  onClick: () => void;
}

const SessionCard = ({ session, onClick }: SessionCardProps) => {
  const deleteSession = useMutation(api.sessions.remove);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (
      confirm(`Delete this search for ${session.model} ${session.version}?`)
    ) {
      try {
        await deleteSession({ id: session._id as Id<"sessions"> });
      } catch (error) {
        console.error("Failed to delete session:", error);
        alert("Failed to delete session. Please try again.");
      }
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "fetching":
        return "default";
      case "ready":
        return "default";
      case "calling":
        return "default";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">
              {session.model} {session.version}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">{session.carType}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(session.status) as any}>
              {session.status}
            </Badge>
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{session.zipCode}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(session.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
