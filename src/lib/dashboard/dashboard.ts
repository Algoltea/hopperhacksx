import { db } from '@/lib/firebase';
import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  CollectionReference,
  setDoc
} from 'firebase/firestore';

// Types for our data structure
export interface Note {
  id: string;
  content: string;
  analysis: string;
  confidence: number;
  createdAt: Timestamp;
  hopperEmotion: string;
  hopperResponse: string;
  mood: string;
}

export interface DayEntry {
  id: string;
  analysis: string;
  confidence: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  hopperEmotion: string;
  hopperResponse: string;
  mood: string;
  notes: Note[];
}

// Helper function to get the dates collection for a user
const getDatesCollection = (userId: string): CollectionReference => {
  return collection(db, 'users', userId, 'dates');
};

// Helper function to get the notes collection for a specific date
const getNotesCollection = (userId: string, dateId: string): CollectionReference => {
  return collection(db, 'users', userId, 'dates', dateId, 'notes');
};

// Helper function to calculate daily summary from notes
const calculateDailySummary = (notes: Note[]): Omit<DayEntry, 'id' | 'createdAt' | 'updatedAt' | 'notes'> => {
  if (notes.length === 0) {
    return {
      analysis: '',
      confidence: 0,
      hopperEmotion: '',
      hopperResponse: '',
      mood: ''
    };
  }

  // Get the most recent note
  const latestNote = notes.reduce((latest, current) => 
    latest.createdAt.seconds > current.createdAt.seconds ? latest : current
  );

  return {
    analysis: latestNote.analysis,
    confidence: latestNote.confidence,
    hopperEmotion: latestNote.hopperEmotion,
    hopperResponse: latestNote.hopperResponse,
    mood: latestNote.mood
  };
};

// Helper function to sync daily summary with notes
const syncDailySummary = async (userId: string, dateId: string): Promise<void> => {
  const notes = await getNotes(userId, dateId);
  const summary = calculateDailySummary(notes);
  await upsertDayEntry(userId, dateId, summary);
};

// Create a new note for a specific date
export const createNote = async (
  userId: string,
  dateId: string,
  noteData: Omit<Note, 'id' | 'createdAt'>
): Promise<string> => {
  const notesRef = getNotesCollection(userId, dateId);
  const docRef = await addDoc(notesRef, {
    ...noteData,
    createdAt: Timestamp.now()
  });
  
  // Sync daily summary after creating a new note
  await syncDailySummary(userId, dateId);
  
  return docRef.id;
};

// Update an existing note
export const updateNote = async (
  userId: string,
  dateId: string,
  noteId: string,
  noteData: Partial<Omit<Note, 'id' | 'createdAt'>>
): Promise<void> => {
  const noteRef = doc(getNotesCollection(userId, dateId), noteId);
  await updateDoc(noteRef, noteData);
  
  // Sync daily summary after updating a note
  await syncDailySummary(userId, dateId);
};

// Delete a note
export const deleteNote = async (
  userId: string,
  dateId: string,
  noteId: string
): Promise<void> => {
  const noteRef = doc(getNotesCollection(userId, dateId), noteId);
  await deleteDoc(noteRef);
  
  // Sync daily summary after deleting a note
  await syncDailySummary(userId, dateId);
};

// Get all notes for a specific date
export const getNotes = async (
  userId: string,
  dateId: string
): Promise<Note[]> => {
  const notesRef = getNotesCollection(userId, dateId);
  const q = query(notesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Note));
};

// Create or update a day entry
export const upsertDayEntry = async (
  userId: string,
  dateId: string,
  entryData: Omit<DayEntry, 'id' | 'createdAt' | 'updatedAt' | 'notes'>
): Promise<void> => {
  const dateRef = doc(getDatesCollection(userId), dateId);
  const dateDoc = await getDoc(dateRef);

  const updateData = {
    ...entryData,
    updatedAt: Timestamp.now()
  };

  if (!dateDoc.exists()) {
    // If document doesn't exist, create it with initial data
    await setDoc(dateRef, {
      ...updateData,
      createdAt: Timestamp.now(),
    });
  } else {
    // If document exists, update it
    await updateDoc(dateRef, updateData);
  }
};

// Get a day entry with all its notes and ensure sync
export const getDayEntry = async (
  userId: string,
  dateId: string
): Promise<DayEntry | null> => {
  const dateRef = doc(getDatesCollection(userId), dateId);
  const dateDoc = await getDoc(dateRef);
  const notes = await getNotes(userId, dateId);
  
  if (!dateDoc.exists()) {
    if (notes.length > 0) {
      // Create day entry if it doesn't exist but has notes
      const summary = calculateDailySummary(notes);
      await upsertDayEntry(userId, dateId, summary);
      return {
        id: dateId,
        ...summary,
        createdAt: notes[0].createdAt,
        updatedAt: Timestamp.now(),
        notes
      };
    }
    return null;
  }

  // Ensure the daily summary is in sync with the latest note
  const summary = calculateDailySummary(notes);
  const currentData = dateDoc.data();
  
  if (
    currentData.analysis !== summary.analysis ||
    currentData.confidence !== summary.confidence ||
    currentData.hopperEmotion !== summary.hopperEmotion ||
    currentData.hopperResponse !== summary.hopperResponse ||
    currentData.mood !== summary.mood
  ) {
    await upsertDayEntry(userId, dateId, summary);
    return {
      id: dateId,
      ...summary,
      createdAt: currentData.createdAt,
      updatedAt: Timestamp.now(),
      notes
    };
  }

  return {
    id: dateId,
    ...dateDoc.data(),
    notes
  } as DayEntry;
};

// Get all dates that have entries for a user within a date range
export const getDateEntriesInRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<string[]> => {
  const datesRef = getDatesCollection(userId);
  const q = query(
    datesRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate))
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
};
