import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Car, MapPin, Calendar, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

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
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <h1 className="text-2xl font-bold text-functional-gray">
          My Car Searches
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your dealer outreach sessions
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* New Session Button */}
        <button
          onClick={() => navigate("/sessions/new")}
          className="w-full bg-toyoda-red text-white py-4 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-md"
        >
          <Plus size={24} />
          New Car Search
        </button>

        {/* Sessions List */}
        {!sessions && (
          <div className="text-center py-12 text-gray-500">
            Loading your sessions...
          </div>
        )}

        {sessions && sessions.length === 0 && (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No car searches yet</p>
            <p className="text-sm text-gray-500 mt-2">
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
        return "bg-gray-100 text-gray-700";
      case "fetching":
        return "bg-blue-100 text-blue-700";
      case "ready":
        return "bg-green-100 text-green-700";
      case "calling":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div onClick={onClick} className="flex-1 cursor-pointer">
          <h3 className="font-bold text-lg text-functional-gray">
            {session.model} {session.version}
          </h3>
          <p className="text-sm text-gray-600 capitalize">{session.carType}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}
          >
            {session.status}
          </span>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete session"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div
        onClick={onClick}
        className="flex items-center gap-4 text-sm text-gray-600 cursor-pointer"
      >
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{session.zipCode}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{formatDate(session.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
