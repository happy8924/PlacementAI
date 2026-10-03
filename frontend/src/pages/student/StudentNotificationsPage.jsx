import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import StudentHeader from '../../components/student/StudentHeader';
import { Bell, Sparkles, Inbox, CheckCircle2, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { getStudentNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/student';
import { Link } from 'react-router-dom';

export default function StudentNotificationsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      const data = await getStudentNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      <StudentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader
          title="Notifications"
          subtitle="Stay updated with placement alerts, drive updates, and system notices"
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg p-6 rounded-2xl border border-theme shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-primary tracking-tight flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </h2>
                <p className="text-sm text-secondary">
                  Recent activities and alerts
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card-bg rounded-2xl border border-theme">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-4 text-secondary text-sm">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-6 text-center">
              <p>{error}</p>
              <button onClick={fetchNotifications} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600">Retry</button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-card-bg border border-theme rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="max-w-md mx-auto p-6 bg-secondary/50 rounded-2xl border border-theme space-y-3">
                <Inbox className="w-8 h-8 text-secondary mx-auto" />
                <p className="text-sm font-mono font-bold text-primary uppercase tracking-wider">
                  No New Notifications
                </p>
                <p className="text-sm text-secondary">
                  Your inbox is clean! You have no unread notifications or campus announcements at the moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-card-bg border border-theme rounded-2xl shadow-sm overflow-hidden divide-y divide-theme">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-6 flex flex-col sm:flex-row gap-5 transition-colors hover:bg-secondary/5 ${!notification.is_read ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-base flex items-center gap-2 ${!notification.is_read ? 'font-bold text-primary' : 'font-medium text-secondary'}`}>
                        {!notification.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                        {notification.action === 'applied_to_job' 
                          ? `Application Submitted: ${notification.details?.job_title || 'Job'}` 
                          : notification.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                    </div>
                    {notification.details?.company_name && (
                      <p className="text-sm text-primary font-medium">{notification.details.company_name}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs font-medium text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(notification.timestamp).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1.5 rounded-lg border border-theme text-xs font-semibold text-secondary hover:text-primary hover:bg-secondary/10 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.action === 'applied_to_job' && notification.details?.job_id && (
                      <Link 
                        to="/student/applications"
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors"
                        title="View Application"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
