import MenuItem from "./menu-item";

const Sidebar = () => {
	return (
		<div className="bg-secondary fixed p-3">
			<nav>
				<ul>
					<MenuItem item={{ name: "Home", icon: "🏠" }} />
					<MenuItem item={{ name: "About", icon: "📖" }} />
					<MenuItem item={{ name: "Contact", icon: "📞" }} />
				</ul>
			</nav>
		</div>
	);
};

export default Sidebar;
