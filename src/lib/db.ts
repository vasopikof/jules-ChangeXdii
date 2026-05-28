import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

// --- Types ---

export type UserRole = 'student' | 'company' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  organization?: string;
  status: 'pending' | 'confirmed';
  checkedInAt?: any;
}

export interface Booking {
  id?: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: any;
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

// --- MOCK MODE (LocalStorage Persistence) ---
const MOCK_MODE = true;

const getStorage = (key: string) => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('mock_' + key);
  return data ? JSON.parse(data) : [];
};

const setStorage = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mock_' + key, JSON.stringify(data));
};

// --- Firestore Helpers ---

export const getUser = async (id: string) => {
  if (MOCK_MODE) {
    const users = getStorage('users');
    return users.find((u: any) => u.id === id) || null;
  }
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as UserProfile : null;
};

export const saveUser = async (user: UserProfile) => {
  if (MOCK_MODE) {
    const users = getStorage('users');
    const index = users.findIndex((u: any) => u.id === user.id);
    if (index > -1) users[index] = user;
    else users.push(user);
    setStorage('users', users);
    return;
  }
  await setDoc(doc(db, "users", user.id), { ...user, updatedAt: serverTimestamp() }, { merge: true });
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
  if (MOCK_MODE) {
    const bookings = getStorage('bookings');
    const id = Math.random().toString(36).substr(2, 9);
    const newBooking = { ...booking, id, createdAt: new Date() };
    bookings.push(newBooking);
    setStorage('bookings', bookings);
    return { id };
  }
  return await addDoc(collection(db, "bookings"), { ...booking, createdAt: serverTimestamp() });
};

export const updateBookingStatus = async (id: string, status: Booking['status']) => {
  if (MOCK_MODE) {
    const bookings = getStorage('bookings');
    const index = bookings.findIndex((b: any) => b.id === id);
    if (index > -1) bookings[index].status = status;
    setStorage('bookings', bookings);
    return;
  }
  await updateDoc(doc(db, "bookings", id), { status, updatedAt: serverTimestamp() });
};

export const sendNotification = async (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
  if (MOCK_MODE) {
    const notifs = getStorage('notifications');
    const id = Math.random().toString(36).substr(2, 9);
    notifs.push({ ...notification, id, read: false, createdAt: new Date() });
    setStorage('notifications', notifs);
    return;
  }
  await addDoc(collection(db, "notifications"), { ...notification, read: false, createdAt: serverTimestamp() });
};

export const subscribeToNotifications = (userId: string, callback: (notifs: AppNotification[]) => void) => {
  if (MOCK_MODE) {
    const check = () => {
      const all = getStorage('notifications');
      callback(all.filter((n: any) => n.userId === userId).sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }
  const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification)));
  });
};

export const subscribeToAllBookings = (callback: (bookings: Booking[]) => void) => {
  if (MOCK_MODE) {
    const check = () => {
      const all = getStorage('bookings');
      callback(all.sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
  });
};
