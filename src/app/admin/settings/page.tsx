"use client";
import { Segmented } from "antd";
import { Clock, Home } from "lucide-react";
import { useState } from "react";
import HomeUniversitySettings from "./_sections/home-university-settings";
import DeadlineSettings from "./_sections/deadline-settings";

export default function Settings() {
	const [selected, setSelected] = useState("homeUni");
	return (
		<div className="flex flex-col gap-2">
			<Segmented
				onChange={(value) => setSelected(value)}
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
								<Clock size={16} />
								<span>Deadline</span>
							</div>
						),
						value: "deadline",
					},
				]}
			/>

			{selected === "homeUni" && <HomeUniversitySettings />}
			{selected === "deadline" && <DeadlineSettings />}
		</div>
	);
}
