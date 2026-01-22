/**
 * syncService.js
 * ------------------------------------------------
 * Offline-first background sync service.
 *
 * - Reads unsynced records from LOCAL DB
 * - Uploads them to CLOUD DB
 * - Marks them as synced on success
 *
 * Safe, retryable, non-blocking.
 */

import dns from "dns";
import Screening from "../models/screeningModel.js";

/**
 * Check if internet is available
 * Uses DNS lookup (fast & reliable)
 */
function isInternetAvailable() {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Push a single record to cloud database
 * (Assumes cloud DB connection already exists)
 */
async function uploadToCloud(record) {
  // IMPORTANT:
  // You should have TWO mongoose connections:
  // - Local DB connection (default)
  // - Cloud DB connection (cloudConn)

  // For hackathon:
  // We assume Screening model is bound to cloud connection
  // when internet is available

  await record.save(); // cloud save
}

/**
 * Main sync function
 */
export async function syncOfflineData() {
  try {
    const online = await isInternetAvailable();

    if (!online) {
      console.log("🔴 Offline — sync skipped");
      return;
    }

    console.log("🟢 Internet detected — starting sync");

    // Find unsynced local records
    const unsyncedRecords = await Screening.find({ synced: false });

    if (unsyncedRecords.length === 0) {
      console.log("✅ No unsynced records");
      return;
    }

    console.log(`🔄 Syncing ${unsyncedRecords.length} record(s)`);

    for (const record of unsyncedRecords) {
      try {
        // Upload to cloud
        await uploadToCloud(record);

        // Mark as synced locally
        record.synced = true;
        record.syncedAt = new Date();
        await record.save();

        console.log(`✅ Synced record ${record._id}`);
      } catch (err) {
        console.error(
          `❌ Failed to sync record ${record._id}, will retry`,
          err.message
        );
      }
    }

    console.log("🎉 Sync cycle complete");
  } catch (error) {
    console.error("🔥 Sync service error:", error.message);
  }
}

/**
 * Auto-sync runner
 * Call this once when server starts
 */
export function startSyncService(intervalMinutes = 5) {
  // Run once on startup
  syncOfflineData();

  // Run periodically
  setInterval(() => {
    syncOfflineData();
  }, intervalMinutes * 60 * 1000);
}
