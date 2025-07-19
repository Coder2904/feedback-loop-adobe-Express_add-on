// src/sandbox/code.js

import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// -----------------------------------------------------------------------------
// 1. Backend API Configuration (Configurable at runtime if needed)
// -----------------------------------------------------------------------------
const BACKEND_CONFIG = {
  baseUrl: "https://your-backend-api.com", // <- Replace with your backend URL or inject from UI as needed
  apiKey: "<your-api-key>", // <- Secure key; if using real auth, set at runtime
};

// -----------------------------------------------------------------------------
// 2. Utility functions for document analysis & export
// -----------------------------------------------------------------------------
const DocumentUtils = {
  getDocumentInfo: () => {
    const context = editor.context ?? {};
    const document = context.document ?? {};
    const insertionParent = context.insertionParent ?? {};

    return {
      id: document.id || `doc_${Date.now()}`,
      title: document.title || "Untitled Document",
      dimensions: {
        width: document.width ?? 1080,
        height: document.height ?? 1080,
      },
      pages: document.pages ? document.pages.length : 1,
      elements: insertionParent.children ? insertionParent.children.length : 0,
      lastModified: new Date().toISOString(),
      artboards: document.artboards ? document.artboards.length : 0,
    };
  },

  getElementsData: () => {
    const context = editor.context ?? {};
    const insertionParent = context.insertionParent ?? {};
    const children = insertionParent.children ?? [];
    const elements = [];

    (children.forEach ? children : Array.from(children)).forEach(
      (child, index) => {
        elements.push({
          id: child?.id || `element_${index}`,
          type: child?.type || "unknown",
          position: {
            x: child?.translation?.x ?? 0,
            y: child?.translation?.y ?? 0,
          },
          size: {
            width: child?.width ?? 0,
            height: child?.height ?? 0,
          },
          visible: child?.visible !== false,
        });
      }
    );

    return elements;
  },

  generatePreview: async () => {
    try {
      const context = editor.context ?? {};
      const document = context.document ?? {};
      const previewData = {
        documentId: document.id,
        timestamp: new Date().toISOString(),
        elements: DocumentUtils.getElementsData(),
        metadata: DocumentUtils.getDocumentInfo(),
      };
      return previewData;
    } catch (error) {
      console.error("Error generating preview:", error);
      return null;
    }
  },

  exportForReview: async (format = "png") => {
    try {
      const documentInfo = DocumentUtils.getDocumentInfo();
      const elementsData = DocumentUtils.getElementsData();
      // TODO: Use Adobe Express export APIs when available
      return {
        success: true,
        exportId: `export_${Date.now()}`,
        format,
        document: documentInfo,
        elements: elementsData,
        exportUrl: null, // Placeholder; actual URL if export API is called
      };
    } catch (error) {
      console.error("Export error:", error);
      return { success: false, error: error.message };
    }
  },
};

// -----------------------------------------------------------------------------
// 3. Backend Communication Methods
// -----------------------------------------------------------------------------
const BackendAPI = {
  setConfig: ({ baseUrl, apiKey }) => {
    if (baseUrl) BACKEND_CONFIG.baseUrl = baseUrl;
    if (apiKey) BACKEND_CONFIG.apiKey = apiKey;
  },

  createReviewSession: async (documentData, settings) => {
    try {
      const response = await fetch(`${BACKEND_CONFIG.baseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BACKEND_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          document: documentData,
          settings,
          createdAt: new Date().toISOString(),
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Error creating review session:", error);
      throw error;
    }
  },

  getFeedback: async (documentId) => {
    try {
      const response = await fetch(
        `${BACKEND_CONFIG.baseUrl}/api/reviews/${documentId}/feedback`,
        {
          headers: { Authorization: `Bearer ${BACKEND_CONFIG.apiKey}` },
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  },

  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await fetch(
        `${BACKEND_CONFIG.baseUrl}/api/feedback/${feedbackId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BACKEND_CONFIG.apiKey}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating feedback status:", error);
      throw error;
    }
  },

  notifyReviewers: async (reviewId, reviewerEmails) => {
    try {
      const response = await fetch(
        `${BACKEND_CONFIG.baseUrl}/api/reviews/${reviewId}/notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BACKEND_CONFIG.apiKey}`,
          },
          body: JSON.stringify({ reviewers: reviewerEmails }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw error;
    }
  },
};

// -----------------------------------------------------------------------------
// 4. Feedback Monitoring Utilities
// -----------------------------------------------------------------------------
const FeedbackMonitor = {
  intervalId: null,
  startMonitoring: (documentId, callback) => {
    FeedbackMonitor.stopMonitoring();
    FeedbackMonitor.intervalId = setInterval(async () => {
      try {
        const feedback = await BackendAPI.getFeedback(documentId);
        callback(feedback);
      } catch (error) {
        console.error("Error monitoring feedback:", error);
      }
    }, 30000);
  },
  stopMonitoring: () => {
    if (FeedbackMonitor.intervalId) {
      clearInterval(FeedbackMonitor.intervalId);
      FeedbackMonitor.intervalId = null;
    }
  },
};

// -----------------------------------------------------------------------------
// 5. Expose Sandbox API to UI
// -----------------------------------------------------------------------------
function start() {
  const sandboxApi = {
    getDocumentInfo: () => DocumentUtils.getDocumentInfo(),
    generatePreview: () => DocumentUtils.generatePreview(),
    exportForReview: (format) => DocumentUtils.exportForReview(format),

    // Backend calls
    setBackendConfig: BackendAPI.setConfig,
    createReviewSession: async (settings) => {
      try {
        const documentData = DocumentUtils.getDocumentInfo();
        const previewData = await DocumentUtils.generatePreview();
        const reviewSession = await BackendAPI.createReviewSession(
          { ...documentData, preview: previewData },
          settings
        );
        return {
          success: true,
          reviewId: reviewSession.id,
          reviewUrl: reviewSession.url,
          data: reviewSession,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    getFeedback: async (documentId) => {
      try {
        const feedback = await BackendAPI.getFeedback(documentId);
        return { success: true, feedback };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    updateFeedbackStatus: async (feedbackId, status) => {
      try {
        const result = await BackendAPI.updateFeedbackStatus(
          feedbackId,
          status
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    notifyReviewers: async (reviewId, reviewerEmails) => {
      try {
        const result = await BackendAPI.notifyReviewers(
          reviewId,
          reviewerEmails
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Polling/Monitoring
    startFeedbackMonitoring: (documentId, callback) =>
      FeedbackMonitor.startMonitoring(documentId, callback),
    stopFeedbackMonitoring: () => FeedbackMonitor.stopMonitoring(),

    // Document events
    onDocumentChange: (callback) => {
      if (editor && typeof editor.on === "function") {
        editor.on("documentChange", () => {
          callback(DocumentUtils.getDocumentInfo());
        });
      }
    },

    // Simulated user context (stub)
    getCurrentUser: () => ({
      id: "user_123",
      name: "Current User",
      email: "user@example.com",
    }),
  };

  runtime.exposeApi(sandboxApi);
  console.log("Feedback Loop sandbox API initialized");
}

start();
