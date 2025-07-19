// FeedbackLoopAddOn.jsx
import React, { useState, useEffect } from "react";
import {
  Link,
  Bell,
  Send,
  Settings,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import "./App.css";

const BACKEND_URL = "http://localhost:3001"; // Update when deployed!

const FeedbackLoopAddOn = ({ sandboxProxy }) => {
  // State hooks
  const [projectData, setProjectData] = useState(null);
  const [reviewLink, setReviewLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    allowAnonymous: true,
    requireLogin: false,
    deadline: "",
    emailNotifications: true,
  });

  // Fetch project data on mount
  useEffect(() => {
    if (sandboxProxy?.getDocumentInfo) {
      sandboxProxy.getDocumentInfo().then((info) => {
        setProjectData({
          id: info.id,
          title: info.title,
          dimensions: `${info.dimensions.width}x${info.dimensions.height}`,
          lastModified: new Date(info.lastModified).toLocaleDateString(),
        });
      });
    }
  }, [sandboxProxy]);

  // Fetch feedback when tab switches or new review generated
  useEffect(() => {
    if (activeTab === "feedback" && projectData?.id) fetchFeedback();
    // eslint-disable-next-line
  }, [activeTab, projectData?.id]);

  // Fetch feedback API
  const fetchFeedback = async () => {
    if (!projectData?.id) return;
    const res = await fetch(
      `${BACKEND_URL}/api/reviews/${projectData.id}/feedback`
    );
    const data = await res.json();
    setFeedbackList(data.data || []);
  };

  // POST: create review session
  const generateReviewLink = async () => {
    setIsGenerating(true);
    const document = await sandboxProxy.getDocumentInfo();
    const preview = await sandboxProxy.generatePreview();
    const reviewers = settings.reviewerEmails
      ?.split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const res = await fetch(`${BACKEND_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document,
        preview,
        settings: { ...settings, reviewerEmails: reviewers },
        userId: "user-creator-demo",
      }),
    });
    const result = await res.json();
    setReviewLink(result.url);
    setIsGenerating(false);
  };

  // POST: submit feedback from UI form
  const [feedbackForm, setFeedbackForm] = useState({
    type: "suggestion",
    priority: "medium",
    message: "",
    reviewer: { name: "", email: "" },
  });
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message.trim()) return;
    setSendingFeedback(true);
    const res = await fetch(
      `${BACKEND_URL}/api/reviews/${projectData.id}/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedbackForm,
          documentId: projectData.id,
        }),
      }
    );
    const { data: newFeedback } = await res.json();
    setFeedbackList((list) => [newFeedback, ...list]);
    setFeedbackForm({
      type: "suggestion",
      priority: "medium",
      message: "",
      reviewer: { name: "", email: "" },
    });
    setSendingFeedback(false);
  };

  // PATCH: resolve feedback
  const markFeedbackResolved = async (feedbackId) => {
    await fetch(`${BACKEND_URL}/api/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    setFeedbackList((list) =>
      list.map((item) =>
        item._id === feedbackId ? { ...item, status: "resolved" } : item
      )
    );
  };

  // Helper icons and status CSS
  const getTypeIcon = (type) => {
    switch (type) {
      case "bug":
        return <AlertCircle className="icon bug" />;
      case "suggestion":
        return <MessageSquare className="icon suggestion" />;
      case "compliment":
        return <CheckCircle className="icon compliment" />;
      default:
        return <MessageSquare className="icon default" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "resolved":
        return "badge badge-resolved";
      case "acknowledged":
        return "badge badge-acknowledged";
      case "pending":
      default:
        return "badge badge-pending";
    }
  };

  return (
    <div className="addon-wrapper">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo-section">
            <Link className="icon" />
            <h1>Feedback Loop</h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)}>
            <Settings className="icon" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-panel">
            <div className="panel-header">
              <h3>Review Settings</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="icon close" />
              </button>
            </div>
            <div className="panel-body">
              <label>
                <input
                  type="checkbox"
                  checked={settings.allowAnonymous}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      allowAnonymous: e.target.checked,
                    }))
                  }
                />
                Allow anonymous feedback
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.requireLogin}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      requireLogin: e.target.checked,
                    }))
                  }
                />
                Require login
              </label>
              <label>
                Review deadline:
                <input
                  type="date"
                  value={settings.deadline}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                />
                Enable email notifications
              </label>
              <label>
                Reviewer emails (comma separated):
                <input
                  type="text"
                  value={settings.reviewerEmails || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      reviewerEmails: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="panel-footer">
              <button onClick={() => setShowSettings(false)}>Cancel</button>
              <button
                className="primary"
                onClick={() => setShowSettings(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "create" ? "tab active" : "tab"}
          onClick={() => setActiveTab("create")}
        >
          <Plus className="icon" /> Create Link
        </button>
        <button
          className={activeTab === "feedback" ? "tab active" : "tab"}
          onClick={() => setActiveTab("feedback")}
        >
          <Bell className="icon" />
          Feedback
          {feedbackList.some((f) => f.status === "pending") && (
            <span className="notification-dot"></span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Tab: Create Review Link */}
        {activeTab === "create" && (
          <div className="tab-content">
            <div className="card project-info">
              <h3>Project</h3>
              {projectData ? (
                <>
                  <p>
                    <strong>Title:</strong> {projectData.title}
                  </p>
                  <p>
                    <strong>Dimensions:</strong> {projectData.dimensions}
                  </p>
                  <p>
                    <strong>Last Modified:</strong> {projectData.lastModified}
                  </p>
                </>
              ) : (
                <p>Loading project info…</p>
              )}
            </div>

            <button
              className={`generate-button ${isGenerating ? "disabled" : ""}`}
              onClick={generateReviewLink}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Create Review Link"}{" "}
              <Send className="icon" />
            </button>

            {reviewLink && (
              <div className="card review-link-box">
                <p className="success-title">Link Generated!</p>
                <div className="link-wrapper">
                  <input type="text" value={reviewLink} readOnly />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(reviewLink);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                  >
                    {linkCopied ? (
                      <CheckCircle className="icon copied" />
                    ) : (
                      <Copy className="icon" />
                    )}
                  </button>
                </div>
                <p>Share this link to collect feedback from reviewers.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Feedback display, submission & resolve */}
        {activeTab === "feedback" && (
          <div className="tab-content">
            <form className="feedback-form" onSubmit={submitFeedback}>
              <select
                value={feedbackForm.type}
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug</option>
                <option value="compliment">Compliment</option>
              </select>
              <select
                value={feedbackForm.priority}
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                placeholder="Your name"
                value={feedbackForm.reviewer.name}
                onChange={(e) =>
                  setFeedbackForm((f) => ({
                    ...f,
                    reviewer: { ...f.reviewer, name: e.target.value },
                  }))
                }
              />
              <input
                placeholder="Your email"
                value={feedbackForm.reviewer.email}
                onChange={(e) =>
                  setFeedbackForm((f) => ({
                    ...f,
                    reviewer: { ...f.reviewer, email: e.target.value },
                  }))
                }
              />
              <textarea
                placeholder="Feedback"
                value={feedbackForm.message}
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, message: e.target.value }))
                }
                required
              />
              <button type="submit" disabled={sendingFeedback}>
                {sendingFeedback ? "Sending..." : "Submit Feedback"}
              </button>
            </form>

            <h3 className="section-title">Feedback ({feedbackList.length})</h3>

            {feedbackList.map((feedback) => (
              <div className="card feedback-card" key={feedback._id}>
                <div className="feedback-header">
                  <div className="icon-area">
                    {getTypeIcon(feedback.type)}
                    <span className={`priority ${feedback.priority}`}>
                      {feedback.priority}
                    </span>
                  </div>
                  <div className="timestamp">
                    <Clock className="icon" />{" "}
                    {new Date(feedback.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="feedback-body">
                  <p>{feedback.message}</p>
                  <small>- {feedback.reviewer?.name || "Anonymous"}</small>
                </div>
                <div className="feedback-footer">
                  {feedback.status === "pending" && (
                    <button
                      className="resolve"
                      onClick={() => markFeedbackResolved(feedback._id)}
                    >
                      Mark Resolved
                    </button>
                  )}
                  <span className={getStatusBadgeClass(feedback.status)}>
                    {feedback.status}
                  </span>
                </div>
              </div>
            ))}
            {!feedbackList.length && <p>No feedback yet.</p>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <p>Feedback Loop v1.0</p>
        <p className="status-indicator">🟢 Connected</p>
      </div>
    </div>
  );
};

export default FeedbackLoopAddOn;
