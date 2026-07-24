import { useState, useEffect } from 'react';

export interface Building {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Floor {
  id: string;
  name: string;
  description: string;
  image: string;
  buildingId: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  image: string;
  floorId: string;
}

const DEFAULT_BUILDINGS: Building[] = [
  {
    id: 'b1',
    name: 'Headquarters (HQ)',
    description: 'Main office building and corporate center.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'b2',
    name: 'Warehouse A',
    description: 'Storage and distribution facility for electronics and materials.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80'
  }
];

const DEFAULT_FLOORS: Floor[] = [
  {
    id: 'f1',
    name: '1st Floor',
    description: 'Lobby, reception, and visitor areas.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
    buildingId: 'b1'
  },
  {
    id: 'f2',
    name: '2nd Floor',
    description: 'Engineering and product development offices.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80',
    buildingId: 'b1'
  },
  {
    id: 'f3',
    name: 'Ground Floor',
    description: 'Receiving, loading docks, and shipping staging.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=300&q=80',
    buildingId: 'b2'
  }
];

const DEFAULT_ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Main Reception',
    description: 'Front entrance lobby area.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
    floorId: 'f1'
  },
  {
    id: 'r2',
    name: 'Conference Room 101',
    description: 'Large conference room with video conferencing.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=300&q=80',
    floorId: 'f1'
  },
  {
    id: 'r3',
    name: 'Developer Open Space',
    description: 'Engineering desks and brainstorming area.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80',
    floorId: 'f2'
  },
  {
    id: 'r4',
    name: 'Server Room',
    description: 'Main local server racks and network switches.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80',
    floorId: 'f2'
  },
  {
    id: 'r5',
    name: 'Loading Dock 1',
    description: 'Primary incoming shipping dock area.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=300&q=80',
    floorId: 'f3'
  }
];

export const useRooms = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const savedBuildings = localStorage.getItem('crud_buildings');
    const savedFloors = localStorage.getItem('crud_floors');
    const savedRooms = localStorage.getItem('crud_rooms');

    if (savedBuildings) setBuildings(JSON.parse(savedBuildings));
    else {
      setBuildings(DEFAULT_BUILDINGS);
      localStorage.setItem('crud_buildings', JSON.stringify(DEFAULT_BUILDINGS));
    }

    if (savedFloors) setFloors(JSON.parse(savedFloors));
    else {
      setFloors(DEFAULT_FLOORS);
      localStorage.setItem('crud_floors', JSON.stringify(DEFAULT_FLOORS));
    }

    if (savedRooms) setRooms(JSON.parse(savedRooms));
    else {
      setRooms(DEFAULT_ROOMS);
      localStorage.setItem('crud_rooms', JSON.stringify(DEFAULT_ROOMS));
    }
  }, []);

  const saveBuildings = (updated: Building[]) => {
    setBuildings(updated);
    localStorage.setItem('crud_buildings', JSON.stringify(updated));
  };

  const saveFloors = (updated: Floor[]) => {
    setFloors(updated);
    localStorage.setItem('crud_floors', JSON.stringify(updated));
  };

  const saveRooms = (updated: Room[]) => {
    setRooms(updated);
    localStorage.setItem('crud_rooms', JSON.stringify(updated));
  };

  // Building Actions
  const addBuilding = (item: Omit<Building, 'id'>) => {
    const newItem: Building = { ...item, id: 'b_' + Date.now() };
    saveBuildings([...buildings, newItem]);
  };

  const updateBuilding = (id: string, item: Omit<Building, 'id'>) => {
    const updated = buildings.map((b) => (b.id === id ? { ...item, id } : b));
    saveBuildings(updated);
  };

  const deleteBuilding = (id: string) => {
    const updatedBuildings = buildings.filter((b) => b.id !== id);
    saveBuildings(updatedBuildings);
    
    // Cascading delete floors and rooms
    const floorsToDelete = floors.filter((f) => f.buildingId === id);
    const floorIds = floorsToDelete.map((f) => f.id);
    
    const updatedFloors = floors.filter((f) => f.buildingId !== id);
    saveFloors(updatedFloors);

    const updatedRooms = rooms.filter((r) => !floorIds.includes(r.floorId));
    saveRooms(updatedRooms);
  };

  // Floor Actions
  const addFloor = (item: Omit<Floor, 'id'>) => {
    const newItem: Floor = { ...item, id: 'f_' + Date.now() };
    saveFloors([...floors, newItem]);
  };

  const updateFloor = (id: string, item: Omit<Floor, 'id'>) => {
    const updated = floors.map((f) => (f.id === id ? { ...item, id } : f));
    saveFloors(updated);
  };

  const deleteFloor = (id: string) => {
    const updatedFloors = floors.filter((f) => f.id !== id);
    saveFloors(updatedFloors);

    // Cascading delete rooms
    const updatedRooms = rooms.filter((r) => r.floorId !== id);
    saveRooms(updatedRooms);
  };

  // Room Actions
  const addRoom = (item: Omit<Room, 'id'>) => {
    const newItem: Room = { ...item, id: 'r_' + Date.now() };
    saveRooms([...rooms, newItem]);
  };

  const updateRoom = (id: string, item: Omit<Room, 'id'>) => {
    const updated = rooms.map((r) => (r.id === id ? { ...item, id } : r));
    saveRooms(updated);
  };

  const deleteRoom = (id: string) => {
    const updatedRooms = rooms.filter((r) => r.id !== id);
    saveRooms(updatedRooms);
  };

  return {
    buildings,
    floors,
    rooms,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addFloor,
    updateFloor,
    deleteFloor,
    addRoom,
    updateRoom,
    deleteRoom,
  };
};
