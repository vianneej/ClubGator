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

  const allowed = new Set(campusLandmarks.map((l) => l.id));
  return snapshot.docs.map((d) => d.data()).filter((l) => allowed.has(l.id));
}

export async function getLandmarkById(id) {
    const mockData = {
        'century-tower': {
            name: 'CENTURY TOWER',
            background: 'century-tower',
            interactables: [
                { id: 'bells', label: 'Carillon Bells', x: 560, y: 175, type: 'info', message: 'You hear the 61-bell carillon chimes ring across campus.' },
                { id: 'entrance', label: 'Tower Door', x: 560, y: 640, type: 'door', message: 'The door to the bell tower is locked.' }
            ]
        },
        'student-union': {
            name: 'REITZ UNION',
            background: 'reitz-union',
            interactables: [
                { id: 'food_court', label: 'Food Court', x: 155, y: 550, type: 'door', message: 'Grab a bite between classes at the Reitz Union Food Court, from Starbucks and Panda Express to local favorites.' },
                { id: 'elevator', label: 'Elevator', x: 512, y: 315, type: 'info', message: 'Take the Gator-blue glass elevator down to the ground floor to bowl and play billiards at the Reitz Union Game Room!' },
                { id: 'info_desk', label: 'Information Desk', x: 895, y: 550, type: 'info', message: 'Stop by the Information Desk for campus maps, event schedules, and everything happening around UF today.' }
            ]
        },
        'football-stadium': {
            name: 'THE SWAMP',
            background: 'football-stadium',
            interactables: [
                { id: 'scoreboard', label: 'Scoreboard', x: 315, y: 185, type: 'info', message: "A beloved Swamp tradition: between the 3rd and 4th quarters, the whole stadium sings \"I Won't Back Down\" by Tom Petty!" },
                { id: 'field_gate', label: 'Tunnel Entrance', x: 240, y: 420, type: 'info', message: 'Looking out over Florida Field and Steve Spurrier-Florida Field. This is Gator Country!' },
                { id: 'football_field', label: 'Football Field', x: 540, y: 525, type: 'info', message: "90,000+ strong doing the Gator Chomp on Saturdays. Only Gators get out alive!" }
            ]
        },
        'sports-arena': {
            name: "O'DOME",
            background: 'sports-arena',
            interactables: [
                { id: 'banners', label: 'Title Banners', x: 165, y: 145, type: 'info', message: 'Florida Gators Volleyball Team: 2026 SEC Champions!' },
                { id: 'court', label: 'Arena Court', x: 520, y: 535, type: 'info', message: 'Home to Florida Gators basketball, volleyball, and gymnastics.' }
            ]
        },
        'library-west': {
            name: 'LIB WEST',
            background: 'library-west',
            interactables: [
                { id: 'entrance', label: 'Main Entrance', x: 523, y: 670, type: 'door', message: 'Library West: quiet floors upstairs, group study downstairs.' },
                { id: 'starbucks', label: 'Starbucks Counter', x: 668, y: 670, type: 'info', message: 'Grab an iced coffee before pulling an all-nighter.' }
            ]
        },
        'marston-library': {
            name: 'MARSTON',
            background: 'marston-library',
            interactables: [
                { id: 'french_fries', label: 'Marston French Fries', x: 336, y: 516, type: 'info', message: 'The yellow sculpture everyone calls the French Fries.' },
                { id: 'marston_entrance', label: 'Marston Library', x: 696, y: 328, type: 'door', message: 'Marston Science Library: STEM stacks, group rooms, and late-night study.' },
                { id: 'maker_space', label: 'Made@UF Lab', x: 826, y: 530, type: 'info', message: '3D printers and VR development equipment available for students.' }
            ]
        },
        'plaza-of-the-americas': {
            name: 'PLAZA OF THE AMERICAS',
            background: 'plaza-americas',
            interactables: [
                { id: 'auditorium', label: 'Auditorium', x: 512, y: 280, type: 'info', message: 'University Auditorium watches over the plaza.' },
                { id: 'paths', label: 'Walkways', x: 512, y: 560, type: 'info', message: 'Crisscrossing paths cut triangles of grass across the plaza.' }
            ]
        },
        'lake-alice': {
            name: 'LAKE ALICE',
            background: 'lake-alice',
            interactables: [
                { id: 'bats', label: 'Bats', x: 440, y: 155, type: 'info', message: 'Every evening at dusk, hundreds of thousands of Brazilian free-tailed bats emerge from the bat houses across Lake Alice.' },
                { id: 'bat_houses', label: 'Bat Houses', x: 620, y: 340, type: 'info', message: 'Among the world\'s largest occupied bat houses, home to thousands of bats.' },
                { id: 'lake', label: 'Lake Alice', x: 340, y: 520, type: 'info', message: 'Calm water, campus gators, and one of UF\'s quietest views.' },
                { id: 'gator', label: 'Alligator', x: 150, y: 650, type: 'info', message: 'A campus alligator sunning on the shore. Give them plenty of space!' }
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