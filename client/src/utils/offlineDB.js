// offlineDB.js
// IndexedDB for storing hospitals + retrieving offline

const DB_NAME = "AsteriaAI_DB";
const STORE_NAME = "hospitals";
const DB_VERSION = 1;

// --------------------------------------------------
// OPEN DATABASE
// --------------------------------------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --------------------------------------------------
// SAVE HOSPITAL ARRAY OFFLINE
// --------------------------------------------------
export async function saveOfflineHospitals(hospitals) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  hospitals.forEach((h) => {
    store.put(h); // insert or update
  });

  return tx.complete;
}

// --------------------------------------------------
// GET ALL HOSPITALS OFFLINE
// --------------------------------------------------
export async function getOfflineHospitals() {
  const db = await openDB();

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve([]);
  });
}

// --------------------------------------------------
// CLEAR OFFLINE CACHE (optional)
// --------------------------------------------------
export async function clearOfflineHospitals() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  store.clear();
  return tx.complete;
}
