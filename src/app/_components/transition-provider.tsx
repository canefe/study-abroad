"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function TransitionProvider({ children }) {
	const pathname = usePathname();

	return (
		<motion.div
			key={pathname}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			className="container"
		>
			{children}
		</motion.div>
	);
}
