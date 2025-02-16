"use client";

import { createContext, useState, useContext } from "react";

type DropdownName = "bell" | "avatar" | null;

const DropdownContext = createContext<{
	openDropdown: DropdownName;
	toggleDropdown: (dropdownName: DropdownName) => void;
}>({
	openDropdown: null,
	toggleDropdown: () => {},
});

export const DropdownProvider = ({ children }) => {
	const [openDropdown, setOpenDropdown] = useState(undefined); // 'bell' or 'avatar' or null

	const toggleDropdown = (dropdownName) => {
		setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
	};

	return (
		<DropdownContext.Provider value={{ openDropdown, toggleDropdown }}>
			{children}
		</DropdownContext.Provider>
	);
};

export const useDropdown = () => useContext(DropdownContext);
