// FeedbackLoopAddOn.jsx
import React, { useState, useEffect } from "react";
import "./App.css"; //

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

const FeedbackLoopAddOn = () => {
  const [projectData, setProjectData] = useState({
    title: "Brand Guidelines Template",
    id: "proj_123456",
    dimensions: "1080x1080",
    lastModified: new Date().toLocaleDateString(),
  });

  const [reviewLink, setReviewLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 1,
      type: "suggestion",
      priority: "high",
      message: "The logo seems too small in the header",
      reviewer: "Sarah Johnson",
      timestamp: "2 hours ago",
      status: "pending",
    },
    {
      id: 2,
      type: "compliment",
      priority: "low",
      message: "Love the color scheme! Very professional.",
      reviewer: "Mike Chen",
      timestamp: "3 hours ago",
      status: "acknowledged",
    },
    {
      id: 3,
      type: "bug",
      priority: "medium",
      message: "Text alignment issue in the footer section",
      reviewer: "Alex Rivera",
      timestamp: "5 hours ago",
      status: "pending",
    },
  ]);

  const [activeTab, setActiveTab] = useState("create");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    allowAnonymous: true,
    requireLogin: false,
    deadline: "",
    emailNotifications: true,
  });

  const generateReviewLink = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedLink = `https://express.ly/review/${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setReviewLink(generatedLink);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const markFeedbackResolved = (id) => {
    setFeedbackList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "resolved" } : item
      )
    );
  };

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
        {activeTab === "create" && (
          <div className="tab-content">
            <div className="card project-info">
              <h3>Project</h3>
              <p>
                <strong>Title:</strong> {projectData.title}
              </p>
              <p>
                <strong>Dimensions:</strong> {projectData.dimensions}
              </p>
              <p>
                <strong>Last Modified:</strong> {projectData.lastModified}
              </p>
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
                  <button onClick={() => copyToClipboard(reviewLink)}>
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

        {activeTab === "feedback" && (
          <div className="tab-content">
            <h3 className="section-title">Feedback ({feedbackList.length})</h3>

            {feedbackList.map((feedback) => (
              <div className="card feedback-card" key={feedback.id}>
                <div className="feedback-header">
                  <div className="icon-area">
                    {getTypeIcon(feedback.type)}
                    <span className={`priority ${feedback.priority}`}>
                      {feedback.priority}
                    </span>
                  </div>
                  <div className="timestamp">
                    <Clock className="icon" /> {feedback.timestamp}
                  </div>
                </div>
                <div className="feedback-body">
                  <p>{feedback.message}</p>
                  <small>- {feedback.reviewer}</small>
                </div>
                <div className="feedback-footer">
                  {feedback.status === "pending" && (
                    <button
                      className="resolve"
                      onClick={() => markFeedbackResolved(feedback.id)}
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
