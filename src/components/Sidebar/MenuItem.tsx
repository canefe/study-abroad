"use client";
import { useState } from "react";

export type MenuItemType = {
	name: string;
	icon: React.ReactNode;
	items?: MenuItemType[];
};

const MenuItem = ({ item }: { item: MenuItemType }) => {
	const { name, icon, items } = item;
	const [isCollapsed, setIsCollapsed] = useState(true);
	const isExpandable = items && items.length > 0;

	const handleClick = () => {
		setIsCollapsed(!isCollapsed);
	};

	return (
		<div>
			<div
				className="flex items-center gap-4 py-2 pl-4 pr-2 hover:bg-gray-200 cursor-pointer"
				onClick={handleClick}>
				<div className="flex items-center gap-2">
					{icon}
					<span>{name}</span>
				</div>
				{isExpandable && (
					<div>{isCollapsed ? <a>co</a> : <a>oc</a>}</div>
				)}
			</div>
			<div className={`${isCollapsed ? "hidden" : "block"}`}>
				{items &&
					items.map((subItem, index) => (
						<MenuItem key={index} item={subItem} />
					))}
			</div>
		</div>
	);
};

export default MenuItem;
