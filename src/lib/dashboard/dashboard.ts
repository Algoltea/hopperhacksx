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
  CollectionReference
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
};

// Delete a note
export const deleteNote = async (
  userId: string,
  dateId: string,
  noteId: string
): Promise<void> => {
  const noteRef = doc(getNotesCollection(userId, dateId), noteId);
  await deleteDoc(noteRef);
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
  await updateDoc(dateRef, {
    ...entryData,
    updatedAt: Timestamp.now()
  });
};

// Get a day entry with all its notes
export const getDayEntry = async (
  userId: string,
  dateId: string
): Promise<DayEntry | null> => {
  const dateRef = doc(getDatesCollection(userId), dateId);
  const dateDoc = await getDoc(dateRef);
  const notes = await getNotes(userId, dateId);
  
  if (!dateDoc.exists()) {
    return null;
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
