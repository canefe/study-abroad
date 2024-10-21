const Header = () => {
	return (
		<header className="h-16 bg-primary p-3 flex justify-between items-center text-white">
			<h1 className="text-2xl w-1/2">LOGO</h1>
			<nav className="flex flex-1 items-center">
				<ul className="flex gap-4">
					<li>
						<a href="#">Home</a>
					</li>
					<li>
						<a href="#">About</a>
					</li>
					<li>
						<a href="#">Contact</a>
					</li>
				</ul>
			</nav>
		</header>
	);
};

export default Header;
