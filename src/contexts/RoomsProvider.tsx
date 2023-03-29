import { createContext, useCallback, useEffect, useState } from "react";
import getRoomsList from "../services/getRoomsList";

type RoomsContextProps = {
  roomsList: string[];
  updateRoomsList: (updatedRoomsList: string[]) => void;
};

const defaultValue: RoomsContextProps = {
  roomsList: [],
  updateRoomsList: () => {
    throw new Error("updateRoomsList must be defined");
  },
};

export const RoomsContext = createContext(defaultValue);

const RoomsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [roomsList, setRoomsList] = useState<string[]>([]);

  const fetch = useCallback(() => {
    getRoomsList()
      .then((response) => {
        console.log("Chamou re fetch:", response);
        if (response.error) {
          console.error(response.error);
        }
      })
      .catch(() => {
        console.warn("Error getting rooms list. Using default rooms now!");
      });
  }, []);

  const updateRoomsList = useCallback((updatedRoomsList: string[]) => {
    setRoomsList(updatedRoomsList);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <RoomsContext.Provider value={{ roomsList, updateRoomsList }}>
      {children}
    </RoomsContext.Provider>
  );
};

export default RoomsProvider;
