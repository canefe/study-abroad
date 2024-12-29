"use client";
import { Segmented } from "antd";
import { Flag, Home } from "lucide-react";
import { useState } from "react";
import HomeUniversitySettings from "./_sections/HomeUniversitySettings";

export default function Settings() {
	const [selected, setSelected] = useState("homeUni");
	return (
		<div>
			<Segmented
				options={[
					{
						label: (
							<div className="flex items-center gap-1">
								<Home size={16} />
								<span>Home University</span>
							</div>
						),
						value: "homeUni",
					},
					{
						label: (
							<div className="flex items-center gap-1">
								<Flag size={16} />
								<span>Flagged Courses</span>
							</div>
						),
						value: "flagged",
					},
				]}
			/>

			{selected === "homeUni" && <HomeUniversitySettings />}
		</div>
	);
}
