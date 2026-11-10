import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { campusLandmarks } from "../data/landmarks";

const landmarksCollection = "landmarks";

export async function seedLandmarksIfEmpty() {
  const colRef = collection(db, landmarksCollection);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    for (const landmark of campusLandmarks) {
      await setDoc(doc(db, landmarksCollection, landmark.id), landmark);
    }
    return campusLandmarks;
  }

  return snapshot.docs.map((d) => d.data());
}

export async function getLandmarks() {
  const colRef = collection(db, landmarksCollection);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    return await seedLandmarksIfEmpty();
  }

  return snapshot.docs.map((d) => d.data());
}

export async function getLandmarkById(id) {
    const mockData = {
        'century-tower': {
            name: 'CENTURY TOWER',
            interactables: [
                { id: 'bells', label: 'Carillon Bells', x: 512, y: 400, type: 'info', message: 'You hear the 61-bell carillon chimes ring across campus.' },
                { id: 'entrance', label: 'Tower Door', x: 720, y: 520, type: 'door', message: 'The door to the bell tower is locked.' }
            ]
        },
        'student-union': {
            name: 'REITZ UNION',
            interactables: [
                { id: 'food_court', label: 'Food Court', x: 380, y: 450, type: 'door', message: 'Starbucks, Panda Express, Sonic, and more are open!' },
                { id: 'info_desk', label: 'Information Desk', x: 650, y: 450, type: 'info', message: 'Pick up an official UF event guide or talk to the desk.' }
            ]
        },
        'football-stadium': {
            name: 'THE SWAMP',
            interactables: [
                { id: 'field_gate', label: 'Tunnel Entrance', x: 512, y: 450, type: 'info', message: 'Looking out over Florida Field and Steve Spurrier-Florida Field.' }
            ]
        },
        'sports-arena': {
            name: "O'DOME",
            interactables: [
                { id: 'court', label: 'Basketball Court', x: 512, y: 450, type: 'info', message: 'Home of Florida Gators Basketball, Gymnastics, and Volleyball.' }
            ]
        },
        'library-west': {
            name: 'LIB WEST',
            interactables: [
                { id: 'starbucks', label: 'Starbucks Counter', x: 400, y: 450, type: 'info', message: 'Grab an iced coffee before pulling an all-nighter.' }
            ]
        },
        'marston-library': {
            name: 'MARSTON',
            interactables: [
                { id: 'maker_space', label: 'Made@UF Lab', x: 512, y: 450, type: 'info', message: '3D printers and VR development equipment available for students.' }
            ]
        }
    };

    return mockData[id] || {
        name: id.replace(/-/g, ' ').toUpperCase(),
        interactables: [
            { id: 'marker', label: 'Plaque', x: 512, y: 450, type: 'info', message: `Historical plaque for ${id.replace(/-/g, ' ')}.` }
        ]
    };
}